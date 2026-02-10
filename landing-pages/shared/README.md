# Conversion Toolkit v1.0

Modułowa biblioteka JavaScript do zwiększania konwersji na landing pages.

## Komponenty

| Komponent | Opis | Wpływ na konwersję |
|-----------|------|-------------------|
| **Exit Intent Popup** | Wyskakujące okno przy próbie opuszczenia strony | +15-20% |
| **Urgency Timer** | Odliczanie do końca oferty (evergreen) | +9-15% |
| **Stock Counter** | Licznik dostępnych sztuk | +10-12% |
| **Social Proof Toast** | Powiadomienia o zakupach innych | +5-8% |
| **Live Visitors** | Licznik osób oglądających | +3-5% |
| **Progress Bar** | Pasek postępu czytania | engagement |
| **Floating CTA** | Pływający przycisk CTA | +5-10% |
| **Extra Section CTAs** | Dodatkowe przyciski w sekcjach | +3-5% |

## Użycie

### Podstawowe

```html
<script src="/landing-pages/shared/conversion-toolkit.js"></script>
<script>
  ConversionToolkit.init({
    brand: {
      primary: '#FF6B35',
      secondary: '#1A3A5C',
      name: 'Twoja Marka',
      ctaUrl: '#offer'
    }
  });
</script>
```

### Pełna konfiguracja

```javascript
ConversionToolkit.init({
  // Kolory i dane marki
  brand: {
    primary: '#FF6B35',      // Kolor akcentowy (przyciski, elementy)
    secondary: '#1A3A5C',    // Kolor drugorzędny
    name: 'Vellur',          // Nazwa marki
    ctaUrl: '#offer'         // URL przycisku CTA
  },

  // Exit Intent Popup
  exitPopup: {
    enabled: true,
    delay: 5000,              // ms przed włączeniem detekcji
    cooldown: 86400000,       // 24h - nie pokazuj ponownie
    headline: 'Czekaj! Mamy dla Ciebie coś specjalnego',
    subheadline: 'Odbierz 10% rabatu na pierwsze zamówienie',
    ctaText: 'Odbierz rabat',
    dismissText: 'Nie, dziękuję',
    showOnMobile: true
  },

  // Elementy pilności
  urgency: {
    enabled: true,
    countdown: {
      enabled: true,
      endDate: null,           // null = 24h evergreen
      position: 'both',        // 'hero', 'offer', 'both'
      text: 'Oferta kończy się za:'
    },
    stock: {
      enabled: true,
      initial: 23,
      min: 3,
      decreaseInterval: 45000,  // co 45s
      text: 'Zostało tylko {count} sztuk!'
    }
  },

  // Social proof
  socialProof: {
    enabled: true,
    liveVisitors: {
      enabled: true,
      min: 12,
      max: 47,
      text: '{count} osób ogląda teraz'
    },
    recentPurchases: {
      enabled: true,
      interval: 25000,
      names: ['Anna', 'Marek', ...],
      cities: ['Warszawa', 'Kraków', ...],
      text: '{name} z {city} właśnie zamówił(a)'
    }
  },

  // Pływający CTA
  scrollCTA: {
    enabled: true,
    showAfter: 30,            // % scroll
    text: 'Zamów teraz',
    pulse: true
  },

  // Pasek postępu
  progressBar: {
    enabled: true,
    color: null,              // null = brand.primary
    height: 3
  },

  // Dodatkowe CTA w sekcjach
  extraCTAs: {
    enabled: true,
    sections: ['problem', 'solution', 'how-it-works', 'comparison']
  }
});
```

## Wyłączanie komponentów

Każdy komponent można wyłączyć ustawiając `enabled: false`:

```javascript
ConversionToolkit.init({
  brand: { ... },
  exitPopup: { enabled: false },      // Wyłączone
  urgency: { enabled: true },         // Włączone
  socialProof: { enabled: false },    // Wyłączone
  // ...
});
```

## Evergreen Countdown

Timer domyślnie działa w trybie "evergreen" - każdy użytkownik widzi 24h od swojej pierwszej wizyty. To etyczne podejście, które nie oszukuje użytkowników.

Aby ustawić konkretną datę końca promocji:

```javascript
urgency: {
  countdown: {
    endDate: '2024-12-31T23:59:59',  // ISO 8601
    // ...
  }
}
```

## Wymagania

- Vanilla JavaScript (zero zależności)
- Nowoczesne przeglądarki (ES6+)
- LocalStorage do przechowywania stanu

## Integracja z landing page

1. Dodaj skrypt przed `</body>`
2. Wywołaj `ConversionToolkit.init()` z konfiguracją
3. Upewnij się, że struktura HTML zawiera wymagane selektory:
   - `.header` - nagłówek strony
   - `.hero-stats` - miejsce na live visitors
   - `.offer-box` - sekcja oferty
   - `.offer-price` - miejsce na stock counter
   - `.problem`, `.solution`, `.how-it-works`, `.comparison` - sekcje na extra CTAs

## Źródła i badania

- [OptiMonk: Exit Intent Popup Best Practices](https://www.optimonk.com/how-to-create-an-exit-intent-popup/)
- [Shopify: Exit Intent Popup Examples](https://www.shopify.com/blog/exit-intent-popup)
- [CXL: Creating Urgency in Sales](https://cxl.com/blog/creating-urgency/)
- [Smart Insights: Psychology of Urgency](https://www.smartinsights.com/digital-marketing-strategy/psychology-urgency-9-ways-drive-conversions/)
