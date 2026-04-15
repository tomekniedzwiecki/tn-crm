// Background service worker: Supabase REST proxy + command handler

const SUPABASE_DEFAULT_URL = 'https://yxmavwkwnfuphjqbelws.supabase.co';

async function getConfig() {
  const { supabase_url, supabase_key } = await chrome.storage.local.get(['supabase_url', 'supabase_key']);
  return {
    url: supabase_url || SUPABASE_DEFAULT_URL,
    key: supabase_key || ''
  };
}

async function sbFetch(path, init = {}) {
  const { url, key } = await getConfig();
  if (!key) throw new Error('Brak klucza Supabase — ustaw w Opcjach');
  const res = await fetch(`${url}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

// List workflows that have ad_copies.versions populated
async function listWorkflows() {
  // Pull recent workflow_ads with ad_copies, then join offer_name via workflows
  const ads = await sbFetch('/workflow_ads?select=workflow_id,ad_copies,updated_at&ad_copies=not.is.null&order=updated_at.desc&limit=100');
  const withVersions = ads.filter(a => Array.isArray(a?.ad_copies?.versions) && a.ad_copies.versions.length > 0);
  if (withVersions.length === 0) return [];
  const ids = withVersions.map(a => `"${a.workflow_id}"`).join(',');
  const workflows = await sbFetch(`/workflows?id=in.(${ids})&select=id,offer_name,customer_name`);
  const byId = new Map(workflows.map(w => [w.id, w]));
  return withVersions.map(a => ({
    workflow_id: a.workflow_id,
    offer_name: byId.get(a.workflow_id)?.offer_name || '(bez nazwy)',
    customer_name: byId.get(a.workflow_id)?.customer_name || '',
    versions: a.ad_copies.versions,
    landing_url: a.ad_copies.landing_url || '',
    brand_name: a.ad_copies.brand_name || '',
    product_name: a.ad_copies.product_name || '',
    updated_at: a.updated_at
  }));
}

async function getWorkflowAds(workflowId) {
  const rows = await sbFetch(`/workflow_ads?workflow_id=eq.${workflowId}&select=ad_copies,ad_creatives`);
  if (!rows.length) throw new Error('Nie znaleziono workflow_ads dla tego workflow');
  return rows[0];
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      if (msg.type === 'list_workflows') {
        sendResponse({ ok: true, data: await listWorkflows() });
      } else if (msg.type === 'get_workflow') {
        sendResponse({ ok: true, data: await getWorkflowAds(msg.workflow_id) });
      } else if (msg.type === 'test_connection') {
        const cfg = await getConfig();
        if (!cfg.key) throw new Error('Brak klucza');
        await sbFetch('/workflow_ads?select=workflow_id&limit=1');
        sendResponse({ ok: true });
      } else {
        sendResponse({ ok: false, error: 'Nieznany typ wiadomości' });
      }
    } catch (e) {
      sendResponse({ ok: false, error: e.message });
    }
  })();
  return true;
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'fill-all-variants') return;
  const { last_workflow_id } = await chrome.storage.local.get('last_workflow_id');
  if (!last_workflow_id) return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  try {
    const ads = await getWorkflowAds(last_workflow_id);
    await chrome.tabs.sendMessage(tab.id, { type: 'fill_all', versions: ads.ad_copies?.versions || [] });
  } catch (e) {
    console.error('Fill via shortcut failed:', e);
  }
});
