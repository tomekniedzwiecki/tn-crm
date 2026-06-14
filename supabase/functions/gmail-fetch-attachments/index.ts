import { createClient } from "jsr:@supabase/supabase-js@2";
import { GmailImap, gmailThreadIdToDecimal } from "../_shared/gmail-imap.ts";
import { extractAttachments } from "../_shared/gmail-mime.ts";

const DEFAULT_GMAIL_USER = "ceo@tomekniedzwiecki.pl";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: { threadId?: string; user?: string };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const { threadId, user } = body;
  if (!threadId || !/^[0-9a-f]+$/i.test(threadId)) {
    return json({ error: "threadId required (hex)" }, 400);
  }

  // AUTORYZACJA: narzedzie wewnetrzne. Bez tego kazdy (chroniony tylko entropia
  // threadId) wyciagal zalaczniki maili do publicznego bucketu.
  const SECRET = Deno.env.get("SPAR_CRON_SECRET");
  if (!SECRET || (req.headers.get("x-admin-secret") !== SECRET && req.headers.get("x-cron-secret") !== SECRET)) {
    return json({ error: "brak_autoryzacji" }, 401);
  }

  const password = Deno.env.get("GMAIL_APP_PASSWORD");
  if (!password) return json({ error: "GMAIL_APP_PASSWORD not configured" }, 500);

  const gmailUser = user || DEFAULT_GMAIL_USER;
  const threadIdDec = gmailThreadIdToDecimal(threadId);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const imap = new GmailImap();
  const debug: string[] = [];
  try {
    debug.push("connecting");
    await imap.connect();
    debug.push("connected");
    await imap.login(gmailUser, password);
    debug.push("logged in");
    const allMailName = await imap.selectAllMail();
    debug.push(`selected All Mail folder: ${allMailName}`);
    const uids = await imap.searchByThreadId(threadIdDec);
    debug.push(`search returned ${uids.length} UIDs`);
    if (uids.length === 0) {
      return json({ error: "No messages found", threadId, debug }, 404);
    }

    const uploaded: Array<Record<string, unknown>> = [];
    for (const uid of uids) {
      debug.push(`fetching uid ${uid}`);
      const rfc822 = await imap.fetchBody(uid);
      debug.push(`fetched uid ${uid}: ${rfc822.length} bytes`);
      const atts = extractAttachments(rfc822, debug);
      debug.push(`uid ${uid}: ${atts.length} attachments`);
      for (let i = 0; i < atts.length; i++) {
        const att = atts[i];
        const safe = att.filename.replace(/[^a-zA-Z0-9._-]/g, "_") || `att-${uid}-${i}`;
        const path = `email/${threadId}/${uid}-${i}-${safe}`;
        const { error } = await supabase.storage
          .from("attachments")
          .upload(path, att.data, { contentType: att.contentType, upsert: true });
        if (error) { debug.push(`upload error ${path}: ${error.message}`); continue; }
        const { data } = supabase.storage.from("attachments").getPublicUrl(path);
        uploaded.push({
          uid,
          filename: safe,
          mimeType: att.contentType,
          size: att.data.length,
          url: data.publicUrl,
        });
      }
    }

    return json({ threadId, count: uploaded.length, attachments: uploaded, debug });
  } catch (err) {
    return json({ error: String(err), debug }, 500);
  } finally {
    await imap.logout();
  }
});
