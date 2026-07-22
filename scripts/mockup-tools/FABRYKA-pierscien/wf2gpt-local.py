# -*- coding: utf-8 -*-
"""Lokalny wariant wf2gpt-call.py: Responses API BEZPOŚREDNIO (OPENAI_API_KEY z .env).
Powód: edge wf2-gpt pada 504 na effort=high (wall-clock 330 s) — lokalnie bez limitu.
Użycie: python wf2gpt-local.py <briefing.md> <out.md> [img_url1 img_url2 ...]"""
import io, json, os, re, sys, urllib.request

sys.stdout.reconfigure(encoding='utf-8')


def env_key():
    txt = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
    m = re.search(r'^OPENAI_API_KEY=(.+)$', txt, re.M)
    return m.group(1).strip()


briefing_path, out_path = sys.argv[1], sys.argv[2]
imgs = sys.argv[3:]
text = io.open(briefing_path, encoding='utf-8').read()

content = [{"type": "input_text", "text": text}]
for u in imgs:
    content.append({"type": "input_image", "image_url": u})

payload = {
    "model": os.environ.get("WF2_MODEL", "gpt-5.6-sol"),
    "input": [{"role": "user", "content": content}],
    "max_output_tokens": int(os.environ.get("WF2_MAXOUT", "9000")),
}
if os.environ.get("WF2_EFFORT"):
    payload["reasoning"] = {"effort": os.environ["WF2_EFFORT"]}

req = urllib.request.Request("https://api.openai.com/v1/responses",
                             data=json.dumps(payload).encode("utf-8"),
                             headers={"Content-Type": "application/json",
                                      "Authorization": "Bearer " + env_key()})
raw = urllib.request.urlopen(req, timeout=900).read()
j = json.loads(raw.decode("utf-8"))
# Responses API: output[] → message → content[] → output_text
text_out = ""
for item in j.get("output", []):
    if item.get("type") == "message":
        for c in item.get("content", []):
            if c.get("type") == "output_text":
                text_out += c.get("text", "")
io.open(out_path, "w", encoding="utf-8").write(text_out)
u = j.get("usage") or {}
print("OK len=%d usage: %s" % (len(text_out), json.dumps(u)[:300]))
