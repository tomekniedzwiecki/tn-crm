# -*- coding: utf-8 -*-
# Call wf2-gpt (Responses API proxy) z briefingiem + obrazami. UTF-8 end-to-end.
# Uzycie: python wf2gpt-call.py <briefing.md> <out.md> [img_url1 img_url2 ...]
import sys, json, io, os, urllib.request, re

BASE = "https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gpt"

def env_secret():
    txt = io.open(r"c:/repos_tn/tn-crm/.env", encoding="utf-8", errors="ignore").read()
    m = re.search(r"^WF2_GEN_SECRET=(.+)$", txt, re.M)
    return m.group(1).strip()

briefing_path, out_path = sys.argv[1], sys.argv[2]
imgs = sys.argv[3:]
text = io.open(briefing_path, encoding="utf-8").read()

content = [{"type": "input_text", "text": text}]
for u in imgs:
    content.append({"type": "input_image", "image_url": u})

payload = {
    "model": "gpt-5.6-sol",
    "input": [{"role": "user", "content": content}],
    "max_output_tokens": int(os.environ.get("WF2_MAXOUT", "9000")),
}
# WF2_EFFORT: minimal|low|medium|high (mapa fabryki: plan/krytyk/kreatywne=high, kod=medium, poprawki=low)
if os.environ.get("WF2_EFFORT"):
    payload["reasoning"] = {"effort": os.environ["WF2_EFFORT"]}
body = json.dumps(payload).encode("utf-8")

req = urllib.request.Request(BASE, data=body, headers={
    "Content-Type": "application/json",
    "x-wf2-secret": env_secret(),
})
raw = urllib.request.urlopen(req, timeout=600).read()
j = json.loads(raw.decode("utf-8"))
io.open(out_path, "w", encoding="utf-8").write(j.get("text", ""))
u = j.get("usage") or {}
print("OK usage:", json.dumps(u)[:300])
