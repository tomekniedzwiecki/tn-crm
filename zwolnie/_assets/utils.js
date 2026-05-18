// Shared utils
window.ZE = window.ZE || {};

ZE.STATUS_LABELS = {
  new: 'Nowy',
  analyzing: 'Analiza',
  analyzed: 'Analiza gotowa',
  proposal_sent: 'Propozycja',
  negotiation: 'Negocjacje',
  won: 'Wygrany',
  lost: 'Przegrany',
  archived: 'Archiwum'
};

ZE.STATUS_ORDER = ['new', 'analyzing', 'analyzed', 'proposal_sent', 'negotiation', 'won', 'lost', 'archived'];

ZE.INDUSTRY_LABELS = {
  ecommerce: 'E-commerce',
  uslugi: 'Usługi',
  produkcja: 'Produkcja',
  'handel-b2b': 'Handel B2B',
  tech: 'Tech / SaaS',
  prawo: 'Kancelaria',
  finanse: 'Finanse / Księgowość',
  medyczne: 'Medyczne / Wellness',
  inna: 'Inna'
};

ZE.TEAM_SIZE_LABELS = {
  '1-5': '1-5 osób',
  '6-15': '6-15 osób',
  '16-50': '16-50 osób',
  '51-150': '51-150 osób',
  '150+': '150+ osób'
};

ZE.PAYROLL_LABELS = {
  '<50k': 'do 50k zł',
  '50-150k': '50-150k zł',
  '150-500k': '150-500k zł',
  '500k-1.5M': '500k-1.5M zł',
  '1.5M+': 'powyżej 1.5M zł',
  'nie-chce': 'nie podane'
};

ZE.BUDGET_LABELS = {
  '<20k': 'do 20k zł',
  '20-50k': '20-50k zł',
  '50-150k': '50-150k zł',
  '150-500k': '150-500k zł',
  '500k+': 'powyżej 500k zł',
  'nie-wiem': 'do ustalenia'
};

ZE.fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' });
};

ZE.fmtDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

ZE.fmtRelative = (iso) => {
  if (!iso) return '—';
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diffM = Math.round((now - t) / 60000);
  if (diffM < 1) return 'teraz';
  if (diffM < 60) return diffM + ' min temu';
  const diffH = Math.round(diffM / 60);
  if (diffH < 24) return diffH + ' godz. temu';
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return diffD + ' dni temu';
  return ZE.fmtDate(iso);
};

ZE.fmtFileSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  return Math.max(1, Math.round(bytes / 1024)) + ' KB';
};

ZE.statusBadge = (status) => {
  const label = ZE.STATUS_LABELS[status] || status;
  return `<span class="ze-status ze-status--${status}">${label}</span>`;
};

ZE.escapeHtml = (s) => {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Bezpieczna konwersja URL użytkownika do clickable href.
// Blokuje javascript:, data:, file: schematy. Domyślnie dodaje https://.
ZE.safeUrl = (url) => {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';
  // Wykryj niebezpieczne schematy (po lowercase, ignoruj whitespace przed)
  if (/^\s*(javascript|data|file|vbscript|about):/i.test(trimmed)) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Add https:// dla bare domains
  return 'https://' + trimmed.replace(/^\/+/, '');
};

// Otwórz dowolne HTML w nowej karcie BEZ udzielenia mu dostępu do origin panelu.
// Używamy Blob URL zamiast document.write — Blob URL ma osobny origin (null).
ZE.openHtmlInNewTab = (html) => {
  if (!html) return;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

// Modal: zamiennik dla natywnego prompt() obsługujący multi-line text.
// Returns Promise<string|null>. Anuluj zwraca null.
ZE.askText = ({ title, value = '', placeholder = '', multiline = false, maxLength = 20000 } = {}) => {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4';
    wrap.innerHTML = `
      <div class="bg-zinc-900 border border-white/10 rounded-xl p-5 w-full max-w-lg">
        <h3 class="text-white font-semibold mb-3">${ZE.escapeHtml(title)}</h3>
        ${multiline
          ? `<textarea rows="6" maxlength="${maxLength}" class="ze-input w-full px-3 py-2 rounded-lg text-sm"></textarea>`
          : `<input type="text" maxlength="${maxLength}" class="ze-input w-full px-3 py-2 rounded-lg text-sm">`}
        <div class="flex justify-end gap-2 mt-4">
          <button data-act="cancel" class="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white">Anuluj</button>
          <button data-act="ok" class="px-4 py-2 rounded-lg text-sm bg-white text-black font-semibold hover:bg-zinc-200">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
    const input = wrap.querySelector('input, textarea');
    input.value = value;
    if (placeholder) input.placeholder = placeholder;
    input.focus();
    if (!multiline) input.select();

    const close = (val) => { wrap.remove(); resolve(val); };
    wrap.querySelector('[data-act="cancel"]').addEventListener('click', () => close(null));
    wrap.querySelector('[data-act="ok"]').addEventListener('click', () => close(input.value));
    wrap.addEventListener('click', (e) => { if (e.target === wrap) close(null); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close(null);
      if (e.key === 'Enter' && !multiline) close(input.value);
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) close(input.value);
    });
  });
};

ZE.confirm = (msg) => new Promise((resolve) => {
  const wrap = document.createElement('div');
  wrap.className = 'fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4';
  wrap.innerHTML = `
    <div class="bg-zinc-900 border border-white/10 rounded-xl p-5 w-full max-w-sm">
      <div class="text-zinc-200 mb-4">${ZE.escapeHtml(msg)}</div>
      <div class="flex justify-end gap-2">
        <button data-act="cancel" class="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white">Anuluj</button>
        <button data-act="ok" class="px-4 py-2 rounded-lg text-sm bg-red-500 text-white hover:bg-red-400">Potwierdź</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);
  const close = (v) => { wrap.remove(); resolve(v); };
  wrap.querySelector('[data-act="cancel"]').addEventListener('click', () => close(false));
  wrap.querySelector('[data-act="ok"]').addEventListener('click', () => close(true));
  wrap.addEventListener('click', (e) => { if (e.target === wrap) close(false); });
});

ZE.toast = (msg, type = 'info', timeout = 3500) => {
  let wrap = document.querySelector('.ze-toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'ze-toast-wrap';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = 'ze-toast ze-toast--' + (type === 'error' ? 'err' : type === 'success' ? 'ok' : '');
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), timeout);
};

ZE.logActivity = async (leadId, action, details = null) => {
  try {
    const staff = ZE_Auth.staff();
    await ZE_SB.from('ze_lead_activity').insert({
      lead_id: leadId,
      actor_id: staff?.id || null,
      action,
      details
    });
  } catch (e) {
    console.error('activity log failed', e);
  }
};

ZE.renderPromptTemplate = (template, lead) => {
  // Replaces {{key}} placeholders with values from lead object.
  if (!template) return '';
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const labels = {
      industry: ZE.INDUSTRY_LABELS[lead.industry],
      team_size: ZE.TEAM_SIZE_LABELS[lead.team_size],
      payroll: ZE.PAYROLL_LABELS[lead.payroll],
      budget: ZE.BUDGET_LABELS[lead.budget]
    };
    const v = labels[k] != null ? labels[k] : lead[k];
    return v == null || v === '' ? '(brak)' : String(v);
  });
};
