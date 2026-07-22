# OCHRONA LANDINGÓW PRZED KOPIOWANIEM (decyzja Tomka 22.07)

**Rama uczciwa:** HTML/CSS/JS wysyłany do przeglądarki NIE MOŻE być ukryty — każdy pobierze go
curl-em/DevTools. „Ukrywanie kodu" (blokada prawego przycisku, anty-DevTools) to teatr: łatwe do
obejścia, psuje UX/dostępność — NIE robimy. Zamiast tego trzy realne warstwy:

## 1. Kopia jest MARTWA — origin-gate w `wf2-landing-api`
Runtime landingu (cena, checkout, blok platform) odpowiada TYLKO gdy `Origin`/`Referer` należy do:
domeny projektu (`wf2_projects.domain` + subdomeny), `*.trevio.pl` / `*.trevio.shop` (preview),
`*.tomekniedzwiecki.pl`, `*.vercel.app`, `localhost`. Jawnie obcy host → **403** → skopiowany
landing na cudzej domenie nie hydratyzuje ceny i nie ma działającej kasy (checkout i tak prowadzi
do NASZEJ kasy — kopiujący musi przepisać całą warstwę sprzedażową). Brak nagłówka = fail-open
(curl, file:// w fabryce, health-checki). Deploy: `npx supabase functions deploy wf2-landing-api
--no-verify-jwt --project-ref yxmavwkwnfuphjqbelws`.

## 2. Kopia jest NIECZYTELNA i NAMIERZALNA — `_harden()` w `platform-sync.py publish`
Domyślnie przy KAŻDYM publish (wyłączenie: `--no-harden`):
- strip WSZYSTKICH komentarzy fabryki (markery sekcji, notki procesowe = know-how) + collapse
  wcięć/pustych linii poza `<script>/<pre>/<textarea>` (~−12% rozmiaru, czytelność znika);
- **fingerprint deterministyczny** `md5('wf2:'+product_id)[:12]` → `<meta name="build">` +
  `data-b` na `<body>` — odtwarzalny bez bazy, jednoznacznie wiąże KAŻDĄ kopię z naszym
  produktem (dowód w sporze); 
- nota © na szczycie dokumentu (deklaracja praw + informacja o identyfikowalności buildu).
Źródła w repo zostają czytelne — harden działa tylko na publikowanym artefakcie.
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
