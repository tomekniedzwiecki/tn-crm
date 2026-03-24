# Assety do lead magnetu: OraVibe

## 1. Formularz lead capture

### Wersja popup (exit intent)

```html
<div class="popup-container">
  <h2>Zanim wyjdziesz...</h2>
  <p class="subtitle">Pobierz darmowy poradnik</p>

  <h3>"5 mitów o irygatorach które kosztują Cię zdrowe dziąsła"</h3>

  <p>Dowiedz się, czy naprawdę potrzebujesz irygatora i na co zwrócić uwagę przy zakupie.</p>

  <form>
    <input type="text" placeholder="Twoje imię" name="name" required />
    <input type="email" placeholder="Twój email" name="email" required />
    <button type="submit">Wyślij mi poradnik →</button>
  </form>

  <p class="disclaimer">Żadnego spamu. Możesz wypisać się w każdej chwili.</p>
</div>
```

### Wersja inline (sekcja na landing page)

```html
<section class="lead-capture">
  <div class="content">
    <span class="badge">Darmowy poradnik</span>
    <h2>Czy irygator jest dla Ciebie?</h2>
    <p>Pobierz poradnik i dowiedz się, jakie mity powstrzymują Cię przed zdrowszymi dziąsłami.</p>

    <ul class="benefits">
      <li>5 obalonych mitów o irygatorach</li>
      <li>Checklist przed zakupem</li>
      <li>Porady od specjalistów</li>
    </ul>
  </div>

  <form class="form">
    <input type="text" placeholder="Imię" name="name" required />
    <input type="email" placeholder="Email" name="email" required />
    <button type="submit">Pobierz za darmo</button>
  </form>
</section>
```

### Dane do wysłania (endpoint)

```javascript
// Endpoint: /supabase/functions/lead-upsert
const leadData = {
  email: formData.email,
  name: formData.name,
  lead_source: 'lead_magnet_oravibe',
  notes: 'Pobrał poradnik "5 mitów o irygatorach"',
  // Opcjonalnie - tracking
  utm_source: urlParams.get('utm_source'),
  utm_medium: urlParams.get('utm_medium'),
  utm_campaign: urlParams.get('utm_campaign')
};
```

---

## 2. Popup copy (3 warianty)

### Wariant A: Exit intent
```
NAGŁÓWEK: "Zanim wyjdziesz..."
PODTYTUŁ: Czy wiesz, że 98% Polaków ma problemy z dziąsłami?
TEKST: Pobierz darmowy poradnik i dowiedz się, czy irygator może Ci pomóc.
CTA: "Wyślij mi poradnik →"
TRIGGER: Exit intent
```

### Wariant B: Scroll 50%
```
NAGŁÓWEK: "Masz 2 minuty?"
PODTYTUŁ: Obalamy 5 mitów o irygatorach
TEKST: Darmowy poradnik, który pomoże Ci podjąć świadomą decyzję.
CTA: "Pobierz za darmo"
TRIGGER: Scroll 50%
```

### Wariant C: Timer 30s
```
NAGŁÓWEK: "Darmowy poradnik dla Ciebie"
PODTYTUŁ: 5 mitów o irygatorach które kosztują Cię zdrowe dziąsła
TEKST: Dowiedz się, na co zwrócić uwagę przy zakupie.
CTA: "Chcę poradnik →"
TRIGGER: Po 30 sekundach
```

---

## 3. Email sequence (5 emaili)

### Email 1: Dzień 0 — Dostawa lead magnetu

**Temat:** Twój poradnik o irygatorach jest gotowy

**Treść:**
```
Cześć {{name}}!

Dziękuję za pobranie poradnika "5 mitów o irygatorach które kosztują Cię zdrowe dziąsła".

👉 Pobierz tutaj: [LINK DO PDF]

Moja rada? Zacznij od Mitu #3 — to ten, który zaskakuje najwięcej osób.

Spoiler: różnica między tanim a dobrym irygatorem jest większa niż myślisz.

Do usłyszenia,
Zespół OraVibe

P.S. Jeśli masz pytania o irygatory — po prostu odpisz na tego maila. Odpowiadam osobiście.
```

---

### Email 2: Dzień 2 — Rozwinięcie tematu

**Temat:** Jedno pytanie do Ciebie

**Treść:**
```
Cześć {{name}},

Mam do Ciebie jedno pytanie:

Czy Twoje dziąsła krwawią podczas szczotkowania zębów?

Jeśli tak — to NIE jest normalne.

Zdrowe dziąsła nie krwawią. Nigdy.

Krwawienie to znak, że w przestrzeniach międzyzębowych gromadzą się bakterie. Bakterie, do których szczoteczka nie dociera.

To właśnie dlatego irygator może zmienić wszystko.

Nie mówię, że musisz kupić nasz produkt. Mówię, że warto zwrócić uwagę na sygnały, które wysyła Twoje ciało.

Czy przeczytałeś już poradnik? Który mit Cię najbardziej zaskoczył?

Odpisz — chętnie porozmawiam.

Pozdrawiam,
Zespół OraVibe
```

---

### Email 3: Dzień 4 — Obalenie obiekcji

**Temat:** "To za drogie jak na wodę pod ciśnieniem"

**Treść:**
```
Cześć {{name}},

Słyszę to często: "Irygator to tylko woda pod ciśnieniem. Po co przepłacać?"

Rozumiem. Sam tak myślałem.

Ale potem policzyłem:

🦷 Średni koszt leczenia jednego ubytku: 150-300 zł
🦷 Średni koszt leczenia kanałowego: 500-1500 zł
🦷 Średni koszt protezy/implantu: 2000-8000 zł

A teraz:
💧 Koszt dobrego irygatora: 200-400 zł
💧 Czas użytkowania: 3-5 lat

Irygator to nie wydatek. To inwestycja w profilaktykę.

Bo łatwiej (i taniej) jest zapobiegać niż leczyć.

Oczywiście — sam musisz zdecydować, czy to dla Ciebie. Ale przynajmniej masz teraz pełny obraz.

Do usłyszenia,
Zespół OraVibe

P.S. W poradniku znajdziesz checklist "Przed zakupem irygatora". Użyj go, niezależnie od tego, którą markę wybierzesz.
```

---

### Email 4: Dzień 6 — Social proof

**Temat:** "Dentysta pierwszy raz powiedział, że dziąsła są OK"

**Treść:**
```
Cześć {{name}},

Chciałem podzielić się historią, którą usłyszałem od jednej z naszych klientek.

Ania (42 lata) przez lata bała się wizyt u dentysty. Nie dlatego, że bała się bólu — bała się tego, co usłyszy.

"Za każdym razem to samo: dziąsła w złym stanie, kamień nazębny, kolejny ubytek do leczenia."

3 miesiące temu zaczęła używać irygatora. Codziennie, po szczotkowaniu.

W zeszłym tygodniu była na kontroli.

Cytuję dentystę: "Co Pani zrobiła? Dziąsła wyglądają zupełnie inaczej."

To nie był komplement — to było zdziwienie.

Ania płakała.

Nie obiecuję, że irygator rozwiąże wszystkie problemy. Ale jeśli Twoje dziąsła potrzebują pomocy — warto spróbować.

Pozdrawiam,
Zespół OraVibe
```

---

### Email 5: Dzień 8 — Soft CTA

**Temat:** Gotowy na następny krok?

**Treść:**
```
Cześć {{name}},

Przez ostatni tydzień wysłałem Ci kilka maili o irygatorach:

✅ 5 mitów, które obaliliśmy
✅ Dlaczego krwawiące dziąsła to sygnał alarmowy
✅ Jak policzyć prawdziwy koszt (nie)używania irygatora
✅ Historia Ani i jej dentysty

Teraz decyzja należy do Ciebie.

Jeśli zdecydowałeś, że irygator jest dla Ciebie — możesz sprawdzić nasz OraVibe tutaj: [LINK DO STRONY]

Jeśli nie teraz — nic się nie dzieje. Poradnik masz na zawsze.

Jeśli masz pytania — po prostu odpisz. Odpowiadam osobiście.

Dziękuję, że pozwoliłeś mi zabrać kilka minut Twojego czasu.

Trzymaj się zdrowo,
Zespół OraVibe

---

P.S. Jeśli zdecydujesz się na zakup — użyj kodu PORADNIK, żeby dostać darmową wysyłkę.
```

---

## 4. Integracja z systemem (SQL)

```sql
-- 1. Template emaila z dostawą lead magnetu
INSERT INTO settings (key, value) VALUES
('email_template_lead_magnet_oravibe_subject', 'Twój poradnik o irygatorach jest gotowy'),
('email_template_lead_magnet_oravibe_body', '<!DOCTYPE html>...</html>')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Automation flow
INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active, category)
VALUES (
  'OraVibe - Lead Magnet Delivery',
  'Wysyła PDF z poradnikiem po zapisie',
  'lead_created',
  '{"lead_source": "lead_magnet_oravibe"}',
  true,
  'lead'
);

-- 3. Dodaj step: wyślij email
-- (po utworzeniu flow, pobierz flow_id i dodaj step)
```

---

## 5. Hosting PDF

### Upload do Supabase Storage

```bash
# 1. Konwertuj Markdown na PDF (lokalnie przez Pandoc lub Canva)
# 2. Upload do storage

curl -X POST "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/attachments/lead-magnets/oravibe/5-mitow-o-irygatorach.pdf" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/pdf" \
  --data-binary @"5-mitow-o-irygatorach.pdf"
```

### Link publiczny

```
https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/lead-magnets/oravibe/5-mitow-o-irygatorach.pdf
```

---

## 6. Kolory i branding (do PDF)

| Element | Kolor | HEX |
|---------|-------|-----|
| Primary (nagłówki, CTA) | Fresh Teal | #00B4A6 |
| Secondary (akcenty) | Ocean Blue | #2563EB |
| Accent (highlights) | Mint Glow | #34D399 |
| Tekst główny | Deep Charcoal | #111827 |
| Tekst pomocniczy | Slate Gray | #475569 |
| Tło | Cloud White | #F8FAFC |

**Fonty:**
- Nagłówki: Quicksand (500, 700)
- Body: Open Sans (400, 600)
- Akcent/cytaty: Comfortaa

**Logo:**
```
https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/branding/f978547e-6e08-482d-8752-ef083e47c990/logo_main_1769967015416.png
```
