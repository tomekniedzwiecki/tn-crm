
# SEKCJA 05-wieczorem (scenowa, BEZ akcentu petrol — sekcja bez CTA)
Prefiks `.wi-`. Eyebrow "TWÓJ MOMENT", .h2: "Twój moment po całym dniu."
+ .lead: "Bez przewodu, bez umawiania się — w domu, kiedy chcesz."
Desktop: LEWA duża foto-karta (55%) = https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/wi-biurko.webp + callout "docisk oburącz";
PRAWA kolumna: mniejsza foto-karta = https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/wi-trening.webp, pod nią karta korzyści
z 2 wierszami (ikona outline + tekst): "Po pracy:" b + "kark, barki, lędźwie" /
"Po treningu:" b + "uda i łydki".
Mobile: stack duża foto→mała foto→karta korzyści.

ID sekcji: <section id="wieczorem">.

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
