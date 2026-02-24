// WhatsApp CRM Sync - Background Service Worker

// Inicjalizacja alarmu dla auto-sync
chrome.runtime.onInstalled.addListener(() => {
  console.log('WhatsApp CRM Sync installed');

  // Ustaw domyślne wartości
  chrome.storage.sync.get(['autoSync'], (result) => {
    if (result.autoSync === undefined) {
      chrome.storage.sync.set({ autoSync: false });
    }
  });
});

// Nasłuchuj na wiadomości
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SYNC_RESULT') {
    // Przekaż do popup jeśli otwarty
    chrome.runtime.sendMessage(message).catch(() => {
      // Popup nie jest otwarty - ignoruj
    });
  }

  return true;
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
