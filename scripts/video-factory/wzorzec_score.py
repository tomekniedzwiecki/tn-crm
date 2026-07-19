# -*- coding: utf-8 -*-
"""WZORZEC-SCORE — os A wyboru wzorca UGC (liczby z radaru; decyzja Tomka 19.07).

Ranking kandydatow na WZORZEC kreacji dla produktu z bud_tt_products:
kandydaci = [rekord glowny (tiktok_url)] + tt_shop.videos[] + BLIZNIACZE rekordy
(inne wpisy bud_tt_products wskazujace na to samo video LUB przypisane do tego samego
produktu po nazwie — radar tworzy wiele wpisow tego samego schematu).

OS A (automat, 0-100):
  * viral_ratio  = plays / author_followers (gdy znamy followers rekordu glownego)
                   — 2M plays na koncie 1.8k followers = ALGORYTM pchal SCHEMAT (stolik);
                   ratio >= 100 -> max punktow. Bez followers: neutralne 50%.
  * eng          = (likes + 2*saves + 3*shares + comments) / plays — saves/shares najcenniejsze
                   (intencja); dla tt_shop.videos[] zwykle tylko likes -> liczymy z tego, co jest.
  * plays_abs    = log-skala do 10M (dowod nosnosci).
  * freshness    = newest_days rekordu (schematy sie wypalaja; <=30 dni pelne punkty).
  * twins        = liczba NIEZALEZNYCH wpisow radaru z tym samym video (dowod powtarzalnosci).
Wagi: viral_ratio 0.35 · eng 0.25 · plays_abs 0.20 · freshness 0.10 · twins 0.10.

OSIE B (odtwarzalnosc stackiem) i C (zdatnosc reklamowa) = CHECKLISTA OPERATORA
(PROCEDURA KROK 0) — skrypt daje ranking liczbowy, operator OGLADA top-2-3 covery
i moze przesunac wybor (loguje powod w blueprint.wzorzec). Score != autopilot.

Uzycie: python wzorzec_score.py <tt_product_id | key>
Wymaga: klucz service-role z tn-crm/.env (jak panel-sync).
"""
import sys, os, json, math, importlib.util

_PS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "mockup-tools", "panel-sync.py")
spec = importlib.util.spec_from_file_location("ps", _PS)
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

W = {"viral_ratio": 0.35, "eng": 0.25, "plays_abs": 0.20, "freshness": 0.10, "twins": 0.10}


def _norm_viral_ratio(plays, followers):
    if not followers or followers <= 0:
        return 0.5  # nieznane followers -> neutralnie
    return min(1.0, (plays / followers) / 100.0)


def _norm_eng(likes, plays, comments=0, saves=0, shares=0):
    if not plays:
        return 0.0
    e = (likes + 2 * saves + 3 * shares + comments) / plays
    return min(1.0, e / 0.15)  # 15% wazonego engagementu = max


def _norm_plays(plays):
    if not plays or plays <= 0:
        return 0.0
    return min(1.0, math.log10(plays) / 7.0)  # 10M = 1.0


def _norm_fresh(days):
    if days is None:
        return 0.5
    return max(0.0, min(1.0, 1.0 - (days - 30) / 335.0))  # <=30 dni = 1.0; rok = 0


def score_product(key_or_id):
    by_id = len(key_or_id) == 36 and key_or_id.count("-") == 4
    rows = ps._get("bud_tt_products", {("id" if by_id else "key"): f"eq.{key_or_id}", "select": "*"})
    if not rows:
        raise SystemExit(f"produkt nieznany: {key_or_id}")
    p = rows[0]
    cands = {}

    def add(url, plays, likes, author, src, cover=None, comments=0, saves=0, shares=0, followers=None):
        if not url or url in cands:
            # duplikat = "twin" (dowod powtarzalnosci)
            if url in cands:
                cands[url]["twins"] += 1
                cands[url]["plays"] = max(cands[url]["plays"], plays or 0)
            return
        cands[url] = {"url": url, "plays": plays or 0, "likes": likes or 0, "author": author,
                      "zrodla": [src], "cover": cover, "comments": comments or 0,
                      "saves": saves or 0, "shares": shares or 0, "followers": followers, "twins": 0}

    # 1) rekord glowny
    add(p.get("tiktok_url"), p.get("max_plays"), None, p.get("author"), "rekord-glowny",
        cover=p.get("cover"), comments=p.get("comments"), saves=p.get("saves"),
        shares=p.get("shares"), followers=p.get("author_followers"))
    # 2) tt_shop.videos[]
    for v in ((p.get("tt_shop") or {}).get("videos") or []):
        add(v.get("url") or v.get("tiktok_url"), v.get("plays"), v.get("likes"),
            v.get("author"), "tt_shop.videos", cover=v.get("cover"))
    # 3) blizniacze rekordy radaru (to samo video w innych wpisach)
    urls = [u for u in cands if u]
    if urls:
        twins = ps._get("bud_tt_products", {"tiktok_url": f"in.({','.join(urls)})",
                                            "select": "tiktok_url,max_plays,author_followers,newest_days,status"})
        for t in twins:
            u = t["tiktok_url"]
            if u in cands and u != p.get("tiktok_url"):
                cands[u]["twins"] += 1
            if u in cands and t.get("author_followers") and not cands[u]["followers"]:
                cands[u]["followers"] = t["author_followers"]

    out = []
    for c in cands.values():
        n = {"viral_ratio": _norm_viral_ratio(c["plays"], c["followers"]),
             "eng": _norm_eng(c["likes"], c["plays"], c["comments"], c["saves"], c["shares"]),
             "plays_abs": _norm_plays(c["plays"]),
             "freshness": _norm_fresh(p.get("newest_days")),
             "twins": min(1.0, c["twins"] / 3.0)}
        c["score"] = round(sum(W[k] * n[k] for k in W) * 100, 1)
        c["norm"] = {k: round(v, 2) for k, v in n.items()}
        out.append(c)
    out.sort(key=lambda c: -c["score"])
    return p, out


if __name__ == "__main__":
    p, ranked = score_product(sys.argv[1])
    print(f"PRODUKT: {p.get('pl_name')} ({p['id'][:8]}) | newest_days={p.get('newest_days')}")
    for i, c in enumerate(ranked, 1):
        f = c["followers"] or "?"
        print(f"{i}. score={c['score']:5.1f} plays={c['plays']:>9,} followers={f} "
              f"twins={c['twins']} eng={c['norm']['eng']} vr={c['norm']['viral_ratio']} @{c['author']}")
        print(f"   {c['url']}")
    print("\nUWAGA: to os A (liczby). Osie B (odtwarzalnosc: archetyp/fizyka/zgodnosc wariantu"
          "/audio) i C (hook bez dzwieku, problem-first, product-clarity) = checklista KROK 0;"
          " operator OGLADA covery top-2-3 i loguje wybor w blueprint.wzorzec.")
