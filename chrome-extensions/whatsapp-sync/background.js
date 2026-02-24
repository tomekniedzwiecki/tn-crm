// WhatsApp CRM Sync - Background Service Worker

const SCHEDULED_SYNC_ALARM = 'whatsapp-scheduled-sync';
const HEARTBEAT_ALARM = 'whatsapp-heartbeat';
const CHECK_CRM_SETTINGS_ALARM = 'whatsapp-check-crm-settings';
const SYNC_INTERVAL_HOURS = 5;
const HEARTBEAT_INTERVAL_MINUTES = 2;
const CHECK_CRM_INTERVAL_MINUTES = 5;

// Cache dla ustawień
let cachedSettings = null;
let cachedCrmScheduledSync = false;

// Inicjalizacja alarmu dla auto-sync
chrome.runtime.onInstalled.addListener(() => {
  console.log('WhatsApp CRM Sync installed');

  // Ustaw domyślne wartości
  chrome.storage.sync.get(['autoSync', 'scheduledSync'], (result) => {
    if (result.autoSync === undefined) {
      chrome.storage.sync.set({ autoSync: false });
    }
    if (result.scheduledSync === undefined) {
      chrome.storage.sync.set({ scheduledSync: false });
    }
  });

  // Ustaw alarm heartbeat
  chrome.alarms.create(HEARTBEAT_ALARM, {
    periodInMinutes: HEARTBEAT_INTERVAL_MINUTES
  });

  // Ustaw alarm sprawdzania ustawień CRM
  chrome.alarms.create(CHECK_CRM_SETTINGS_ALARM, {
    periodInMinutes: CHECK_CRM_INTERVAL_MINUTES
  });
});

// Uruchom alarmy przy starcie
chrome.storage.sync.get(['scheduledSync'], (result) => {
  if (result.scheduledSync) {
    setupScheduledSync();
  }
});

// Zawsze uruchom heartbeat i check CRM
chrome.alarms.create(HEARTBEAT_ALARM, {
  periodInMinutes: HEARTBEAT_INTERVAL_MINUTES
});
chrome.alarms.create(CHECK_CRM_SETTINGS_ALARM, {
  delayInMinutes: 0.1, // Sprawdź od razu po starcie
  periodInMinutes: CHECK_CRM_INTERVAL_MINUTES
});

// Pobierz ustawienia
async function getSettings() {
  if (cachedSettings) return cachedSettings;

  return new Promise((resolve) => {
    chrome.storage.sync.get(['supabaseUrl', 'supabaseKey', 'syncApiKey', 'syncUser'], (result) => {
      cachedSettings = result;
      resolve(result);
    });
  });
}

// Wyczyść cache ustawień
function clearSettingsCache() {
  cachedSettings = null;
}

// Wyślij heartbeat do CRM
async function sendHeartbeat() {
  const settings = await getSettings();

  if (!settings.supabaseUrl || !settings.supabaseKey || !settings.syncUser) {
    console.log('WhatsApp Sync: Heartbeat skipped - missing settings');
    return;
  }

  const userName = settings.syncUser.charAt(0).toUpperCase() + settings.syncUser.slice(1).toLowerCase();

  try {
    const response = await fetch(
      `${settings.supabaseUrl}/rest/v1/whatsapp_widget_status?user_name=eq.${userName}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': settings.supabaseKey,
          'Authorization': `Bearer ${settings.supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          is_active: true,
          last_seen_at: new Date().toISOString()
        })
      }
    );

    if (response.ok) {
      console.log('WhatsApp Sync: Heartbeat sent for', userName);
    } else {
      console.warn('WhatsApp Sync: Heartbeat failed', response.status);
    }
  } catch (err) {
    console.error('WhatsApp Sync: Heartbeat error', err);
  }
}

// Sprawdź ustawienia scheduled sync w CRM
async function checkCrmSettings() {
  const settings = await getSettings();

  if (!settings.supabaseUrl || !settings.supabaseKey || !settings.syncUser) {
    console.log('WhatsApp Sync: CRM check skipped - missing settings');
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
      const crmEnabled = data[0]?.scheduled_sync_enabled || false;

      console.log('WhatsApp Sync: CRM scheduled_sync_enabled =', crmEnabled, 'for', userName);

      // Jeśli ustawienie w CRM się zmieniło, zaktualizuj lokalne
      if (crmEnabled !== cachedCrmScheduledSync) {
        cachedCrmScheduledSync = crmEnabled;

        if (crmEnabled) {
          setupScheduledSync();
          console.log('WhatsApp Sync: Scheduled sync ENABLED from CRM');
        } else {
          removeScheduledSync();
          console.log('WhatsApp Sync: Scheduled sync DISABLED from CRM');
        }

        // Zaktualizuj też lokalne storage
        chrome.storage.sync.set({ scheduledSync: crmEnabled });
      }
    }
  } catch (err) {
    console.error('WhatsApp Sync: CRM check error', err);
  }
}

// Ustaw alarm dla scheduled sync
function setupScheduledSync() {
  chrome.alarms.create(SCHEDULED_SYNC_ALARM, {
    periodInMinutes: SYNC_INTERVAL_HOURS * 60 // 5 godzin
  });
  console.log(`WhatsApp Sync: Scheduled sync enabled every ${SYNC_INTERVAL_HOURS} hours`);
}

// Usuń alarm
function removeScheduledSync() {
  chrome.alarms.clear(SCHEDULED_SYNC_ALARM);
  console.log('WhatsApp Sync: Scheduled sync disabled');
}

// Obsługa alarmu
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === SCHEDULED_SYNC_ALARM) {
    console.log('WhatsApp Sync: Running scheduled sync...');
    await runScheduledSync();
  }

  if (alarm.name === HEARTBEAT_ALARM) {
    await sendHeartbeat();
  }

  if (alarm.name === CHECK_CRM_SETTINGS_ALARM) {
    await checkCrmSettings();
  }
});

// Wykonaj scheduled sync
async function runScheduledSync() {
  // Znajdź kartę WhatsApp Web
  const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });

  if (tabs.length === 0) {
    console.log('WhatsApp Sync: No WhatsApp Web tab found, skipping scheduled sync');
    return;
  }

  const tab = tabs[0];

  // Aktywuj kartę (żeby była widoczna)
  await chrome.tabs.update(tab.id, { active: true });
  await chrome.windows.update(tab.windowId, { focused: true });

  // Poczekaj chwilę żeby strona była gotowa
  await new Promise(r => setTimeout(r, 2000));

  // Wyślij polecenie sync
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'SYNC_ALL_CHATS' });
    console.log('WhatsApp Sync: Scheduled sync completed', response);

    // Pokaż powiadomienie
    if (response.success) {
      flashBadge(`+${response.totalInserted}`, '#25D366');

      // Zaktualizuj last_sync_at w CRM
      await updateLastSyncTime();
    }
  } catch (err) {
    console.error('WhatsApp Sync: Scheduled sync failed', err);
  }
}

// Zaktualizuj czas ostatniej synchronizacji
async function updateLastSyncTime() {
  const settings = await getSettings();

  if (!settings.supabaseUrl || !settings.supabaseKey || !settings.syncUser) {
    return;
  }

  const userName = settings.syncUser.charAt(0).toUpperCase() + settings.syncUser.slice(1).toLowerCase();

  try {
    await fetch(
      `${settings.supabaseUrl}/rest/v1/whatsapp_widget_status?user_name=eq.${userName}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': settings.supabaseKey,
          'Authorization': `Bearer ${settings.supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          last_sync_at: new Date().toISOString()
        })
      }
    );
  } catch (err) {
    console.error('WhatsApp Sync: Update last_sync_at error', err);
  }
}

// Debugger state
let debuggerAttached = false;
let debuggerTabId = null;

// Nasłuchuj na wiadomości
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SYNC_RESULT') {
    // Przekaż do popup jeśli otwarty
    chrome.runtime.sendMessage(message).catch(() => {
      // Popup nie jest otwarty - ignoruj
    });

    // Zaktualizuj last_sync_at
    updateLastSyncTime();
  }

  // Zwróć ID karty
  if (message.type === 'GET_TAB_ID') {
    sendResponse({ tabId: sender.tab?.id });
    return true;
  }

  // Prawdziwe kliknięcie przez debugger API
  if (message.type === 'REAL_CLICK') {
    const { x, y, tabId } = message;
    performRealClick(tabId, x, y)
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // async response
  }

  // Odłącz debugger
  if (message.type === 'DETACH_DEBUGGER') {
    detachDebugger()
      .then(() => sendResponse({ success: true }))
      .catch(() => sendResponse({ success: false }));
    return true;
  }

  // Włącz/wyłącz scheduled sync (lokalne - z popup)
  if (message.type === 'SET_SCHEDULED_SYNC') {
    if (message.enabled) {
      setupScheduledSync();
    } else {
      removeScheduledSync();
    }
    sendResponse({ success: true });
    return true;
  }

  // Pobierz status następnego sync
  if (message.type === 'GET_NEXT_SYNC') {
    chrome.alarms.get(SCHEDULED_SYNC_ALARM, (alarm) => {
      sendResponse({
        enabled: !!alarm,
        nextSync: alarm ? alarm.scheduledTime : null
      });
    });
    return true;
  }

  // Wyczyść cache ustawień (po zmianie w popup)
  if (message.type === 'SETTINGS_CHANGED') {
    clearSettingsCache();
    sendResponse({ success: true });
    return true;
  }

  return true;
});

// Podłącz debugger do taba
async function attachDebugger(tabId) {
  if (debuggerAttached && debuggerTabId === tabId) {
    return true;
  }

  // Odłącz od poprzedniego taba
  if (debuggerAttached) {
    await detachDebugger();
  }

  return new Promise((resolve, reject) => {
    chrome.debugger.attach({ tabId }, '1.3', () => {
      if (chrome.runtime.lastError) {
        console.error('Debugger attach error:', chrome.runtime.lastError);
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        debuggerAttached = true;
        debuggerTabId = tabId;
        console.log('Debugger attached to tab', tabId);
        resolve(true);
      }
    });
  });
}

// Odłącz debugger
async function detachDebugger() {
  if (!debuggerAttached || !debuggerTabId) {
    return;
  }

  return new Promise((resolve) => {
    chrome.debugger.detach({ tabId: debuggerTabId }, () => {
      debuggerAttached = false;
      debuggerTabId = null;
      console.log('Debugger detached');
      resolve();
    });
  });
}

// Wykonaj prawdziwe kliknięcie
async function performRealClick(tabId, x, y) {
  await attachDebugger(tabId);

  // Mouse down
  await new Promise((resolve, reject) => {
    chrome.debugger.sendCommand({ tabId }, 'Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: x,
      y: y,
      button: 'left',
      clickCount: 1
    }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });

  // Small delay
  await new Promise(r => setTimeout(r, 50));

  // Mouse up
  await new Promise((resolve, reject) => {
    chrome.debugger.sendCommand({ tabId }, 'Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: x,
      y: y,
      button: 'left',
      clickCount: 1
    }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });

  console.log('Real click performed at', x, y);
}

// Cleanup on debugger detach
chrome.debugger.onDetach.addListener((source, reason) => {
  console.log('Debugger detached:', reason);
  debuggerAttached = false;
  debuggerTabId = null;
});

// Badge update
function updateBadge(text, color = '#25D366') {
  chrome.action.setBadgeText({ text: text });
  chrome.action.setBadgeBackgroundColor({ color: color });
}

// Clear badge after 3 seconds
function flashBadge(text, color) {
  updateBadge(text, color);
  setTimeout(() => {
    chrome.action.setBadgeText({ text: '' });
  }, 3000);
}
