// Popup logic: load workflows from Supabase, render list, handle fill actions

const $ = (id) => document.getElementById(id);

const states = {
  setup: $('state-setup'),
  loading: $('state-loading'),
  error: $('state-error'),
  ready: $('state-ready')
};

function show(name) {
  Object.values(states).forEach(el => el?.classList.add('hidden'));
  states[name]?.classList.remove('hidden');
}

function escapeHTML(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

let allWorkflows = [];
let activeWorkflow = null;

async function init() {
  const { supabase_key } = await chrome.storage.local.get('supabase_key');
  if (!supabase_key) {
    show('setup');
    return;
  }
  await loadWorkflows();
}

async function loadWorkflows() {
  show('loading');
  const resp = await chrome.runtime.sendMessage({ type: 'list_workflows' });
  if (!resp?.ok) {
    $('error-msg').textContent = resp?.error || 'Nie można pobrać workflow';
    show('error');
    return;
  }
  allWorkflows = resp.data || [];
  show('ready');
  renderList('');
}

function renderList(query) {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? allWorkflows.filter(w =>
        (w.offer_name || '').toLowerCase().includes(q) ||
        (w.customer_name || '').toLowerCase().includes(q) ||
        (w.brand_name || '').toLowerCase().includes(q) ||
        (w.product_name || '').toLowerCase().includes(q))
    : allWorkflows;

  const list = $('workflow-list');
  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty"><p>Brak workflow z wygenerowanym copy</p></div>';
    return;
  }
  list.innerHTML = filtered.map(w => {
    const metaParts = [];
    if (w.customer_name) metaParts.push(escapeHTML(w.customer_name));
    if (w.brand_name && w.brand_name !== w.offer_name) metaParts.push(escapeHTML(w.brand_name));
    if (w.product_name && w.product_name !== w.offer_name && w.product_name !== w.brand_name) metaParts.push(escapeHTML(w.product_name));
    return `
      <div class="workflow-item" data-id="${escapeHTML(w.workflow_id)}">
        <div class="name">${escapeHTML(w.offer_name)}</div>
        <div class="meta">
          ${metaParts.length ? `<span>${metaParts.join(' · ')}</span>` : ''}
          <span class="pill">${w.versions.length} wariantów</span>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.workflow-item').forEach(el => {
    el.addEventListener('click', () => selectWorkflow(el.dataset.id));
  });
}

async function selectWorkflow(id) {
  activeWorkflow = allWorkflows.find(w => w.workflow_id === id);
  if (!activeWorkflow) return;
  await chrome.storage.local.set({ last_workflow_id: id });

  $('workflow-list').classList.add('hidden');
  $('workflow-detail').classList.remove('hidden');
  $('detail-name').textContent = activeWorkflow.offer_name;
  $('detail-brand').textContent = activeWorkflow.brand_name || activeWorkflow.customer_name || '';

  await scanCurrentPage();
  renderVariants();
}

async function scanCurrentPage() {
  const status = $('scan-status');
  status.textContent = 'Skanuję stronę...';
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      status.textContent = '⚠ Brak aktywnej karty';
      return;
    }
    const resp = await chrome.tabs.sendMessage(tab.id, { type: 'scan' }).catch(() => null);
    if (!resp?.ok) {
      status.textContent = '⚠ Strona nie jest obsługiwana — otwórz Meta Ads / TakeDrop';
      $('btn-fill-all').disabled = true;
      return;
    }
    const c = resp.counts;
    const total = c.primary_text + c.headline + c.description + c.cta;
    if (total === 0) {
      status.textContent = '⚠ Nie znaleziono pól na tej stronie';
      $('btn-fill-all').disabled = true;
    } else {
      const parts = [];
      if (c.primary_text) parts.push(`${c.primary_text}× tekst`);
      if (c.headline) parts.push(`${c.headline}× nagłówek`);
      if (c.description) parts.push(`${c.description}× opis`);
      if (c.cta) parts.push(`${c.cta}× CTA`);
      status.textContent = `✓ Wykryto: ${parts.join(', ')}`;
      $('btn-fill-all').disabled = false;
    }
  } catch (e) {
    status.textContent = '⚠ Błąd skanowania: ' + e.message;
  }
}

function renderVariants() {
  const list = $('variants-list');
  if (!activeWorkflow?.versions?.length) {
    list.innerHTML = '<div class="empty"><p>Brak wariantów</p></div>';
    return;
  }
  list.innerHTML = activeWorkflow.versions.map((v, i) => `
    <div class="variant">
      <div class="variant-header">
        <span class="variant-num">#${i + 1}</span>
        ${v.angle ? `<span class="variant-angle">${escapeHTML(v.angle)}</span>` : ''}
      </div>
      <div class="variant-preview">${escapeHTML(v.primary_text || v.headline || '')}</div>
      <div class="variant-actions">
        <button class="primary" data-action="fill" data-idx="${i}">Wypełnij</button>
        <button data-action="copy" data-idx="${i}">Kopiuj</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => handleVariantAction(btn.dataset.action, parseInt(btn.dataset.idx, 10)));
  });
}

async function handleVariantAction(action, idx) {
  const version = activeWorkflow.versions[idx];
  if (!version) return;

  if (action === 'copy') {
    const text = [
      version.primary_text ? `Primary:\n${version.primary_text}` : '',
      version.headline ? `Headline: ${version.headline}` : '',
      version.description ? `Description: ${version.description}` : '',
      version.cta ? `CTA: ${version.cta}` : ''
    ].filter(Boolean).join('\n\n');
    await navigator.clipboard.writeText(text);
    flashBtn(event.target, 'Skopiowano ✓');
    return;
  }

  if (action === 'fill') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    const resp = await chrome.tabs.sendMessage(tab.id, {
      type: 'fill_variant',
      variant_index: idx,
      versions: activeWorkflow.versions
    }).catch(e => ({ ok: false, error: e.message }));
    if (resp?.ok) {
      flashBtn(event.target, `✓ ${resp.stats.filled} pól`);
    } else {
      flashBtn(event.target, 'Błąd');
    }
  }
}

function flashBtn(btn, text) {
  const orig = btn.textContent;
  btn.textContent = text;
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = orig;
    btn.disabled = false;
  }, 1500);
}

async function fillAll() {
  if (!activeWorkflow) return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  const btn = $('btn-fill-all');
  btn.disabled = true;
  btn.textContent = 'Wypełniam...';
  const resp = await chrome.tabs.sendMessage(tab.id, {
    type: 'fill_all',
    versions: activeWorkflow.versions
  }).catch(e => ({ ok: false, error: e.message }));
  if (resp?.ok) {
    btn.textContent = `✓ ${resp.stats.filled} pól`;
  } else {
    btn.textContent = 'Błąd — zobacz konsolę';
  }
  setTimeout(() => {
    btn.textContent = 'Wypełnij wszystkie warianty';
    btn.disabled = false;
  }, 2000);
}

// Wiring
$('btn-options').addEventListener('click', () => chrome.runtime.openOptionsPage());
$('btn-setup').addEventListener('click', () => chrome.runtime.openOptionsPage());
$('btn-retry').addEventListener('click', loadWorkflows);
$('btn-back').addEventListener('click', () => {
  activeWorkflow = null;
  $('workflow-list').classList.remove('hidden');
  $('workflow-detail').classList.add('hidden');
});
$('search').addEventListener('input', (e) => renderList(e.target.value));
$('btn-fill-all').addEventListener('click', fillAll);

init();
