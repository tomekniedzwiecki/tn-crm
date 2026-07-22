Jesteś koderem fabryki landingów. Zbuduj JEDEN kompletny, samowystarczalny plik HTML
(inline CSS/JS, zero zewnętrznych bibliotek; Google Fonts dozwolone z subsetem latin-ext) —
STRONĘ GŁÓWNĄ sklepu internetowego. To mała witryna-rozdzielnia marki, NIE landing.

KANON (nienaruszalny):
- Sekcje DOKŁADNIE: (1) topbar [logo + slim linia zaufania „Płatność przy odbiorze · 14 dni na zwrot"],
  (2) intro nad foldem [H1 = nazwa + tagline, akapit answer-first 40-75 słów], (3) pas zaufania
  [3 chipy: płatność przy odbiorze / 14 dni na zwrot / bezpieczne płatności], (4) GALERIA KART
  produktów (rdzeń), (5) krótka banda „jak to działa" (1-2 zdania), (6) footer (moduł niżej).
  ŻADNYCH innych sekcji: bez wideo, opinii, demo, porównań, offer-boxów, sticky-buy.
- Karta produktu: obraz (jedna proporcja 1/1 na WSZYSTKICH kartach, object-fit:cover),
  nazwa mini-marki (font display marki), 1-zdaniowy hook, cena, CTA „Zobacz …". CAŁA karta
  = jeden <a> do landinga. Rama karty w tokenach MARKI PARASOLOWEJ (jeden akcent UI);
  indywidualność produktu niesie WYŁĄCZNIE fotografia.
- Siatka: repeat(auto-fit,minmax(280px,1fr)), max-width kontenera ~1140px; 3→2→1 kolumn.
  Kontener kart MUSI mieć atrybut data-cards. Stan data-count="1" = karta featured
  (szersza, poziomy układ obraz+treść na desktopie) — obsłuż w CSS.
- Rytm 8pt; JASNE tła (⛔ ciemne); DOKŁADNIE JEDEN akcent UI; jeden radius; touch-target ≥44px;
  prefers-reduced-motion; zero h-scrolla 320-1920px; diakrytyki PL wszędzie poprawne.
- ⛔ gwiazdki/oceny nad foldem (dozwolone tylko w footerze, tu: brak — nie mamy ocen sklepu).
- ⛔ liczb zmyślonych (opinii, klientów, lat). Zero urgency/przecen.
- Subtelny ruch dozwolony: hover kart (transform 2-3px + cień), fade-in on-scroll przez
  IntersectionObserver z fallbackiem bez JS. Nic więcej.

KONTRAKT TECHNICZNY (twardy — bez niego strona nie przejdzie montażu):
- W <head>: <title>{NAZWA} — {TAGLINE}</title>, meta description (answer-first),
  <meta name="robots" content="noindex,nofollow">, <link rel="canonical" href="{{CANONICAL_URL}}">,
  og:title/og:description/og:image={{OG_URL}}, favicon = URL podany niżej.
- Miejsce na karty: kontener z data-cards, w środku DOKŁADNIE:
  <!--CARDS:START--><!--CARDS:END-->
  (montaż wstrzykuje karty między te markery — NIE wpisuj przykładowych kart do środka).
- Wzorzec karty umieść W KOMENTARZU zaraz nad kontenerem:
  <!--CARD-TEMPLATE
  …markup jednej karty z placeholderami {{CARD_URL}} {{CARD_IMG}} {{CARD_NAME}} {{CARD_HOOK}}
  {{CARD_PRICE}} {{CARD_PID}} {{CARD_CTA}} {{CARD_ALT}}…
  CARD-TEMPLATE-->
  Cena w karcie: <span class="…" data-wf2-product="{{CARD_PID}}">{{CARD_PRICE}}</span>.
- Przed </head>: <!--ITEMLIST:START--><!--ITEMLIST:END--> (montaż wstawi JSON-LD).
- Przed </body> skrypt hydratacji cen (fetch GET
  https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-landing-api?product=<uuid>
  dla każdego [data-wf2-product]; odpowiedź {price}; podmień tekst na format
  „123,45 zł"; błędy cicho ignoruj) + defensywne
  window.trevio?.viewItemList?.() w try/catch.
- Footer: użyj DOKŁADNIE modułu footer@1 (markup+style niżej; skórka = tokeny marki,
  wordmark TEKSTEM, favicon jako brand-mark). Linki prawne zostaw jako {{REGULAMIN_URL}},
  {{POLITYKA_URL}}, {{ZWROTY_URL}}, {{DOSTAWA_URL}}, {{KONTAKT_URL}} (podmienia je publikacja).
  W footerze POMIŃ rating (nie mamy ocen sklepu). Pay-badges: prosty rząd tekstowych
  pigułek BLIK · Visa · Mastercard · Pobranie (bez SVG logotypów).
- Obrazy: loading="lazy" poza pierwszym; width/height lub aspect-ratio (zero CLS).

ZWRÓĆ WYŁĄCZNIE kompletny HTML w jednym bloku ```html … ``` — bez komentarza od siebie.


--- DANE MARKI (partytura — zaprojektuj wyraz strony Z TYCH danych) ---
Nazwa: Trafionek
Tagline: Trafione rzeczy na co dzień
Opis marki (do answer-first, przeredaguj zwięźle): Trafionek to sklep z rzeczami, które po prostu robią robotę — wybieramy je pojedynczo spośród setek trendów i zostawiamy tylko trafione. Od domu i relaksu po auto i zwierzaki: każdy produkt ma tu własną małą markę i stronę, na której dokładnie pokazujemy, co potrafi. Płacisz przy odbiorze, a jeśli coś nie zagra — masz 14 dni na zwrot.
Paleta (role): primary #E63946 · accent #2A9D8F · ink #26221E · bg #FDF8F2 · bg-alt #F6EDE2 · border #E7DCCD (JASNE tła)
UWAGA paleta: primary = JEDYNY akcent UI (CTA, drobne podkreślenia). Drugiego koloru marki NIE używaj w chromie UI (żyje w grafice logo). Tła z rodziny bg/bg-alt, linie border.
Fonty: heading: Fredoka (latin-ext) · body: Nunito (latin-ext) (Google Fonts, subset latin-ext, display=swap)
Logo (topbar, wys. ~36-40px): https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/parasol-trafionek/brand/logo-combo.png
Favicon: https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/parasol-trafionek/brand/favicon-512.png
Sygnatura marki: motyw „trafienia” (ptaszek/metka z logo) — użyj OSZCZĘDNIE jako 1 akcent wydawniczy (np. znacznik przy H1 albo markery listy w bandzie), nie tapeta.

--- PRODUKTY (przykładowe DANE do wyczucia proporcji; NIE wpisuj ich w HTML — karty wstrzyknie montaż przez markery; 3 szt. teraz, będzie rosło) ---
- Kłujek: Kłujek to mata do akupresury z wałkiem pod kark. · 109,90 zł · foto https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/mata/gallery-curated/keep1_packshot-zestaw-3-4.webp
- Odprężek: Odprężek to bezprzewodowy masażer karku i ramion. · 179,00 zł · foto https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/masazer/scenes/oferta.webp
- Drapek: Drapek to drewniana deska ze schowkiem na smakołyki, na której pies sam ściera pazury podczas zabawy. · 74,90 zł · foto https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/drapek/scenes/oferta.webp

--- MODUŁ footer@1 (osadź 1:1, skórka=tokeny marki, bez ratingu) ---
<!--
============================================================================
MODUŁ KANONICZNY: footer@1
ŹRÓDŁO:   drapek@FINALNY-MONTAŻ (2026-07-18) — stopka „porządna" na życzenie
          Tomka („footer praktycznie nie ma, ważne miejsce: regulamin, polityka,
          elementy zaufania"). Pierwszy kanoniczny footer fabryki.
ROLA:     STOPKA każdego landingu = marka + linki prawne + warstwa zaufania +
          copyright. Bez JS (czysty layout/grid). Wielokolumnowy desktop /
          stack mobile.

────────────────────────────────────────────────────────────────────────────
KONTRAKT SKÓROWANIA (co WOLNO zmienić — Z6 „design per projekt" dotyczy WYGLĄDU):
  • tokeny/kolory/promienie/cienie (paleta landingu),
  • TREŚĆ: nazwa marki, claim, teksty linków, chipy zaufania, rating, copyright,
  • lockup marki: favicon LEWA + żywy wordmark PRAWA (F2.5 — wordmark = TEKST, nie obraz),
  • font display (Baloo 2 → font marki).

CO JEST NIETYKALNE (struktura/mechanika layoutu — NIE RUSZAĆ):
  • 3 strefy .foot-top: (1) marka+claim+rating (2) linki prawne (3) zaufanie,
  • KOMPLET linków prawnych: Regulamin · Polityka prywatności · Zwroty i reklamacje ·
    Dostawa · Kontakt — href = PLACEHOLDERY {{REGULAMIN_URL}} itp. (podmiana przy publikacji, jak {{CANONICAL_URL}}),
  • warstwa zaufania: pay-badges KANONICZNE (blik/visa/mc/cod) + chipy (14 dni zwrot,
    bezpieczne płatności, wysyłka) + rating ★ (realny: 4,7/182 lub z bazy),
  • .foot-bottom: hairline + copyright + nota (VAT / zdjęcia poglądowe),
  • siatka responsywna: 3 kol → 2 kol (≤820, marka span-full) → 1 kol (≤520),
  • touch-target linków ≥40px (min-height na <a>).

UŻYCIE: wklej STYLE do <head> (lub scoped) + MARKUP na końcu <body>, przed
  modułami sticky-buy/lightbox. pay-badges = ten sam kanon co hero/oferta
  (id gradientu BLIK unikalny per wystąpienie: pbblikg4/g5…).

⛔ ANTY-WZORZEC: „stopka = jedna linijka wyśrodkowana" (marka + tag + legal) —
   to NIE jest footer. Brak linków prawnych / brak warstwy zaufania = ODSTĘPSTWO
   raportowane w LEDGER. Wordmark z obrazka (gpt-image) = ZAKAZ (diakrytyki).
============================================================================
-->

<!-- (1) STYLE — do <head>. Klasy #footer .foot-*. Skórka = tokeny landingu. -->
<style>
  #footer{background:var(--paper-2);border-top:1px solid var(--line);color:var(--body)}
  #footer .foot-top{display:grid;grid-template-columns:1.5fr 1fr 1.2fr;gap:clamp(26px,4vw,60px);
    padding:clamp(46px,6vw,74px) 0 clamp(30px,3.4vw,44px)}
  #footer .foot-brand{display:flex;align-items:center;gap:10px;color:var(--ink)}
  #footer .foot-brand .brand-mark{height:34px;width:auto;display:block;flex:0 0 auto} /* PRAWDZIWY favicon (F2.5) */
  #footer .foot-brand span{font-family:"Baloo 2",sans-serif;font-weight:700;font-size:27px;letter-spacing:.01em}
  #footer .foot-claim{margin-top:15px;font-size:14.5px;color:var(--body);line-height:1.55;max-width:340px}
  #footer .foot-rating{margin-top:17px;display:inline-flex;align-items:center;gap:9px;font-size:13.5px;color:var(--ink);font-weight:600}
  #footer .foot-rating .stars{font-size:14px;color:var(--star)}
  #footer .foot-h{font-family:"Baloo 2",sans-serif;font-weight:700;font-size:15px;color:var(--ink);letter-spacing:.02em;margin-bottom:16px}
  #footer .foot-nav{list-style:none;margin:0;padding:0;display:grid;gap:2px}
  #footer .foot-nav a{font-size:14.5px;color:var(--body);display:inline-flex;align-items:center;min-height:44px;transition:color .18s ease}
  #footer .foot-nav a:hover{color:var(--cta-d)}
  #footer .foot-trust{display:grid;gap:16px}
  #footer .foot-chips{display:grid;gap:11px}
  #footer .foot-chip{display:inline-flex;align-items:center;gap:9px;font-size:13.5px;color:var(--body);line-height:1.35}
  #footer .foot-chip svg{width:18px;height:18px;flex:0 0 auto;color:var(--cta)}
  #footer .foot-bottom{border-top:1px solid var(--line);padding:22px 0 clamp(30px,3vw,42px);
    display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
  #footer .foot-copy{font-size:12.5px;color:var(--muted);line-height:1.5}
  #footer .foot-note{font-size:12px;color:var(--muted)}
  @media(max-width:820px){
    #footer .foot-top{grid-template-columns:1fr 1fr;gap:34px 28px}
    #footer .foot-brandcol{grid-column:1 / -1}
  }
  @media(max-width:520px){
    #footer .foot-top{grid-template-columns:1fr;gap:30px}
    #footer .foot-bottom{flex-direction:column;align-items:flex-start;gap:10px}
  }
</style>

<!-- (2) MARKUP — koniec <body>. Wymaga .wrap + .pay-badges + .stars (z bazy landingu).
     Podmień: MARKA_NAZWA, FAVICON_URL, claim, rating, {{*_URL}}, copyright. -->
<footer id="footer">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brandcol">
        <div class="foot-brand">
          <img class="brand-mark" src="FAVICON_URL" width="96" height="96" alt="" aria-hidden="true" loading="lazy" decoding="async">
          <span>MARKA_NAZWA</span>
        </div>
        <p class="foot-claim">Jednozdaniowy claim marki — obietnica produktu, ton z DNA.</p>
        <div class="foot-rating"><span class="stars" aria-hidden="true">★★★★<span class="off">★</span></span> 4,7 / 5 · 182 oceny</div>
      </div>
      <nav class="foot-col" aria-label="Informacje i pomoc">
        <p class="foot-h">Zakupy i pomoc</p>
        <ul class="foot-nav">
          <li><a href="{{REGULAMIN_URL}}">Regulamin</a></li>
          <li><a href="{{POLITYKA_URL}}">Polityka prywatności</a></li>
          <li><a href="{{ZWROTY_URL}}">Zwroty i reklamacje</a></li>
          <li><a href="{{DOSTAWA_URL}}">Dostawa</a></li>
          <li><a href="{{KONTAKT_URL}}">Kontakt</a></li>
        </ul>
      </nav>
      <div class="foot-col">
        <p class="foot-h">Bezpieczne zakupy</p>
        <div class="foot-trust">
          <!-- pay-badges KANONICZNE (ten sam blok co hero/oferta; id gradientu BLIK unikalny) -->
          <div class="pay-badges" aria-label="Dostępne metody płatności"><!-- blik · visa · mc · cod --></div>
          <div class="foot-chips">
            <span class="foot-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg> 14 dni na zwrot bez podawania przyczyny</span>
            <span class="foot-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3Z"/><path d="M9 12l2 2 4-4"/></svg> Bezpieczne płatności — BLIK, karta lub za pobraniem</span>
            <span class="foot-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="6" width="13" height="10" rx="1.5"/><path d="M14.5 9H18l3.5 3.2V16h-7z"/><circle cx="6" cy="18" r="1.9"/><circle cx="17" cy="18" r="1.9"/></svg> Wysyłka pod wskazany adres</span>
          </div>
        </div>
      </div>
    </div>
    <div class="foot-bottom">
      <p class="foot-copy">© 2026 MARKA_NAZWA · Wszystkie prawa zastrzeżone</p>
      <p class="foot-note">Ceny zawierają VAT · Zdjęcia mają charakter poglądowy</p>
    </div>
  </div>
</footer>
