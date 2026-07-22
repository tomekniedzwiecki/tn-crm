
# SEKCJA 07-zestaw
Prefiks `.ze-`. Eyebrow "ZESTAW", .h2: "Co dokładnie dostajesz".
Desktop: LEWA foto-karta = https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/ze-flatlay.webp + callout "komplet w pudełku";
PRAWA karta-tabela spec (4 wiersze, etykieta | wartość --font-display 700): "Wymiary" |
"28 × 16,5 × 11 cm"; "Waga" | "1113 g"; "Moc" | "10 W"; "Certyfikaty" | "CE · RoHS · FCC".
Pod tabelą pas-karta: https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/ze-profil.webp z bocznym wymiarem "11 cm"
(pionowa hairline + label — element kodowy, nie na obrazie).
Mobile: stack flat-lay→tabela→profil.

ID sekcji: <section id="zestaw">.

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
