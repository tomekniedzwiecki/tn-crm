# -*- coding: utf-8 -*-
"""Wpięcie checkout-inline@3 (paczkomaty z mapką) do landingu z modułem @2/@3.
IDEMPOTENTNE per krok (poprawka 23.07 po incydencie: warunek „note istnieje" sprawdzany
na CAŁYM pliku łapał literal selektora w JS @3 → markup note nigdy nie wstawiony,
ślepy zaułek płatności na live; teraz każdy krok ma własny, precyzyjny test):
  1. modułowy <style> (marker: '.zc-spin' + '.zc-checkout .zc-card') → <style> z @3,
     jeśli nie zawiera '--zc-map-h' albo różni się od wzorca,
  2. markup <p class="zc-pay-note"...> po .zc-pay-list (przed <p class="zc-err"
     data-err="payment") — test po MARKUPIE '<p class="zc-pay-note"', nie po atrybucie,
  3. modułowy <script> IIFE (marker: 'resolveClientId') → IIFE z @3, jeśli różni się.
Skórka landingu i atrybuty <section id=zamow> NIETYKANE.
Użycie: python -X utf8 inject-checkout3.py <index.html> [kolejne...]"""
import io, re, sys

MOD = r"C:\repos_tn\tn-crm\docs\zbuduje\moduly\checkout-inline@3.html"
NOTE = '<p class="zc-pay-note" data-zc-pay-note role="status" hidden></p>'

def blocks(text):
    styles = [m for m in re.finditer(r"<style[^>]*>(.*?)</style>", text, re.S)
              if ".zc-spin" in m.group(1) and ".zc-checkout .zc-card" in m.group(1)]
    scripts = [m for m in re.finditer(r"<script(?![^>]*src)[^>]*>(.*?)</script>", text, re.S)
               if "resolveClientId" in m.group(1)]
    return styles, scripts

mod = io.open(MOD, encoding="utf-8").read()
mst, msc = blocks(mod)
assert len(mst) == 1 and len(msc) == 1, f"@3: styles={len(mst)} scripts={len(msc)}"
NEW_CSS, NEW_JS = mst[0].group(1), msc[0].group(1)
assert "--zc-map-h" in NEW_CSS and "pickupPointId" in NEW_JS and NOTE in mod

for path in sys.argv[1:]:
    t = io.open(path, encoding="utf-8").read()
    changed = []
    # 3. JS — od tyłu (nie psuje offsetów wcześniejszych bloków)
    _, lsc = blocks(t)
    if len(lsc) == 1:
        if lsc[0].group(1) != NEW_JS:
            s = lsc[0]; t = t[:s.start(1)] + NEW_JS + t[s.end(1):]; changed.append("js")
    else:
        print(path, f"-> POMINIETY (scripts={len(lsc)})"); continue
    # 2. note w MARKUPIE (anchor = pierwszy err payment PO otwarciu sekcji #zamow)
    if '<p class="zc-pay-note"' not in t:
        sec = t.find('<section id="zamow"')
        anchor = t.find('<p class="zc-err" data-err="payment"', sec if sec >= 0 else 0)
        assert anchor > 0, path + ": brak kotwicy err payment w markupie"
        t = t[:anchor] + NOTE + "\n            " + t[anchor:]
        changed.append("note")
    # 1. CSS
    lst, _ = blocks(t)
    if len(lst) == 1 and lst[0].group(1) != NEW_CSS:
        s = lst[0]; t = t[:s.start(1)] + NEW_CSS + t[s.end(1):]; changed.append("css")
    if changed:
        io.open(path, "w", encoding="utf-8", newline="").write(t)
    ok = ('<p class="zc-pay-note"' in t) and ("--zc-map-h" in t) and ("pickupPointId" in t)
    print(path, "->", (",".join(changed) or "bez zmian"), "| weryfikacja:", "OK" if ok else "FAIL")
