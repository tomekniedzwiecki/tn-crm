# Procedura generowania contentu reklamowego Meta Ads — v2

> **v2 (2026-06-10)** — oparta na researchu najlepszych praktyk 2025-2026 (COD dropshipping PL,
> zimny ruch, niski budżet). Zmiany vs v1: CTA odwrócone pod COD („Kup teraz" DZIAŁA), obowiązkowy
> risk-reversal, twardy zakaz fałszywej pilności (polityka Meta), koncepty zamiast luźnych kątów,
> video_hook per wersja. Spójna z `CLAUDE_MCP_CAMPAIGN_PROCEDURE.md`.

## Gdzie ten content powstaje (produkcyjnie)

| Ścieżka | Co robi | Prompt |
|---|---|---|
| **`generate-campaign-batch`** (główna, przycisk „pipeline" w panelu) | research Manus → copy+image_prompt+video_hook (Claude Vision z referencją produktu) → grafiki (Gemini) | system+user w `supabase/functions/generate-campaign-batch/index.ts` |
| **`generate-ad-copy`** (fallback, samo copy) | copy z researchu konkurencji | system w `supabase/functions/generate-ad-copy/index.ts`, user w `workflow.html:buildAdCopyPrompt` |
| **Ten plik** | spec + fallback manualny gdy edge functions niedostępne | — |

**Po zmianie promptów w edge functions → DEPLOY ręcznie** (`npx supabase functions deploy <fn> --no-verify-jwt`).

Output ląduje w `workflow_ads.ad_copies`:
```json
{ "wow_factor", "target_group", "product_name", "landing_url",
  "risk_reversal": ["płatność przy odbiorze", "zwrot 14 dni"],
  "versions": [ { "angle", "primary_text", "headline", "description", "cta",
                  "image_prompt" (tylko batch), "video_hook" } ] }
```

---

## KONTEKST BIZNESOWY (fundament każdego copy)

Sklep z płatnością **ZA POBRANIEM (COD)**, zimny ruch z Meta, **sceptyczny polski kupujący**.
Największa bariera: „nie zapłacę z góry nieznanemu sklepowi". Największy lever: **RISK-REVERSAL**.

## KAŻDA WERSJA = SPÓJNY KONCEPT

5 wersji = 5 NAPRAWDĘ różnych konceptów (nie parafraz). Koncept = kąt + copy + wizual + video hook
opowiadające TĘ SAMĄ obietnicę. Grafika losowo dobrana do tekstu = spalony koncept.
(Algorytm Meta nagradza RÓŻNORODNOŚĆ konceptów — „kreacja jest targetowaniem".)

## KROK 1 — WOW FACTOR (w pierwszym zdaniu, zawsze)

> „Jaki JEDEN fakt o tym produkcie jest tak zaskakujący, że ktoś musi się zatrzymać?"

- Konkretny: liczba, czas, porównanie („15 sekund do pary. Konkurencja: 3 minuty.")
- Test kawiarnianego stolika: powiedziałbyś to znajomemu przy kawie?
- Jeśli hook brzmi jak z folderu reklamowego — jest ZŁY.

## KROK 2 — LIMITY ZNAKÓW

| Pole | Widoczne bez "See more" | Uwagi |
|------|-------------------------|-------|
| Primary Text | **125 znaków** | 99% NIE klika "See more" — hook MUSI być w 125 |
| Headline | **27-40 znaków** | >50 = -30% CTR |
| Description | **25-30 znaków** | widoczne tylko w części placementów |

## KROK 3 — RISK-REVERSAL (COD) — OBOWIĄZKOWY

- W **każdym** Primary Text naturalnie wpleciony min. 1 element:
  **„płacisz przy odbiorze"** / **„sprawdź zanim zapłacisz"** / **„zwrot do 14 dni"**.
  To argument sprzedażowy, nie stopka.
- **Min. 1 z 5 wersji ma risk-reversal jako GŁÓWNY kąt** („Nie wierzysz? Nie płać z góry...").
- „Dostawa do Paczkomatu InPost" — tylko jeśli sklep faktycznie ją oferuje (zwykle tak; 94% Polaków wybiera Paczkomat).
- ⛔ **NIE obiecuj czasów dostawy** („24h", „wysyłka z Polski", „magazyn w Polsce") — to dropshipping;
  złamana obietnica = skargi = ban konta (Meta auto-flaguje przy dostawie >18 dni).

## KROK 4 — CTA (tylko mapowalne na Meta)

| CTA w copy | Meta enum | Kiedy |
|---|---|---|
| **„Kup teraz"** | SHOP_NOW | **default** — COD zdejmuje ryzyko, działa na zimno |
| „Zamów teraz" | ORDER_NOW | wariant |
| „Zobacz opinie" | SEE_MORE | kąt social proof |
| „Dowiedz się więcej" | LEARN_MORE | curiosity / edukacja |

(Stara zasada „nie Kup teraz na zimny ruch" dotyczyła sklepów prepaid — przy COD jest odwrotnie.)

## ZAKAZY TWARDE (polityka Meta — dropshipping pod lupą)

- ⛔ **ZERO zmyślonej pilności**: żadnych „zostało X szt.", liczników, „tylko dziś" — nie znamy
  stanów magazynu, każda taka fraza to fabrykacja = ryzyko bana („unacceptable business practices").
- ⛔ ZERO cen w copy (zmieniają się, reklamy zostają).
- ⛔ ZERO obietnic medycznych/leczniczych.
- ⛔ ZERO „za pobraniem jako wada" — to atut, sprzedawaj go.

## FORMUŁY HOOKÓW

1. Liczba + Benefit: „2847 osób kupiło to w marcu. Oto dlaczego:"
2. Pytanie: „Ile naprawdę kosztuje Cię [stary sposób]?"
3. Kontrast: „Przestań wyrzucać pieniądze na [kategoria]"
4. Social Proof: „Myślałam że to bubel. Minął rok..."
5. Myth-busting: „[Co wszyscy myślą] jest nieprawdą. Dowód:"
6. Risk-reversal: „Nie wierzysz? Nie płać. Zapłacisz kurierowi jak sprawdzisz."

## EMOCJONALNA KONKRETNOŚĆ

| ❌ Generyczne | ✅ Konkretne |
|--------------|-------------|
| „Bez chemii" | „Twoje dziecko raczkuje po podłodze. Ile na niej Domestosa?" |
| „Oszczędza czas" | „3 godziny tygodniowo z powrotem. Na serial, nie na szorowanie." |
| „Wysoka jakość" | „Minął rok. Działa jak pierwszego dnia." |
| „Bezpieczne zakupy" | „Płacisz dopiero, gdy paczka jest u Ciebie." |

## VIDEO HOOK (per wersja — pod Reels 9:16)

Dla każdego konceptu opisz **pierwsze 3 sekundy** wideo: co widać w pionowym kadrze + polski tekst
na ekranie. Widz decyduje w 3 sekundy. To brief dla przyszłego pipeline'u wideo ORAZ dla klienta
nagrywającego UGC telefonem. (Wideo/Reels = największy pojedynczy dźwig CTR na zimnym ruchu.)

## IMAGE PROMPT (tylko ścieżka batch — Gemini Nano Banana)

Zasady w prompcie `generate-campaign-batch` (formuła scena→kamera→nastrój→tekst PL, max 60 słów,
zero negacji, „the product" zamiast opisu — model dostaje referencyjne zdjęcie). 6 formatów FB:
UGC iPhone selfie, With/Without split, Myth vs Fact z tekstem, Problem visualization, Messy real
context, Process close-up. **Wierność produktu = świętość** (drift AI → zwroty COD; incydent Linovo).

## BRUTAL SELF-REVIEW (zanim oddasz)

- Czy scrollując o 23:00 zmęczony zatrzymałbym się?
- Czy jest LICZBA w pierwszych 10 słowach?
- Czy mógłbym to powiedzieć o KAŻDYM produkcie tej kategorii? (tak = za generyczne)
- Czy brzmi jak człowiek, nie folder?
- **Czy jest risk-reversal? Czy sceptyczny Polak zamówiłby za pobraniem?**
- **Czy NIE ma fałszywej pilności ani obietnic dostawy?**
- Czy grafika/video_hook opowiada TO SAMO co copy?

## POLSKI RYNEK — ton

Bezpośredni ale ciepły, zero amerykańskiego hype'u. Praktyczność > prestiż.
Słowa-wytrychy: wreszcie, sprawdzone, bez ryzyka, **płacisz przy odbiorze**, **zwrot 14 dni**.
Max 1-2 emoji. Rodzina jako motywator („dla dzieci", „dla domu").

---

## Połączenie z kampanią (→ `CLAUDE_MCP_CAMPAIGN_PROCEDURE.md`)

Content z tej procedury konsumuje kampania MCP: `versions[]` po indeksie → kreacje+reklamy,
`cta` → mapa enum (tabela wyżej), `video_hook` → przyszły pipeline wideo / brief dla klienta.
Pełny flow: research → content (koncepty) → grafiki per image_prompt → kampania przez MCP (PAUSED).
