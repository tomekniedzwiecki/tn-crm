# OCHRONA LANDINGÓW PRZED KOPIOWANIEM (decyzja Tomka 22.07)

**Rama uczciwa:** HTML/CSS/JS wysyłany do przeglądarki NIE MOŻE być ukryty — każdy pobierze go
curl-em/DevTools. „Ukrywanie kodu" (blokada prawego przycisku, anty-DevTools, obfuskacja) to teatr:
łatwe do obejścia, psuje UX/dostępność, a obfuskacja dodatkowo złamałaby `manifest-check.py`/
`gate-check.py` (czytają serwowany HTML regexem) — NIE robimy. Zamiast tego cztery realne warstwy:

## 1. Kopia jest MARTWA — origin-gate w `wf2-landing-api`
Runtime landingu (cena, checkout) odpowiada TYLKO gdy `Origin`/`Referer` należy do:
domeny projektu (`wf2_projects.domain` + subdomeny), `*.trevio.pl` / `*.trevio.shop` (preview),
`*.tomekniedzwiecki.pl`, `localhost`. Jawnie obcy host → **403** → skopiowany
landing na cudzej domenie nie hydratyzuje ceny i nie ma działającej kasy (checkout i tak prowadzi
do NASZEJ kasy — kopiujący musi przepisać całą warstwę sprzedażową). Brak nagłówka = fail-open
(curl, file:// w fabryce, health-checki). Loguje `console.warn forbidden_origin host=…` (telemetria
→ §6.1). Deploy: `npx supabase functions deploy wf2-landing-api --no-verify-jwt --project-ref
yxmavwkwnfuphjqbelws`.

> **⛔ `*.vercel.app` USUNIĘTE z allowlisty (23.07).** Darmowy wildcard-hosting Vercela dawał
> kopiście ŻYWĄ cenę+checkout na własnej domenie (red team potwierdził — klon sprzedawał w <1h).
> Żaden nasz konsument tam nie hostuje (landingi = domeny Trevio, fabryka = localhost/curl). To samo
> usunięcie w `wf2-asset` (§3). Blok `platform{}` (website/product/variant id) świadomie NIE
> bramkowany — te id są jawne w publicznym storefroncie, a gate po Referer psułby kasę na landingach
> z `Referrer-Policy: no-referrer`.

## 2. Kopia jest NIECZYTELNA i NAMIERZALNA — `_harden()` w `platform-sync.py publish`
Domyślnie przy KAŻDYM publish (wyłączenie: `--no-harden`):
- strip WSZYSTKICH komentarzy fabryki (markery sekcji, notki procesowe = know-how) + collapse
  wcięć/pustych linii poza `<script>/<pre>/<textarea>` (~−12% rozmiaru, czytelność znika);
- **watermark kryptograficzny** `build_id()` = **HMAC-SHA256(sekret, 'wf2:'+product_id)[:16]**
  (sekret = `WF2_WATERMARK_SALT` z .env lub fallback `SUPABASE_SERVICE_KEY`) w **4 loci**:
  `<meta name="build">`, `data-b` na `<body>`, komentarz „Build <fp>", oraz **ukryty, ale
  INDEKSOWALNY** `<span data-mk>wf2·<fp></span>` (clip-rect sr-only — nie psuje layoutu/h-scroll,
  łapie go SERP → skaner §4). **Było `md5('wf2:'+product_id)[:12]` — WYWNIOSKOWALNE z jawnego
  product_id; teraz bez sekretu nieodtwarzalne = twardy dowód własności (§5).**
- nota © na szczycie dokumentu (deklaracja praw + informacja o identyfikowalności buildu).
Źródła w repo zostają czytelne — harden działa tylko na publikowanym artefakcie. **Watermark wchodzi
na LIVE dopiero przy re-publish** — po zmianie sekretu/kodu trzeba re-publikować (6/6 zrobione 23.07).
Obejmuje też `home` (strona główna; fingerprint po **project_id**, nie product_id). Podstrony
prawne (`page`) świadomie BEZ hardenu — boilerplate, zero know-how.

## 3. Egzekucja — gdy znajdziemy kopię
Landing (kod, układ, copy, sceny) = utwór; zdjęcia produktowe i klipy = nasze pliki. Ścieżka:
(a) dowód: fingerprint/`data-b` w kopii albo 1:1 frazy copy (unikalne hooki są sygnaturą samą
w sobie), archiwizacja kopii (zrzut + kod z datą); (b) wezwanie do usunięcia do operatora
domeny/hostingu (abuse) — przy sklepach PL skuteczne w dni; (c) zgłoszenie do platform reklamowych
kopiującego (Meta zdejmuje ady prowadzące na plagiat). Wykrywanie: co jakiś czas Google po 2-3
unikalnych frazach hooków landingu (fraza w cudzysłowie).

**Czego świadomie NIE robimy:** obfuskacji JS (utrudnia debug, zero realnej ochrony), anty-DevTools,
przenoszenia treści do canvas/obrazków (SEO/dostępność), szyfrowania HTML „loaderem" (killuje
LCP/SEO, łamane w minutę).

---

## 4. DETEKCJA KOPII — skaner SERP + tabela sygnałów (Faza C, 23.07)

Watermark z §2 jest UKRYTY, ale INDEKSOWALNY (span `data-mk` z frazą `wf2·<build_id>`). Skaner
`scripts/mockup-tools/copy-scan.py` co jakiś czas przeczesuje wyszukiwarkę tą frazą po WSZYSTKICH
naszych produktach i zgłasza obce hosty.

- **build_id** = `HMAC-SHA256(sekret, 'wf2:'+product_id)[:16]` (sekret = `WF2_WATERMARK_SALT` z .env
  lub fallback `SUPABASE_SERVICE_KEY`). Funkcja: `build_id()` w `platform-sync.py` — skaner ją
  IMPORTUJE (jedno źródło prawdy), nie duplikuje. Landing produktu → build_id z `product_id`; strona
  główna → z `project_id` (lustro `_harden`).
- **Zapytanie:** `"wf2·<build_id>" -site:<nasze-domeny>` (wykluczamy trevio.pl/.shop,
  tomekniedzwiecki.pl, niedzwiecki.ai, vercel.app, localhost + `wf2_projects.domain` z bazy — żeby
  nie łapać własnego live/preview). Trafienie na obcym hoście = kandydat na kopię.
- **Provider (auto-detekcja klucza w .env, kolejność):** Google Programmable Search (CSE:
  `GOOGLE_CSE_KEY`+`GOOGLE_CSE_CX`) → SerpAPI (`SERPAPI_KEY`) → Bing v7 (`BING_SEARCH_KEY`).
  **Brak klucza → DRY-RUN:** skaner wypisuje gotowe zapytania + klikalne URL-e Google do ręcznego
  sprawdzenia i sygnalizuje, że trzeba dodać klucz. Po dodaniu klucza działa bez zmian w kodzie.
- **Wynik:** obce trafienia lądują w `wf2_copy_signals` (`source='serp'`, host, product_id, build_id,
  url, detail). Idempotentnie (GET-before-POST po source+url+build_id).

```bash
# DRY-RUN (bez klucza — pokazuje zapytania i URL-e ręczne, zero sieci/zapisów):
python -X utf8 scripts/mockup-tools/copy-scan.py scan --dry-run --include-projects --out raport.json
# LIVE (po dodaniu klucza wyszukiwarki do .env):
python -X utf8 scripts/mockup-tools/copy-scan.py scan --include-projects
```

Tabela sygnałów: migracja `supabase/migrations/20260723b_wf2_copy_signals.sql` (RLS: team_members,
ZERO anon; service-role bypassuje). Aplikacja migracji — patrz koniec dokumentu.

---

## 5. PLAYBOOK DMCA / TAKEDOWN — BIAŁA ETYKIETA

> **⛔ ZASADA BIAŁEJ ETYKIETY.** Notice **NIE MOŻE zdradzać nazwy sklepu klienta** ani tego, że
> stoi za nim TN / fabryka. Cały dowód opieramy na **watermarku `build_id`** (kryptograficzny
> identyfikator wstawiony w NASZ oryginał), a nie na brandzie klienta. Jako „poszkodowanego /
> właściciela praw" wskazujemy podmiot składający notice (TN / operator), nie markę końcowego sklepu.
> Zdjęcia produktowe i klipy = nasze pliki (osobna podstawa). Kopiujący nie zna sekretu HMAC → nie
> odtworzy build_id → to jednostronny, niepodważalny trop.

### (a) Potwierdź, że kopia jest NASZA — recompute build_id
Watermark `build_id` odtwarzamy zawsze; kopista nigdy. Recompute + weryfikacja żywej strony:

```bash
# Sam identyfikator (do notice) — recompute z product_id:
python -X utf8 scripts/mockup-tools/copy-scan.py id <product_id>
# Pobierz podejrzaną stronę i sprawdź, które loci watermarku niesie (+ opcjonalny zapis dowodu):
python -X utf8 scripts/mockup-tools/copy-scan.py verify <product_id> "https://kopia.example/…" --save
```

`verify` sprawdza 4 loci z §2 (`<meta name=build>`, `<body data-b>`, komentarz „Build …", ukryty
`<span data-mk>wf2·…`). Trafienie choćby jednego = dowód (sekret znany tylko nam). **Zarchiwizuj
dowód**: zrzut ekranu + zapis źródła z datą (`curl -s <url> -o dowod_<data>.html`) oraz
`web.archive.org/save/<url>` (niezależny timestamp). Jeśli strona renderuje się z JS i `verify` nie
widzi watermarku w surowym HTML — pobierz DOM z DevTools/`chrome-devtools` i szukaj `data-mk`/`data-b`
ręcznie; w ostateczności dowodem pomocniczym są 1:1 unikalne frazy copy (hooki) i nasze pliki graficzne.

### (b) Ustal hosting i rejestratora — RDAP / WHOIS / DNS
```bash
DOM=kopia.example.pl
# rejestrator + kontakt abuse domeny (RDAP; 429 → fallback WHOIS):
curl -s "https://rdap.org/domain/$DOM" | python -X utf8 -c "import sys,json;d=json.load(sys.stdin);print(json.dumps(d.get('entities',[]),ensure_ascii=False)[:1500])"
# IP + kto hostuje (RDAP po IP):
nslookup $DOM
curl -s "https://rdap.org/ip/<IP_z_nslookup>" | python -X utf8 -m json.tool | head -40
# Czy stoi za Cloudflare (wtedy realny host jest ukryty — abuse do Cloudflare + żądanie origin):
curl -sI "https://$DOM" | grep -i "server\|cf-ray"
```
Cloudflare (`server: cloudflare` / `cf-ray`) = proxy: zgłoś do Cloudflare (poniżej), oni ujawniają/
przekazują do realnego hostingu. Dla `.pl` rejestr NASK-owy — dane abuse z RDAP/WHOIS.

### (c) Kontakty abuse (eskalacja równoległa — im więcej frontów, tym szybciej)
- **Trevio (jeśli kopia stoi na ich platformie / subdomenie `*.trevio.pl`/`*.trevio.shop`):** kontakt
  partnerski / abuse Trevio — najszybsza ścieżka (znają nas, sklep zdejmą operacyjnie w dni). To
  najczęstszy wektor kopii „na naszym własnym podwórku".
- **Cloudflare:** `https://abuse.cloudflare.com/` → kategoria „Trademark/Copyright (DMCA)”. Przekażą do
  hostingu i ujawnią origin.
- **Hostingodawcy PL (abuse@…):** home.pl / cyberFolks (`abuse@cyberfolks.pl`), nazwa.pl
  (`abuse@nazwa.pl`), OVH (`abuse@ovh.net` / formularz), Hostinger (`abuse@hostinger.com`),
  Hetzner (`abuse@hetzner.com`), Zenbox (`abuse@zenbox.pl`). Adres abuse potwierdź z RDAP/WHOIS hosta.
- **Google — deindeksacja z wyników:** formularz DMCA
  `https://reporters.google.com/legal/reporter/DMCA` (Search) — usuwa kopię z indeksu, nawet gdy host
  zwleka. Publiczne w bazie Lumen (białoetykietowo: bez nazwy sklepu, dowód = build_id + URL oryginału).
- **Meta (gdy kopia jest reklamowana):** zgłoszenie IP/oszustwa przez formularz „Report” przy reklamie
  oraz Meta IP Reporting (`https://www.facebook.com/help/contact/634636770043106`) — Meta zdejmuje ady
  prowadzące na plagiat. Zarchiwizuj kreację (ad library / screenshot) przed zgłoszeniem.
- **Autopay/operator płatności kopisty (opcjonalnie):** jeśli kopia pobiera płatności przez znanego
  operatora, zgłoszenie oszustwa potrafi odciąć monetyzację szybciej niż takedown hostingu.

### (d) Szablon notice — PL i EN (białoetykietowo; wypełnij `[…]`)

**PL — wezwanie do usunięcia (do hostingu/rejestratora/Cloudflare):**
```
Temat: Naruszenie praw autorskich — żądanie usunięcia treści (DMCA / art. 79 pr. aut.)

Szanowni Państwo,

pod adresem [URL KOPII] opublikowano stronę będącą kopią utworu (kod HTML/CSS/JS, układ,
treści i grafiki), do którego przysługują nam autorskie prawa majątkowe. Publikacja nastąpiła
bez naszej zgody i narusza te prawa.

DOWÓD TOŻSAMOŚCI KOPII: kopiowana strona zawiera nasz ukryty, kryptograficzny znak wodny —
identyfikator „[BUILD_ID]” (osadzony m.in. w atrybucie data-b znacznika <body>, w <meta name="build">
oraz w ukrytym elemencie oznaczonym „wf2·[BUILD_ID]”). Identyfikator ten jest generowany funkcją
HMAC-SHA256 z tajnym kluczem będącym wyłącznie w naszym posiadaniu i nie jest możliwy do odtworzenia
przez osobę trzecią — jego obecność jednoznacznie dowodzi, że strona została skopiowana z naszego
oryginału opublikowanego pod adresem [URL ORYGINAŁU].

Żądamy niezwłocznego (nie później niż w ciągu 48 godzin) usunięcia lub zablokowania dostępu do
wskazanej treści. Zastrzegamy dalsze kroki prawne w razie braku reakcji.

Dane zgłaszającego: [NAZWA/PODMIOT], [EMAIL KONTAKTOWY].
Oświadczam w dobrej wierze, że wykorzystanie treści nie jest autoryzowane, a informacje w tym
zgłoszeniu są prawdziwe.

Z poważaniem,
[PODPIS / PODMIOT]
```

**EN — DMCA takedown notice (Google / Cloudflare / zagraniczny host):**
```
Subject: DMCA Takedown Notice — Copyright Infringement

To whom it may concern,

The page at [COPY URL] is an unauthorized copy of a work (HTML/CSS/JS code, layout, copy and
imagery) to which we own the copyright. It was published without our permission.

PROOF OF COPYING: the infringing page carries our hidden cryptographic watermark — identifier
"[BUILD_ID]" — embedded in the <body data-b> attribute, a <meta name="build"> tag, and a hidden
element marked "wf2·[BUILD_ID]". This identifier is derived via HMAC-SHA256 using a secret key held
solely by us and cannot be reproduced by any third party; its presence conclusively proves the page
was copied from our original at [ORIGINAL URL].

I have a good-faith belief that the use is not authorized by the copyright owner, its agent, or the
law. The information in this notice is accurate, and under penalty of perjury I am authorized to act
on behalf of the copyright owner.

Identification of the original work: [ORIGINAL URL]
Location of infringing material: [COPY URL]
Contact: [NAME/ENTITY], [CONTACT EMAIL]

Signature: [SIGNATURE / ENTITY]
```

> Pola: `[URL KOPII]`/`[COPY URL]` = adres plagiatu; `[BUILD_ID]` = z komendy `copy-scan.py id …`;
> `[URL ORYGINAŁU]`/`[ORIGINAL URL]` = nasz landing na domenie docelowej. **Nie wpisujemy nazwy sklepu
> klienta** — podmiotem praw jest zgłaszający.

### (e) Eskalacja
1. **Nadawca DNS/Cloudflare + host + Google-deindex równolegle** (dzień 0), archiwum dowodu wcześniej.
2. **Brak reakcji hosta w 48–72 h →** ponaglenie + eskalacja do rejestratora domeny (RDAP abuse) i do
   dostawcy IP (upstream). Google-deindex zwykle działa niezależnie od hosta.
3. **Reklamy →** zgłoszenie Meta/TikTok kreacji (odcięcie ruchu boli kopistę bardziej niż sam host).
4. **Uporczywość / skala →** przekazanie sprawy do radcy: wezwanie przedsądowe (art. 79 pr. aut.),
   ewentualnie zabezpieczenie. Komplet dowodu: recompute build_id + zarchiwizowane źródło z datą +
   wpis w `wf2_copy_signals`.

---

## 6. MAPA SYSTEMU OCHRONY (warstwy)

| Warstwa | Gdzie | Co robi | Status |
|---|---|---|---|
| **Origin-gate 403 + telemetria** | edge `wf2-landing-api` (Faza A) | runtime (cena/checkout) odpowiada tylko dla naszych Origin/Referer; obcy host → 403; loguje `console.warn` | **LIVE** (vercel.app zamknięty 23.07) |
| **Watermark HMAC 4-loci** | `platform-sync.py _harden()` (Faza B) | `build_id` HMAC w `<meta build>`, `<body data-b>`, komentarz ©, ukryty indeksowalny `<span data-mk>wf2·…` | **LIVE** (re-publish 6/6 23.07) |
| **Kasa = nasza** | `checkout-inline@3` + `wf2-landing-api` | checkout składa zamówienie w NASZYM storefroncie Trevio — kopia musi przepisać całą warstwę sprzedażową | **LIVE** (inherentne) |
| **Bramka assetów** | edge `wf2-asset` + `asset-gate.py` (Faza C) | referer-gate na obrazy/wideo (obcy→403, nasz/brak→302 signed-url, BEZ streamingu=LCP OK, hero-exempt) | **CZĘŚCIOWO** — edge deployed w trybie `public`/test, wpięcie za flagą `--gate` **OFF**; realna ochrona dopiero po migracji do prywatnego bucketa (**§7, ODROCZONE — nadzór Tomka**) |
| **Detekcja SERP** | `copy-scan.py` + `wf2_copy_signals` (Faza D) | przeczesuje wyszukiwarkę frazą `wf2·<build_id>`, zapisuje obce trafienia | skaner GOTOWY; czeka na klucz wyszukiwarki (Google CSE) + aplikację migracji |
| **Egzekucja DMCA** | ten playbook (§5) | recompute build_id → dowód → takedown białoetykietowy | procedura GOTOWA |

### 6.1 Podłączenie logów origin-gate 403 do `wf2_copy_signals` (do zrobienia przez główną sesję)
Origin-gate (Faza A) loguje 403 przez `console.warn`. Żeby trafiały do tabeli sygnałów
(`source='origin_gate_403'`), są dwie drogi — **edge modyfikuje główna sesja, nie warstwa detekcji:**

- **Edge insert (rekomendowane, near-real-time):** w handlerze `wf2-landing-api`, w gałęzi zwracającej
  403 dla obcego Origin, zrobić fire-and-forget `INSERT` do `wf2_copy_signals` service-rolem:
  `{ source:'origin_gate_403', host: <obcy host z Origin/Referer>, url: <Referer>, build_id: null,
  product_id: null, detail: { origin, referer, ua, path } }`. **Ważne:** insert nie może blokować
  odpowiedzi 403 (await w tle / `EdgeRuntime.waitUntil`), a `build_id`/`product_id` zwykle będą `null`
  (na etapie gate'u znamy host, nie produkt) — dowiązanie do produktu robi później skaner/`verify`.
  Rozważyć throttling/dedupe (ten sam host potrafi walić seriami) — np. partial unique index
  `(source, host, date_trunc('hour', created_at))` albo bufor w pamięci edge.
- **Log-drain (mniejsze ryzyko, batch):** skonfigurować Supabase Log Drain / eksport logów edge do
  zewnętrznego kolektora, a stamtąd okresowo parsować wpisy `console.warn` origin-gate i wsadowo
  wrzucać do `wf2_copy_signals`. Wolniejsze, ale zero zmian w kodzie edge.

Do czasu podłączenia 403 głównym źródłem sygnałów pozostaje skaner SERP (§4) i zgłoszenia `manual`.

---

## 7. DOKOŃCZENIE BRAMKI ASSETÓW — migracja do prywatnego bucketa (ODROCZONE, nadzór Tomka)

**Dlaczego niedokończone.** Edge `wf2-asset` + `asset-gate.py` przepisują URL-e assetów na
`…/functions/v1/wf2-asset?path=bud-assets/<slug>/<plik>` i bramkują po Referer. ALE dopóki oryginały
leżą na **publicznym** buckecie (`…/object/public/attachments/bud-assets/…`), URL bramki JAWNIE
zawiera oryginalną ścieżkę (`?path=bud-assets/…`) → kopista czyta ją i puka wprost w public URL,
omijając bramkę. **Bramka ma realny sens dopiero, gdy oryginały są PRYWATNE**, a jedyną drogą do
bajtów jest 302-signed-url z edge (który sprawdza Referer). Dlatego edge stoi w trybie `public`/test,
a wpięcie w `cmd_publish` jest za flagą `--gate` **domyślnie OFF**.

**Dlaczego to krok pod nadzorem (nie autopilot).** Dotyka LIVE ~23 assetów poza-hero × 6 landingów
(+ home + og:image) na produkcyjnych domenach klientów. Błąd = znikające obrazy poniżej folda na
żywych stronach sprzedażowych. Robić **kanarkowo, z weryfikacją wizualną po każdym kroku.**

**Runbook (gdy Tomek da „go"):**
1. **Backup mapy assetów** — wylistować obecne publiczne URL-e per landing (dry-run
   `asset-gate.py --file <index.html>` pokazuje pełną listę „PRZEPISANE" vs „HERO-EXEMPT").
2. **Nowy PRYWATNY bucket** `bud-assets-gated` (Storage, `public=false`, `allowed_mime` webp/png/jpg/
   mp4/webm, limit rozmiaru jak `attachments`). Hero zostaje na starym public (LCP, exempt).
3. **Kopia poza-hero assetów** z `attachments/bud-assets/<slug>/…` → `bud-assets-gated/bud-assets/
   <slug>/…` (te same ścieżki-sufiksy, żeby `?path=` się zgadzał). Skrypt kopiujący server-side
   (Storage copy API), **kanarek: najpierw JEDEN landing (rozgrzewek), zweryfikuj, potem reszta.**
4. **Przełącz sekrety edge:** `WF2_ASSET_MODE=signed`, `WF2_ASSET_BUCKET=bud-assets-gated`
   (`WF2_ASSET_SIGNED_TTL=300`). Re-deploy `wf2-asset --no-verify-jwt`.
5. **Re-publish landingów Z flagą `--gate`** (`platform-sync.py publish … --gate`) — teraz URL-e
   poza-hero idą przez bramkę, a bajty leżą prywatnie. Kanarek rozgrzewek → weryfikacja wizualna
   (obrazy below-fold ładują się, LCP hero bez zmian, brak h-scroll, checkout żywy) → reszta 5.
6. **Usuń/odetnij publiczne oryginały poza-hero** (dopiero po potwierdzeniu, że wszystkie 6 landingów
   ciągną z bramki) — inaczej public URL wciąż otwarty. **To krok nieodwracalny → dopiero po zielonym
   kanarku i backupie z pkt 1.**
7. **Test kopisty:** `curl` assetu przez bramkę z obcym Referer → 403; bez nagłówka → 302 (fabryka/
   crawler żyją); nasz Referer → 302 signed-url → 200 bajty.

Do tego czasu warstwy 1-2-4 (origin-gate martwa kasa + watermark + detekcja) już utrudniają i
namierzają kopię; bramka assetów to „docisk", nie warunek konieczny.

---

## Aplikacja migracji (NIE zrobiona automatycznie)
```bash
# przez Supabase CLI (zalogowany), projekt CRM yxmavwkwnfuphjqbelws:
npx supabase db push
# albo pojedynczy plik przez psql/SQL editor:
#   supabase/migrations/20260723b_wf2_copy_signals.sql
```
Weryfikacja po aplikacji: `select count(*) from wf2_copy_signals;` (0 wierszy, tabela istnieje) oraz
`copy-scan.py scan` bez `--dry-run` (gdy jest klucz) zacznie zapisywać `source='serp'`.
