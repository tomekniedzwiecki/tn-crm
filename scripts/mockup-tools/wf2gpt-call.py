# -*- coding: utf-8 -*-
# Call wf2-gpt (Responses API proxy) z briefingiem + obrazami. UTF-8 end-to-end.
# Uzycie: python wf2gpt-call.py <briefing.md> <out.md> [img_url1 img_url2 ...]
#
# PROMPT-CACHE (KAPITALIZACJA-OPS §2): OpenAI Responses API cache'uje IDENTYCZNY prefix >=1024 tok
# AUTOMATYCZNIE. Skladaj <briefing.md> PREFIX-FIRST: statyczne partiale (PARTIALE-PROMPTY.md verbatim)
# NA GORZE, zmienne (PASZPORT/ICP/PLAN/tokeny/sekcja) NA DOLE. Jakosc identyczna (ten sam tekst),
# tylko szybciej/taniej. Zero zmian w payloadzie — nie dokladamy pol (ryzyko odrzucenia przez proxy).
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

def call_edge():
    req = urllib.request.Request(BASE, data=body, headers={
        "Content-Type": "application/json",
        "x-wf2-secret": env_secret(),
    })
    raw = urllib.request.urlopen(req, timeout=600).read()
    j = json.loads(raw.decode("utf-8"))
    return j.get("text", ""), j.get("usage") or {}

def call_openai_local():
    # FALLBACK (LL: edge wall-clock 330s → 504 przy effort=high): Responses API
    # bezposrednio z OPENAI_API_KEY z .env. Tylko modele nie-kimi.
    txt = io.open(r"c:/repos_tn/tn-crm/.env", encoding="utf-8", errors="ignore").read()
    m = re.search(r"^OPENAI_API_KEY=(.+)$", txt, re.M)
    if not m:
        raise RuntimeError("brak OPENAI_API_KEY w .env — fallback lokalny niedostepny")
    req = urllib.request.Request("https://api.openai.com/v1/responses", data=body, headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer " + m.group(1).strip(),
    })
    raw = urllib.request.urlopen(req, timeout=900).read()
    j = json.loads(raw.decode("utf-8"))
    out = ""
    for item in j.get("output", []):
        if item.get("type") == "message":
            for c in item.get("content", []):
                if c.get("type") == "output_text":
                    out += c.get("text", "")
    return out, j.get("usage") or {}

try:
    text_out, u = call_edge()
except urllib.error.HTTPError as e:
    if e.code in (502, 503, 504) and not payload["model"].startswith("kimi"):
        print("edge %d -> fallback lokalny OpenAI (Responses API)" % e.code)
        text_out, u = call_openai_local()
    else:
        raise
io.open(out_path, "w", encoding="utf-8").write(text_out)
print("OK usage:", json.dumps(u)[:300])
