const $ = (id) => document.getElementById(id);

async function load() {
  const { supabase_url, supabase_key } = await chrome.storage.local.get(['supabase_url', 'supabase_key']);
  $('supabase_url').value = supabase_url || 'https://yxmavwkwnfuphjqbelws.supabase.co';
  $('supabase_key').value = supabase_key || '';
}

function showStatus(text, kind) {
  const el = $('status');
  el.textContent = text;
  el.className = `status ${kind === 'ok' ? 'ok' : 'err'}`;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

async function save() {
  const supabase_url = $('supabase_url').value.trim().replace(/\/$/, '');
  const supabase_key = $('supabase_key').value.trim();
  if (!supabase_url || !supabase_key) {
    showStatus('Wypełnij oba pola', 'err');
    return;
  }
  await chrome.storage.local.set({ supabase_url, supabase_key });
  showStatus('Zapisano ✓', 'ok');
}

async function test() {
  await save();
  const resp = await chrome.runtime.sendMessage({ type: 'test_connection' });
  if (resp?.ok) showStatus('Połączenie OK ✓', 'ok');
  else showStatus('Błąd: ' + (resp?.error || 'nieznany'), 'err');
}

$('btn-save').addEventListener('click', save);
$('btn-test').addEventListener('click', test);
load();
