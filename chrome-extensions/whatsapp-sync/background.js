// WhatsApp CRM Sync - Background Service Worker

const HEARTBEAT_ALARM = 'whatsapp-heartbeat';
const CHECK_UPDATE_ALARM = 'whatsapp-check-update';
const HEARTBEAT_INTERVAL_MINUTES = 2;
const CHECK_UPDATE_INTERVAL_HOURS = 6;

// Current extension version
const CURRENT_VERSION = chrome.runtime.getManifest().version;
const VERSION_CHECK_URL = 'https://crm.tomekniedzwiecki.pl/whatsapp-extension-version.json';

// Cache for update info
let updateAvailable = null;

// Cache dla ustawień
let cachedSettings = null;

// Inicjalizacja
chrome.runtime.onInstalled.addListener(() => {
  console.log('WhatsApp CRM Sync installed');

  // Ustaw alarm heartbeat
  chrome.alarms.create(HEARTBEAT_ALARM, {
    periodInMinutes: HEARTBEAT_INTERVAL_MINUTES
  });
});

// Zawsze uruchom heartbeat
chrome.alarms.create(HEARTBEAT_ALARM, {
  periodInMinutes: HEARTBEAT_INTERVAL_MINUTES
});

// Ustaw alarm sprawdzania aktualizacji
chrome.alarms.create(CHECK_UPDATE_ALARM, {
  delayInMinutes: 1, // Sprawdź po minucie od startu
  periodInMinutes: CHECK_UPDATE_INTERVAL_HOURS * 60
});

// Sprawdź aktualizacje na starcie
checkForUpdate();

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

// Sprawdź dostępność aktualizacji
async function checkForUpdate() {
  try {
    const response = await fetch(VERSION_CHECK_URL + '?t=' + Date.now(), {
      cache: 'no-store'
    });

    if (!response.ok) {
      console.log('WhatsApp Sync: Version check failed', response.status);
      return;
    }

    const data = await response.json();
    const latestVersion = data.version;

    console.log('WhatsApp Sync: Current version:', CURRENT_VERSION, 'Latest:', latestVersion);

    if (compareVersions(latestVersion, CURRENT_VERSION) > 0) {
      updateAvailable = {
        version: latestVersion,
        downloadUrl: data.downloadUrl,
        changelog: data.changelog
      };
      console.log('WhatsApp Sync: Update available!', updateAvailable);

      // Pokaż badge z powiadomieniem
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#ff9800' });
    } else {
      updateAvailable = null;
    }
  } catch (err) {
    console.error('WhatsApp Sync: Version check error', err);
  }
}

// Porównaj wersje (1.0.0 vs 1.0.1)
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
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

// Obsługa alarmu
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === HEARTBEAT_ALARM) {
    await sendHeartbeat();
  }

  if (alarm.name === CHECK_UPDATE_ALARM) {
    await checkForUpdate();
  }
});

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

  // Wyczyść cache ustawień (po zmianie w popup)
  if (message.type === 'SETTINGS_CHANGED') {
    clearSettingsCache();
    sendResponse({ success: true });
    return true;
  }

  // Sprawdź czy jest dostępna aktualizacja
  if (message.type === 'GET_UPDATE_INFO') {
    sendResponse({
      currentVersion: CURRENT_VERSION,
      updateAvailable: updateAvailable
    });
    return true;
  }

  // Odśwież sprawdzanie aktualizacji
  if (message.type === 'CHECK_UPDATE') {
    checkForUpdate().then(() => {
      sendResponse({
        currentVersion: CURRENT_VERSION,
        updateAvailable: updateAvailable
      });
    });
    return true;
  }

  // Zignoruj powiadomienie o aktualizacji
  if (message.type === 'DISMISS_UPDATE') {
    chrome.action.setBadgeText({ text: '' });
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
