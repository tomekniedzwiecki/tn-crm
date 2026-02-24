// WhatsApp CRM Sync - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const chatAvatar = document.getElementById('chat-avatar');
  const chatName = document.getElementById('chat-name');
  const chatPhone = document.getElementById('chat-phone');
  const messageCount = document.getElementById('message-count');
  const btnSync = document.getElementById('btn-sync');
  const btnDeepSync = document.getElementById('btn-deep-sync');
  const btnSyncAll = document.getElementById('btn-sync-all');
  const btnOpenLead = document.getElementById('btn-open-lead');
  const btnSave = document.getElementById('btn-save');

  let currentPhoneNumber = null; // Aktualny numer do wyszukania leada
  const supabaseUrl = document.getElementById('supabase-url');
  const supabaseKey = document.getElementById('supabase-key');
  const syncApiKey = document.getElementById('sync-api-key');
  const syncUser = document.getElementById('sync-user');
  const autoSync = document.getElementById('auto-sync');
  const syncOnChange = document.getElementById('sync-on-change');
  const scheduledSyncIndicator = document.getElementById('scheduled-sync-indicator');
  const scheduledSyncText = document.getElementById('scheduled-sync-text');
  const nextSyncInfo = document.getElementById('next-sync-info');
  const nextSyncTime = document.getElementById('next-sync-time');
  const logContainer = document.getElementById('log');

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tabId = btn.dataset.tab;
      document.getElementById('tab-sync').classList.toggle('hidden', tabId !== 'sync');
      document.getElementById('tab-settings').classList.toggle('hidden', tabId !== 'settings');
    });
  });

  // Load saved settings
  chrome.storage.sync.get(['supabaseUrl', 'supabaseKey', 'syncApiKey', 'syncUser', 'autoSync', 'syncOnChange'], (result) => {
    if (result.supabaseUrl) supabaseUrl.value = result.supabaseUrl;
    if (result.supabaseKey) supabaseKey.value = result.supabaseKey;
    if (result.syncApiKey) syncApiKey.value = result.syncApiKey;
    if (result.syncUser) syncUser.value = result.syncUser;
    autoSync.checked = result.autoSync || false;
    syncOnChange.checked = result.syncOnChange !== false;

    // Sprawdź status scheduled sync z CRM
    checkScheduledSyncStatus(result);
  });

  // Save settings
  btnSave.addEventListener('click', () => {
    const settings = {
      supabaseUrl: supabaseUrl.value.trim(),
      supabaseKey: supabaseKey.value.trim(),
      syncApiKey: syncApiKey.value.trim(),
      syncUser: syncUser.value,
      autoSync: autoSync.checked,
      syncOnChange: syncOnChange.checked
    };

    chrome.storage.sync.set(settings, () => {
      // Powiadom background script o zmianie ustawien
      chrome.runtime.sendMessage({ type: 'SETTINGS_CHANGED' });
      addLog('Ustawienia zapisane', 'success');

      // Sprawdz status scheduled sync z nowymi ustawieniami
      checkScheduledSyncStatus(settings);
    });
  });

  // Auto-sync toggle
  autoSync.addEventListener('change', () => {
    chrome.storage.sync.set({ autoSync: autoSync.checked });
  });

  syncOnChange.addEventListener('change', () => {
    chrome.storage.sync.set({ syncOnChange: syncOnChange.checked });
  });

  // Sprawdź status scheduled sync z CRM
  async function checkScheduledSyncStatus(settings) {
    if (!settings || !settings.supabaseUrl || !settings.supabaseKey || !settings.syncUser) {
      scheduledSyncText.textContent = 'Sync co 5h: brak konfiguracji';
      scheduledSyncIndicator.style.background = '#555';
      return;
    }

    const userName = settings.syncUser.charAt(0).toUpperCase() + settings.syncUser.slice(1).toLowerCase();

    try {
      const response = await fetch(
        `${settings.supabaseUrl}/rest/v1/whatsapp_widget_status?user_name=eq.${userName}&select=scheduled_sync_enabled`,
        {
          headers: {
            'apikey': settings.supabaseKey,
            'Authorization': `Bearer ${settings.supabaseKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const enabled = data[0]?.scheduled_sync_enabled || false;

        if (enabled) {
          scheduledSyncText.textContent = `Sync co 5h: wlaczony (${userName})`;
          scheduledSyncIndicator.style.background = '#25D366';
          updateNextSyncTime();
        } else {
          scheduledSyncText.textContent = `Sync co 5h: wylaczony`;
          scheduledSyncIndicator.style.background = '#555';
          nextSyncInfo.classList.add('hidden');
        }
      } else {
        scheduledSyncText.textContent = 'Sync co 5h: blad sprawdzenia';
        scheduledSyncIndicator.style.background = '#ff5252';
      }
    } catch (err) {
      scheduledSyncText.textContent = 'Sync co 5h: blad polaczenia';
      scheduledSyncIndicator.style.background = '#ff5252';
    }
  }

  // Pokaż czas następnego sync
  function updateNextSyncTime() {
    chrome.runtime.sendMessage({ type: 'GET_NEXT_SYNC' }, (response) => {
      if (response && response.nextSync) {
        const nextDate = new Date(response.nextSync);
        nextSyncTime.textContent = nextDate.toLocaleString('pl-PL', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        });
        nextSyncInfo.classList.remove('hidden');
      } else {
        nextSyncInfo.classList.add('hidden');
      }
    });
  }

  // Get current tab and chat info
  async function updateCurrentChat() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url?.includes('web.whatsapp.com')) {
      chatName.textContent = 'Otwórz WhatsApp Web';
      chatPhone.textContent = 'web.whatsapp.com';
      chatAvatar.textContent = '?';
      messageCount.textContent = '-';
      btnSync.disabled = true;
      btnSyncAll.disabled = true;
      btnOpenLead.classList.add('hidden');
      currentPhoneNumber = null;
      return;
    }

    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_CURRENT_CHAT' });

      if (response && response.phone) {
        chatName.textContent = response.name || 'Nieznany';
        chatPhone.textContent = `+${response.phone}`;
        chatAvatar.textContent = (response.name || '?').charAt(0).toUpperCase();
        messageCount.textContent = `${response.messageCount} wiadomości`;
        btnSync.disabled = false;
        btnSyncAll.disabled = false;
        btnOpenLead.classList.remove('hidden');
        currentPhoneNumber = response.phone;
      } else {
        chatName.textContent = 'Wybierz czat';
        chatPhone.textContent = 'Kliknij na rozmowę';
        chatAvatar.textContent = '?';
        messageCount.textContent = '-';
        btnSync.disabled = true;
        btnSyncAll.disabled = false;
        btnOpenLead.classList.add('hidden');
        currentPhoneNumber = null;
      }
    } catch (e) {
      chatName.textContent = 'Błąd połączenia';
      chatPhone.textContent = 'Odśwież stronę WhatsApp';
      chatAvatar.textContent = '!';
      messageCount.textContent = '-';
      btnSync.disabled = true;
      btnSyncAll.disabled = true;
      btnOpenLead.classList.add('hidden');
      currentPhoneNumber = null;
    }
  }

  // Sync current chat
  btnSync.addEventListener('click', async () => {
    btnSync.disabled = true;
    btnSync.textContent = 'Synchronizuję...';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'MANUAL_SYNC' });
      addLog(`Sync zakończony`, 'success');
    } catch (e) {
      addLog(`Błąd: ${e.message}`, 'error');
    } finally {
      btnSync.disabled = false;
      btnSync.textContent = 'Synchronizuj ten czat';
      updateCurrentChat();
    }
  });

  // Deep sync - scrolluje w górę i pobiera starsze wiadomości
  btnDeepSync.addEventListener('click', async () => {
    btnDeepSync.disabled = true;
    btnDeepSync.textContent = 'Pobieranie starszych...';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'DEEP_SYNC' });

      if (response.success) {
        addLog(`Deep sync: +${response.inserted} nowych, ${response.skipped} pominięte`, 'success');
        if (response.scrollsPerformed) {
          addLog(`Wykonano ${response.scrollsPerformed} scrolli`, 'success');
        }
      } else {
        addLog(`Błąd: ${response.error}`, 'error');
      }
    } catch (e) {
      addLog(`Błąd: ${e.message}`, 'error');
    } finally {
      btnDeepSync.disabled = false;
      btnDeepSync.textContent = 'Deep Sync (pobierz starsze)';
      updateCurrentChat();
    }
  });

  // Sync all chats
  btnSyncAll.addEventListener('click', async () => {
    if (!confirm('To przejdzie przez wszystkie czaty. WhatsApp Web będzie "klikać" sam. Czy kontynuować?')) {
      return;
    }

    btnSyncAll.disabled = true;
    btnSyncAll.textContent = 'Synchronizuję wszystkie...';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'SYNC_ALL_CHATS' });

      if (response.success) {
        addLog(`Zsynchronizowano ${response.chatsProcessed} czatów`, 'success');
        addLog(`Nowe: ${response.totalInserted}, Pominięte: ${response.totalSkipped}`, 'success');
      } else {
        addLog(`Błąd: ${response.error}`, 'error');
      }
    } catch (e) {
      addLog(`Błąd: ${e.message}`, 'error');
    } finally {
      btnSyncAll.disabled = false;
      btnSyncAll.textContent = 'Synchronizuj wszystkie nowe czaty';
    }
  });

  // Open lead in CRM
  btnOpenLead.addEventListener('click', async () => {
    if (!currentPhoneNumber) {
      addLog('Brak numeru telefonu', 'error');
      return;
    }

    // Pobierz URL CRM z ustawień
    const settings = await new Promise(resolve => {
      chrome.storage.sync.get(['supabaseUrl', 'supabaseKey'], resolve);
    });

    if (!settings.supabaseUrl || !settings.supabaseKey) {
      addLog('Brak konfiguracji Supabase', 'error');
      return;
    }

    // Szukaj leada po numerze telefonu
    const phone = currentPhoneNumber;
    const phoneVariants = [
      phone,
      phone.length === 11 && phone.startsWith('48') ? phone.substring(2) : phone,
      phone.length === 9 ? '48' + phone : phone
    ];

    try {
      // Zapytanie do Supabase
      const query = phoneVariants.map(p => `phone.ilike.%${p}%`).join(',');
      const response = await fetch(
        `${settings.supabaseUrl}/rest/v1/leads?or=(${query})&select=id,name,phone&limit=1`,
        {
          headers: {
            'apikey': settings.supabaseKey,
            'Authorization': `Bearer ${settings.supabaseKey}`
          }
        }
      );

      const leads = await response.json();

      if (leads && leads.length > 0) {
        const lead = leads[0];
        // Otwórz lead w nowej karcie
        const crmUrl = settings.supabaseUrl.replace('.supabase.co', '').replace('https://', '');
        // Zakładamy że CRM jest na tej samej domenie co projekt
        chrome.tabs.create({ url: `https://crm.tomekniedzwiecki.pl/lead.html?id=${lead.id}` });
        addLog(`Otwieram: ${lead.name || lead.phone}`, 'success');
      } else {
        addLog('Nie znaleziono leada', 'error');
        // Otwórz listę leadów z wyszukiwaniem
        chrome.tabs.create({ url: `https://crm.tomekniedzwiecki.pl/leads.html?search=${phone}` });
      }
    } catch (err) {
      addLog(`Błąd: ${err.message}`, 'error');
    }
  });

  // Add log entry
  function addLog(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    logContainer.insertBefore(entry, logContainer.firstChild);

    // Keep only last 20 entries
    while (logContainer.children.length > 20) {
      logContainer.removeChild(logContainer.lastChild);
    }
  }

  // Listen for sync results from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SYNC_RESULT') {
      const { phone, name, success, inserted, skipped, error } = message.data;

      if (success) {
        addLog(`${name || phone}: +${inserted} nowych, ${skipped} pominięte`, 'success');
      } else {
        addLog(`${name || phone}: Błąd - ${error}`, 'error');
      }

      updateCurrentChat();
    }

    if (message.type === 'SYNC_PROGRESS') {
      const { current, total, name } = message.data;
      btnSyncAll.textContent = `Sync ${current}/${total}: ${name}`;
    }
  });

  // Initial update
  updateCurrentChat();

  // Refresh every 2 seconds
  setInterval(updateCurrentChat, 2000);
});
