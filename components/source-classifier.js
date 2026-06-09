// ============================================================
// WSPOLNY KLASYFIKATOR ZRODLA RUCHU — SINGLE SOURCE OF TRUTH
// Uzywany przez: leads.html, pipeline.html, tn-biznes/analytics.html
// (zastepuje 3 rozjezdzajace sie kopie: getMarketingSource / getSource / determineSource).
//
// Wejscie: obiekt tracking z polami click-ID / UTM. Akceptuje zarowno
//   zagniezdzone (lead.tracking, order.leads.lead_tracking[0]) jak i plaskie (lead.*)
//   — wystarczy podac obiekt zawierajacy te klucze.
// Zwraca: { channel, key, name }
//   channel — gruby kanal do agregacji/filtra: google | youtube | meta | tiktok | email | organic
//   key     — granularny do badge: + google_search | google_display
//   name    — etykieta do wyswietlenia
//
// Zasady (ujednolicone z wszystkich wczesniejszych kopii):
//   - gad_source LICZY sie jako Google (auto-tagging Google Ads), nawet bez gclid.
//   - Kolejnosc: Google -> Meta -> TikTok -> UTM -> Organic (deterministyczna).
//   - utm_source 'instagram' => Meta.
// ============================================================
(function (global) {
  function S(channel, key, name) { return { channel: channel, key: key, name: name }; }

  function classifySource(t) {
    t = t || {};

    // Google Ads (gclid/gbraid/wbraid lub gad_source z auto-taggingu)
    if (t.gclid || t.gbraid || t.wbraid || t.gad_source) {
      if (t.network === 'v' || t.utm_medium === 'youtube' || t.utm_medium === 'video') return S('youtube', 'youtube', 'YouTube');
      if (t.network === 'd') return S('google', 'google_display', 'Display');
      if (t.network === 'g' || t.network === 's') return S('google', 'google_search', 'Search');
      return S('google', 'google', 'Google Ads');
    }

    if (t.fbclid) return S('meta', 'meta', 'Meta');
    if (t.ttclid) return S('tiktok', 'tiktok', 'TikTok');

    // Fallback po utm_source
    if (t.utm_source) {
      var s = String(t.utm_source).toLowerCase();
      if (s.indexOf('youtube') >= 0) return S('youtube', 'youtube', 'YouTube');
      if (s.indexOf('google') >= 0) return S('google', 'google', 'Google');
      if (s.indexOf('facebook') >= 0 || s.indexOf('fb') >= 0 || s.indexOf('meta') >= 0 || s.indexOf('instagram') >= 0) return S('meta', 'meta', 'Meta');
      if (s.indexOf('tiktok') >= 0) return S('tiktok', 'tiktok', 'TikTok');
      if (s.indexOf('mailerlite') >= 0 || s.indexOf('email') >= 0 || s.indexOf('newsletter') >= 0) return S('email', 'email', 'Email');
    }
    if (t.utm_medium === 'email') return S('email', 'email', 'Email');

    return S('organic', 'organic', 'Organic');
  }

  global.classifySource = classifySource;
})(typeof window !== 'undefined' ? window : this);
