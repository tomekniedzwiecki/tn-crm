# BUILDLOG — projekt rozwojowy „Znajdzik" (Tomek Niedźwiecki)

Projekt wf2: `baacc66f-3dd0-462a-9799-de9c7aaea639` · Panel: crm.tomekniedzwiecki.pl/tn-sklepy/projekt?id=baacc66f-3dd0-462a-9799-de9c7aaea639
Zasady: każda sesja ZACZYNA od przeczytania tego pliku, KOŃCZY dopisem (co zrobione / decyzje+dlaczego / otwarte / dowody). Kontekst żyje w repo, nie w czacie.

---

## 2026-07-15 — Sesja 0: fundament produkcyjny + marka + branding

**Zrobione:**
- Projekt utworzony + portfel 5 produktów z /trendy (lokówka 87, koc chłodzący 80, endoskop 71, jeździk koparka 71, pompka do bagażu 68; ZipString 84 ODRZUCONY — koszt $1,81 = groszowa marża kwotowa). Ceny testowe +15% (NBP 3,7879).
- SSOT 0b (koncepcja produkcyjna: cel nadrzędny SPRZEDAŻ, API platformy, cennik dwufazowy, kampanie 500/500) + WORKFLOW-V2-TESTY.md (system decyzji: alokacja dwubramkowa, checkpointy spend-based, progi w settings `wf2_test_config`/`wf2_scale_config`).
- Migracje: `20260715_wf2_produkcja_fundament` (wf2_notes, milestone_label, deadline_at, platform_shop_id/product_id/checkout_url/page_url) + `20260715b_wf2_testy_dane` (ad-level lejek w ad_stats, source 'platform', kolumny cyklu testowego).
- Krok `marka` (project-scope) dodany do step_defs + warsztat WS + prompt. Etap Kampanie dopracowany wg Reklam v1 (partner access BM 737839566050751, prepaid 1000 zł, pixel-gotchas, instrukcje klienckie w instructions_md).
- MARKA: research 45 nazw (RDAP) → 14 wolnych .pl → REKOMENDACJA **Znajdzik** (znajdzik.pl; alternatywy: Odkrytka, Skarbka). Pakiet: tagline/opis/paleta/fonty — w kroku `marka`.
- BRANDING produktowy 5/5 pod marką parasolową: nazwy wyświetleniowe, persony, obietnice, 3 hooki/produkt (limit ≤125 zn., polityka Meta czysta) — w krokach `branding`.
- Snapshot endoskopu potwierdzony (source=detail). Lokówka+koc: rebuild w toku.

**Decyzje (dlaczego):**
- 1 sklep = 1 marka parasolowa + produkty na podstronach (zgodne z API platformy: strona główna + podstrony; 5 domen = koszt bez sensu).
- Dwubramkowa alokacja 500 zł zamiast 5×100 (100 zł/produkt ≈ 0,4 zakupu — brak werdyktu; koncentracja na survivorach).
- Test przy marży 15% jest świadomie stratny na reklamie (BE-ROAS ~9) — to koszt walidacji; zysk przychodzi z ceną scale (BE-ROAS ~1,6).
- WYMÓG: w fazie testowej dostawę płaci klient (inaczej mikro-marża ujemna przed reklamą).

**Otwarte / czeka:**
- [BRAMKA Tomka] Akcept nazwy Znajdzik + zakup domeny znajdzik.pl (wolna 15.07).
- [ZEWNĘTRZNE] Dokumentacja API platformy od developera (base URL, auth) + wymogi trackingowe (CAPI Purchase per sklep — sekcja 0b pkt 6).
- Loga Znajdzik ×5 w generacji (generate-image, medium).
- Pętla weryfikacyjna brandingu (świeży krytyk) → potem status done na krokach.
- Landingi 5 produktów — plan sesji w `_brief.md` (S1-S7). CTA = placeholder `data-checkout` pod checkout_url z API.
- Konto reklamowe + budżet (kroki klienckie — tu: Tomek jako klient testowy).

**Dowody:** commity `2580954`, `26e4193` (tn-crm main); wpisy wf2_activities projektu; kroki `marka`/`branding` wypełnione w panelu.
