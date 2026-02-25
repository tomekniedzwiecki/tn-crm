# AI WhatsApp Reply System - Architektura

## 1. PRZEGLĄD SYSTEMU

```
┌─────────────────────────────────────────────────────────────────┐
│                    WHATSAPP AI REPLY SYSTEM                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   Frontend  │───▶│Edge Function│───▶│    Claude API       │  │
│  │ whatsapp.html│   │ generate-   │    │                     │  │
│  └─────────────┘    │ whatsapp-   │    └─────────────────────┘  │
│                     │ reply       │              ▲              │
│                     └──────┬──────┘              │              │
│                            │                     │              │
│                            ▼                     │              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   CONTEXT BUILDER                        │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │   │
│  │  │   Lead   │ │  Offer   │ │ Client   │ │  Discount  │  │   │
│  │  │   Info   │ │  Info    │ │  Offer   │ │   Codes    │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │   │
│  │  │  Order   │ │ Messages │ │Knowledge │ │  Contract  │  │   │
│  │  │ History  │ │ History  │ │   Base   │ │   Terms    │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2. ŹRÓDŁA DANYCH

### 2.1 Lead (tabela: leads)
```
Dane wykorzystywane:
├── Podstawowe: name, email, phone, company, nip, address
├── Status: status (new, contacted, qualified, proposal, won, lost, abandoned)
├── Finansowe: deal_value, budget
├── Kwalifikacja:
│   ├── weekly_hours - ile godzin tygodniowo może poświęcić
│   ├── experience - doświadczenie/motywacja
│   ├── target_income - oczekiwany dochód
│   └── open_question - otwarta odpowiedź z ankiety
├── Historia:
│   ├── activities[] - wszystkie aktywności
│   └── notes_history[] - notatki handlowców
└── Przypisanie: assigned_to, offer_id
```

### 2.2 Oferty (tabela: offers)
```
Dane wykorzystywane:
├── Podstawowe: name, description, price
├── Struktura: milestones[] z tasks[]
│   ├── title - nazwa etapu
│   ├── description - opis
│   ├── tasks[] - zadania (co robimy my vs klient)
│   ├── deliverables[] - co klient dostaje
│   └── duration_days - czas trwania
└── Typ: offer_type (starter, full, premium)
```

### 2.3 Oferta klienta (tabela: client_offers)
```
Dane wykorzystywane:
├── Link: unique_token → crm.tomekniedzwiecki.pl/p/{token}
├── Ważność: valid_until
├── Intro: personalized_intro
├── Cena: custom_price (jeśli inna niż standardowa)
├── Statystyki: viewed_at, view_count, view_history
└── Typ: offer_type
```

### 2.4 Kody rabatowe (tabela: discount_codes)
```
Dane wykorzystywane:
├── Kod: code
├── Rabat: discount_amount, discount_percent
├── Cena: original_price → target_price
├── Ważność: valid_until
├── Limit: uses_limit, uses_count
└── Status: is_active
```

### 2.5 Zamówienia (tabela: orders)
```
Dane wykorzystywane:
├── Status: status (pending, paid, cancelled)
├── Kwota: amount, original_amount, discount_amount
├── Płatność: paid_at, payment_source
└── Rabat: discount_code_id
```

### 2.6 Umowy (tabela: offers → contract_html)
```
Dane wykorzystywane:
├── Typ umowy: "budowa-sklepu" lub "mentoring-ai"
├── Kluczowe warunki:
│   ├── 20% dochodu netto - bezterminowo
│   ├── Opcja wykupu po 24 miesiącach (min 50k zł)
│   ├── Próg 400k do założenia spółki
│   └── Raty: pierwsza płatność za miesiąc
├── Etapy (budowa sklepu):
│   ├── Przygotowania (7 dni)
│   ├── Formalności (7 dni)
│   ├── Materiały reklamowe (14 dni)
│   ├── Uruchomienie (14 dni)
│   └── Skalowanie (bezterminowo)
└── Etapy (mentoring AI):
    ├── Strategia (7 dni)
    ├── Baza wiedzy AI (14 dni)
    ├── System mentoringowy (14 dni)
    ├── Platforma (14 dni)
    ├── Marketing (14 dni)
    └── Prowadzenie (bezterminowo)
```

### 2.7 Historia wiadomości (tabela: whatsapp_messages)
```
Dane wykorzystywane:
├── Kierunek: direction (inbound/outbound)
├── Treść: message_text
├── Czas: message_timestamp
└── Kto syncował: synced_by (tomek/maciek)
```

## 3. KNOWLEDGE BASE (statyczna)

### 3.1 Tabela: ai_knowledge_base

```sql
CREATE TABLE ai_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,        -- 'company', 'product', 'objection', 'process', 'tone'
    subcategory TEXT,              -- np. 'pricing', 'timeline', 'guarantee'
    title TEXT NOT NULL,           -- Krótki tytuł
    content TEXT NOT NULL,         -- Pełna treść wiedzy
    trigger_keywords TEXT[],       -- Słowa kluczowe które aktywują tę wiedzę
    priority INT DEFAULT 0,        -- Wyższy = ważniejszy
    for_user TEXT,                 -- NULL = wszyscy, 'tomek', 'maciek'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Kategorie wiedzy

#### COMPANY - Kim jesteśmy
```
- Historia Tomka (TakeDrop, sprzedaż udziałów)
- Model biznesowy (20% dochodu dożywotnio)
- Wartości (partnerstwo, nie klient-dostawca)
- Zespół (Tomek, Maciek)
```

#### PRODUCT - Oferty
```
- Starter (1990 zł) - etapy, co zawiera
- Full (8400 zł) - etapy, co zawiera
- Co dostaje klient na każdym etapie
- Harmonogram prac (co robimy, co klient)
- Dodatkowe koszty (platforma 99 zł/mies, budżet reklamowy)
```

#### OBJECTION - Obiekcje i odpowiedzi
```
- "Nie mam pieniędzy" → Raty, pierwsza za miesiąc
- "Za drogo" → To ułamek wartości, ROI
- "Co jak nie wypali?" → Zmiana produktu, zwrot możliwy
- "Ile zarobię?" → Średnio 17k/mies dochodu
- "Ile czasu potrzebuję?" → 0.5-1h dziennie
- "Kiedy start sprzedaży?" → ~2-3 tygodnie
- "Czy muszę mieć firmę?" → Nie na początku, nierejestrowana/inkubator
```

#### PROCESS - Procesy
```
- Jak wygląda checkout
- Jak działają raty
- Jak podpisać umowę
- Co po płatności
- Jak wybrać produkt
```

#### TONE - Styl komunikacji
```
- Tomek: relacyjny, dłuższe wiadomości, budowanie zaufania
- Maciek: bezpośredni, krótsze, szybkie kwalifikowanie
- Ogólne: naturalny język, bez emoji (chyba że klient), 1-3 zdania
```

## 4. CONTEXT BUILDER - Logika

### 4.1 Algorytm budowania kontekstu

```typescript
async function buildContext(phoneNumber: string, syncedBy: string) {
    // 1. Pobierz konwersację WhatsApp
    const conversation = await getConversation(phoneNumber, syncedBy);

    // 2. Znajdź powiązanego leada (po phone)
    const lead = await findLeadByPhone(phoneNumber);

    // 3. Jeśli jest lead - pobierz wszystko
    if (lead) {
        // Oferta bazowa
        const offer = await getOffer(lead.offer_id);

        // Oferta klienta (personalizowana)
        const clientOffer = await getClientOffer(lead.id);

        // Kody rabatowe dla tego leada
        const discountCodes = await getDiscountCodes(lead.id, clientOffer?.id);

        // Zamówienia
        const orders = await getOrders(lead.id, lead.email);

        return {
            lead,
            offer,
            clientOffer,
            discountCodes,
            orders,
            messages: conversation.messages
        };
    }

    // 4. Brak leada - tylko wiadomości
    return {
        lead: null,
        messages: conversation.messages
    };
}
```

### 4.2 Pobieranie wiedzy kontekstowej

```typescript
async function getRelevantKnowledge(messages: Message[], lead: Lead | null) {
    const lastMessage = messages[messages.length - 1];
    const keywords = extractKeywords(lastMessage.message_text);

    // Znajdź pasującą wiedzę po słowach kluczowych
    const knowledge = await supabase
        .from('ai_knowledge_base')
        .select('*')
        .or(keywords.map(k => `trigger_keywords.cs.{${k}}`).join(','))
        .order('priority', { ascending: false })
        .limit(5);

    // Zawsze dodaj podstawową wiedzę o firmie
    const companyInfo = await supabase
        .from('ai_knowledge_base')
        .select('*')
        .eq('category', 'company')
        .eq('subcategory', 'core');

    return [...knowledge, ...companyInfo];
}
```

## 5. PROMPT ENGINEERING

### 5.1 System Prompt (szablon)

```
Jesteś asystentem sprzedawcy w firmie TN (Tomek Niedźwiecki).
Pomagasz pisać odpowiedzi na wiadomości WhatsApp.

## O FIRMIE
{company_knowledge}

## STYL KOMUNIKACJI ({synced_by})
{tone_guide}

## AKTUALNA OFERTA
{offer_details}

## INFORMACJE O KLIENCIE
{lead_info}

## OFERTA DLA KLIENTA
Link: {client_offer_url}
Ważna do: {valid_until}
Cena: {price}
{discount_info}

## HISTORIA ZAMÓWIEŃ
{orders_history}

## ZASADY
1. Pisz naturalnie, po polsku, jak człowiek
2. Bądź uprzejmy ale konkretny
3. Odpowiedzi 1-3 zdania (chyba że pytanie wymaga więcej)
4. Jeśli klient pyta o cenę - podaj link do oferty
5. Jeśli klient się waha - subtelna presja czasowa
6. Nie obiecuj rzeczy których nie wiesz
7. Użyj informacji o kliencie do personalizacji

## DOSTĘPNE KODY RABATOWE
{discount_codes}

## KONTEKST ROZMOWY (ostatnie wiadomości)
{conversation_history}
```

### 5.2 User Prompt

```
Napisz odpowiedź na ostatnią wiadomość od {contact_name}.
Odpowiedz TYLKO tekstem wiadomości, bez wyjaśnień.
```

## 6. EDGE FUNCTION - Rozbudowana

### 6.1 Struktura plików

```
supabase/functions/generate-whatsapp-reply/
├── index.ts              # Główny handler
├── context-builder.ts    # Budowanie kontekstu
├── knowledge-service.ts  # Pobieranie wiedzy
├── prompt-builder.ts     # Budowanie promptów
└── types.ts              # Typy TypeScript
```

### 6.2 Flow

```
Request (phone, synced_by, messages)
    │
    ▼
┌─────────────────────────┐
│   Context Builder       │
│   - Find lead by phone  │
│   - Get offer           │
│   - Get client_offer    │
│   - Get discount_codes  │
│   - Get orders          │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Knowledge Service     │
│   - Extract keywords    │
│   - Find relevant KB    │
│   - Get tone guide      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Prompt Builder        │
│   - Build system prompt │
│   - Build user prompt   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Claude API Call       │
│   - Send prompt         │
│   - Get response        │
└───────────┬─────────────┘
            │
            ▼
Response (generated reply)
```

## 7. FRONTEND - Rozszerzenia

### 7.1 Nowe funkcje w whatsapp.html

```javascript
// Pokaż kontekst w modalu AI
async function showAIContext() {
    // Wyświetl lead info, ofertę, kody rabatowe
}

// Dodaj instrukcję do generowania
function generateWithInstruction(instruction) {
    // Przekaż dodatkową instrukcję do AI
}

// Historia generowań
function showGenerationHistory() {
    // Pokaż poprzednie wygenerowane odpowiedzi
}
```

### 7.2 Rozbudowany modal

```html
<!-- Zakładki: Odpowiedź | Kontekst | Instrukcja -->
<div class="tabs">
    <button data-tab="reply">Odpowiedź</button>
    <button data-tab="context">Kontekst</button>
    <button data-tab="instruction">Instrukcja</button>
</div>

<!-- Tab: Kontekst -->
<div id="context-tab">
    <div class="lead-info">...</div>
    <div class="offer-info">...</div>
    <div class="discount-codes">...</div>
</div>

<!-- Tab: Instrukcja -->
<div id="instruction-tab">
    <textarea placeholder="Dodatkowe instrukcje dla AI..."></textarea>
    <button onclick="generateWithInstruction()">Generuj z instrukcją</button>
</div>
```

## 8. IMPLEMENTACJA - KOLEJNOŚĆ

### Faza 1: Knowledge Base
1. [ ] Migracja SQL - tabela ai_knowledge_base
2. [ ] Seed data - podstawowa wiedza
3. [ ] UI do zarządzania wiedzą (opcjonalnie)

### Faza 2: Context Builder
4. [ ] context-builder.ts - pobieranie danych
5. [ ] knowledge-service.ts - pobieranie wiedzy
6. [ ] prompt-builder.ts - budowanie promptów

### Faza 3: Edge Function
7. [ ] Rozbudowa generate-whatsapp-reply
8. [ ] Testy

### Faza 4: Frontend
9. [ ] Rozbudowany modal z kontekstem
10. [ ] Instrukcje dodatkowe
11. [ ] Historia generowań

## 9. PRZYKŁAD PEŁNEGO KONTEKSTU

```json
{
  "lead": {
    "name": "Karolina Kobla",
    "email": "karolinakobla@gmail.com",
    "phone": "48514588807",
    "status": "contacted",
    "weekly_hours": "1-5h",
    "experience": "Studiuję i pracuję na etacie",
    "target_income": "5-10k",
    "deal_value": 2490,
    "notes": ["Czeka na dofinansowanie w marcu"]
  },
  "offer": {
    "name": "Budowa sklepu starter",
    "price": 1990,
    "milestones": [...]
  },
  "clientOffer": {
    "url": "crm.tomekniedzwiecki.pl/p/abc123",
    "valid_until": "2026-02-22",
    "viewed": true,
    "view_count": 3
  },
  "discountCodes": [
    {
      "code": "KAROLINA500",
      "discount": 500,
      "valid_until": "2026-02-22"
    }
  ],
  "orders": [],
  "knowledge": [
    { "title": "Raty", "content": "Pierwsza płatność za miesiąc..." },
    { "title": "Czas na sklep", "content": "~2-3 tygodnie..." }
  ],
  "messages": [
    { "direction": "outbound", "text": "Cześć, Karolina..." },
    { "direction": "inbound", "text": "Chodzi o to, że w marcu..." }
  ]
}
```

---

**Następny krok:** Zaczynam od Fazy 1 - migracja i seed data dla Knowledge Base?
