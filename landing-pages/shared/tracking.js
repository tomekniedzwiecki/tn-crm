/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LEAD TRACKING v1.0
 * Zbieranie parametrow UTM i click IDs dla atrybucji marketingowej
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Obslugiwane platformy:
 * - Google Ads (gclid, gbraid, wbraid + ValueTrack params)
 * - Meta/Facebook (fbclid + _fbp cookie)
 * - TikTok (ttclid)
 *
 * Uzycie:
 * 1. Dolacz skrypt na landing page: <script src="/landing-pages/shared/tracking.js"></script>
 * 2. Wywolaj LeadTracking.init() po zaladowaniu strony
 * 3. Przy tworzeniu leada: LeadTracking.getData() zwroci obiekt z parametrami
 */

(function() {
  'use strict';

  // Parametry do zbierania z URL
  const TRACKING_PARAMS = [
    // Google Ads Click IDs
    'gclid',      // Google Ads click ID
    'gbraid',     // Google Ads iOS app campaigns
    'wbraid',     // Google Ads web-to-app
    'gad_source', // Google Ads source indicator

    // Google Ads ValueTrack parameters
    'network',    // g=search, s=search partner, d=display, v=video (YouTube)
    'campaignid', // Campaign ID
    'adgroupid',  // Ad group ID
    'creative',   // Creative/Ad ID
    'placement',  // Placement (YouTube channel, website)
    'device',     // m=mobile, c=computer, t=tablet
    'keyword',    // Search keyword

    // Meta/Facebook
    'fbclid',     // Facebook click ID

    // TikTok
    'ttclid',     // TikTok click ID

    // Standard UTM
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'utm_id'
  ];

  const LeadTracking = {
    version: '1.0.0',
    storageKey: 'lead_tracking_params',

    /**
     * Inicjalizacja - wywolaj na zaladowaniu strony
     */
    init: function() {
      this.captureParams();
      console.log('[LeadTracking] Initialized', this.getData());
    },

    /**
     * Pobierz cookie po nazwie
     */
    getCookie: function(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    },

    /**
     * Zbierz parametry z URL i zapisz w sessionStorage
     */
    captureParams: function() {
      const urlParams = new URLSearchParams(window.location.search);
      const stored = JSON.parse(sessionStorage.getItem(this.storageKey) || '{}');

      // Zbierz kazdy parametr z URL
      TRACKING_PARAMS.forEach(function(param) {
        const value = urlParams.get(param);
        if (value) {
          stored[param] = value;
        }
      });

      // Facebook browser pixel cookie (_fbp)
      const fbp = this.getCookie('_fbp');
      if (fbp) {
        stored.fbp = fbp;
      }

      // Landing page URL (bez query params dla czystosci)
      if (!stored.landing_page) {
        stored.landing_page = window.location.origin + window.location.pathname;
      }

      // Referrer
      if (!stored.referrer && document.referrer) {
        // Nie zapisuj referrer z tej samej domeny
        const referrerDomain = new URL(document.referrer).hostname;
        const currentDomain = window.location.hostname;
        if (referrerDomain !== currentDomain) {
          stored.referrer = document.referrer;
        }
      }

      // User agent
      stored.user_agent = navigator.userAgent;

      // Timestamp pierwszej wizyty
      if (!stored.first_visit) {
        stored.first_visit = new Date().toISOString();
      }

      sessionStorage.setItem(this.storageKey, JSON.stringify(stored));
    },

    /**
     * Pobierz zebrane dane tracking
     * @returns {Object} Obiekt z parametrami do wyslania do API
     */
    getData: function() {
      const stored = JSON.parse(sessionStorage.getItem(this.storageKey) || '{}');

      // Odswiez _fbp cookie (moze byc ustawiony pozniej przez pixel)
      const fbp = this.getCookie('_fbp');
      if (fbp) {
        stored.fbp = fbp;
      }

      return stored;
    },

    /**
     * Pobierz rozpoznane zrodlo ruchu
     * @returns {Object} { key, name, color }
     */
    getSource: function() {
      const data = this.getData();

      // Google Ads - rozroznienie typow kampanii
      if (data.gclid || data.gbraid || data.wbraid || data.gad_source) {
        // Sprawdz network type
        if (data.network === 'v') {
          return { key: 'youtube', name: 'YouTube Ads', color: '#FF0000' };
        }
        if (data.network === 'd') {
          return { key: 'google_display', name: 'Google Display', color: '#4285F4' };
        }
        if (data.network === 'g' || data.network === 's') {
          return { key: 'google_search', name: 'Google Search', color: '#FBBC04' };
        }
        // Fallback - sprawdz utm_medium
        if (data.utm_medium === 'youtube' || data.utm_medium === 'video') {
          return { key: 'youtube', name: 'YouTube Ads', color: '#FF0000' };
        }
        // Default Google Ads
        return { key: 'google', name: 'Google Ads', color: '#FBBC04' };
      }

      // Meta/Facebook
      if (data.fbclid) {
        return { key: 'meta', name: 'Meta Ads', color: '#1877F2' };
      }

      // TikTok
      if (data.ttclid) {
        return { key: 'tiktok', name: 'TikTok Ads', color: '#FF0050' };
      }

      // UTM source fallback
      if (data.utm_source) {
        const src = data.utm_source.toLowerCase();

        if (src.includes('youtube')) {
          return { key: 'youtube', name: 'YouTube', color: '#FF0000' };
        }
        if (src.includes('google')) {
          return { key: 'google', name: 'Google', color: '#FBBC04' };
        }
        if (src.includes('facebook') || src.includes('fb') || src.includes('meta') || src.includes('instagram')) {
          return { key: 'meta', name: 'Meta', color: '#1877F2' };
        }
        if (src.includes('tiktok')) {
          return { key: 'tiktok', name: 'TikTok', color: '#FF0050' };
        }
        if (src.includes('mailerlite') || src.includes('email') || src.includes('newsletter')) {
          return { key: 'email', name: 'Email', color: '#9333EA' };
        }
      }

      // Email medium
      if (data.utm_medium === 'email') {
        return { key: 'email', name: 'Email', color: '#9333EA' };
      }

      // Organic/Direct
      return { key: 'organic', name: 'Organic', color: '#10B981' };
    },

    /**
     * Wyczysc dane (np. po pomyslnym utworzeniu leada)
     */
    clear: function() {
      sessionStorage.removeItem(this.storageKey);
    },

    /**
     * Debug - pokaz wszystkie zebrane dane w konsoli
     */
    debug: function() {
      console.table(this.getData());
      console.log('Source:', this.getSource());
    }
  };

  // Eksportuj do window
  window.LeadTracking = LeadTracking;

  // Auto-init jesli DOM jest gotowy
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      LeadTracking.init();
    });
  } else {
    LeadTracking.init();
  }

})();
