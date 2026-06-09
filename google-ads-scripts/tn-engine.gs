/**
 * TN ENGINE — silnik panelu Google Ads (marka osobista Tomka).
 * NIE wymaga developer tokena — Google Ads Scripts autoryzują się wewnętrznie.
 *
 * GDZIE WKLEIĆ:
 *   Google Ads → Narzędzia (Tools) → Operacje zbiorcze → Skrypty → "+" → wklej → Autoryzuj → Zapisz.
 *   HARMONOGRAM: co godzinę (Frequency: Hourly). Pętla komend chodzi co godzinę;
 *   pełny pull metryk robi się raz dziennie o CONFIG.METRICS_HOUR.
 *
 * BEZPIECZEŃSTWO: tu jest TYLKO AGENT_KEY (sekret) — NIGDY service_role Supabase.
 *   Ten sam sekret ustaw w Supabase: Edge Functions → Secrets → GADS_AGENT_SECRET.
 *
 * UWAGA — nazwy pól wideo: od API v22 (2026-03-02) stare metrics.video_views/average_cpv/
 *   video_view_rate zwracają null. Skrypt próbuje najpierw nazw TrueView, potem starych (fallback).
 *   Po pierwszym uruchomieniu sprawdź logi i ewentualnie zweryfikuj w Query Validator dla swojego konta.
 */

// ===================== KONFIGURACJA =====================
var CONFIG = {
  ENDPOINT: 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/gads-agent',
  AGENT_KEY: 'WKLEJ_TEN_SAM_SEKRET_CO_W_SUPABASE',  // == GADS_AGENT_SECRET
  METRICS_HOUR: 6,            // godzina (0-23, strefa konta) pełnego pullu metryk
  METRICS_RANGE: 'LAST_7_DAYS',
  CLAIM_LIMIT: 50,
};
// ========================================================

function main() {
  var cfg = call('config', {});
  if (!cfg || cfg.engine_enabled === false) { Logger.log('Silnik wyłączony (gads_engine_enabled).'); return; }

  var tz = AdsApp.currentAccount().getTimeZone();
  var runId = 'run-' + Utilities.formatDate(new Date(), tz, 'yyyyMMddHHmm');

  // ---- 1) PĘTLA KOMEND (co godzinę) ----
  var claim = call('claim', { run_id: runId, limit: CONFIG.CLAIM_LIMIT });
  var cmds = (claim && claim.commands) || [];
  var results = [];
  for (var i = 0; i < cmds.length; i++) {
    var cmd = cmds[i];
    try {
      if (cfg.kill_switch) { results.push({ id: cmd.id, status: 'error', error: 'kill_switch ON' }); continue; }
      var res = execute(cmd);
      results.push({
        id: cmd.id,
        status: res.error ? 'error' : 'done',
        result: res, error: res.error || null,
        campaign_ref: cmd.campaign_ref,
        set_last_mutated: !!res.mutated,
      });
    } catch (e) {
      results.push({ id: cmd.id, status: 'error', error: String(e) });
    }
  }
  if (results.length) call('ack', { results: results });
  Logger.log('Komendy: ' + cmds.length + ' (zatwierdzono ' + results.length + ')');

  // ---- 2) PULL METRYK (raz dziennie) ----
  var hour = Number(Utilities.formatDate(new Date(), tz, 'H'));
  if (hour === CONFIG.METRICS_HOUR) {
    var camps = fetchCampaigns();
    if (camps.length) call('campaigns', { rows: camps });
    var mrows = fetchMetrics();
    if (mrows.length) call('metrics', { rows: mrows });
    Logger.log('Metryki: ' + mrows.length + ' wierszy, kampanie: ' + camps.length);
  }
}

// ---------- WYKONANIE KOMEND ----------
function getCampaign(id) {
  var sels = [AdsApp.campaigns(), AdsApp.videoCampaigns(), AdsApp.performanceMaxCampaigns()];
  for (var i = 0; i < sels.length; i++) {
    try {
      var it = sels[i].withIds([id]).get();
      if (it.hasNext()) return it.next();
    } catch (e) { /* selektor nie wspiera typu — próbuj dalej */ }
  }
  return null;
}

function execute(cmd) {
  var camp = getCampaign(Number(cmd.campaign_ref));
  if (!camp) return { error: 'campaign not found: ' + cmd.campaign_ref };
  var p = cmd.payload || {};
  switch (cmd.type) {
    case 'PAUSE':  camp.pause();  return { ok: true };
    case 'ENABLE': camp.enable(); return { ok: true };
    case 'SET_BUDGET': {
      if (p.amount_micros == null) return { error: 'amount_micros required' };
      camp.getBudget().setAmount(Number(p.amount_micros) / 1e6);
      return { ok: true, mutated: true };
    }
    case 'SET_BID_TARGET': {
      // best-effort: adjust_pct (względem aktualnego tCPA) albo target_micros (wprost)
      try {
        var bidding = camp.bidding();
        if (p.target_cpa_micros != null) { bidding.setTargetCpa(Number(p.target_cpa_micros) / 1e6); return { ok: true, mutated: true }; }
        if (p.adjust_pct != null && bidding.getTargetCpa) {
          var cur = bidding.getTargetCpa();
          if (cur) { bidding.setTargetCpa(cur * (1 + Number(p.adjust_pct) / 100)); return { ok: true, mutated: true }; }
        }
        return { error: 'bid target nieobsługiwany dla tej kampanii (ustaw ręcznie albo użyj target_cpa_micros)' };
      } catch (e) { return { error: 'SET_BID_TARGET: ' + e }; }
    }
    default: return { error: 'unknown type: ' + cmd.type };
  }
}

// ---------- KAMPANIE (mirror) ----------
function fetchCampaigns() {
  var rows = [];
  var q = "SELECT campaign.id, campaign.name, campaign.advertising_channel_type, campaign.status, " +
          "campaign_budget.amount_micros FROM campaign WHERE campaign.status != 'REMOVED'";
  var it = AdsApp.search(q);
  while (it.hasNext()) {
    var r = it.next();
    rows.push({
      ad_campaign_id: String(r.campaign.id),
      name: r.campaign.name,
      channel_type: r.campaign.advertisingChannelType,
      status: r.campaign.status,
      daily_budget_micros: r.campaignBudget ? Number(r.campaignBudget.amountMicros) : null,
      last_synced_at: new Date().toISOString(),
    });
  }
  return rows;
}

// ---------- METRYKI (GAQL → wiersze metrics_daily) ----------
function fetchMetrics() {
  var byKey = {};   // campaign_ref|date -> row

  // a) metryki standardowe (zawsze dostępne)
  var qStd = "SELECT campaign.id, segments.date, metrics.impressions, metrics.clicks, metrics.cost_micros, " +
             "metrics.average_cpm, metrics.ctr, metrics.conversions, metrics.conversions_value, " +
             "metrics.all_conversions FROM campaign WHERE segments.date DURING " + CONFIG.METRICS_RANGE +
             " AND campaign.status != 'REMOVED'";
  var it = AdsApp.search(qStd);
  while (it.hasNext()) {
    var r = it.next();
    var key = r.campaign.id + '|' + r.segments.date;
    byKey[key] = {
      campaign_ref: String(r.campaign.id),
      date: r.segments.date,
      impressions: num(r.metrics.impressions),
      clicks: num(r.metrics.clicks),
      cost_micros: num(r.metrics.costMicros),
      average_cpm: num(r.metrics.averageCpm),
      ctr: num(r.metrics.ctr),
      conversions: num(r.metrics.conversions),
      conversions_value: num(r.metrics.conversionsValue),
      all_conversions: num(r.metrics.allConversions),
    };
  }

  // b) metryki wideo — próbuj TrueView (v22), fallback do starych nazw
  var videoVariants = [
    { views: 'metrics.video_trueview_views', vr: 'metrics.video_trueview_view_rate', cpv: 'metrics.video_trueview_average_cpv' },
    { views: 'metrics.video_views',          vr: 'metrics.video_view_rate',          cpv: 'metrics.average_cpv' },
  ];
  for (var v = 0; v < videoVariants.length; v++) {
    var f = videoVariants[v];
    var qVid = "SELECT campaign.id, segments.date, " + f.views + ", " + f.vr + ", " + f.cpv + ", " +
               "metrics.video_quartile_p25_rate, metrics.video_quartile_p50_rate, " +
               "metrics.video_quartile_p75_rate, metrics.video_quartile_p100_rate " +
               "FROM campaign WHERE campaign.advertising_channel_type = 'VIDEO' AND segments.date DURING " +
               CONFIG.METRICS_RANGE;
    try {
      var vit = AdsApp.search(qVid);
      while (vit.hasNext()) {
        var vr = vit.next();
        var k = vr.campaign.id + '|' + vr.segments.date;
        var row = byKey[k] || (byKey[k] = { campaign_ref: String(vr.campaign.id), date: vr.segments.date });
        var fk = camelTail(f.views), vrk = camelTail(f.vr), cpvk = camelTail(f.cpv);
        row.trueview_views = num(vr.metrics[fk]);
        row.trueview_view_rate = num(vr.metrics[vrk]);
        row.trueview_average_cpv = num(vr.metrics[cpvk]);
        row.video_quartile_p25_rate = num(vr.metrics.videoQuartileP25Rate);
        row.video_quartile_p50_rate = num(vr.metrics.videoQuartileP50Rate);
        row.video_quartile_p75_rate = num(vr.metrics.videoQuartileP75Rate);
        row.video_quartile_p100_rate = num(vr.metrics.videoQuartileP100Rate);
      }
      Logger.log('Metryki wideo: wariant ' + (v === 0 ? 'TrueView (v22)' : 'legacy') + ' OK');
      break; // wariant zadziałał
    } catch (e) {
      Logger.log('Wariant wideo ' + v + ' nieobsługiwany: ' + e);
    }
  }

  var out = [];
  for (var key2 in byKey) out.push(byKey[key2]);
  return out;
}

// ---------- HELPERY ----------
function num(x) { return x == null || x === '' ? null : Number(x); }
// 'metrics.video_trueview_views' -> 'videoTrueviewViews'
function camelTail(field) {
  var t = field.split('.').pop();
  return t.replace(/_([a-z])/g, function (_, c) { return c.toUpperCase(); });
}

function call(action, payload) {
  var body = { action: action };
  for (var k in payload) body[k] = payload[k];
  var resp = UrlFetchApp.fetch(CONFIG.ENDPOINT, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-agent-key': CONFIG.AGENT_KEY },
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  });
  var code = resp.getResponseCode();
  if (code < 200 || code >= 300) { Logger.log('[' + action + '] HTTP ' + code + ': ' + resp.getContentText()); return null; }
  try { return JSON.parse(resp.getContentText()); } catch (e) { return null; }
}
