// ════════════════════════════════════════════════════════════════════════════
// PanelCore — WSPÓLNY RDZEŃ paneli admina lejków (tn-aplikacje + tn-sklep).
// Faza 1 konsolidacji: bezstanowe/format helpery utrzymywane RAZ dla obu paneli
// (wcześniej byte-identyczne kopie w każdym pliku → podatek „popraw w dwóch miejscach").
//
// Ładowanie: <script src="../components/panel-core.js"></script> PO source-classifier.js
// (srcInfo woła globalne classifySource) i PRZED głównym <script> panelu.
// Panel pobiera funkcje przez destrukturyzację: const {esc, fmtPln, ...} = window.PanelCore.
//
// Stan: jedyna zależność stanowa to KURS USD→PLN (fmtPln). Trzymany wewnątrz modułu,
// ustawiany przez PanelCore.setRate(rate) z loadAll() / zapisu kursu w panelu.
// Funkcje zależne od map budowanych w loadAll (avatar/engagement/koszty) zostają
// na razie w panelach (Faza 2 — wspólny data-loader z configiem adaptera).
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  // ── Kurs USD→PLN (jedyny stan modułu) ──
  let _rate = 4.0;
  function setRate(r) { const v = parseFloat(r); if (v && v > 0) _rate = v; }
  function getRate() { return _rate; }

  // ── Format / mikro-UI ──
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtPln = (usd) => (usd * _rate).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
  const fmtZl = (n) => Number(n).toLocaleString('pl-PL') + ' zł';
  const fmtUsd = (usd) => '$' + usd.toFixed(usd < 1 ? 3 : 2);
  const timeAgo = (iso) => {
    if (!iso) return '—';
    const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (m < 60) return m + ' min temu';
    const h = Math.round(m / 60);
    if (h < 48) return h + ' h temu';
    return Math.round(h / 24) + ' dni temu';
  };
  const fmtDate = (iso) => iso ? new Date(iso).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
  const untilStr = (ms) => { const m = Math.round((ms - Date.now()) / 60000); if (m < 60) return 'za ' + Math.max(0, m) + ' min'; const h = Math.round(m / 60); if (h < 48) return 'za ' + h + ' h'; return 'za ' + Math.round(h / 24) + ' dni'; };
  const plural = (n, one, few, many) => n === 1 ? one : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many);
  function toast(msg) {
    const t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 2600);
  }

  // ── Etap pipeline wyliczany z danych (lejek automatyczny) ──
  const STAGES = [
    { id: 'talk',     name: 'Rozmowa',         icon: 'ph-chat-circle',   color: 'text-zinc-400',    dot: 'bg-zinc-500' },
    { id: 'lead',     name: 'Lead (e-mail)',   icon: 'ph-user-plus',     color: 'text-sky-400',     dot: 'bg-sky-500' },
    { id: 'project',  name: 'Projekt',         icon: 'ph-images',        color: 'text-violet-400',  dot: 'bg-violet-500' },
    { id: 'green',    name: 'Zielony werdykt', icon: 'ph-check-circle',  color: 'text-emerald-400', dot: 'bg-emerald-500' },
    { id: 'paid',     name: 'Rezerwacja',      icon: 'ph-currency-circle-dollar', color: 'text-amber-400', dot: 'bg-amber-400' },
    // Kategoria „przegrane" — etapy ustawiane WYŁĄCZNIE ręcznie, zapisywane w *_sessions.pipeline_override.
    { id: 'resigned', name: 'Zrezygnował',     icon: 'ph-hand-waving',   color: 'text-orange-400',  dot: 'bg-orange-500', lost: true },
    { id: 'lost',     name: 'Przegrany',       icon: 'ph-x-circle',      color: 'text-rose-400',    dot: 'bg-rose-500',   lost: true },
  ];
  const STAGE_IDS = STAGES.map((x) => x.id);
  const LOST_STAGE_IDS = STAGES.filter((x) => x.lost).map((x) => x.id);
  function derivedStageOf(s) {
    if (s.paid_at) return 'paid';
    if (s.verdict === 'zielony') return 'green';
    if (s.preview_images && Object.keys(s.preview_images).length) return 'project';
    if (s.email) return 'lead';
    return 'talk';
  }
  function stageOf(s) {
    if (s.pipeline_override && STAGE_IDS.includes(s.pipeline_override)) return s.pipeline_override;
    return derivedStageOf(s);
  }
  function projName(s) {
    return (s.preview_brief && s.preview_brief.nazwa) || s.profession || 'Rozmowa bez nazwy';
  }

  // ── Design zaprojektowany przez AI (preview_brief.design) ──
  const designOf = (s) => (s.preview_brief && s.preview_brief.design && typeof s.preview_brief.design === 'object') ? s.preview_brief.design : null;
  const hexOf = (txt) => { const m = String(txt || '').match(/#[0-9a-fA-F]{3,8}\b/); return m ? m[0] : null; };
  function accentDot(s) {
    const d = designOf(s);
    const hex = d && hexOf(d.akcent);
    if (!hex) return '';
    return `<span class="inline-block w-2.5 h-2.5 rounded-full border border-white/25 align-middle mr-1.5" style="background:${hex}" title="${esc(d.kierunek || 'akcent ' + hex)}"></span>`;
  }
  function designSwatch(label, txt) {
    if (!txt) return '';
    const hex = hexOf(txt);
    return `<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/5 text-[10px] text-zinc-400" title="${esc(txt)}">${hex ? `<span class="w-3.5 h-3.5 rounded border border-white/20 shrink-0" style="background:${hex}"></span>` : ''}${label}${hex ? ` <span class="font-mono text-zinc-500">${hex}</span>` : ''}</span>`;
  }

  // ── Źródło pozyskania (atrybucja) — deleguje do globalnego classifySource (source-classifier.js) ──
  const SRC_STYLE = {
    youtube:        'text-red-400 bg-red-500/10 border-red-500/20',
    google_display: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    google_search:  'text-amber-400 bg-amber-500/10 border-amber-500/20',
    google:         'text-amber-400 bg-amber-500/10 border-amber-500/20',
    meta:           'text-blue-400 bg-blue-500/10 border-blue-500/20',
    tiktok:         'text-pink-400 bg-pink-500/10 border-pink-500/20',
    email:          'text-violet-400 bg-violet-500/10 border-violet-500/20',
    organic:        'text-zinc-400 bg-white/5 border-white/10',
  };
  const SRC_ICON = {
    youtube: 'ph-youtube-logo', google_display: 'ph-google-logo', google_search: 'ph-google-logo',
    google: 'ph-google-logo', meta: 'ph-meta-logo', tiktok: 'ph-tiktok-logo',
    email: 'ph-envelope-simple', organic: 'ph-compass',
  };
  function srcInfo(s) {
    const r = (typeof classifySource === 'function')
      ? classifySource((s && s.tracking) || {})
      : { channel: 'organic', key: 'organic', name: 'Organic' };
    return Object.assign({}, r, { cls: SRC_STYLE[r.key] || SRC_STYLE.organic, icon: SRC_ICON[r.key] || SRC_ICON.organic });
  }
  function srcTitle(s) {
    const t = (s && s.tracking) || {};
    const bits = [];
    if (t.utm_campaign) bits.push('kampania: ' + t.utm_campaign);
    if (t.utm_source) bits.push('source: ' + t.utm_source);
    if (t.utm_medium) bits.push('medium: ' + t.utm_medium);
    ['gclid', 'fbclid', 'ttclid', 'gbraid', 'wbraid', 'msclkid'].forEach((k) => { if (t[k]) bits.push(k); });
    return bits.length ? bits.join(' · ') : 'Brak parametrów kampanii (bezpośrednio / organic)';
  }
  function sourceBadge(s) {
    const i = srcInfo(s);
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium ${i.cls}" title="${esc(srcTitle(s))}"><i class="ph ${i.icon}"></i>${esc(i.name)}</span>`;
  }
  function sourceMini(s) {
    const i = srcInfo(s);
    return `<i class="ph ${i.icon} ${i.cls.split(' ')[0]} text-sm" title="Źródło: ${esc(i.name)} — ${esc(srcTitle(s))}"></i>`;
  }
  function sourceDetailHTML(s) {
    const i = srcInfo(s);
    const t = (s && s.tracking) || {};
    const LABELS = {
      utm_source: 'utm_source', utm_medium: 'utm_medium', utm_campaign: 'Kampania (utm_campaign)',
      utm_content: 'utm_content', utm_term: 'utm_term', utm_id: 'utm_id',
      gclid: 'gclid (Google)', gbraid: 'gbraid (Google)', wbraid: 'wbraid (Google)', gad_source: 'gad_source',
      fbclid: 'fbclid (Meta)', ttclid: 'ttclid (TikTok)', msclkid: 'msclkid (Bing)',
      campaignid: 'campaignid', adgroupid: 'adgroupid', creative: 'creative', keyword: 'keyword',
      matchtype: 'matchtype', device: 'device', network: 'network', placement: 'placement', ref: 'ref',
    };
    const order = Object.keys(LABELS);
    const rows = order.filter((k) => t[k] != null && t[k] !== '').map((k) =>
      `<div class="flex gap-2 min-w-0"><span class="text-zinc-600 shrink-0">${LABELS[k]}:</span><span class="text-zinc-300 font-mono text-[11px] truncate" title="${esc(String(t[k]))}">${esc(String(t[k]))}</span></div>`).join('');
    const lp = t.landing_page ? `<div class="flex gap-2 min-w-0"><span class="text-zinc-600 shrink-0">Strona wejścia:</span><a href="${esc(String(t.landing_page))}" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 truncate" title="${esc(String(t.landing_page))}">${esc(String(t.landing_page))}</a></div>` : '';
    const rf = t.referrer ? `<div class="flex gap-2 min-w-0"><span class="text-zinc-600 shrink-0">Referrer:</span><span class="text-zinc-300 truncate" title="${esc(String(t.referrer))}">${esc(String(t.referrer))}</span></div>` : '';
    const empty = !rows && !lp && !rf;
    return `<div class="bg-zinc-900/60 border border-white/5 rounded-xl p-5 max-w-xl">
      <div class="flex items-center justify-between mb-2.5">
        <div class="text-[11px] uppercase tracking-wider text-zinc-500"><i class="ph ph-broadcast mr-1 text-zinc-600"></i>Źródło pozyskania</div>
        ${sourceBadge(s)}
      </div>
      ${empty
        ? '<div class="text-[12px] text-zinc-500">Brak parametrów kampanii — lead wszedł bezpośrednio lub z ruchu organicznego (żaden click-ID/UTM nie dotarł do sparingu).</div>'
        : `<div class="space-y-1 text-[12px]">${rows}${lp}${rf}</div>`}
    </div>`;
  }

  // ── Czyszczenie markerów rozmowy sparingu (wspólny słownik markerów obu silników) ──
  const MARKER_RE = /<(opcje|opcje_multi|suwak|ranking|styl_wybor|sekcje|karuzela|blysk|kamien|makieta|projekt|werdykt)>[\s\S]*?(<\/\1>|$)/g;
  function cleanMsg(content) {
    let out = content;
    const verdict = content.match(/<werdykt>([\s\S]*?)<\/werdykt>/);
    out = out.replace(MARKER_RE, '').replace(/<(rezygnacja|bierny)\s*\/?>/g, '').trim();
    let badge = '';
    if (verdict) {
      try { badge = `<div class="mt-1.5 text-[10px] uppercase tracking-wider text-emerald-400">werdykt: ${esc(JSON.parse(verdict[1]).kolor)}</div>`; } catch (e) { /* ignore */ }
    }
    if (content.includes('<projekt>')) badge += '<div class="mt-1 text-[10px] uppercase tracking-wider text-violet-400">+ brief projektu (generowanie ekranów)</div>';
    if (/<rezygnacja\s*\/?>/.test(content)) badge += '<div class="mt-1 text-[10px] uppercase tracking-wider text-orange-400">rezygnacja potwierdzona → etap „Zrezygnował"</div>';
    return esc(out).replace(/\n/g, '<br>') + badge;
  }

  // ── Dane sesji (wstrzykiwane z panelu) ──────────────────────────────────────
  // Panel woła setData() przekazując REFERENCJE swoich map (te same obiekty), więc
  // mutacje in-place są widoczne obustronnie, a reassign przy reloadzie leci razem
  // przez loadSessions→setData. Współdzielone state-readery czytają _data.
  let _data = { sessions: [], costsBySession: {}, mailsBySession: {}, avatarByUser: {} };
  function setData(d) { _data = Object.assign(_data, d || {}); }
  const getSessions = () => _data.sessions;
  // Kontekst wstrzykiwany raz przez panel (PanelCore nie zna globali panelu):
  // {supabase, rpcCostsDaily, ...}. Używany przez render/akcje wymagające klienta/RPC.
  let _cfg = {};
  function initCtx(c) { _cfg = Object.assign(_cfg, c || {}); }
  const costOf = (s) => (_data.costsBySession[s.id] ? Number(_data.costsBySession[s.id].cost_usd) : 0);

  // ── Avatar konta: zdjęcie Google (gdy logowano przez Google), inaczej inicjały ──
  function avatarPhoto(s) { return (s.auth_provider === 'google' && s.auth_user_id && _data.avatarByUser[s.auth_user_id]) || null; }
  function avatarImg(url, px) { return `<img src="${esc(url)}" alt="" referrerpolicy="no-referrer" loading="lazy" class="rounded-full object-cover shrink-0 border border-white/10" style="width:${px}px;height:${px}px" title="Konto Google">`; }
  function avatarThumb(s, px) { const u = avatarPhoto(s); return u ? avatarImg(u, px) : ''; }
  function avatarBlock(s, px) {
    const u = avatarPhoto(s);
    if (u) return avatarImg(u, px);
    const initials = (s.name || s.email || '?').trim().slice(0, 2).toUpperCase();
    return `<div class="rounded-md bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold shrink-0" style="width:${px}px;height:${px}px;font-size:${Math.round(px * 0.34)}px">${esc(initials)}</div>`;
  }

  // ── Zaangażowanie (lustro serwerowego isEngaged z drip) ──
  const ENGAGE_DAYS = 10;
  function lastTouchOf(s) {
    const t = [s.last_panel_at, s.last_user_at].map((x) => x ? new Date(x).getTime() : 0);
    return Math.max(t[0], t[1]) || 0;
  }
  function isEngaged(s) { return lastTouchOf(s) >= (Date.now() - ENGAGE_DAYS * 864e5); }
  function revealDelivered(s) { return (_data.mailsBySession[s.id] || []).filter((m) => /^reveal_/.test(m.kind) && m.delivered_at).length; }
  function leadSignal(s) {
    if (s.paid_at) return { key: 'paid', label: 'opłacony', tone: 'amber', icon: 'ph-currency-circle-dollar' };
    if (s.verdict === 'zielony') {
      if (isEngaged(s)) return { key: 'hot', label: 'gorący', tone: 'emerald', icon: 'ph-fire' };
      return { key: 'cold', label: 'wystygł', tone: 'sky', icon: 'ph-snowflake' };
    }
    if (s.verdict === 'zolty' || s.verdict === 'czerwony') return { key: 'verdict', label: 'werdykt', tone: 'zinc', icon: 'ph-flag' };
    if (s.email) return { key: 'lead', label: 'lead', tone: 'zinc', icon: 'ph-user' };
    return { key: 'talk', label: 'rozmowa', tone: 'zinc', icon: 'ph-chat-circle' };
  }

  // ── Ładowanie sesji (wspólny loader; różnice lejków wchodzą configiem) ──
  // Wzorzec „zwróć dane": PanelCore ładuje, panel przypisuje do swoich zmiennych
  // (bez przenoszenia własności stanu — najniższe ryzyko). cfg: {table, select,
  // rpcCosts, rpcAvatars, emailsTable}. Zwraca komplet map gotowych do podstawienia.
  async function loadSessions(supabase, cfg) {
    const all = [];
    const pageSize = 1000;
    let page = 0;
    while (true) {
      const { data, error } = await supabase
        .from(cfg.table)
        .select(cfg.select)
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      if (error) { console.error(error); toast('Błąd ładowania sesji'); break; }
      if (!data || !data.length) break;
      all.push(...data);
      if (data.length < pageSize) break;
      page++;
    }
    const [{ data: costs }, { data: rateRow }, { data: mailRows }, { data: avatars }] = await Promise.all([
      supabase.rpc(cfg.rpcCosts),
      supabase.from('settings').select('value').eq('key', 'usd_pln_rate').maybeSingle(),
      supabase.from(cfg.emailsTable).select('session_id, kind, email, sent_at, opened_at, clicked_at, delivered_at').order('sent_at', { ascending: false }).limit(800),
      supabase.rpc(cfg.rpcAvatars),
    ]);
    const costsBySession = {};
    (costs || []).forEach((c) => { costsBySession[c.session_id] = c; });
    const avatarByUser = {};
    (avatars || []).forEach((a) => { if (a.auth_user_id && a.avatar_url) avatarByUser[a.auth_user_id] = a.avatar_url; });
    const rate = (rateRow && rateRow.value) ? (parseFloat(rateRow.value) || 4.0) : null;
    if (rate) setRate(rate);
    const mails = mailRows || [];
    const mailKindsBySession = {};
    const mailsBySession = {};
    mails.forEach((m) => {
      (mailKindsBySession[m.session_id] = mailKindsBySession[m.session_id] || new Set()).add(m.kind);
      (mailsBySession[m.session_id] = mailsBySession[m.session_id] || []).push(m);
    });
    const out = { sessions: all, costsBySession, avatarByUser, rate, mails, mailKindsBySession, mailsBySession };
    setData(out); // PanelCore trzyma referencje dla wspólnych state-readerów (costOf/avatar/engagement)
    return out;
  }

  // ── DASHBOARD / PRZEGLĄD (command-center) — identyczne w obu panelach ──
  const TONE_TXT = { emerald: 'text-emerald-400', amber: 'text-amber-400', sky: 'text-sky-400', zinc: 'text-zinc-400' };
  const TONE_CHIP = {
    emerald: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    amber: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    sky: 'text-sky-400 border-sky-400/30 bg-sky-400/10',
    zinc: 'text-zinc-400 border-white/10 bg-white/5',
  };
  function renderDashboard() {
    const sessions = getSessions();
    const vis = sessions.filter((s) => !s.is_test);
    const now = Date.now();
    const d7 = now - 7 * 864e5;
    const within7 = vis.filter((s) => new Date(s.created_at).getTime() >= d7);
    const leads = vis.filter((s) => s.email);
    const projects = vis.filter((s) => s.preview_images && Object.keys(s.preview_images).length);
    const greens = vis.filter((s) => s.verdict === 'zielony');
    const paid = vis.filter((s) => s.paid_at);
    const totalCost = vis.reduce((sum, s) => sum + costOf(s), 0);
    const cost7 = within7.reduce((sum, s) => sum + costOf(s), 0);
    const withCost = vis.filter((s) => costOf(s) > 0).length;
    const avgCost = withCost ? totalCost / withCost : 0;
    const kpi = [
      { label: 'Sesje (7 dni / razem)', val: `${within7.length} / ${vis.length}`, icon: 'ph-chats-circle', tone: 'text-blue-400' },
      { label: 'Leady (e-mail)', val: leads.length, icon: 'ph-user-plus', tone: 'text-sky-400' },
      { label: 'Zielone werdykty', val: greens.length, icon: 'ph-check-circle', tone: 'text-emerald-400' },
      { label: 'Rezerwacja', val: paid.length, icon: 'ph-currency-circle-dollar', tone: 'text-amber-400' },
      { label: 'Koszt AI — 7 dni', val: fmtPln(cost7), icon: 'ph-wallet', tone: 'text-blue-400' },
      { label: 'Koszt AI — razem', val: fmtPln(totalCost), icon: 'ph-stack', tone: 'text-blue-400' },
      { label: 'Śr. koszt rozmowy', val: avgCost ? fmtPln(avgCost) : '—', icon: 'ph-calculator', tone: 'text-zinc-400' },
      { label: 'Przychód (rezerwacje)', val: (paid.length * 500).toLocaleString('pl-PL') + ' zł', icon: 'ph-trend-up', tone: 'text-emerald-400' },
    ];
    $('kpi-grid').innerHTML = kpi.map((k) => `
      <div class="bg-zinc-900/60 border border-white/5 rounded-xl p-4 animate-enter">
        <div class="flex items-center gap-2 text-[11px] uppercase tracking-wider text-zinc-500"><i class="ph ${k.icon} ${k.tone}"></i>${k.label}</div>
        <div class="text-xl font-bold text-white mt-1.5">${k.val}</div>
      </div>`).join('');
    const steps = [
      ['Rozmowy', vis.length],
      ['Podany e-mail', leads.length],
      ['Wygenerowany projekt', projects.length],
      ['Zielony werdykt', greens.length],
      ['Rezerwacja', paid.length],
    ];
    const max = Math.max(1, vis.length);
    $('funnel').innerHTML = steps.map(([label, n], i) => {
      const pct = vis.length ? Math.round((n / max) * 100) : 0;
      const conv = i === 0 ? '' : steps[i - 1][1] ? ` <span class="text-zinc-600">(${Math.round((n / Math.max(1, steps[i - 1][1])) * 100)}%)</span>` : '';
      return `<div>
        <div class="flex justify-between text-xs mb-1"><span class="text-zinc-400">${label}</span><span class="text-white font-medium">${n}${conv}</span></div>
        <div class="h-2 rounded-full bg-white/5 overflow-hidden"><div class="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400" style="width:${pct}%"></div></div>
      </div>`;
    }).join('');
    renderCostChart();
    $('recent-sessions').innerHTML = vis.slice(0, 8).map(sessionRowMini).join('') || '<div class="text-sm text-zinc-600">Brak sesji.</div>';
  }

  function sessionRowMini(s) {
    const st = STAGES.find((x) => x.id === stageOf(s));
    return `<button onclick="openSession('${s.id}')" class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition text-left">
      <span class="w-2 h-2 rounded-full ${st.dot} shrink-0"></span>
      <span class="text-sm text-white truncate">${accentDot(s)}${esc(projName(s))}</span>
      <span class="text-xs text-zinc-500 truncate">${esc(s.email || 'bez e-maila')}</span>
      <span class="ml-auto text-xs font-mono text-zinc-400 shrink-0">${costOf(s) ? fmtPln(costOf(s)) : ''}</span>
      <span class="text-[11px] text-zinc-600 shrink-0 w-20 text-right">${timeAgo(s.created_at)}</span>
    </button>`;
  }

  async function renderCostChart() {
    const to = new Date(); const from = new Date(Date.now() - 13 * 864e5);
    const iso = (d) => d.toISOString().slice(0, 10);
    const { data, error } = await _cfg.supabase.rpc(_cfg.rpcCostsDaily, { p_from: iso(from), p_to: iso(to) });
    if (error) { console.error(error); return; }
    const byDay = {};
    (data || []).forEach((r) => { byDay[r.day] = (byDay[r.day] || 0) + Number(r.cost_usd); });
    const days = [];
    for (let i = 13; i >= 0; i--) days.push(iso(new Date(Date.now() - i * 864e5)));
    const max = Math.max(0.01, ...days.map((d) => byDay[d] || 0));
    let total = 0;
    $('cost-chart').innerHTML = days.map((d) => {
      const v = byDay[d] || 0; total += v;
      const h = Math.max(2, Math.round((v / max) * 100));
      const dayPl = new Date(d + 'T12:00:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', weekday: 'long' });
      return `<div class="flex-1 flex flex-col justify-end h-full group cursor-default" title="${dayPl} — ${fmtPln(v)}">
        <div class="bar w-full rounded-t bg-gradient-to-t from-blue-700/60 to-blue-400/80 group-hover:from-blue-600 group-hover:to-blue-300 transition-colors" style="height:${h}%"></div>
      </div>`;
    }).join('');
    $('cost-chart-labels').innerHTML = days.map((d) => `<div class="flex-1 text-center text-[9px] text-zinc-600">${d.slice(8)}</div>`).join('');
    $('chart-total').textContent = '14 dni: ' + fmtPln(total);
  }

  function renderPrzeglad() { renderDashboard(); renderAttention(); }
  function attentionRow(s, right) {
    const g = leadSignal(s);
    return `<button onclick="openSession('${s.id}')" class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 transition text-left">
      <i class="ph ${g.icon} ${TONE_TXT[g.tone]} shrink-0"></i>
      <span class="min-w-0 flex-1">
        <span class="block text-sm text-white truncate">${accentDot(s)}${esc(projName(s))}</span>
        <span class="block text-[11px] text-zinc-500 truncate">${esc(s.email || 'bez e-maila')}</span>
      </span>
      <span class="shrink-0 text-right flex items-center gap-2">${sourceMini(s)}<span class="text-[11px] text-zinc-500">${right || ''}</span></span>
    </button>`;
  }
  function attentionCol(title, icon, tone, items, empty) {
    const head = `<div class="flex items-center justify-between mb-2">
      <span class="inline-flex items-center gap-1.5 text-xs font-medium ${TONE_TXT[tone]}"><i class="ph ${icon}"></i>${title}</span>
      <span class="text-[11px] text-zinc-600">${items.length}</span></div>`;
    const body = items.length ? items.slice(0, 7).map((it) => attentionRow(it.s, it.right)).join('')
      + (items.length > 7 ? `<div class="text-[11px] text-zinc-600 px-2.5 pt-1">+ ${items.length - 7} więcej</div>` : '')
      : `<div class="text-xs text-zinc-600 px-2.5 py-3">${empty}</div>`;
    return `<div class="bg-zinc-900/60 border border-white/5 rounded-xl p-3.5">${head}${body}</div>`;
  }
  function renderAttention() {
    const sessions = getSessions();
    const vis = sessions.filter((s) => !s.is_test && !LOST_STAGE_IDS.includes(stageOf(s)));
    const now = Date.now();
    const hot = vis.filter((s) => leadSignal(s).key === 'hot')
      .map((s) => ({ s, t: lastTouchOf(s), right: lastTouchOf(s) ? timeAgo(new Date(lastTouchOf(s)).toISOString()) : '—' }))
      .sort((a, b) => b.t - a.t);
    const cold = vis.filter((s) => leadSignal(s).key === 'cold')
      .map((s) => ({ s, t: lastTouchOf(s), right: 'cisza ' + timeAgo(new Date(lastTouchOf(s) || Date.parse(s.created_at)).toISOString()).replace(' temu', '') }))
      .sort((a, b) => b.t - a.t);
    const paid = vis.filter((s) => s.paid_at && now - Date.parse(s.paid_at) < 14 * 864e5)
      .map((s) => ({ s, t: Date.parse(s.paid_at), right: fmtDate(s.paid_at) }))
      .sort((a, b) => b.t - a.t);
    $('attention-cols').innerHTML =
      attentionCol('Gorące — działaj', 'ph-fire', 'emerald', hot, 'Brak gorących leadów. Wróć po nowych werdyktach.')
      + attentionCol('Wystygli — do reaktywacji', 'ph-snowflake', 'sky', cold, 'Nikt nie wystygł — dobrze.')
      + attentionCol('Świeże wpłaty (14 dni)', 'ph-currency-circle-dollar', 'amber', paid, 'Brak nowych rezerwacji.');
  }

  window.PanelCore = {
    setRate, getRate, loadSessions, setData, getSessions, initCtx,
    TONE_TXT, TONE_CHIP,
    renderDashboard, sessionRowMini, renderCostChart, renderPrzeglad, attentionRow, attentionCol, renderAttention,
    costOf, avatarPhoto, avatarImg, avatarThumb, avatarBlock,
    lastTouchOf, isEngaged, revealDelivered, leadSignal,
    $, esc, fmtPln, fmtZl, fmtUsd, timeAgo, fmtDate, untilStr, plural, toast,
    STAGES, STAGE_IDS, LOST_STAGE_IDS, derivedStageOf, stageOf, projName,
    designOf, hexOf, accentDot, designSwatch,
    SRC_STYLE, SRC_ICON, srcInfo, srcTitle, sourceBadge, sourceMini, sourceDetailHTML,
    MARKER_RE, cleanMsg,
  };
})();
