/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONVERSION TOOLKIT v1.1
 * Modułowa biblioteka do zwiększania konwersji na landing pages
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Komponenty:
 * 1. Exit Intent Popup - wyskakujące okno przy próbie opuszczenia strony
 * 2. Urgency Timer - odliczanie do końca oferty
 * 3. Stock Counter - licznik dostępnych sztuk
 * 4. Social Proof Toast - powiadomienia o zakupach innych
 * 5. Live Visitors - licznik osób oglądających
 * 6. Scroll Progress Bar - pasek postępu czytania
 * 7. Floating CTA - pływający przycisk CTA
 * 8. Scroll-triggered Elements - elementy pojawiające się przy scrollu
 * 9. Trust Badges - ikony płatności i bezpieczeństwa
 * 10. Sticky Product Bar - pasek produktu przy scrollowaniu
 * 11. Mobile Bottom Bar - stały CTA na mobile
 *
 * Użycie:
 * ConversionToolkit.init({
 *   brand: { primary: '#FF6B35', name: 'Vellur' },
 *   exitPopup: { enabled: true, delay: 5000, ... },
 *   urgency: { enabled: true, ... },
 *   ...
 * });
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN TOOLKIT OBJECT
  // ═══════════════════════════════════════════════════════════════════════════

  const ConversionToolkit = {
    version: '1.1.1',
    config: {},
    state: {
      exitPopupShown: false,
      scrollDepth: 0,
      timeOnPage: 0,
      engaged: false
    },

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════

    init(options = {}) {
      this.config = this.mergeConfig(this.getDefaultConfig(), options);
      this.injectStyles();
      this.initModules();
      this.trackEngagement();
      console.log('[ConversionToolkit] Initialized v' + this.version);
    },

    getDefaultConfig() {
      return {
        brand: {
          primary: '#FF6B35',
          secondary: '#1A3A5C',
          name: 'Brand',
          ctaUrl: '#offer'
        },
        exitPopup: {
          enabled: true,
          delay: 3000,           // ms przed włączeniem detekcji
          cooldown: 86400000,    // 24h w ms (nie pokazuj ponownie)
          headline: 'Czekaj! Mamy dla Ciebie coś specjalnego',
          subheadline: 'Odbierz 10% rabatu na pierwsze zamówienie',
          ctaText: 'Odbierz rabat',
          dismissText: 'Nie, dziękuję',
          showOnMobile: true
        },
        urgency: {
          enabled: true,
          countdown: {
            enabled: true,
            endDate: null,        // null = 24h od teraz (evergreen)
            position: 'hero',     // 'hero', 'offer', 'both'
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
            interval: 25000,      // co 25s
            names: ['Anna', 'Marek', 'Kasia', 'Piotr', 'Ewa', 'Tomek', 'Magda', 'Jakub'],
            cities: ['Warszawa', 'Kraków', 'Poznań', 'Wrocław', 'Gdańsk', 'Łódź', 'Katowice'],
            text: '{name} z {city} właśnie zamówił(a)'
          }
        },
        scrollCTA: {
          enabled: true,
          showAfter: 30,          // % scroll
          text: 'Zamów teraz',
          pulse: true
        },
        progressBar: {
          enabled: true,
          color: null,            // null = użyj brand.primary
          height: 3
        },
        extraCTAs: {
          enabled: true,
          sections: ['problem', 'solution', 'how-it-works', 'comparison']
        },
        trustBadges: {
          enabled: true,
          position: 'offer',           // 'offer', 'cta', 'both'
          payments: ['visa', 'mastercard', 'blik', 'przelewy24'],
          security: ['ssl', 'guarantee', 'returns'],
          guaranteeText: '30 dni na zwrot',
          secureText: 'Bezpieczne płatności'
        },
        stickyBar: {
          enabled: true,
          showAfter: 400,              // px scrolled past hero
          productName: null,           // null = auto from h1
          price: null,                 // null = auto from .offer-price
          ctaText: 'Zamów teraz'
        },
        mobileBar: {
          enabled: true,
          text: 'Zamów teraz',
          showPrice: true,
          price: null                  // null = auto from .offer-price
        }
      };
    },

    mergeConfig(defaults, options) {
      const result = { ...defaults };
      for (const key in options) {
        if (typeof options[key] === 'object' && !Array.isArray(options[key])) {
          result[key] = { ...defaults[key], ...options[key] };
        } else {
          result[key] = options[key];
        }
      }
      return result;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // STYLES INJECTION
    // ═══════════════════════════════════════════════════════════════════════

    injectStyles() {
      const css = `
        /* ═══ CONVERSION TOOLKIT STYLES ═══ */

        :root {
          --ct-primary: ${this.config.brand.primary};
          --ct-secondary: ${this.config.brand.secondary};
          --ct-white: #FFFFFF;
          --ct-dark: #1F2937;
          --ct-gray: #6B7280;
          --ct-light: #F3F4F6;
          --ct-shadow: 0 20px 60px rgba(0,0,0,0.15);
          --ct-radius: 16px;
        }

        /* ═══ EXIT POPUP ═══ */
        .ct-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 10000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        .ct-overlay.show {
          opacity: 1;
          visibility: visible;
        }
        .ct-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.9);
          background: var(--ct-white);
          border-radius: var(--ct-radius);
          padding: 48px;
          max-width: 480px;
          width: 90%;
          box-shadow: var(--ct-shadow);
          z-index: 10001;
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: center;
        }
        .ct-overlay.show .ct-popup {
          opacity: 1;
          visibility: visible;
          transform: translate(-50%, -50%) scale(1);
        }
        .ct-popup-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          border: none;
          background: var(--ct-light);
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .ct-popup-close:hover {
          background: var(--ct-dark);
          color: var(--ct-white);
        }
        .ct-popup-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--ct-primary) 0%, var(--ct-secondary) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        .ct-popup-icon svg {
          width: 32px;
          height: 32px;
          color: var(--ct-white);
        }
        .ct-popup h3 {
          font-size: 24px;
          font-weight: 700;
          color: var(--ct-dark);
          margin-bottom: 12px;
          line-height: 1.3;
        }
        .ct-popup p {
          font-size: 16px;
          color: var(--ct-gray);
          margin-bottom: 32px;
          line-height: 1.6;
        }
        .ct-popup-cta {
          display: block;
          width: 100%;
          padding: 16px 32px;
          background: var(--ct-primary);
          color: var(--ct-white);
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 16px;
        }
        .ct-popup-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255,107,53,0.3);
        }
        .ct-popup-dismiss {
          background: none;
          border: none;
          color: var(--ct-gray);
          font-size: 14px;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        .ct-popup-dismiss:hover {
          opacity: 1;
        }

        /* ═══ URGENCY TIMER ═══ */
        .ct-urgency-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 101;
          background: linear-gradient(135deg, var(--ct-primary) 0%, #E85A2A 100%);
          color: var(--ct-white);
          padding: 10px 24px;
          text-align: center;
          font-size: 14px;
          font-weight: 500;
          overflow: hidden;
        }
        .ct-urgency-bar::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
          animation: ct-shimmer 2s infinite;
        }
        @keyframes ct-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        /* Adjust header when urgency bar is present */
        body.ct-has-urgency-bar .header {
          top: 44px !important;
        }
        body.ct-has-urgency-bar {
          padding-top: 44px;
        }
        .ct-countdown {
          display: inline-flex;
          gap: 6px;
          margin-left: 12px;
        }
        .ct-countdown-unit {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255,255,255,0.2);
          padding: 4px 8px;
          border-radius: 6px;
          min-width: 44px;
        }
        .ct-countdown-value {
          font-size: 18px;
          font-weight: 700;
          line-height: 1;
        }
        .ct-countdown-label {
          font-size: 9px;
          text-transform: uppercase;
          opacity: 0.8;
          margin-top: 2px;
        }

        /* ═══ STOCK COUNTER ═══ */
        .ct-stock {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(225, 29, 72, 0.1);
          border: 1px solid rgba(225, 29, 72, 0.2);
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          color: #E11D48;
          animation: ct-pulse 2s infinite;
        }
        @keyframes ct-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .ct-stock-dot {
          width: 8px;
          height: 8px;
          background: #E11D48;
          border-radius: 50%;
          animation: ct-blink 1s infinite;
        }
        @keyframes ct-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* ═══ SOCIAL PROOF TOAST ═══ */
        .ct-toast {
          position: fixed;
          bottom: 24px;
          left: 24px;
          background: var(--ct-white);
          border-radius: 12px;
          padding: 16px 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          display: flex;
          align-items: center;
          gap: 14px;
          z-index: 9999;
          transform: translateX(-120%);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          max-width: 320px;
          border-left: 4px solid var(--ct-primary);
        }
        .ct-toast.show {
          transform: translateX(0);
        }
        .ct-toast-icon {
          width: 40px;
          height: 40px;
          background: var(--ct-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ct-toast-icon svg {
          width: 20px;
          height: 20px;
          color: var(--ct-primary);
        }
        .ct-toast-content {
          flex: 1;
        }
        .ct-toast-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--ct-dark);
          margin-bottom: 2px;
        }
        .ct-toast-time {
          font-size: 12px;
          color: var(--ct-gray);
        }
        .ct-toast-close {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 20px;
          height: 20px;
          border: none;
          background: none;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        .ct-toast-close:hover { opacity: 1; }

        /* ═══ LIVE VISITORS ═══ */
        .ct-live-visitors {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          color: #059669;
        }
        .ct-live-dot {
          width: 8px;
          height: 8px;
          background: #10B981;
          border-radius: 50%;
          animation: ct-blink 1.5s infinite;
        }

        /* ═══ PROGRESS BAR ═══ */
        .ct-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: ${this.config.progressBar.height}px;
          background: ${this.config.progressBar.color || this.config.brand.primary};
          z-index: 102;
          transition: width 0.1s ease-out;
          box-shadow: 0 0 10px ${this.config.brand.primary}40;
        }
        body.ct-has-urgency-bar .ct-progress-bar {
          top: 44px;
        }

        /* ═══ FLOATING CTA ═══ */
        .ct-floating-cta {
          position: fixed;
          bottom: 90px;
          right: 24px;
          z-index: 9997;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px) scale(0.9);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ct-floating-cta.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }
        .ct-floating-cta a {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 28px;
          background: var(--ct-primary);
          color: var(--ct-white);
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          border-radius: 100px;
          box-shadow: 0 8px 32px rgba(255,107,53,0.35);
          transition: all 0.3s;
        }
        .ct-floating-cta a:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(255,107,53,0.45);
        }
        .ct-floating-cta.pulse a {
          animation: ct-cta-pulse 2s infinite;
        }
        @keyframes ct-cta-pulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(255,107,53,0.35); }
          50% { box-shadow: 0 8px 32px rgba(255,107,53,0.55), 0 0 0 8px rgba(255,107,53,0.1); }
        }
        .ct-floating-cta svg {
          width: 18px;
          height: 18px;
        }

        /* ═══ SECTION CTA BUTTONS ═══ */
        .ct-section-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 32px;
          padding: 14px 28px;
          background: transparent;
          color: var(--ct-primary);
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          border: 2px solid var(--ct-primary);
          border-radius: 100px;
          transition: all 0.3s;
        }
        .ct-section-cta:hover {
          background: var(--ct-primary);
          color: var(--ct-white);
        }
        .ct-section-cta svg {
          width: 16px;
          height: 16px;
          transition: transform 0.3s;
        }
        .ct-section-cta:hover svg {
          transform: translateX(4px);
        }

        /* ═══ COUNTDOWN INLINE (for offer section) ═══ */
        .ct-countdown-inline {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin: 24px 0;
        }
        .ct-countdown-inline .ct-countdown-unit {
          background: var(--ct-light);
          padding: 12px 16px;
          min-width: 64px;
        }
        .ct-countdown-inline .ct-countdown-value {
          font-size: 28px;
          color: var(--ct-dark);
        }
        .ct-countdown-inline .ct-countdown-label {
          color: var(--ct-gray);
          font-size: 11px;
        }

        /* ═══ TRUST BADGES ═══ */
        .ct-trust-badges {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(0,0,0,0.08);
        }
        .ct-trust-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .ct-trust-label {
          font-size: 12px;
          color: var(--ct-gray);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }
        .ct-payment-icons {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .ct-payment-icon {
          width: 40px;
          height: 26px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          color: #374151;
        }
        .ct-payment-icon.visa { background: linear-gradient(135deg, #1a1f71 0%, #2557d6 100%); color: #fff; }
        .ct-payment-icon.mastercard { background: linear-gradient(135deg, #eb001b 0%, #f79e1b 100%); color: #fff; }
        .ct-payment-icon.blik { background: #e6007e; color: #fff; }
        .ct-payment-icon.przelewy24 { background: #d13239; color: #fff; font-size: 8px; }
        .ct-payment-icon.paypal { background: #003087; color: #fff; }
        .ct-payment-icon.applepay { background: #000; color: #fff; font-size: 9px; }
        .ct-security-badges {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .ct-security-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #059669;
          font-weight: 500;
        }
        .ct-security-badge svg {
          width: 16px;
          height: 16px;
        }

        /* ═══ STICKY PRODUCT BAR ═══ */
        .ct-sticky-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: var(--ct-white);
          box-shadow: 0 2px 20px rgba(0,0,0,0.1);
          padding: 12px 24px;
          transform: translateY(-100%);
          transition: transform 0.3s ease;
        }
        body.ct-has-urgency-bar .ct-sticky-bar {
          top: 44px;
        }
        .ct-sticky-bar.show {
          transform: translateY(0);
        }
        /* Hide header when sticky bar is visible */
        .header {
          transition: opacity 0.3s ease;
        }
        body.ct-sticky-bar-visible .header {
          opacity: 0;
          pointer-events: none;
        }
        .ct-sticky-bar-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .ct-sticky-product {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .ct-sticky-product-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--ct-dark);
        }
        .ct-sticky-price {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .ct-sticky-price-current {
          font-size: 20px;
          font-weight: 700;
          color: var(--ct-primary);
        }
        .ct-sticky-price-old {
          font-size: 14px;
          color: var(--ct-gray);
          text-decoration: line-through;
        }
        .ct-sticky-cta {
          padding: 12px 28px;
          background: var(--ct-primary);
          color: var(--ct-white);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          border-radius: 100px;
          transition: all 0.3s;
          white-space: nowrap;
        }
        .ct-sticky-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255,107,53,0.3);
        }

        /* ═══ MOBILE BOTTOM BAR ═══ */
        .ct-mobile-bar {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9998;
          background: var(--ct-white);
          box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
          padding: 12px 16px;
          padding-bottom: max(12px, env(safe-area-inset-bottom));
        }
        .ct-mobile-bar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .ct-mobile-bar-price {
          display: flex;
          flex-direction: column;
        }
        .ct-mobile-bar-price-current {
          font-size: 18px;
          font-weight: 700;
          color: var(--ct-dark);
        }
        .ct-mobile-bar-price-old {
          font-size: 12px;
          color: var(--ct-gray);
          text-decoration: line-through;
        }
        .ct-mobile-bar-cta {
          flex: 1;
          max-width: 200px;
          padding: 14px 24px;
          background: var(--ct-primary);
          color: var(--ct-white);
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          text-align: center;
          border-radius: 100px;
          transition: all 0.3s;
        }
        .ct-mobile-bar-cta:active {
          transform: scale(0.98);
        }

        /* ═══ MOBILE ADJUSTMENTS ═══ */
        @media (max-width: 768px) {
          .ct-popup {
            padding: 32px 24px;
            max-width: 340px;
          }
          .ct-popup h3 { font-size: 20px; }
          .ct-toast {
            left: 16px;
            right: 16px;
            bottom: 100px;
            max-width: none;
          }
          .ct-floating-cta {
            right: 16px;
            bottom: 80px;
          }
          .ct-floating-cta a {
            padding: 14px 24px;
            font-size: 14px;
          }
          .ct-countdown-unit {
            min-width: 36px;
            padding: 3px 6px;
          }
          .ct-countdown-value { font-size: 14px; }
          .ct-countdown-label { font-size: 8px; }
          .ct-urgency-bar {
            font-size: 11px;
            padding: 8px 12px;
          }
          body.ct-has-urgency-bar .header {
            top: 38px !important;
          }
          body.ct-has-urgency-bar {
            padding-top: 38px;
          }
          body.ct-has-urgency-bar .ct-progress-bar {
            top: 38px;
          }
          /* Sticky bar on mobile - hidden */
          .ct-sticky-bar {
            display: none !important;
          }
          /* Don't hide header on mobile (no sticky bar) */
          body.ct-sticky-bar-visible .header {
            opacity: 1;
            pointer-events: auto;
          }
          /* Mobile bottom bar */
          .ct-mobile-bar {
            display: block;
          }
          .ct-floating-cta {
            bottom: 80px;
          }
          .ct-toast {
            bottom: 90px;
          }
          /* Trust badges mobile */
          .ct-trust-row {
            gap: 8px;
          }
          .ct-payment-icon {
            width: 36px;
            height: 24px;
          }
          .ct-security-badges {
            gap: 12px;
          }
        }
        @media (min-width: 769px) {
          .ct-mobile-bar {
            display: none !important;
          }
        }
      `;

      const style = document.createElement('style');
      style.id = 'ct-styles';
      style.textContent = css;
      document.head.appendChild(style);
    },

    // ═══════════════════════════════════════════════════════════════════════
    // MODULE INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════

    initModules() {
      if (this.config.progressBar.enabled) this.initProgressBar();
      if (this.config.exitPopup.enabled) this.initExitPopup();
      if (this.config.urgency.enabled) this.initUrgency();
      if (this.config.socialProof.enabled) this.initSocialProof();
      if (this.config.scrollCTA.enabled) this.initScrollCTA();
      if (this.config.extraCTAs.enabled) this.initExtraCTAs();
      if (this.config.trustBadges.enabled) this.initTrustBadges();
      if (this.config.stickyBar.enabled) this.initStickyBar();
      if (this.config.mobileBar.enabled) this.initMobileBar();
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PROGRESS BAR
    // ═══════════════════════════════════════════════════════════════════════

    initProgressBar() {
      const bar = document.createElement('div');
      bar.className = 'ct-progress-bar';
      bar.style.width = '0%';
      document.body.appendChild(bar);

      window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        bar.style.width = progress + '%';
        this.state.scrollDepth = Math.max(this.state.scrollDepth, progress);
      });
    },

    // ═══════════════════════════════════════════════════════════════════════
    // EXIT INTENT POPUP
    // ═══════════════════════════════════════════════════════════════════════

    initExitPopup() {
      const cfg = this.config.exitPopup;

      // Check cooldown
      const lastShown = localStorage.getItem('ct_exit_popup_shown');
      if (lastShown && (Date.now() - parseInt(lastShown)) < cfg.cooldown) {
        return;
      }

      // Create popup HTML
      const overlay = document.createElement('div');
      overlay.className = 'ct-overlay';
      overlay.innerHTML = `
        <div class="ct-popup">
          <button class="ct-popup-close" aria-label="Zamknij">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <div class="ct-popup-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3>${cfg.headline}</h3>
          <p>${cfg.subheadline}</p>
          <a href="${this.config.brand.ctaUrl}" class="ct-popup-cta">${cfg.ctaText}</a>
          <button class="ct-popup-dismiss">${cfg.dismissText}</button>
        </div>
      `;
      document.body.appendChild(overlay);

      // Close handlers
      const closePopup = () => {
        overlay.classList.remove('show');
        localStorage.setItem('ct_exit_popup_shown', Date.now().toString());
      };

      overlay.querySelector('.ct-popup-close').addEventListener('click', closePopup);
      overlay.querySelector('.ct-popup-dismiss').addEventListener('click', closePopup);
      overlay.querySelector('.ct-popup-cta').addEventListener('click', closePopup);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closePopup();
      });

      // Exit intent detection (desktop)
      let exitEnabled = false;
      setTimeout(() => { exitEnabled = true; }, cfg.delay);

      document.addEventListener('mouseout', (e) => {
        if (!exitEnabled || this.state.exitPopupShown) return;
        if (e.clientY <= 0 && e.relatedTarget == null) {
          overlay.classList.add('show');
          this.state.exitPopupShown = true;
        }
      });

      // Mobile: show on back button or after time
      if (cfg.showOnMobile && /Mobi|Android/i.test(navigator.userAgent)) {
        setTimeout(() => {
          if (!this.state.exitPopupShown && this.state.scrollDepth > 50) {
            overlay.classList.add('show');
            this.state.exitPopupShown = true;
          }
        }, 30000); // 30s on mobile
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    // URGENCY (COUNTDOWN + STOCK)
    // ═══════════════════════════════════════════════════════════════════════

    initUrgency() {
      const cfg = this.config.urgency;

      // Countdown Timer
      if (cfg.countdown.enabled) {
        this.initCountdown();
      }

      // Stock Counter
      if (cfg.stock.enabled) {
        this.initStockCounter();
      }
    },

    initCountdown() {
      const cfg = this.config.urgency.countdown;

      // Calculate end date (evergreen: 24h from first visit)
      let endDate;
      if (cfg.endDate) {
        endDate = new Date(cfg.endDate);
      } else {
        const stored = localStorage.getItem('ct_countdown_end');
        if (stored) {
          endDate = new Date(parseInt(stored));
        } else {
          endDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
          localStorage.setItem('ct_countdown_end', endDate.getTime().toString());
        }
      }

      // Create countdown HTML
      const countdownHTML = `
        <span class="ct-countdown-text">${cfg.text}</span>
        <span class="ct-countdown">
          <span class="ct-countdown-unit">
            <span class="ct-countdown-value" data-unit="hours">00</span>
            <span class="ct-countdown-label">godz</span>
          </span>
          <span class="ct-countdown-unit">
            <span class="ct-countdown-value" data-unit="minutes">00</span>
            <span class="ct-countdown-label">min</span>
          </span>
          <span class="ct-countdown-unit">
            <span class="ct-countdown-value" data-unit="seconds">00</span>
            <span class="ct-countdown-label">sek</span>
          </span>
        </span>
      `;

      // Insert urgency bar at top
      if (cfg.position === 'hero' || cfg.position === 'both') {
        const bar = document.createElement('div');
        bar.className = 'ct-urgency-bar';
        bar.innerHTML = countdownHTML;
        document.body.insertBefore(bar, document.body.firstChild);
        document.body.classList.add('ct-has-urgency-bar');
      }

      // Insert inline countdown in offer section
      if (cfg.position === 'offer' || cfg.position === 'both') {
        const offerSection = document.querySelector('#offer .offer-box, .offer-box');
        if (offerSection) {
          const inlineCountdown = document.createElement('div');
          inlineCountdown.className = 'ct-countdown-inline';
          inlineCountdown.innerHTML = `
            <span class="ct-countdown-unit">
              <span class="ct-countdown-value" data-unit="hours">00</span>
              <span class="ct-countdown-label">godzin</span>
            </span>
            <span class="ct-countdown-unit">
              <span class="ct-countdown-value" data-unit="minutes">00</span>
              <span class="ct-countdown-label">minut</span>
            </span>
            <span class="ct-countdown-unit">
              <span class="ct-countdown-value" data-unit="seconds">00</span>
              <span class="ct-countdown-label">sekund</span>
            </span>
          `;
          const badge = offerSection.querySelector('.offer-badge');
          if (badge) {
            badge.parentNode.insertBefore(inlineCountdown, badge.nextSibling);
          }
        }
      }

      // Update countdown every second
      const update = () => {
        const now = Date.now();
        const diff = Math.max(0, endDate.getTime() - now);

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.querySelectorAll('[data-unit="hours"]').forEach(el => {
          el.textContent = String(hours).padStart(2, '0');
        });
        document.querySelectorAll('[data-unit="minutes"]').forEach(el => {
          el.textContent = String(minutes).padStart(2, '0');
        });
        document.querySelectorAll('[data-unit="seconds"]').forEach(el => {
          el.textContent = String(seconds).padStart(2, '0');
        });
      };

      update();
      setInterval(update, 1000);
    },

    initStockCounter() {
      const cfg = this.config.urgency.stock;

      // Get or initialize stock from localStorage
      let stock = parseInt(localStorage.getItem('ct_stock_count'));
      if (!stock || stock < cfg.min) {
        stock = cfg.initial;
        localStorage.setItem('ct_stock_count', stock.toString());
      }

      // Create stock element
      const stockEl = document.createElement('div');
      stockEl.className = 'ct-stock';
      stockEl.innerHTML = `
        <span class="ct-stock-dot"></span>
        <span class="ct-stock-text">${cfg.text.replace('{count}', stock)}</span>
      `;

      // Insert near offer
      const offerPrice = document.querySelector('.offer-price');
      if (offerPrice) {
        offerPrice.parentNode.insertBefore(stockEl, offerPrice.nextSibling);
      }

      // Decrease stock periodically
      setInterval(() => {
        if (stock > cfg.min && Math.random() > 0.5) {
          stock--;
          localStorage.setItem('ct_stock_count', stock.toString());
          stockEl.querySelector('.ct-stock-text').textContent = cfg.text.replace('{count}', stock);
        }
      }, cfg.decreaseInterval);
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SOCIAL PROOF
    // ═══════════════════════════════════════════════════════════════════════

    initSocialProof() {
      const cfg = this.config.socialProof;

      if (cfg.liveVisitors.enabled) {
        this.initLiveVisitors();
      }

      if (cfg.recentPurchases.enabled) {
        this.initRecentPurchases();
      }
    },

    initLiveVisitors() {
      const cfg = this.config.socialProof.liveVisitors;

      const count = Math.floor(Math.random() * (cfg.max - cfg.min + 1)) + cfg.min;

      const el = document.createElement('div');
      el.className = 'ct-live-visitors';
      el.innerHTML = `
        <span class="ct-live-dot"></span>
        <span>${cfg.text.replace('{count}', count)}</span>
      `;

      // Insert in hero section
      const heroStats = document.querySelector('.hero-stats');
      if (heroStats) {
        heroStats.parentNode.insertBefore(el, heroStats);
        el.style.marginBottom = '24px';
      }

      // Fluctuate count
      setInterval(() => {
        const newCount = Math.floor(Math.random() * (cfg.max - cfg.min + 1)) + cfg.min;
        el.querySelector('span:last-child').textContent = cfg.text.replace('{count}', newCount);
      }, 10000);
    },

    initRecentPurchases() {
      const cfg = this.config.socialProof.recentPurchases;

      // Create toast container
      const toast = document.createElement('div');
      toast.className = 'ct-toast';
      toast.innerHTML = `
        <div class="ct-toast-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="ct-toast-content">
          <div class="ct-toast-title"></div>
          <div class="ct-toast-time">przed chwilą</div>
        </div>
        <button class="ct-toast-close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      `;
      document.body.appendChild(toast);

      toast.querySelector('.ct-toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
      });

      const showToast = () => {
        const name = cfg.names[Math.floor(Math.random() * cfg.names.length)];
        const city = cfg.cities[Math.floor(Math.random() * cfg.cities.length)];

        toast.querySelector('.ct-toast-title').textContent = cfg.text
          .replace('{name}', name)
          .replace('{city}', city);

        toast.classList.add('show');

        setTimeout(() => {
          toast.classList.remove('show');
        }, 5000);
      };

      // Initial delay then show periodically
      setTimeout(() => {
        showToast();
        setInterval(showToast, cfg.interval);
      }, 8000);
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SCROLL CTA
    // ═══════════════════════════════════════════════════════════════════════

    initScrollCTA() {
      const cfg = this.config.scrollCTA;

      const cta = document.createElement('div');
      cta.className = 'ct-floating-cta' + (cfg.pulse ? ' pulse' : '');
      cta.innerHTML = `
        <a href="${this.config.brand.ctaUrl}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          ${cfg.text}
        </a>
      `;
      document.body.appendChild(cta);

      window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent > cfg.showAfter) {
          cta.classList.add('show');
        } else {
          cta.classList.remove('show');
        }
      });
    },

    // ═══════════════════════════════════════════════════════════════════════
    // EXTRA CTAs IN SECTIONS
    // ═══════════════════════════════════════════════════════════════════════

    initExtraCTAs() {
      const cfg = this.config.extraCTAs;
      const ctaUrl = this.config.brand.ctaUrl;

      cfg.sections.forEach(sectionId => {
        const section = document.querySelector(`.${sectionId}, #${sectionId}, [class*="${sectionId}"]`);
        if (!section) return;

        // Find content area
        const content = section.querySelector('.problem-content, .solution-header, .how-header, .comparison-header');
        if (!content) return;

        // Check if CTA already exists
        if (content.querySelector('.ct-section-cta')) return;

        const cta = document.createElement('a');
        cta.href = ctaUrl;
        cta.className = 'ct-section-cta';
        cta.innerHTML = `
          Zobacz ofertę
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        `;
        content.appendChild(cta);
      });
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TRUST BADGES
    // ═══════════════════════════════════════════════════════════════════════

    initTrustBadges() {
      const cfg = this.config.trustBadges;

      const paymentIcons = {
        visa: 'VISA',
        mastercard: 'MC',
        blik: 'BLIK',
        przelewy24: 'P24',
        paypal: 'PayPal',
        applepay: 'Apple'
      };

      const securityIcons = {
        ssl: { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>', text: 'SSL 256-bit' },
        guarantee: { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>', text: cfg.guaranteeText },
        returns: { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>', text: 'Darmowy zwrot' }
      };

      // Build HTML
      const badgesHTML = `
        <div class="ct-trust-badges">
          <div class="ct-trust-row">
            <span class="ct-trust-label">${cfg.secureText}</span>
            <div class="ct-payment-icons">
              ${cfg.payments.map(p => `<span class="ct-payment-icon ${p}">${paymentIcons[p] || p.toUpperCase()}</span>`).join('')}
            </div>
          </div>
          <div class="ct-trust-row">
            <div class="ct-security-badges">
              ${cfg.security.map(s => {
                const badge = securityIcons[s];
                return badge ? `<span class="ct-security-badge">${badge.icon}${badge.text}</span>` : '';
              }).join('')}
            </div>
          </div>
        </div>
      `;

      // Insert based on position
      if (cfg.position === 'offer' || cfg.position === 'both') {
        const offerBox = document.querySelector('.offer-box');
        if (offerBox) {
          const cta = offerBox.querySelector('.offer-cta, a[href*="offer"]');
          if (cta) {
            cta.insertAdjacentHTML('afterend', badgesHTML);
          } else {
            offerBox.insertAdjacentHTML('beforeend', badgesHTML);
          }
        }
      }

      if (cfg.position === 'cta' || cfg.position === 'both') {
        const heroCta = document.querySelector('.hero-cta, .hero a.btn');
        if (heroCta && cfg.position !== 'both') {
          heroCta.insertAdjacentHTML('afterend', badgesHTML);
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    // STICKY PRODUCT BAR
    // ═══════════════════════════════════════════════════════════════════════

    initStickyBar() {
      const cfg = this.config.stickyBar;

      // Auto-detect product name and price
      const productName = cfg.productName || document.querySelector('h1')?.textContent?.trim() || this.config.brand.name;
      const priceEl = document.querySelector('.offer-price-current, .price-current');
      const oldPriceEl = document.querySelector('.offer-price-old, .price-old');

      const currentPrice = cfg.price || priceEl?.textContent?.trim() || '';
      const oldPrice = oldPriceEl?.textContent?.trim() || '';

      const bar = document.createElement('div');
      bar.className = 'ct-sticky-bar';
      bar.innerHTML = `
        <div class="ct-sticky-bar-inner">
          <div class="ct-sticky-product">
            <span class="ct-sticky-product-name">${productName}</span>
            <div class="ct-sticky-price">
              ${currentPrice ? `<span class="ct-sticky-price-current">${currentPrice}</span>` : ''}
              ${oldPrice ? `<span class="ct-sticky-price-old">${oldPrice}</span>` : ''}
            </div>
          </div>
          <a href="${this.config.brand.ctaUrl}" class="ct-sticky-cta">${cfg.ctaText}</a>
        </div>
      `;
      document.body.appendChild(bar);

      // Show/hide on scroll
      const heroSection = document.querySelector('.hero, #hero, [class*="hero"]');
      const heroBottom = heroSection ? heroSection.offsetTop + heroSection.offsetHeight : cfg.showAfter;

      window.addEventListener('scroll', () => {
        if (window.scrollY > heroBottom) {
          bar.classList.add('show');
          document.body.classList.add('ct-sticky-bar-visible');
        } else {
          bar.classList.remove('show');
          document.body.classList.remove('ct-sticky-bar-visible');
        }
      });
    },

    // ═══════════════════════════════════════════════════════════════════════
    // MOBILE BOTTOM BAR
    // ═══════════════════════════════════════════════════════════════════════

    initMobileBar() {
      const cfg = this.config.mobileBar;

      // Auto-detect price
      const priceEl = document.querySelector('.offer-price-current, .price-current');
      const oldPriceEl = document.querySelector('.offer-price-old, .price-old');

      const currentPrice = cfg.price || priceEl?.textContent?.trim() || '';
      const oldPrice = oldPriceEl?.textContent?.trim() || '';

      const bar = document.createElement('div');
      bar.className = 'ct-mobile-bar';
      bar.innerHTML = `
        <div class="ct-mobile-bar-inner">
          ${cfg.showPrice && currentPrice ? `
            <div class="ct-mobile-bar-price">
              <span class="ct-mobile-bar-price-current">${currentPrice}</span>
              ${oldPrice ? `<span class="ct-mobile-bar-price-old">${oldPrice}</span>` : ''}
            </div>
          ` : ''}
          <a href="${this.config.brand.ctaUrl}" class="ct-mobile-bar-cta">${cfg.text}</a>
        </div>
      `;
      document.body.appendChild(bar);

      // Add padding to body for mobile bar
      const style = document.createElement('style');
      style.textContent = `
        @media (max-width: 768px) {
          body { padding-bottom: 70px; }
        }
      `;
      document.head.appendChild(style);
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ENGAGEMENT TRACKING
    // ═══════════════════════════════════════════════════════════════════════

    trackEngagement() {
      // Time on page
      setInterval(() => {
        this.state.timeOnPage++;
      }, 1000);

      // Mark as engaged after interaction
      ['click', 'scroll', 'keydown'].forEach(event => {
        document.addEventListener(event, () => {
          this.state.engaged = true;
        }, { once: true });
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPOSE GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════════

  window.ConversionToolkit = ConversionToolkit;

})();
