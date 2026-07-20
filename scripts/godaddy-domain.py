#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
godaddy-domain.py — zakup domen przez GoDaddy Domains API (standard fabryki TN App, krok `nazwa` FAZA 3).

Użycie:
  python scripts/godaddy-domain.py check sygno.pl          # dostępność + cena (NIC nie kupuje)
  python scripts/godaddy-domain.py agreements pl           # wymagane zgody dla TLD
  python scripts/godaddy-domain.py buy sygno.pl            # DRY-RUN: pokaże payload i cenę, NIE kupi
  python scripts/godaddy-domain.py buy sygno.pl --confirm  # PRAWDZIWY ZAKUP (obciąża metodę płatności konta GoDaddy!)
  python scripts/godaddy-domain.py status sygno.pl         # stan domeny na koncie

Klucze (production z https://developer.godaddy.com/keys):
  tn-crm/.env → GODADDY_API_KEY=... i GODADDY_API_SECRET=...   (albo zmienne środowiskowe)

Kontakt rejestranta: defaulty poniżej (dane wykonawcy z settings.aplikacja_wykonawca_dane),
e-mail/telefon przez env GODADDY_CONTACT_EMAIL / GODADDY_CONTACT_PHONE lub flagi --email/--phone.
NS ustawiane OD RAZU na Vercel (ns1/ns2.vercel-dns.com) — flaga --ns pozwala nadpisać.

GOTCHA: GoDaddy od 2024 ogranicza część Domains API dla kont z małą liczbą domen —
403 ACCESS_DENIED na /available oznacza limit konta, nie zły klucz. Wtedy zakup ręczny w UI.
"""
import argparse, datetime, json, os, sys, urllib.request, urllib.error

API = "https://api.godaddy.com"
DEFAULT_NS = ["ns1.vercel-dns.com", "ns2.vercel-dns.com"]

CONTACT_DEFAULTS = {
    "nameFirst": "Tomasz",
    "nameLast": "Niedźwiecki",
    "organization": "Tomasz Niedźwiecki AI",
    "email": os.environ.get("GODADDY_CONTACT_EMAIL", ""),
    "phone": os.environ.get("GODADDY_CONTACT_PHONE", ""),  # format +48.XXXXXXXXX
    "addressMailing": {
        "address1": "ul. Grawerska 30L",
        "city": "Wrocław",
        "state": "dolnośląskie",
        "postalCode": "51-180",
        "country": "PL",
    },
}

def load_keys():
    key = os.environ.get("GODADDY_API_KEY")
    secret = os.environ.get("GODADDY_API_SECRET")
    if not (key and secret):
        env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
        if os.path.exists(env_path):
            for line in open(env_path, encoding="utf-8"):
                line = line.strip()
                if line.startswith("GODADDY_API_KEY="):
                    key = line.split("=", 1)[1]
                elif line.startswith("GODADDY_API_SECRET="):
                    secret = line.split("=", 1)[1]
    if not (key and secret):
        sys.exit("BRAK KLUCZY: ustaw GODADDY_API_KEY i GODADDY_API_SECRET (env lub tn-crm/.env). "
                 "Production key: https://developer.godaddy.com/keys")
    return key, secret

def req(method, path, body=None):
    key, secret = load_keys()
    r = urllib.request.Request(API + path, method=method,
        headers={"Authorization": f"sso-key {key}:{secret}", "Content-Type": "application/json",
                 "Accept": "application/json"})
    data = json.dumps(body, ensure_ascii=False).encode("utf-8") if body is not None else None
    try:
        with urllib.request.urlopen(r, data=data) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try: return e.code, json.loads(raw)
        except Exception: return e.code, {"raw": raw}

def fmt_price(micro, currency):
    return f"{micro/1_000_000:.2f} {currency}" if isinstance(micro, (int, float)) else "?"

def cmd_check(domain):
    code, d = req("GET", f"/v1/domains/available?domain={domain}&checkType=FULL&forTransfer=false")
    print(json.dumps(d, ensure_ascii=False, indent=2))
    if code == 200 and d.get("available"):
        print(f"\nWOLNA — cena: {fmt_price(d.get('price'), d.get('currency','USD'))} / {d.get('period',1)} rok")
    elif code == 403:
        print("\n403 = prawdopodobnie limit konta GoDaddy na Domains API (małe konta) — plan B: zakup w UI.")
    return code

def cmd_agreements(tld):
    code, d = req("GET", f"/v1/domains/agreements?tlds={tld}&privacy=false")
    print(json.dumps(d, ensure_ascii=False, indent=2))
    return code

def build_contact(args):
    c = json.loads(json.dumps(CONTACT_DEFAULTS))
    if args.email: c["email"] = args.email
    if args.phone: c["phone"] = args.phone
    if not c["email"] or not c["phone"]:
        sys.exit("BRAK kontaktu: podaj --email i --phone (+48.XXXXXXXXX) albo env GODADDY_CONTACT_EMAIL/PHONE.")
    return c

def cmd_buy(domain, args):
    tld = domain.split(".", 1)[1]
    code, avail = req("GET", f"/v1/domains/available?domain={domain}&checkType=FULL")
    if code != 200 or not avail.get("available"):
        print(json.dumps(avail, ensure_ascii=False, indent=2))
        sys.exit(f"Domena {domain} niedostępna do zakupu (albo API odmówiło, kod {code}).")
    price = fmt_price(avail.get("price"), avail.get("currency", "USD"))
    code, ag = req("GET", f"/v1/domains/agreements?tlds={tld}&privacy=false")
    if code != 200:
        print(json.dumps(ag, ensure_ascii=False, indent=2)); sys.exit(f"Nie pobrano agreements ({code}).")
    keys = [a["agreementKey"] for a in ag]
    contact = build_contact(args)
    body = {
        "domain": domain,
        "period": 1,
        "renewAuto": True,
        "privacy": False,
        "nameServers": args.ns.split(",") if args.ns else DEFAULT_NS,
        "consent": {
            "agreementKeys": keys,
            "agreedBy": contact["nameFirst"] + " " + contact["nameLast"],
            "agreedAt": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        },
        "contactRegistrant": contact, "contactAdmin": contact,
        "contactTech": contact, "contactBilling": contact,
    }
    print(f"CENA: {price}  |  NS: {body['nameServers']}  |  agreements: {keys}")
    if not args.confirm:
        print("\nDRY-RUN (bez --confirm nie kupuję). Payload:")
        safe = json.loads(json.dumps(body)); safe["contactRegistrant"]["phone"] = "***"
        print(json.dumps(safe, ensure_ascii=False, indent=2))
        return 0
    code, d = req("POST", "/v1/domains/purchase", body)
    print(f"HTTP {code}"); print(json.dumps(d, ensure_ascii=False, indent=2))
    if code in (200, 202):
        print(f"\nKUPIONA: {domain} (orderId: {d.get('orderId')}). NS już wskazują na Vercel.")
    return code

def cmd_status(domain):
    code, d = req("GET", f"/v1/domains/{domain}")
    print(json.dumps(d, ensure_ascii=False, indent=2))
    return code

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["check", "agreements", "buy", "status"])
    ap.add_argument("target")
    ap.add_argument("--confirm", action="store_true", help="wykonaj PRAWDZIWY zakup")
    ap.add_argument("--email", default=""); ap.add_argument("--phone", default="")
    ap.add_argument("--ns", default="", help="lista NS po przecinku (default: Vercel)")
    a = ap.parse_args()
    if a.cmd == "check": sys.exit(0 if cmd_check(a.target) == 200 else 1)
    if a.cmd == "agreements": sys.exit(0 if cmd_agreements(a.target) == 200 else 1)
    if a.cmd == "buy": sys.exit(0 if cmd_buy(a.target, a) in (0, 200, 202) else 1)
    if a.cmd == "status": sys.exit(0 if cmd_status(a.target) == 200 else 1)
