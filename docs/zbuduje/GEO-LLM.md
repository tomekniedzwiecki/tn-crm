# GEO — znajdowalność landingów w LLM (ChatGPT/Perplexity/Google AI/Copilot/Claude)

**Status: PRZYJĘTE 2026-07-15** (research: agent Opus, źródła 2025-26: Princeton GEO arXiv:2311.09735,
arXiv:2605.25517, Ahrefs, Semrush, Seer, Cloudflare, dok. OpenAI/Anthropic/Google/Bing, Statcounter PL).
Wdrożenie per landing: sekcja GEO w STANDARD-LANDING-SKLEPY.md. Ten plik = wiedza + checklisty.

## HIERARCHIA DŹWIGNI (dla naszych landingów impulsowych, wspólna domena, PL)
1. **Treść w SERWEROWYM HTML** — boty ChatGPT/Perplexity/Claude NIE wykonują JS; co nie jest
   w View Source, nie istnieje. (Nasze self-contained landingi ✓ — treść wpisana, nie fetchowana.)
2. **Feedy produktowe** — o poleceniu produktu w zakupach AI decyduje FEED, nie proza:
   Google Merchant Center (darmowe listingi = warunek AI Mode/Shopping Graph), Bing/Microsoft MC
   (Copilot), Perplexity Merchant Program (DARMOWY). GTIN krytyczny. Cena/stan feed↔strona 1:1.
3. **Prawdziwe recenzje + wzmianki poza sklepem** — recenzje: ChatGPT cytuje w 58%, Perplexity
   w 100% odpowiedzi zakupowych; <3★ = niewidzialność. Wzmianki marki korelują z widocznością AI
   r≈0,66 (linki tylko 0,218) — cytaty biorą z Reddit/YouTube/porównywarek, nie z naszej domeny.
4. **robots.txt przepuszcza boty-RETRIEVAL** (≠ treningowe!): OAI-SearchBot, ChatGPT-User,
   Claude-SearchBot/Claude-User, PerplexityBot/Perplexity-User, Googlebot, Bingbot, Applebot.
   (GPTBot/ClaudeBot = TRENING — ich blokada NIE rusza cytowań.) Cloudflare od VII.2025
   domyślnie blokuje boty AI — trzeba jawnie Allow.
5. **Sitemap z UCZCIWYM lastmod** (ISO 8601; tylko realne zmiany) — Bing: kluczowy sygnał świeżości AI.
6. **JSON-LD = higiena, nie dźwignia** (przyczynowe Ahrefs V.2026: ~0 wpływu na cytowania LLM;
   pomaga Google/rich results/feedom). Każdy fakt MUSI być też w widocznym tekście.

## MECHANIKA (skrót)
ChatGPT Search = indeks BING (87% pokrycia z top Bing) + OAI-SearchBot. Perplexity = RAG na żywo,
świeżość <30 dni cytowana 3,2× częściej. Google AIO/AI Mode = indeks Google + Shopping Graph
(czyta FEED, nie stronę, przy zakupach). Claude = Brave Search. PL udziały asystentów (VI.2026):
ChatGPT 79%, Gemini 9%, Perplexity 5% → priorytet: Bing-index + Google.
Co podnosi cytowalność (badania): statystyki/liczby +25,9%, cytowania źródeł +24,9%, Q&A format
+25,5%, tabele 2-3×, akapity 40-75 słów 3,1×, answer-first (44% cytowań z pierwszych 30% treści).
Ton promocyjny SZKODZI (−26,2%). Keyword stuffing = najgorsza taktyka. Długość strony bez znaczenia.

## CO NA LANDINGU (kontrakt — wdrażane w standardzie)
- Jeden H1 = nazwa mini-marki + kategoria („Chłodzik — chłodzący koc…"); answer-first 2-3 zdania
  (co to + korzyść + dla kogo) w hero-sub; liczby i konkrety; akapity 40-75 słów; zero „najlepszy".
- Widoczne: cena, dostępność, ocena z N, recenzje z konkretami, FAQ (3-5), tabela (spec/porównanie).
- JSON-LD @graph: Organization/OnlineStore (parasol, sameAs≥3) + Product (brand=Brand mini-marki!,
  aggregateRating/review TYLKO z prawdziwych widocznych, liczby 1:1, price kropką bez „zł",
  priceCurrency PLN, availability, MerchantReturnPolicy 14 dni) + BreadcrumbList (galeria→produkt)
  + FAQPage (te same pytania co widoczne). BEZ zmyślonych GTIN/wymiarów — pomijaj pola bez danych.
- canonical = docelowy URL publiczny; preview na crm.* ma `noindex` + placeholdery
  `{{CANONICAL_URL}}` (podmiana przy publikacji przez API, jak {{PIXEL_ID}}).
- **ANTY-DOORWAY (główne ryzyko modelu!):** każdy landing GENUINNIE unikalny (własny opis/FAQ/
  recenzje produktu); żadnych klonów pod frazy; spam rozlewa się karą na CAŁĄ domenę (SpamBrain
  obejmuje też AIO/AI Mode od IX.2025). AggregateRating bez prawdziwych recenzji = manual action.

## CHECKLIST DOMENY/PLATFORMY (dla developera sklepy.niedzwiecki.ai — do listy wymagań SSOT 0b)
1. robots.txt: jawny Allow dla botów-retrieval (lista wyżej) + linia Sitemap.
2. Cloudflare/WAF: boty-retrieval Allow (domyślne blokady AI OFF dla nich).
3. sitemap.xml: wszystkie landingi+galeria, lastmod tylko przy realnej zmianie.
4. Canonical per podstrona (self), meta robots index na produkcji.
5. Feedy: GMC free listings + Bing MC + Perplexity Merchant (0 zł); GTIN w danych produktu
   gdy dostępny; cena/stan zsynchronizowane ze stroną.
6. llms.txt: opcjonalnie (Google: „jak meta keywords" — nikt nie konsumuje; 15 min, zero szkody).
7. Serwerowy HTML podstron (nadpisanie HTML-em z API = statyczny render ✓ — NIE SPA).
8. GSC: Generative AI performance report ON (od VI.2026); logi: grep OAI-SearchBot/PerplexityBot/
   Claude-SearchBot/Bingbot (retrieval) — obecność botów = jesteśmy czytani.

## MIERZENIE
Zestaw ~15 promptów PL (kategoria/problem/brand, np. „jaki koc chłodzący na upały", „Chłodzik
opinie") × ChatGPT/Perplexity/AIO co tydzień, kilka powtórzeń (niedeterminizm), Share of Voice.
Narzędzie: Peec AI (~$99, PL-friendly) lub Otterly (~$29) — do decyzji przy skalowaniu.

## OFF-SITE (przy skalowaniu winnerów)
Wzmianki > linki: recenzje/wideo na YouTube/TikTok PL, wątki (autentyczne!) na Reddit/forach,
porównywarki; rozważ Allegro (własny asystent AI, 600k+ userów w testach) jako kanał AI-shopping PL.
