// Scan all Gmail threads of a single client and cache metadata in client_knowledge table.
// Trigger: POST {customer_email} → IMAP search `FROM:<email>` + `TO:<email>` in All Mail,
// extract thread metadata (subject, last date, sender, snippet, attachments count),
// upsert into client_knowledge.
//
// Usage:
//   curl -X POST .../gmail-scan-client -d '{"customer_email":"karol.karpeta@gmail.com"}'
//
// Run periodically (cron) or on-demand when starting a mail thread for a client.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { GmailImap } from "../_shared/gmail-imap.ts";
import { headerValue, splitHeadersBody } from "../_shared/gmail-mime.ts";

const DEFAULT_GMAIL_USER = "ceo@tomekniedzwiecki.pl";
const SCAN_LOOKBACK_DAYS = 180; // Skanuj wątki z ostatnich 6 miesięcy

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

interface ThreadInfo {
  threadId: string; // Gmail hex thread ID
  subject: string;
  lastDate: string; // ISO
  messageCount: number;
  lastSender: string;
  lastSenderIsClient: boolean;
  lastSnippet: string;
  hasUnansweredFromClient: boolean;
  totalAttachments: number;
}

/** Parse Date header to ISO string. */
function parseDate(headerVal: string | null): string {
  if (!headerVal) return new Date(0).toISOString();
  const d = new Date(headerVal);
  return isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
}

/** Decode RFC 2047 encoded-word (=?UTF-8?B?...?= or =?UTF-8?Q?...?=). */
function decodeRfc2047(s: string): string {
  return s.replace(/=\?([^?]+)\?([BbQq])\?([^?]+)\?=/g, (_, charset, enc, data) => {
    try {
      let bytes: Uint8Array;
      if (enc.toUpperCase() === "B") {
        const bin = atob(data);
        bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      } else {
        const decoded = data
          .replace(/_/g, " ")
          .replace(/=([0-9A-Fa-f]{2})/g, (_m: string, hex: string) => String.fromCharCode(parseInt(hex, 16)));
        bytes = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
      }
      return new TextDecoder(charset.toLowerCase()).decode(bytes);
    } catch {
      return s;
    }
  });
}

/** Extract first ~200 chars of plaintext from RFC822 (best effort, multipart-aware-ish). */
function extractSnippet(rfc822: Uint8Array, maxLen = 200): string {
  const { body } = splitHeadersBody(rfc822);
  // Take first 4KB
  const text = new TextDecoder("utf-8", { fatal: false }).decode(body.subarray(0, 4096));
  // Strip lines starting with > (quoted), -- (signature), boundary markers
  const lines = text.split(/\r?\n/);
  const clean: string[] = [];
  for (const line of lines) {
    if (/^[\s>]*>/.test(line)) continue; // quoted
    if (/^--/.test(line)) break; // signature or boundary
    if (/^Content-/i.test(line)) continue; // mime header leak
    if (/^\s*$/.test(line) && clean.length === 0) continue; // leading blank
    clean.push(line.trim());
    if (clean.join(" ").length > maxLen) break;
  }
  return clean.join(" ").substring(0, maxLen).trim();
}

/** Count attachments in RFC822 by counting `Content-Disposition: attachment` (cheap). */
function countAttachments(rfc822: Uint8Array): number {
  const text = new TextDecoder("latin1").decode(rfc822);
  const matches = text.match(/Content-Disposition:\s*attachment/gi);
  return matches ? matches.length : 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: { customer_email?: string; user?: string };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const { customer_email, user } = body;
  if (!customer_email || !/@/.test(customer_email)) {
    return json({ error: "customer_email required" }, 400);
  }

  const password = Deno.env.get("GMAIL_APP_PASSWORD");
  if (!password) return json({ error: "GMAIL_APP_PASSWORD not configured" }, 500);

  const gmailUser = user || DEFAULT_GMAIL_USER;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Lookup workflow_id for this client
  let workflowId: string | null = null;
  try {
    const { data } = await supabase
      .from("workflows")
      .select("id, status")
      .eq("customer_email", customer_email)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    workflowId = data?.id ?? null;
  } catch (e) {
    // Workflow lookup is non-fatal — we still scan
    console.error("workflow lookup failed:", e);
  }

  const imap = new GmailImap();
  const debug: string[] = [];

  try {
    await imap.connect();
    await imap.login(gmailUser, password);
    const allMailName = await imap.selectAllMail();
    debug.push(`selected ${allMailName}`);

    // IMAP SEARCH: messages where from OR to is the client (bidirectional)
    // SINCE filter to limit volume
    const since = new Date(Date.now() - SCAN_LOOKBACK_DAYS * 86400_000);
    const sinceStr = since.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).replace(",", "");
    const escapedEmail = customer_email.replace(/"/g, '\\"');
    const searchCmd = `UID SEARCH SINCE ${sinceStr} OR FROM "${escapedEmail}" TO "${escapedEmail}"`;
    const searchLines = await imap.runCommand(searchCmd);
    const searchLine = searchLines.find((l) => /^\* SEARCH/i.test(l)) ?? "";
    const uids = searchLine.replace(/^\* SEARCH/i, "").trim().split(/\s+/).filter(Boolean).map(Number).filter(Number.isFinite);
    debug.push(`found ${uids.length} messages for ${customer_email} since ${sinceStr}`);

    // Group by thread (X-GM-THRID) — need to fetch THRID per UID
    // We'll fetch HEADERS + X-GM-THRID in one go for efficiency
    const threadMap: Map<string, { uids: number[]; latestUid: number }> = new Map();

    for (const uid of uids) {
      // FETCH X-GM-THRID + envelope for grouping
      const tag = "x" + Math.random().toString(36).slice(2, 6);
      // deno-lint-ignore no-explicit-any
      const conn: any = (imap as any).conn;
      const enc = new TextEncoder();
      await conn.write(enc.encode(`${tag} UID FETCH ${uid} (X-GM-THRID)\r\n`));
      // Read response — adapter to the class is messy; instead use direct runCommand
      // Simpler: use runCommand
      const lines = await imap.runCommand(`UID FETCH ${uid} (X-GM-THRID)`);
      const thrLine = lines.find((l) => /X-GM-THRID/i.test(l));
      const m = thrLine?.match(/X-GM-THRID\s+(\d+)/i);
      if (!m) continue;
      const thridDec = m[1];
      const thridHex = BigInt(thridDec).toString(16);
      const existing = threadMap.get(thridHex) ?? { uids: [], latestUid: uid };
      existing.uids.push(uid);
      if (uid > existing.latestUid) existing.latestUid = uid;
      threadMap.set(thridHex, existing);
    }

    debug.push(`grouped into ${threadMap.size} threads`);

    // For each thread, fetch the LATEST message's headers + snippet
    const threads: ThreadInfo[] = [];
    for (const [threadHexId, info] of threadMap) {
      try {
        const latestRfc822 = await imap.fetchBody(info.latestUid);
        const { headers } = splitHeadersBody(latestRfc822);

        const fromRaw = headerValue(headers, "From") || "";
        const subject = decodeRfc2047(headerValue(headers, "Subject") || "(no subject)");
        const dateStr = parseDate(headerValue(headers, "Date"));
        const lastSender = fromRaw.match(/<([^>]+)>/)?.[1] || fromRaw.split(/\s+/)[0] || "";
        const lastSenderIsClient = lastSender.toLowerCase().includes(customer_email.toLowerCase());

        const snippet = extractSnippet(latestRfc822, 200);
        const totalAttachments = countAttachments(latestRfc822);

        threads.push({
          threadId: threadHexId,
          subject: subject.substring(0, 200),
          lastDate: dateStr,
          messageCount: info.uids.length,
          lastSender,
          lastSenderIsClient,
          lastSnippet: snippet,
          hasUnansweredFromClient: lastSenderIsClient,
          totalAttachments,
        });
      } catch (e) {
        debug.push(`thread ${threadHexId} fetch failed: ${String(e).substring(0, 100)}`);
      }
    }

    // Sort by lastDate desc
    threads.sort((a, b) => b.lastDate.localeCompare(a.lastDate));

    const lastThreadDate = threads[0]?.lastDate ?? null;

    // Upsert to client_knowledge
    const { error: upsertErr } = await supabase
      .from("client_knowledge")
      .upsert({
        customer_email,
        workflow_id: workflowId,
        threads,
        thread_count: threads.length,
        last_thread_date: lastThreadDate,
        last_scanned_at: new Date().toISOString(),
      }, { onConflict: "customer_email" });

    if (upsertErr) {
      return json({ error: "upsert failed", detail: upsertErr.message, threads, debug }, 500);
    }

    return json({
      ok: true,
      customer_email,
      workflow_id: workflowId,
      thread_count: threads.length,
      last_thread_date: lastThreadDate,
      threads_preview: threads.slice(0, 5).map((t) => ({
        threadId: t.threadId,
        subject: t.subject,
        lastDate: t.lastDate,
        messageCount: t.messageCount,
        hasUnansweredFromClient: t.hasUnansweredFromClient,
      })),
      debug,
    });
  } catch (err) {
    return json({ error: String(err), debug }, 500);
  } finally {
    await imap.logout();
  }
});
