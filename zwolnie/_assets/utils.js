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

// Avatar gradient z inicjałami (deterministic z imienia/maila)
ZE.avatarColors = (seed) => {
  if (!seed) return ['#3f3f46', '#52525b'];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  const hue1 = Math.abs(h) % 360;
  const hue2 = (hue1 + 40) % 360;
  return [`hsl(${hue1} 65% 45%)`, `hsl(${hue2} 65% 35%)`];
};

ZE.initials = (name) => {
  if (!name) return '?';
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();
};

ZE.avatarHtml = (name, size = 36, extraClass = '') => {
  const [c1, c2] = ZE.avatarColors(name || '');
  return `<div class="${extraClass}" style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg, ${c1}, ${c2});display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:${Math.round(size*0.36)}px;flex-shrink:0">${ZE.escapeHtml(ZE.initials(name))}</div>`;
};

// Urgency: ile dni w obecnym statusie + kolor
ZE.daysInStatus = (statusChangedAt) => {
  if (!statusChangedAt) return null;
  return Math.floor((Date.now() - new Date(statusChangedAt).getTime()) / 86400000);
};

ZE.urgencyBadge = (statusChangedAt, status) => {
  if (['won', 'lost', 'archived'].includes(status)) return '';
  const days = ZE.daysInStatus(statusChangedAt);
  if (days == null || days < 1) return '';
  let cls = 'bg-zinc-800 text-zinc-400 border-zinc-700';
  let pulse = '';
  if (days >= 7) { cls = 'bg-red-500/15 text-red-300 border-red-500/40'; pulse = 'animate-pulse'; }
  else if (days >= 5) { cls = 'bg-red-500/10 text-red-300 border-red-500/30'; }
  else if (days >= 3) { cls = 'bg-amber-500/10 text-amber-300 border-amber-500/30'; }
  return `<span class="${pulse} inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-medium ${cls}" title="W tym statusie od ${days} dni">${days}d</span>`;
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

ZE.askText = ({ title, value = '', placeholder = '', multiline = false, maxLength = 20000 } = {}) => {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'ds-modal-backdrop';
    wrap.innerHTML = `
      <div class="ds-modal">
        <div class="ds-modal__header">
          <h3 class="ds-h3">${ZE.escapeHtml(title)}</h3>
          <button data-act="cancel" class="ds-btn ds-btn--ghost ds-btn--sm"><i class="ph ph-x"></i></button>
        </div>
        <div class="ds-modal__body">
          ${multiline
            ? `<textarea rows="6" maxlength="${maxLength}" class="ds-textarea"></textarea>`
            : `<input type="text" maxlength="${maxLength}" class="ds-input ds-input--lg">`}
        </div>
        <div class="ds-modal__footer">
          <button data-act="cancel" class="ds-btn ds-btn--ghost">Anuluj</button>
          <button data-act="ok" class="ds-btn ds-btn--primary">Zapisz</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
    const input = wrap.querySelector('input, textarea');
    input.value = value;
    if (placeholder) input.placeholder = placeholder;
    setTimeout(() => { input.focus(); if (!multiline) input.select(); }, 50);

    const close = (val) => { wrap.remove(); resolve(val); };
    wrap.querySelectorAll('[data-act="cancel"]').forEach(b => b.addEventListener('click', () => close(null)));
    wrap.querySelector('[data-act="ok"]').addEventListener('click', () => close(input.value));
    wrap.addEventListener('click', (e) => { if (e.target === wrap) close(null); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close(null);
      if (e.key === 'Enter' && !multiline) close(input.value);
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) close(input.value);
    });
  });
};

// Render structured AI analysis JSON → DS HTML cards (Stripe-style propozycje)
ZE.renderAnalysisHtml = (a) => {
  if (!a) return '';
  const e = ZE.escapeHtml;
  const sevColors = {
    high: { bg: 'rgba(238,68,68,0.1)', color: '#FCA5A5' },
    medium: { bg: 'rgba(245,166,35,0.1)', color: '#FCD34D' },
    low: { bg: 'rgba(115,115,115,0.1)', color: 'var(--ds-fg-3)' }
  };
  let html = '';

  if (a.summary) html += `<div style="font-size: 15px; line-height: 1.65; color: var(--ds-fg-1); margin-bottom: 20px; font-style: italic; padding: 16px; background: rgba(255,255,255,0.02); border-left: 3px solid var(--ds-magic); border-radius: 0 var(--ds-r-sm) var(--ds-r-sm) 0;">${e(a.summary)}</div>`;

  if (a.honest_assessment) html += `<div style="padding: 12px 16px; background: rgba(245,166,35,0.06); border: 1px solid rgba(245,166,35,0.25); border-radius: var(--ds-r-sm); color: #FCD34D; font-size: 13px; line-height: 1.6; margin-bottom: 20px;"><i class="ph ph-lightbulb"></i> ${e(a.honest_assessment)}</div>`;

  if (Array.isArray(a.diagnosed_pain_points) && a.diagnosed_pain_points.length) {
    html += `<div class="ds-label ds-mb-3">Diagnozowane bóle (${a.diagnosed_pain_points.length})</div>`;
    html += '<div class="ds-flex-col ds-gap-2 ds-mb-6">' + a.diagnosed_pain_points.map(p => {
      const sc = sevColors[p.severity] || sevColors.medium;
      return `
      <div style="padding: 14px 16px; background: var(--ds-surface-2); border: 1px solid var(--ds-border); border-radius: var(--ds-r-sm);">
        <div class="ds-flex ds-items-center ds-gap-2 ds-mb-2">
          <strong class="ds-fg-1" style="font-size: 14px;">${e(p.title || '')}</strong>
          <span style="font-size: 10px; text-transform: uppercase; padding: 2px 6px; border-radius: var(--ds-r-xs); background: ${sc.bg}; color: ${sc.color};">${e(p.severity || 'medium')}</span>
        </div>
        ${p.evidence_from_brief ? `<div class="ds-xs" style="font-style: italic; margin-bottom: 6px;">„${e(p.evidence_from_brief)}"</div>` : ''}
        ${p.business_cost ? `<div class="ds-xs" style="color: var(--ds-fg-3);"><strong>Koszt:</strong> ${e(p.business_cost)}</div>` : ''}
      </div>`;
    }).join('') + '</div>';
  }

  if (Array.isArray(a.proposed_solutions) && a.proposed_solutions.length) {
    html += `<div class="ds-label ds-mb-3">Propozycje (${a.proposed_solutions.length})</div>`;
    html += '<div class="ds-flex-col ds-gap-3 ds-mb-6">' + a.proposed_solutions.map((s, i) => `
      <div style="padding: 16px 18px; background: var(--ds-surface-2); border: 1px solid var(--ds-border); border-radius: var(--ds-r-md); transition: border-color var(--ds-d-fast) var(--ds-ease);" onmouseover="this.style.borderColor='var(--ds-border-hover)'" onmouseout="this.style.borderColor='var(--ds-border)'">
        <div class="ds-flex ds-items-center ds-gap-3 ds-mb-3">
          <span style="width: 24px; height: 24px; border-radius: 50%; background: var(--ds-magic-soft); color: var(--ds-magic); font-weight: 600; font-size: 12px; display: flex; align-items: center; justify-content: center;">${i+1}</span>
          <strong class="ds-fg-1" style="font-size: 14px;">${e(s.title || '')}</strong>
        </div>
        ${s.what_it_does ? `<div class="ds-fg-2 ds-mb-3" style="font-size: 13px; line-height: 1.6;">${e(s.what_it_does)}</div>` : ''}
        ${s.what_etat_replaces ? `<div class="ds-xs ds-mb-3"><strong>Zastępuje:</strong> ${e(s.what_etat_replaces)}</div>` : ''}
        <div class="ds-grid ds-grid-4 ds-gap-2 ds-mt-3" style="font-size: 11px;">
          ${s.build_estimate_pln ? `<div style="padding: 10px; background: var(--ds-surface-3); border-radius: var(--ds-r-xs);"><div class="ds-label" style="font-size: 9px;">Budowa</div><div class="ds-fg-1 ds-mt-2 ds-num" style="font-weight: 600;">${e(s.build_estimate_pln)}</div></div>` : ''}
          ${s.build_estimate_weeks ? `<div style="padding: 10px; background: var(--ds-surface-3); border-radius: var(--ds-r-xs);"><div class="ds-label" style="font-size: 9px;">Czas</div><div class="ds-fg-1 ds-mt-2 ds-num" style="font-weight: 600;">${e(s.build_estimate_weeks)} tyg</div></div>` : ''}
          ${s.monthly_savings_pln ? `<div style="padding: 10px; background: var(--ds-emerald-soft); border-radius: var(--ds-r-xs);"><div class="ds-label" style="font-size: 9px; color: var(--ds-emerald);">Oszcz./mies</div><div class="ds-mt-2 ds-num" style="font-weight: 600; color: #6EE7B7;">${e(s.monthly_savings_pln)}</div></div>` : ''}
          ${s.payback_months ? `<div style="padding: 10px; background: var(--ds-surface-3); border-radius: var(--ds-r-xs);"><div class="ds-label" style="font-size: 9px;">Zwrot</div><div class="ds-fg-1 ds-mt-2 ds-num" style="font-weight: 600;">${e(s.payback_months)} mies</div></div>` : ''}
        </div>
        ${s.stack_suggestion ? `<div class="ds-xs ds-mt-3"><strong>Stack:</strong> ${e(s.stack_suggestion)}</div>` : ''}
        ${s.depends_on ? `<div class="ds-xs"><strong>Wymaga:</strong> ${e(s.depends_on)}</div>` : ''}
      </div>
    `).join('') + '</div>';
  }

  if (a.recommended_first_step) {
    const r = a.recommended_first_step;
    html += `
      <div style="padding: 16px 18px; background: var(--ds-emerald-soft); border: 1px solid rgba(0,200,150,0.35); border-radius: var(--ds-r-md); margin-bottom: 20px;">
        <div class="ds-label" style="color: var(--ds-emerald); margin-bottom: 6px;"><i class="ph-bold ph-star"></i> Rekomendowany pierwszy krok</div>
        <div class="ds-fg-1 ds-mb-2" style="font-weight: 600; font-size: 14px;">${e(r.title || '')}</div>
        ${r.why ? `<div class="ds-fg-2 ds-mb-2" style="font-size: 13px; line-height: 1.6;">${e(r.why)}</div>` : ''}
        ${r.mvp_scope ? `<div class="ds-xs"><strong>Zakres MVP:</strong> ${e(r.mvp_scope)}</div>` : ''}
      </div>
    `;
  }

  if (a.estimated_total_savings_pln_per_year || a.estimated_total_build_pln) {
    html += `<div class="ds-grid ds-grid-2 ds-gap-3 ds-mb-4">
      ${a.estimated_total_build_pln ? `<div style="padding: 14px; background: var(--ds-surface-2); border: 1px solid var(--ds-border); border-radius: var(--ds-r-sm);"><div class="ds-label">Total budowa</div><div class="ds-fg-1 ds-mt-2 ds-num" style="font-size: 18px; font-weight: 600;">${e(a.estimated_total_build_pln)}</div></div>` : ''}
      ${a.estimated_total_savings_pln_per_year ? `<div style="padding: 14px; background: var(--ds-emerald-soft); border: 1px solid rgba(0,200,150,0.3); border-radius: var(--ds-r-sm);"><div class="ds-label" style="color: var(--ds-emerald);">Total oszczędności/rok</div><div class="ds-mt-2 ds-num" style="font-size: 18px; font-weight: 600; color: #6EE7B7;">${e(a.estimated_total_savings_pln_per_year)}</div></div>` : ''}
    </div>`;
  }

  if (Array.isArray(a.clarifying_questions) && a.clarifying_questions.length) {
    html += `<details style="margin-top: 16px; background: var(--ds-surface-2); border: 1px solid var(--ds-border); border-radius: var(--ds-r-sm);">
      <summary class="ds-xs" style="padding: 10px 14px; cursor: pointer;">Pytania doprecyzowujące (${a.clarifying_questions.length})</summary>
      <ul style="padding: 0 14px 14px; margin: 0; list-style: none;">${a.clarifying_questions.map(q => `<li class="ds-fg-2" style="font-size: 13px; padding: 4px 0;">• ${e(q)}</li>`).join('')}</ul>
    </details>`;
  }

  return html;
};

ZE.confirm = (msg, opts = {}) => new Promise((resolve) => {
  const wrap = document.createElement('div');
  wrap.className = 'ds-modal-backdrop';
  const danger = opts.danger !== false;
  wrap.innerHTML = `
    <div class="ds-modal" style="max-width: 400px;">
      <div class="ds-modal__body" style="padding-top: var(--ds-s-5);">
        <div class="ds-body">${ZE.escapeHtml(msg)}</div>
      </div>
      <div class="ds-modal__footer">
        <button data-act="cancel" class="ds-btn ds-btn--ghost">Anuluj</button>
        <button data-act="ok" class="ds-btn ${danger ? 'ds-btn--danger' : 'ds-btn--primary'}">${opts.okLabel || 'Potwierdź'}</button>
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
  let wrap = document.querySelector('.ds-toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'ds-toast-wrap';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = 'ds-toast ' + (type === 'error' ? 'ds-toast--err' : type === 'success' ? 'ds-toast--ok' : '');
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
  if (!template) return '';
  const computed = {
    lead_id: lead.id,
    panel_url: 'https://crm.tomekniedzwiecki.pl/zwolnie/lead?id=' + lead.id,
    industry: ZE.INDUSTRY_LABELS[lead.industry] || lead.industry,
    team_size: ZE.TEAM_SIZE_LABELS[lead.team_size] || lead.team_size,
    payroll: ZE.PAYROLL_LABELS[lead.payroll] || lead.payroll,
    budget: ZE.BUDGET_LABELS[lead.budget] || lead.budget
  };
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const v = computed[k] != null ? computed[k] : lead[k];
    return v == null || v === '' ? '(brak)' : String(v);
  });
};
