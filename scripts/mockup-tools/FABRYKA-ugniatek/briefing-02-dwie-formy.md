
# SEKCJA 02-dwie-formy (TOR-I — interaktywny przełącznik dwóch form użycia)
Prefiks klas `.df-`. Nagłówek: eyebrow "DWIE FORMY", .h2: "Jedna płaska forma. Dwa sposoby użycia."
+ .lead: "Używaj tak, jak Ci wygodnie — dociskaj oburącz lub połóż i oprzyj się."
INTERAKCJA (⚠ JEDEN przełącznik, nie dwa panele naraz — makieta pokazuje OBA STANY tylko
dokumentacyjnie!): segmented control z dwoma pigułkami: "Dociskam oburącz" / "Kładę i opieram się";
aktywna = petrol fill + biały tekst; przełączanie crossfade (opacity .38s var(--mo-ease)) między
DWOMA panelami stanu; aria-selected + role="tablist"; działa też z klawiatury; JS w scoped
<script> (IIFE, bez globali poza init).
STAN A: rząd [foto | karta stref]: foto = https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/df-A.webp (dłonie na obu uchwytach,
docisk do uda); karta stref = near-white .df-card z PROSTĄ sylwetką człowieka PRZÓD jako inline
SVG (outline 1.5px --ink) + 4 markery (kropka --ink + hairline + label): "kark", "barki", "uda",
"łydki". Caption pod: "Dociskasz urządzenie oburącz tam, gdzie sięgasz."
STAN B: rząd [foto | karta]: foto = https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/df-B.webp (między lędźwiami a sofą);
sylwetka TYŁ z markerami: "plecy", "lędźwie". Caption: "Kładziesz Ugniatka i opierasz się —
masuje ciężar ciała."
MOBILE (makieta 2): segmented control full-width, stack foto→karta stref→caption.

ID sekcji: <section id="dwie-formy">.

## KONTRAKT/ZAKAZY (wspólne serii)
- Sekcja wklejana w szkielet: istnieją tokeny :root (--paper/--paper-2/--paper-3/--card/--ink/
  --body/--line/--cta/--cta-hover/--cta-ink/--radius-lg/--radius-sm/--shadow-*/--s1..--s7/
  --content-w/--h2-d/--body-fs) i klasy globalne .wrap .sect-pad .eyebrow .h2 .lead .display
  .btn.cta .pill .callout .reveal. UŻYWAJ ich; style sekcyjne w scoped <style> z prefiksem klas.
- Kolory WYŁĄCZNIE tokenami; zero nowych hexów (poza rgba() chłodnych cieni serii).
  Akcent petrol TYLKO CTA/aktywne stany. Ikony: inline SVG stroke 1.5px currentColor (--ink).
- Zero gwiazdek/liczb opinii, zero przekreśleń cen, zero „24h", zero ciemnych teł sekcji.
- Obrazy: <img> z width/height, loading="lazy", alt PL opisowy, radius var(--radius-lg).
- Dodawaj .reveal do głównych bloków.
- NAJPIERW wypisz siatkę sekcji, POTEM kod.

## FORMAT ODPOWIEDZI
Krótka siatka, potem JEDEN blok ```html: WYŁĄCZNIE <section id="ID"> + scoped <style>.
