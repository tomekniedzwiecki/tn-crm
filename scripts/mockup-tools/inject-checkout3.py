# -*- coding: utf-8 -*-
"""Wpięcie checkout-inline@3 (paczkomaty z mapką) do landingu z modułem @2.
Deterministyczna podmiana 3 bloków (wg instrukcji budowniczego @3):
  1. modułowy <style> (marker: '.zc-spin' + '.zc-checkout .zc-card') → <style> z @3,
  2. wstawka <p data-zc-pay-note> po </div> listy płatności (przed err payment),
  3. modułowy <script> IIFE (marker: 'resolveClientId') → IIFE z @3.
Skórka landingu ('SKORKA modulu') i atrybuty <section id=zamow> NIETKNIĘTE.
Użycie: python -X utf8 inject-checkout3.py <index.html> [kolejne pliki...]"""
import io, re, sys

MOD = r"C:\repos_tn\tn-crm\docs\zbuduje\moduly\checkout-inline@3.html"

def blocks(text):
    styles = [m for m in re.finditer(r"<style[^>]*>(.*?)</style>", text, re.S)
              if ".zc-spin" in m.group(1) and ".zc-checkout .zc-card" in m.group(1)]
    scripts = [m for m in re.finditer(r"<script(?![^>]*src)[^>]*>(.*?)</script>", text, re.S)
               if "resolveClientId" in m.group(1)]
    return styles, scripts

mod = io.open(MOD, encoding="utf-8").read()
mst, msc = blocks(mod)
assert len(mst) == 1 and len(msc) == 1, f"@3: styles={len(mst)} scripts={len(msc)} (oczekiwane 1/1)"
NEW_CSS, NEW_JS = mst[0].group(1), msc[0].group(1)
NOTE = '<p class="zc-pay-note" data-zc-pay-note role="status" hidden></p>'
assert "--zc-map-h" in NEW_CSS and "pickupPointId" in NEW_JS

for path in sys.argv[1:]:
    t = io.open(path, encoding="utf-8").read()
    if "--zc-map-h" in t and "data-zc-pay-note" in t:
        print(path, "-> juz @3, pomijam"); continue
    lst, lsc = blocks(t)
    if len(lst) != 1 or len(lsc) != 1:
        print(path, f"-> POMINIETY: styles={len(lst)} scripts={len(lsc)}"); continue
    # 3. JS (podmiana od konca, zeby offsety styli nie uciekly)
    s = lsc[0]
    t = t[:s.start(1)] + NEW_JS + t[s.end(1):]
    # 2. pay-note: po zamknieciu .zc-pay-list, przed <p class="zc-err" data-err="payment"
    if "data-zc-pay-note" not in t:
        anchor = re.search(r'<p class="zc-err" data-err="payment"', t)
        assert anchor, path + ": brak kotwicy err payment"
        t = t[:anchor.start()] + NOTE + "\n            " + t[anchor.start():]
    # 1. CSS (pozycje przeliczone na nowo po zmianach)
    lst2, _ = blocks(t)
    s = lst2[0]
    t = t[:s.start(1)] + NEW_CSS + t[s.end(1):]
    io.open(path, "w", encoding="utf-8", newline="").write(t)
    ok = ("--zc-map-h" in t) and ("data-zc-pay-note" in t) and ("pickupPointId" in t)
    print(path, "-> WPIETE @3, weryfikacja:", "OK" if ok else "FAIL")
