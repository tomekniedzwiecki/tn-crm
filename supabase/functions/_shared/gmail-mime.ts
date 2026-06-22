// Minimal MIME parser for RFC822 messages. Pulls out attachments.
// Used by gmail-fetch-attachments.

export interface ParsedAttachment {
  filename: string;
  contentType: string;
  data: Uint8Array;
}

export function decodeBase64(s: string): Uint8Array {
  const cleaned = s.replace(/[\r\n\s]/g, "");
  const bin = atob(cleaned);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function decodeQuotedPrintable(s: string): Uint8Array {
  const decoded = s
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-Fa-f]{2})/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));
  const out = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) out[i] = decoded.charCodeAt(i);
  return out;
}

export function findBoundary(contentTypeValue: string): string | null {
  const m = contentTypeValue.match(/boundary\s*=\s*"?([^";\r\n]+)"?/i);
  return m ? m[1] : null;
}

export function headerValue(headers: string, name: string): string | null {
  const re = new RegExp(`^${name}:\\s*([^\\r\\n]+(?:\\r\\n[ \\t][^\\r\\n]+)*)`, "im");
  const m = headers.match(re);
  return m ? m[1].replace(/\r\n[ \t]/g, " ").trim() : null;
}

export function paramFromHeader(headerVal: string, paramName: string): string | null {
  // Try RFC 2231 encoded first: param*=charset''value
  const enc = headerVal.match(new RegExp(`${paramName}\\*=([^;]+)`, "i"));
  if (enc) {
    const v = enc[1].trim().replace(/^"|"$/g, "");
    const parts = v.split("''");
    const raw = parts.length === 2 ? parts[1] : v;
    // RFC 2231 value may be percent-encoded in a non-UTF-8 charset (e.g. iso-8859-2
    // Polish filenames). decodeURIComponent throws URIError on such bytes — the name
    // is sanitized downstream anyway, so fall back to the raw string instead of crashing.
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw.replace(/%[0-9A-Fa-f]{2}/g, "_");
    }
  }
  const m = headerVal.match(new RegExp(`${paramName}\\s*=\\s*"?([^";]+)"?`, "i"));
  return m ? m[1].trim() : null;
}

export function splitHeadersBody(part: Uint8Array): { headers: string; body: Uint8Array } {
  // Headers decoded as UTF-8 (handles raw Polish chars in Subject/From etc).
  // Body remains binary (caller decides decoding based on Content-Type).
  // Note: per RFC 5322 headers should be ASCII (non-ASCII must be RFC 2047 encoded),
  // but Gmail clients often send raw UTF-8 in headers when transport is 8bit-clean.
  for (let i = 0; i < part.length - 3; i++) {
    if (part[i] === 13 && part[i + 1] === 10 && part[i + 2] === 13 && part[i + 3] === 10) {
      const headers = new TextDecoder("utf-8", { fatal: false }).decode(part.subarray(0, i));
      const body = part.subarray(i + 4);
      return { headers, body };
    }
  }
  return { headers: new TextDecoder("utf-8", { fatal: false }).decode(part), body: new Uint8Array(0) };
}

export function splitByBoundary(body: Uint8Array, boundary: string): Uint8Array[] {
  const marker = new TextEncoder().encode(`--${boundary}`);
  const parts: Uint8Array[] = [];
  let start = -1;
  let i = 0;
  while (i <= body.length - marker.length) {
    let match = true;
    for (let j = 0; j < marker.length; j++) {
      if (body[i + j] !== marker[j]) { match = false; break; }
    }
    if (match) {
      if (start !== -1) {
        let s = start;
        if (body[s] === 13 && body[s + 1] === 10) s += 2;
        let e = i;
        if (body[e - 2] === 13 && body[e - 1] === 10) e -= 2;
        parts.push(body.subarray(s, e));
      }
      const after = i + marker.length;
      if (body[after] === 45 && body[after + 1] === 45) break;
      i = after;
      if (body[i] === 13 && body[i + 1] === 10) i += 2;
      start = i;
      continue;
    }
    i++;
  }
  return parts;
}

export function extractAttachments(message: Uint8Array, trace?: string[]): ParsedAttachment[] {
  const { headers, body } = splitHeadersBody(message);
  const ct = headerValue(headers, "Content-Type") || "";
  trace?.push(`root CT: ${ct.substring(0, 120)}`);
  const boundary = findBoundary(ct);
  trace?.push(`root boundary: ${boundary}`);
  const out: ParsedAttachment[] = [];
  if (!boundary) return out;

  const walk = (partBytes: Uint8Array, depth: number) => {
    const { headers: ph, body: pb } = splitHeadersBody(partBytes);
    const pct = headerValue(ph, "Content-Type") || "text/plain";
    const disp = headerValue(ph, "Content-Disposition") || "";
    trace?.push(`${"  ".repeat(depth)}part CT=${pct.substring(0, 80)} disp=${disp.substring(0, 80)} bodyLen=${pb.length}`);
    if (/^multipart\//i.test(pct)) {
      const subBoundary = findBoundary(pct);
      if (!subBoundary) { trace?.push(`${"  ".repeat(depth)}  no boundary in multipart`); return; }
      const subs = splitByBoundary(pb, subBoundary);
      trace?.push(`${"  ".repeat(depth)}  split into ${subs.length} sub-parts`);
      for (const sp of subs) walk(sp, depth + 1);
      return;
    }
    const filenameDisp = paramFromHeader(disp, "filename");
    const filenameCt = paramFromHeader(pct, "name");
    const filename = filenameDisp || filenameCt;
    const isAttachment = /attachment/i.test(disp) || (filename && !/^text\//i.test(pct));
    if (!isAttachment || !filename) { trace?.push(`${"  ".repeat(depth)}  skip (no filename or text)`); return; }

    const cte = (headerValue(ph, "Content-Transfer-Encoding") || "7bit").toLowerCase();
    const bodyStr = new TextDecoder("latin1").decode(pb);
    let data: Uint8Array;
    if (cte === "base64") data = decodeBase64(bodyStr);
    else if (cte === "quoted-printable") data = decodeQuotedPrintable(bodyStr);
    else data = pb;

    const ctMatch = pct.match(/^([^;]+)/);
    const contentType = ctMatch ? ctMatch[1].trim() : "application/octet-stream";
    trace?.push(`${"  ".repeat(depth)}  ✓ attachment ${filename} (${contentType}, ${data.length}B, cte=${cte})`);
    out.push({ filename, contentType, data });
  };

  const topParts = splitByBoundary(body, boundary);
  trace?.push(`root split into ${topParts.length} parts`);
  for (const sp of topParts) walk(sp, 1);
  return out;
}
