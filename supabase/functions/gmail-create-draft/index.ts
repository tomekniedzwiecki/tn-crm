// Create Gmail draft via IMAP APPEND (bypasses claude.ai Gmail MCP bug
// that copies inline attachments from the parent message into replies).
// The draft lands in Gmail "Wersje robocze" and Tomek polishes/sends it himself.
//
// Threading: if `threadHexId` is provided, we look up the latest message in
// that thread and set `In-Reply-To` + `References` to its RFC822 Message-ID.
// Gmail then groups this draft into the same conversation when sent.

import { GmailImap, gmailThreadIdToDecimal } from "../_shared/gmail-imap.ts";

const DEFAULT_GMAIL_USER = "ceo@tomekniedzwiecki.pl";
const DEFAULT_FROM_NAME = "Tomasz Niedźwiecki";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

interface CreateDraftRequest {
  to: string | string[];
  subject: string;
  body: string;
  /** Gmail thread ID (hex, like "19e0c5426e02e9f9"). Optional — if set, draft joins this thread. */
  threadHexId?: string;
  /** Explicit RFC822 Message-ID to reply to (overrides threadHexId lookup). Format: `<id@host>` */
  inReplyTo?: string;
  user?: string;
  fromName?: string;
  /** CC recipients. */
  cc?: string | string[];
}

/** Encode header value with UTF-8 if it contains non-ASCII (RFC 2047 B-encoding). */
function encodeHeaderUtf8(value: string): string {
  // ASCII-only short-circuit
  // deno-lint-ignore no-control-regex
  if (/^[\x00-\x7f]*$/.test(value)) return value;
  const bytes = new TextEncoder().encode(value);
  let b64 = "";
  for (let i = 0; i < bytes.length; i++) b64 += String.fromCharCode(bytes[i]);
  return `=?UTF-8?B?${btoa(b64)}?=`;
}

function makeMessageId(domain: string): string {
  const rand = crypto.getRandomValues(new Uint8Array(8));
  const hex = Array.from(rand).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `<${Date.now()}.${hex}@${domain}>`;
}

function rfc2822Date(d: Date): string {
  // Example: "Wed, 14 May 2026 14:23:32 +0000"
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${days[d.getUTCDay()]}, ${pad(d.getUTCDate())} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} +0000`;
}

/** Parse Message-ID and References headers from a header block. */
function parseReferenceHeaders(headers: string): { messageId: string | null; references: string | null } {
  const midMatch = headers.match(/^Message-ID:\s*(<[^>\r\n]+>)/im);
  const refMatch = headers.match(/^References:\s*([^\r\n]+(?:\r\n[ \t][^\r\n]+)*)/im);
  return {
    messageId: midMatch ? midMatch[1].trim() : null,
    references: refMatch ? refMatch[1].replace(/\r\n[ \t]/g, " ").trim() : null,
  };
}

function buildRfc822({
  from,
  to,
  cc,
  subject,
  body,
  inReplyTo,
  references,
  messageId,
}: {
  from: string;
  to: string[];
  cc: string[];
  subject: string;
  body: string;
  inReplyTo: string | null;
  references: string | null;
  messageId: string;
}): Uint8Array {
  const headers: string[] = [
    `From: ${encodeHeaderUtf8(from)}`,
    `To: ${to.join(", ")}`,
  ];
  if (cc.length > 0) headers.push(`Cc: ${cc.join(", ")}`);
  headers.push(`Subject: ${encodeHeaderUtf8(subject)}`);
  headers.push(`Date: ${rfc2822Date(new Date())}`);
  headers.push(`Message-ID: ${messageId}`);
  if (inReplyTo) headers.push(`In-Reply-To: ${inReplyTo}`);
  if (references) headers.push(`References: ${references}`);
  headers.push(`MIME-Version: 1.0`);
  headers.push(`Content-Type: text/plain; charset=UTF-8`);
  headers.push(`Content-Transfer-Encoding: base64`);

  // Base64-encode body bytes (UTF-8). Wrap at 76 chars per line per RFC 2045.
  const bodyBytes = new TextEncoder().encode(body.replace(/\r?\n/g, "\r\n"));
  let bin = "";
  for (let i = 0; i < bodyBytes.length; i++) bin += String.fromCharCode(bodyBytes[i]);
  const b64 = btoa(bin);
  const wrapped = b64.match(/.{1,76}/g)?.join("\r\n") ?? b64;

  const rfc822 = headers.join("\r\n") + "\r\n\r\n" + wrapped + "\r\n";
  return new TextEncoder().encode(rfc822);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: CreateDraftRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!body.to || !body.subject || !body.body) {
    return json({ error: "to, subject and body are required" }, 400);
  }

  const password = Deno.env.get("GMAIL_APP_PASSWORD");
  if (!password) return json({ error: "GMAIL_APP_PASSWORD not configured" }, 500);

  const gmailUser = body.user || DEFAULT_GMAIL_USER;
  const fromName = body.fromName ?? DEFAULT_FROM_NAME;
  const fromHeader = fromName ? `"${fromName}" <${gmailUser}>` : gmailUser;
  const toList = Array.isArray(body.to) ? body.to : [body.to];
  const ccList = body.cc ? (Array.isArray(body.cc) ? body.cc : [body.cc]) : [];

  const imap = new GmailImap();
  const debug: string[] = [];

  try {
    debug.push("connecting");
    await imap.connect();
    debug.push("connected");
    await imap.login(gmailUser, password);
    debug.push("logged in");

    // Resolve threading headers (In-Reply-To + References)
    let inReplyTo: string | null = body.inReplyTo ?? null;
    let references: string | null = null;

    if (!inReplyTo && body.threadHexId) {
      // Look up latest message in thread, extract its Message-ID + References
      if (!/^[0-9a-f]+$/i.test(body.threadHexId)) {
        return json({ error: "threadHexId must be hex" }, 400);
      }
      const allMail = await imap.selectAllMail();
      debug.push(`selected All Mail: ${allMail}`);
      const uids = await imap.searchByThreadId(gmailThreadIdToDecimal(body.threadHexId));
      debug.push(`thread search returned ${uids.length} UIDs`);
      if (uids.length > 0) {
        const latestUid = uids[uids.length - 1];
        const headers = await imap.fetchHeaders(latestUid, ["Message-ID", "References"]);
        debug.push(`fetched headers for uid ${latestUid}: ${headers.substring(0, 200)}`);
        const parsed = parseReferenceHeaders(headers);
        inReplyTo = parsed.messageId;
        // Build References: previous References + previous Message-ID
        if (parsed.references && parsed.messageId) {
          references = `${parsed.references} ${parsed.messageId}`;
        } else if (parsed.messageId) {
          references = parsed.messageId;
        } else if (parsed.references) {
          references = parsed.references;
        }
        debug.push(`In-Reply-To: ${inReplyTo}`);
        debug.push(`References: ${references}`);
      }
    } else if (inReplyTo) {
      references = inReplyTo;
    }

    // Build RFC822 message
    const messageId = makeMessageId("mail.gmail.com");
    const rfc822 = buildRfc822({
      from: fromHeader,
      to: toList,
      cc: ccList,
      subject: body.subject,
      body: body.body,
      inReplyTo,
      references,
      messageId,
    });
    debug.push(`built RFC822: ${rfc822.length} bytes`);

    // APPEND to Drafts folder
    const draftsFolder = await imap.findFolderByFlag("\\Drafts");
    if (!draftsFolder) return json({ error: "Drafts folder not found", debug }, 500);
    debug.push(`drafts folder: ${draftsFolder}`);

    await imap.appendMessage(draftsFolder, rfc822);
    debug.push("APPEND OK");

    return json({
      ok: true,
      messageId,
      inReplyTo,
      threadHexId: body.threadHexId ?? null,
      draftsFolder,
      debug,
    });
  } catch (err) {
    return json({ error: String(err), debug }, 500);
  } finally {
    await imap.logout();
  }
});
