// Pure-Deno Gmail IMAP client (no npm dependencies).
// Used by edge functions: gmail-fetch-attachments, gmail-create-draft, gmail-scan-clients.

export class GmailImap {
  private conn!: Deno.TlsConn;
  private encoder = new TextEncoder();
  private decoder = new TextDecoder("latin1"); // preserve bytes for binary literals
  private tagCounter = 0;
  private leftover = new Uint8Array(0);

  async connect(host = "imap.gmail.com", port = 993) {
    this.conn = await Deno.connectTls({ hostname: host, port });
    await this.readLine(); // greeting "* OK ..."
  }

  private nextTag(): string {
    return `a${(++this.tagCounter).toString().padStart(3, "0")}`;
  }

  private async write(s: string) {
    await this.conn.write(this.encoder.encode(s));
  }

  /** Write raw bytes (for IMAP literals after `{N}\r\n`). */
  private async writeBytes(bytes: Uint8Array) {
    let written = 0;
    while (written < bytes.length) {
      const n = await this.conn.write(bytes.subarray(written));
      written += n;
    }
  }

  /** Read until \r\n. Returns line (without CRLF) as latin1 string. */
  private async readLine(): Promise<string> {
    const chunks: number[] = [];
    while (true) {
      if (this.leftover.length > 0) {
        const idx = this.leftover.indexOf(13); // CR
        if (idx !== -1 && idx + 1 < this.leftover.length && this.leftover[idx + 1] === 10) {
          for (let i = 0; i < idx; i++) chunks.push(this.leftover[i]);
          this.leftover = this.leftover.slice(idx + 2);
          return this.decoder.decode(new Uint8Array(chunks));
        }
        for (let i = 0; i < this.leftover.length; i++) chunks.push(this.leftover[i]);
        this.leftover = new Uint8Array(0);
      }
      const buf = new Uint8Array(16384);
      const n = await this.conn.read(buf);
      if (n === null) throw new Error("IMAP connection closed");
      this.leftover = buf.subarray(0, n);
    }
  }

  /** Read exactly N bytes (raw, binary-safe). */
  private async readBytes(n: number): Promise<Uint8Array> {
    const out = new Uint8Array(n);
    let filled = 0;
    if (this.leftover.length > 0) {
      const take = Math.min(this.leftover.length, n);
      out.set(this.leftover.subarray(0, take), 0);
      filled += take;
      this.leftover = this.leftover.subarray(take);
    }
    while (filled < n) {
      const buf = new Uint8Array(Math.min(65536, n - filled));
      const got = await this.conn.read(buf);
      if (got === null) throw new Error("IMAP connection closed");
      out.set(buf.subarray(0, got), filled);
      filled += got;
    }
    return out;
  }

  private quote(s: string) {
    return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }

  async runCommand(cmd: string): Promise<string[]> {
    const tag = this.nextTag();
    await this.write(`${tag} ${cmd}\r\n`);
    const lines: string[] = [];
    while (true) {
      const line = await this.readLine();
      lines.push(line);
      if (line.startsWith(`${tag} OK`)) return lines;
      if (line.startsWith(`${tag} NO`) || line.startsWith(`${tag} BAD`)) {
        throw new Error(`IMAP ${cmd.split(" ")[0]} failed: ${line}`);
      }
    }
  }

  async login(user: string, pass: string) {
    // Google App Passwords are shown with spaces but accepted without.
    await this.runCommand(`LOGIN ${this.quote(user)} ${this.quote(pass.replace(/\s+/g, ""))}`);
  }

  async select(mailbox: string) {
    await this.runCommand(`SELECT ${this.quote(mailbox)}`);
  }

  /** LIST all mailboxes, return their wire names + flags. */
  async listMailboxes(): Promise<Array<{ name: string; flags: string[] }>> {
    const lines = await this.runCommand(`LIST "" "*"`);
    const out: Array<{ name: string; flags: string[] }> = [];
    for (const line of lines) {
      const m = line.match(/^\* LIST \(([^)]*)\) "[^"]*" (?:"((?:[^"\\]|\\.)+)"|(\S+))/);
      if (!m) continue;
      const flags = m[1].trim().split(/\s+/).filter(Boolean);
      const name = (m[2] !== undefined ? m[2].replace(/\\(.)/g, "$1") : m[3]);
      out.push({ name, flags });
    }
    return out;
  }

  /** Find folder by IMAP special-use flag (e.g. `\All`, `\Drafts`, `\Sent`, `\Trash`). */
  async findFolderByFlag(flag: string): Promise<string | null> {
    const boxes = await this.listMailboxes();
    const target = flag.toLowerCase();
    const match = boxes.find((b) => b.flags.some((f) => f.toLowerCase() === target));
    return match?.name ?? null;
  }

  async selectAllMail(): Promise<string> {
    const name = await this.findFolderByFlag("\\All");
    const target = name ?? "[Gmail]/All Mail";
    await this.select(target);
    return target;
  }

  async selectDrafts(): Promise<string> {
    const name = await this.findFolderByFlag("\\Drafts");
    const target = name ?? "[Gmail]/Drafts";
    await this.select(target);
    return target;
  }

  /** Gmail-specific: search by thread ID (decimal string, not hex). */
  async searchByThreadId(threadIdDecimal: string): Promise<number[]> {
    const lines = await this.runCommand(`UID SEARCH X-GM-THRID ${threadIdDecimal}`);
    const searchLine = lines.find((l) => /^\* SEARCH/i.test(l));
    if (!searchLine) return [];
    const parts = searchLine.replace(/^\* SEARCH/i, "").trim().split(/\s+/).filter(Boolean);
    return parts.map((p) => Number(p)).filter((n) => Number.isFinite(n));
  }

  /** Fetch full RFC822 body for a UID (binary-safe). */
  async fetchBody(uid: number): Promise<Uint8Array> {
    const tag = this.nextTag();
    await this.write(`${tag} UID FETCH ${uid} BODY.PEEK[]\r\n`);
    let body: Uint8Array | null = null;
    while (true) {
      const line = await this.readLine();
      const litMatch = line.match(/\{(\d+)\}$/);
      if (litMatch) {
        const size = Number(litMatch[1]);
        body = await this.readBytes(size);
        continue;
      }
      if (line.startsWith(`${tag} OK`)) break;
      if (line.startsWith(`${tag} NO`) || line.startsWith(`${tag} BAD`)) {
        throw new Error(`UID FETCH failed: ${line}`);
      }
    }
    if (!body) throw new Error(`No body returned for UID ${uid}`);
    return body;
  }

  /** Fetch specific headers for a UID (returns text). Useful for getting Message-ID / References without full body. */
  async fetchHeaders(uid: number, fields: string[]): Promise<string> {
    const fieldsList = fields.join(" ");
    const tag = this.nextTag();
    await this.write(`${tag} UID FETCH ${uid} BODY.PEEK[HEADER.FIELDS (${fieldsList})]\r\n`);
    let headers = "";
    while (true) {
      const line = await this.readLine();
      const litMatch = line.match(/\{(\d+)\}$/);
      if (litMatch) {
        const size = Number(litMatch[1]);
        const bytes = await this.readBytes(size);
        headers = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
        continue;
      }
      if (line.startsWith(`${tag} OK`)) break;
      if (line.startsWith(`${tag} NO`) || line.startsWith(`${tag} BAD`)) {
        throw new Error(`UID FETCH HEADERS failed: ${line}`);
      }
    }
    return headers;
  }

  /**
   * APPEND a raw RFC822 message to a mailbox (e.g. Drafts).
   * `flags` example: ["\\Draft", "\\Seen"]. Default: ["\\Draft"].
   * Uses IMAP literal `{N}\r\n<bytes>` syntax (non-synchronizing handled by waiting for "+ continuation").
   */
  async appendMessage(mailbox: string, rfc822: Uint8Array, flags: string[] = ["\\Draft"]): Promise<void> {
    const tag = this.nextTag();
    const flagsStr = `(${flags.join(" ")})`;
    const cmd = `${tag} APPEND ${this.quote(mailbox)} ${flagsStr} {${rfc822.length}}\r\n`;
    await this.write(cmd);
    // Server should respond with "+ Ready for literal data" (or similar continuation)
    const cont = await this.readLine();
    if (!cont.startsWith("+")) {
      throw new Error(`APPEND continuation expected, got: ${cont}`);
    }
    await this.writeBytes(rfc822);
    await this.write("\r\n");
    // Wait for tagged OK
    while (true) {
      const line = await this.readLine();
      if (line.startsWith(`${tag} OK`)) return;
      if (line.startsWith(`${tag} NO`) || line.startsWith(`${tag} BAD`)) {
        throw new Error(`APPEND failed: ${line}`);
      }
    }
  }

  async logout() {
    try { await this.write(`a999 LOGOUT\r\n`); } catch { /* ignore */ }
    try { this.conn.close(); } catch { /* ignore */ }
  }
}

/** Convert Gmail hex thread ID (e.g. "19e0c5426e02e9f9") to decimal string for IMAP X-GM-THRID search. */
export function gmailThreadIdToDecimal(hexId: string): string {
  return BigInt("0x" + hexId).toString();
}
