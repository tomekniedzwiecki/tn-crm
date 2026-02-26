// WhatsApp CRM Sync - Content Script
// Działa na web.whatsapp.com

(function() {
  'use strict';

  // Konfiguracja
  const CONFIG = {
    SUPABASE_URL: '', // Ustaw w popup
    SUPABASE_KEY: '', // Ustaw w popup
    SYNC_API_KEY: '', // Klucz API do whatsapp-sync
    SYNC_USER: 'tomek', // tomek lub maciek
    AUTO_SYNC_INTERVAL: 10000, // 10 sekund - szybszy auto-sync
    SYNC_ON_CHAT_CHANGE: true
  };

  let currentChatPhone = null;
  let issyncing = false;
  let autoSyncEnabled = true; // Zawsze włączone - sync automatyczny
  let lastSyncedHashes = new Set();
  let lastAutoSyncPhone = null; // Track który czat był ostatnio syncowany

  // Sprawdź czy kontekst rozszerzenia jest aktywny
  function isExtensionContextValid() {
    try {
      return chrome.runtime && chrome.runtime.id;
    } catch (e) {
      return false;
    }
  }

  // Ładowanie konfiguracji
  async function loadConfig() {
    if (!isExtensionContextValid()) {
      console.warn('WhatsApp Sync: Extension context invalidated - please refresh the page');
      return;
    }

    return new Promise((resolve) => {
      try {
        chrome.storage.sync.get(['supabaseUrl', 'supabaseKey', 'syncApiKey', 'syncUser', 'autoSync'], (result) => {
          if (chrome.runtime.lastError) {
            console.warn('WhatsApp Sync: Storage error -', chrome.runtime.lastError);
            resolve();
            return;
          }
          if (result.supabaseUrl) CONFIG.SUPABASE_URL = result.supabaseUrl;
          if (result.supabaseKey) CONFIG.SUPABASE_KEY = result.supabaseKey;
          if (result.syncApiKey) CONFIG.SYNC_API_KEY = result.syncApiKey;
          if (result.syncUser) CONFIG.SYNC_USER = result.syncUser;
          // autoSyncEnabled zawsze true - nie czytamy z ustawień
          resolve();
        });
      } catch (e) {
        console.warn('WhatsApp Sync: Extension context invalidated - please refresh the page');
        resolve();
      }
    });
  }

  // Pobierz ID bieżącej karty
  async function getTabId() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_TAB_ID' }, (response) => {
        resolve(response?.tabId || null);
      });
    });
  }

  // Normalizacja numeru telefonu
  function normalizePhoneNumber(phone) {
    if (!phone) return null;
    // Usuń wszystko oprócz cyfr
    let cleaned = phone.replace(/[^0-9]/g, '');
    // Usuń wiodące 00
    cleaned = cleaned.replace(/^00/, '');
    // Jeśli 9 cyfr, dodaj 48
    if (cleaned.length === 9) {
      cleaned = '48' + cleaned;
    }
    return cleaned;
  }

  // Prosty hash MD5-like
  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  // Pobierz numer telefonu z aktywnego czatu
  function getCurrentChatPhone() {
    // Najpierw sprawdź czy #main istnieje
    const mainEl = document.querySelector('#main');
    if (!mainEl) {
      console.log('WhatsApp Sync: #main not found - no chat open');
      return null;
    }

    // Różne selektory headera - WhatsApp często je zmienia
    const headerSelectors = [
      '[data-testid="conversation-header"]',
      'header',
      '[role="banner"]',
      '[data-testid="conversation-panel-header"]'
    ];

    let header = null;
    for (const sel of headerSelectors) {
      header = mainEl.querySelector(sel);
      if (header) {
        console.log('WhatsApp Sync: Found header with selector:', sel);
        break;
      }
    }

    if (!header) {
      // Fallback - użyj pierwszego diva w main jako headera
      const firstChild = mainEl.querySelector('div > div');
      if (firstChild) {
        header = firstChild;
        console.log('WhatsApp Sync: Using fallback header');
      } else {
        console.log('WhatsApp Sync: Header not found in #main');
        return null;
      }
    }

    // Szukaj numeru telefonu w różnych miejscach
    const phonePatterns = [
      /\+?48[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{3}/,
      /\+?\d{10,15}/
    ];

    // Różne selektory dla tytułu/podtytułu
    const titleSelectors = [
      '[data-testid="conversation-info-header-chat-title"]',
      'header span[dir="auto"]',
      'header [title]',
      '#main header span'
    ];

    const subtitleSelectors = [
      '[data-testid="conversation-info-header-subtitle"]',
      'header span[title*="kliknij"]',
      'header span:not([data-testid])'
    ];

    // Sprawdź title
    for (const sel of titleSelectors) {
      const el = header.querySelector(sel);
      if (el) {
        const text = el.textContent || el.getAttribute('title') || '';
        for (const pattern of phonePatterns) {
          const match = text.match(pattern);
          if (match) {
            console.log('WhatsApp Sync: Found phone in title:', match[0]);
            return normalizePhoneNumber(match[0]);
          }
        }
      }
    }

    // Sprawdź subtitle
    for (const sel of subtitleSelectors) {
      const el = header.querySelector(sel);
      if (el) {
        const text = el.textContent || '';
        for (const pattern of phonePatterns) {
          const match = text.match(pattern);
          if (match) {
            console.log('WhatsApp Sync: Found phone in subtitle:', match[0]);
            return normalizePhoneNumber(match[0]);
          }
        }
      }
    }

    // Fallback: sprawdź cały header
    const chatInfo = header.textContent || '';
    for (const pattern of phonePatterns) {
      const match = chatInfo.match(pattern);
      if (match) {
        console.log('WhatsApp Sync: Found phone in header text:', match[0]);
        return normalizePhoneNumber(match[0]);
      }
    }

    console.log('WhatsApp Sync: No phone found in header. Header text:', chatInfo.substring(0, 100));
    return null;
  }

  // Pobierz nazwę kontaktu
  function getCurrentChatName() {
    const titleSelectors = [
      '[data-testid="conversation-info-header-chat-title"]',
      '#main header span[dir="auto"]',
      '#main header [title]'
    ];

    for (const sel of titleSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        const name = el.textContent || el.getAttribute('title');
        if (name && name.trim()) {
          return name.trim();
        }
      }
    }

    const title = document.querySelector('[data-testid="conversation-info-header-chat-title"]');
    return title ? title.textContent.trim() : null;
  }

  // Pobierz wiadomości z aktywnego czatu
  function getMessagesFromChat() {
    const messages = [];

    // Różne selektory dla wiadomości
    const messageSelectors = [
      '[data-testid="msg-container"]',
      '.message-in, .message-out',
      '[data-id*="true_"], [data-id*="false_"]',
      '#main [role="row"]'
    ];

    let messageRows = [];
    for (const sel of messageSelectors) {
      messageRows = document.querySelectorAll(sel);
      if (messageRows.length > 0) {
        console.log('WhatsApp Sync: Found messages with selector:', sel, 'count:', messageRows.length);
        break;
      }
    }

    if (messageRows.length === 0) {
      console.log('WhatsApp Sync: No messages found');
      return messages;
    }

    messageRows.forEach((row) => {
      try {
        // Sprawdź kierunek (wiadomość wysłana vs otrzymana)
        const isOutbound = row.classList.contains('message-out') ||
                          row.querySelector('[data-testid="msg-check"], [data-testid="msg-dblcheck"]') !== null ||
                          row.closest('[class*="message-out"]') !== null ||
                          row.getAttribute('data-id')?.startsWith('true_');

        // Pobierz tekst wiadomości - różne selektory
        const textSelectors = [
          '[data-testid="msg-text"]',
          '.selectable-text',
          'span.selectable-text',
          '[dir="ltr"]'
        ];

        let textEl = null;
        for (const sel of textSelectors) {
          textEl = row.querySelector(sel);
          if (textEl && textEl.textContent.trim()) break;
        }

        if (!textEl) return; // Pomijamy media bez tekstu

        const messageText = textEl.textContent.trim();
        if (!messageText) return;

        // Pobierz timestamp
        const timeSelectors = [
          '[data-testid="msg-meta"] span',
          '[data-testid="msg-time"]',
          '.copyable-text[data-pre-plain-text]',
          'span[dir="auto"]:last-child'
        ];

        let timestamp = null;

        for (const sel of timeSelectors) {
          const timeEl = row.querySelector(sel);
          if (timeEl) {
            // Sprawdź data-pre-plain-text (format: "[14:30, 24.02.2026] Nazwa:")
            const prePlain = timeEl.getAttribute('data-pre-plain-text');
            if (prePlain) {
              const match = prePlain.match(/\[(\d{1,2}:\d{2}),\s*(\d{1,2}\.\d{1,2}\.\d{4})\]/);
              if (match) {
                const [_, time, date] = match;
                const [day, month, year] = date.split('.');
                timestamp = new Date(`${year}-${month}-${day}T${time}:00`).toISOString();
                break;
              }
            }

            const timeText = timeEl.textContent.trim();
            if (timeText && /\d{1,2}:\d{2}/.test(timeText)) {
              timestamp = parseMessageTime(timeText);
              if (timestamp) break;
            }
          }
        }

        if (!timestamp) {
          // Fallback: użyj atrybutu data-timestamp jeśli istnieje
          const dataTimestamp = row.getAttribute('data-timestamp') ||
                               row.closest('[data-timestamp]')?.getAttribute('data-timestamp');
          if (dataTimestamp) {
            timestamp = new Date(parseInt(dataTimestamp)).toISOString();
          }
        }

        if (!timestamp) {
          // Ostateczny fallback: obecny czas
          timestamp = new Date().toISOString();
        }

        const direction = isOutbound ? 'outbound' : 'inbound';
        const hash = simpleHash(`${timestamp}|${direction}|${messageText}`);

        messages.push({
          message_text: messageText,
          message_timestamp: timestamp,
          direction: direction,
          message_hash: hash
        });
      } catch (e) {
        console.error('Error parsing message:', e);
      }
    });

    // Dodaj milisekundy do wiadomości z tym samym timestampem (zachowaj kolejność DOM)
    const timestampCounts = {};
    messages.forEach((msg, index) => {
      const baseTs = msg.message_timestamp;
      if (!timestampCounts[baseTs]) {
        timestampCounts[baseTs] = 0;
      }
      const offset = timestampCounts[baseTs];
      timestampCounts[baseTs]++;

      // Jeśli są duplikaty, dodaj milisekundy bazując na kolejności
      if (offset > 0 || messages.filter(m => m.message_timestamp === baseTs).length > 1) {
        const date = new Date(baseTs);
        date.setMilliseconds(offset * 100); // 0, 100, 200, ... ms
        msg.message_timestamp = date.toISOString();
        // Przelicz hash z nowym timestampem
        msg.message_hash = simpleHash(`${msg.message_timestamp}|${msg.direction}|${msg.message_text}`);
      }
    });

    console.log('WhatsApp Sync: Parsed', messages.length, 'messages');
    return messages;
  }

  // Parse time z formatu WhatsApp
  function parseMessageTime(timeText) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Format 24h: "14:30"
    let match = timeText.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);

      // Sprawdź czy AM/PM
      if (timeText.toLowerCase().includes('pm') && hours < 12) {
        today.setHours(hours + 12, minutes, 0, 0);
      } else if (timeText.toLowerCase().includes('am') && hours === 12) {
        today.setHours(0, minutes, 0, 0);
      } else {
        today.setHours(hours, minutes, 0, 0);
      }

      return today.toISOString();
    }

    return null;
  }

  // Wyślij wiadomości do CRM
  async function syncMessages(messages, phoneNumber, contactName) {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_KEY) {
      console.error('WhatsApp Sync: Brak konfiguracji Supabase');
      return { success: false, error: 'Brak konfiguracji' };
    }

    if (!phoneNumber) {
      console.error('WhatsApp Sync: Nie udało się pobrać numeru telefonu');
      return { success: false, error: 'Brak numeru telefonu' };
    }

    if (messages.length === 0) {
      return { success: true, inserted: 0, skipped: 0 };
    }

    // Dodaj phone_number, contact_name i synced_by do każdej wiadomości
    const messagesWithPhone = messages.map(msg => ({
      ...msg,
      phone_number: phoneNumber,
      contact_name: contactName,
      synced_by: CONFIG.SYNC_USER
    }));

    // Filtruj już zsynchronizowane
    const newMessages = messagesWithPhone.filter(msg =>
      !lastSyncedHashes.has(msg.message_hash)
    );

    if (newMessages.length === 0) {
      return { success: true, inserted: 0, skipped: messages.length };
    }

    try {
      const response = await fetch(`${CONFIG.SUPABASE_URL}/functions/v1/whatsapp-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
          'x-whatsapp-sync-key': CONFIG.SYNC_API_KEY
        },
        body: JSON.stringify({ messages: newMessages })
      });

      const result = await response.json();

      if (result.success) {
        // Zapamiętaj zsynchronizowane hashe
        newMessages.forEach(msg => lastSyncedHashes.add(msg.message_hash));
      }

      return result;
    } catch (error) {
      console.error('WhatsApp Sync error:', error);
      return { success: false, error: error.message };
    }
  }

  // Główna funkcja sync
  async function performSync() {
    if (issyncing) return;
    issyncing = true;

    try {
      await loadConfig();

      const phoneNumber = getCurrentChatPhone();
      const contactName = getCurrentChatName();
      const messages = getMessagesFromChat();

      console.log(`WhatsApp Sync: Found ${messages.length} messages for ${phoneNumber || 'unknown'}`);

      if (phoneNumber && messages.length > 0) {
        const result = await syncMessages(messages, phoneNumber, contactName);
        console.log('WhatsApp Sync result:', result);

        // Wyślij wynik do popup
        chrome.runtime.sendMessage({
          type: 'SYNC_RESULT',
          data: {
            phone: phoneNumber,
            name: contactName,
            ...result
          }
        });
      }
    } catch (error) {
      console.error('WhatsApp Sync error:', error);
    } finally {
      issyncing = false;
    }
  }

  // Obserwuj zmiany czatu
  function observeChatChanges() {
    let injectTimeout = null;
    let lastInjectedPhone = null;

    const observer = new MutationObserver((mutations) => {
      const newPhone = getCurrentChatPhone();
      if (!newPhone) return;

      // Sprawdź czy przyciski i info są kompletne
      const hasButtons = document.getElementById('crm-deep-sync-btn') && document.getElementById('crm-open-lead-btn');
      const hasLeadInfo = document.getElementById('crm-lead-info');
      const leadInfoHasContent = hasLeadInfo && hasLeadInfo.innerHTML.trim().length > 0;

      // Wstrzyknij jeśli brakuje przycisków lub info, lub zmienił się numer
      const needsRefresh = !hasButtons || !leadInfoHasContent || lastInjectedPhone !== newPhone;

      if (needsRefresh) {
        clearTimeout(injectTimeout);
        injectTimeout = setTimeout(() => {
          lastInjectedPhone = newPhone;
          injectSyncButton();
        }, 300);
      }

      // Wykryj zmianę czatu
      if (newPhone !== currentChatPhone) {
        currentChatPhone = newPhone;
        console.log('WhatsApp Sync: Chat changed to', newPhone);

        // Wymuś odświeżenie przy zmianie czatu
        clearTimeout(injectTimeout);
        injectTimeout = setTimeout(() => {
          lastInjectedPhone = newPhone;
          injectSyncButton();
        }, 400);

        if (autoSyncEnabled && CONFIG.SYNC_ON_CHAT_CHANGE) {
          setTimeout(performSync, 1000);
        }
      }
    });

    // Obserwuj zmiany w głównym kontenerze
    const mainContainer = document.getElementById('main');
    if (mainContainer) {
      observer.observe(mainContainer, {
        childList: true,
        subtree: true,
        attributes: true
      });
    }

    // Obserwuj cały app - żeby wykryć też gdy #main się pojawi
    const appContainer = document.getElementById('app');
    if (appContainer) {
      observer.observe(appContainer, {
        childList: true,
        subtree: true
      });
    }

    // Backup: sprawdzaj co 2 sekundy czy trzeba wstrzyknąć przyciski
    setInterval(() => {
      const phone = getCurrentChatPhone();
      if (phone) {
        const hasButtons = document.getElementById('crm-deep-sync-btn');
        const hasLeadInfo = document.getElementById('crm-lead-info');
        const leadInfoHasContent = hasLeadInfo && hasLeadInfo.innerHTML.trim().length > 0;

        if (!hasButtons || !leadInfoHasContent) {
          console.log('WhatsApp Sync: Backup check - injecting buttons');
          injectSyncButton();
        }
      }
    }, 2000);
  }

  // Auto-sync co X sekund
  function startAutoSync() {
    setInterval(async () => {
      await loadConfig();
      if (!autoSyncEnabled) return;

      const currentPhone = getCurrentChatPhone();
      if (!currentPhone) return; // Brak otwartego czatu

      // Sync tylko widoczne wiadomości (bez scrollowania)
      performSync();

      // Log jeśli zmienił się czat
      if (lastAutoSyncPhone !== currentPhone) {
        console.log('WhatsApp Auto-Sync: Nowy czat -', currentPhone);
        lastAutoSyncPhone = currentPhone;
      }
    }, CONFIG.AUTO_SYNC_INTERVAL);
  }

  // Deep sync - scrolluje w górę i pobiera starsze wiadomości
  // Opcjonalnie można przekazać phone i name jeśli są już znane
  // skipLock = true pomija sprawdzenie issyncing (używane przez syncAllChats)
  async function performDeepSync(knownPhone = null, knownName = null, skipLock = false) {
    if (!skipLock && issyncing) return { success: false, error: 'Sync w trakcie' };
    if (!skipLock) issyncing = true;

    await loadConfig();
    const phoneNumber = knownPhone || getCurrentChatPhone();
    const contactName = knownName || getCurrentChatName();

    if (!phoneNumber) {
      if (!skipLock) issyncing = false;
      console.log('WhatsApp Sync: performDeepSync - no phone number found');
      return { success: false, error: 'Brak numeru telefonu' };
    }

    console.log('WhatsApp Sync: performDeepSync for', phoneNumber, contactName);

    // Znajdź kontener wiadomości do scrollowania
    const messageContainerSelectors = [
      '[data-testid="conversation-panel-messages"]',
      '#main [role="application"]',
      '#main .copyable-area',
      '#main > div > div > div._akbu'
    ];

    let messageContainer = null;
    for (const sel of messageContainerSelectors) {
      messageContainer = document.querySelector(sel);
      if (messageContainer && messageContainer.scrollHeight > messageContainer.clientHeight) {
        break;
      }
    }

    if (!messageContainer) {
      // Fallback - szukaj scrollowalnego elementu w #main
      const mainEl = document.querySelector('#main');
      if (mainEl) {
        messageContainer = Array.from(mainEl.querySelectorAll('div')).find(
          el => el.scrollHeight > el.clientHeight + 100 && el.clientHeight > 200
        );
      }
    }

    if (!messageContainer) {
      console.log('WhatsApp Sync: Could not find scrollable container');
      const messages = getMessagesFromChat();
      const result = await syncMessages(messages, phoneNumber, contactName);
      if (!skipLock) issyncing = false;
      return result;
    }

    console.log('WhatsApp Sync: Starting deep sync - scrolling until we hit synced messages');

    let totalInserted = 0;
    let totalSkipped = 0;
    let scrollAttempts = 0;
    let consecutiveNoNewMessages = 0;
    const maxScrollAttempts = 100; // Max 100 scrolli

    // Najpierw sync bieżących wiadomości
    let messages = getMessagesFromChat();
    let result = await syncMessages(messages, phoneNumber, contactName);
    totalInserted += result.inserted || 0;
    totalSkipped += result.skipped || 0;

    console.log(`WhatsApp Sync: Initial sync - ${result.inserted || 0} new, ${result.skipped || 0} skipped`);

    // Jeśli już na starcie wszystko było zduplikowane, możemy skończyć
    if (result.inserted === 0 && messages.length > 10) {
      console.log('WhatsApp Sync: All messages already synced, no need to scroll');
      if (!skipLock) issyncing = false;
      return { success: true, inserted: 0, skipped: totalSkipped, scrolls: 0 };
    }

    // Scrolluj w górę aż trafimy na zsynchronizowane wiadomości
    while (scrollAttempts < maxScrollAttempts) {
      scrollAttempts++;

      // Scroll to top
      const previousScrollTop = messageContainer.scrollTop;
      messageContainer.scrollTop = 0;

      // Poczekaj na załadowanie nowych wiadomości
      await new Promise(r => setTimeout(r, 1000));

      // Pobierz wiadomości
      messages = getMessagesFromChat();

      // Sync i sprawdź ile było nowych
      result = await syncMessages(messages, phoneNumber, contactName);
      const newInThisScroll = result.inserted || 0;
      totalInserted += newInThisScroll;
      totalSkipped += result.skipped || 0;

      console.log(`WhatsApp Sync: Scroll ${scrollAttempts}, messages: ${messages.length}, new: ${newInThisScroll}`);

      // Wyślij progress do popup
      if (isExtensionContextValid()) {
        chrome.runtime.sendMessage({
          type: 'SYNC_PROGRESS',
          data: {
            phone: phoneNumber,
            scroll: scrollAttempts,
            messages: messages.length,
            inserted: totalInserted
          }
        }).catch(() => {});
      }

      // Jeśli w tym scrollu nie było żadnych nowych wiadomości = trafiamy na zsynchronizowane
      if (newInThisScroll === 0) {
        consecutiveNoNewMessages++;
        console.log(`WhatsApp Sync: No new messages (${consecutiveNoNewMessages} consecutive)`);

        // Po 3 scrollach bez nowych wiadomości - kończymy
        if (consecutiveNoNewMessages >= 3) {
          console.log('WhatsApp Sync: Reached synced messages, stopping');
          break;
        }
      } else {
        consecutiveNoNewMessages = 0;
      }

      // Sprawdź czy dotarliśmy do góry konwersacji
      if (messageContainer.scrollTop === previousScrollTop && previousScrollTop === 0) {
        console.log('WhatsApp Sync: Reached top of conversation');
        break;
      }
    }

    if (!skipLock) issyncing = false;

    // Wyczyść cache statusu sync dla tego numeru
    clearSyncStatusCache(phoneNumber);

    console.log(`WhatsApp Sync: Deep sync complete - ${totalInserted} new, ${totalSkipped} skipped, ${scrollAttempts} scrolls`);

    return {
      success: true,
      inserted: totalInserted,
      skipped: totalSkipped,
      scrolls: scrollAttempts
    };
  }

  // Nasłuchuj na wiadomości z popup
  if (isExtensionContextValid()) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!isExtensionContextValid()) {
        sendResponse({ success: false, error: 'Extension context invalidated - refresh page' });
        return true;
      }

      if (message.type === 'MANUAL_SYNC') {
        performSync().then(() => {
          sendResponse({ success: true });
        });
        return true; // async response
      }

      if (message.type === 'DEEP_SYNC') {
        performDeepSync().then(sendResponse);
        return true;
      }

      if (message.type === 'GET_CURRENT_CHAT') {
        sendResponse({
          phone: getCurrentChatPhone(),
          name: getCurrentChatName(),
          messageCount: getMessagesFromChat().length
        });
        return true;
      }

      if (message.type === 'SYNC_ALL_CHATS') {
        syncAllChats().then(sendResponse);
        return true;
      }

      // AI - pobierz wiadomości w formacie dla AI
      if (message.type === 'GET_MESSAGES_FOR_AI') {
        const messages = getMessagesFromChat();
        const formattedMessages = messages.map(m => ({
          direction: m.direction,
          message_text: m.message_text,
          message_timestamp: m.message_timestamp
        }));
        sendResponse({
          messages: formattedMessages,
          contact_name: getCurrentChatName(),
          phone_number: getCurrentChatPhone()
        });
        return true;
      }

      // AI - wklej odpowiedź do czatu
      if (message.type === 'PASTE_AI_REPLY') {
        const inputSelectors = [
          '[data-testid="conversation-compose-box-input"]',
          'div[contenteditable="true"][data-tab="10"]',
          '#main footer div[contenteditable="true"]',
          'div[contenteditable="true"][role="textbox"]'
        ];

        let inputEl = null;
        for (const sel of inputSelectors) {
          inputEl = document.querySelector(sel);
          if (inputEl) break;
        }

        if (inputEl) {
          inputEl.focus();
          // Użyj document.execCommand dla kompatybilności z contenteditable
          document.execCommand('insertText', false, message.text);
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'Nie znaleziono pola wiadomości' });
        }
        return true;
      }
    });
  }

  // Sync wszystkich czatów - synchronizuje niezsynchronizowane czaty
  async function syncAllChats() {
    await loadConfig();

    // Pobierz limit z ustawień
    const settings = await new Promise(resolve => {
      chrome.storage.sync.get(['syncAllLimit'], resolve);
    });
    const syncAllLimit = settings.syncAllLimit || 0; // 0 = brak limitu
    console.log('WhatsApp Sync: syncAllLimit =', syncAllLimit);

    const sidePanel = document.querySelector('#pane-side');
    if (!sidePanel) {
      return { success: false, error: 'Nie znaleziono panelu bocznego' };
    }

    console.log('WhatsApp Sync: Starting sync all chats');

    const results = [];
    let totalInserted = 0;
    let totalSkipped = 0;
    let consecutiveSynced = 0; // Ile czatów z rzędu było już zsynchronizowanych
    let chatIndex = 0;
    let scrollPosition = 0;
    const maxChats = 200; // Absolutny limit bezpieczeństwa
    const processedPhones = new Set(); // Unikaj duplikatów

    // Funkcja do znalezienia czatów z czerwonym wskaźnikiem "Sync" (niezsynchronizowanych)
    function findUnsyncedChats() {
      const allSyncBtns = sidePanel.querySelectorAll('.crm-quick-sync-btn');
      const unsyncedChats = [];

      allSyncBtns.forEach(btn => {
        const phone = btn.dataset.phone;
        if (phone && !processedPhones.has(phone)) {
          // Znajdź element czatu
          let chatEl = btn.closest('[tabindex="-1"]') || btn.closest('[data-testid="cell-frame-container"]')?.parentElement;
          if (chatEl) {
            unsyncedChats.push({ chatEl, phone });
          }
        }
      });

      return unsyncedChats;
    }

    // Funkcja do znalezienia wszystkich czatów
    function findAllChatItems() {
      const chatContainers = sidePanel.querySelectorAll('[data-testid="cell-frame-container"]');
      return Array.from(chatContainers).map(el => el.parentElement || el);
    }

    const tabId = await getTabId();
    let noMoreUnsyncedScrolls = 0;

    while (chatIndex < maxChats) {
      // Sprawdź limit zapisanych wiadomości
      if (syncAllLimit > 0 && totalInserted >= syncAllLimit) {
        console.log(`WhatsApp Sync: Reached syncAllLimit (${syncAllLimit}), stopping`);
        break;
      }

      // Sprawdź czy 5 czatów z rzędu było zsynchronizowanych
      if (consecutiveSynced >= 5) {
        console.log('WhatsApp Sync: 5 consecutive synced chats, stopping');
        break;
      }

      // Znajdź niezsynchronizowane czaty (z czerwonym przyciskiem Sync)
      let unsyncedChats = findUnsyncedChats();

      if (unsyncedChats.length === 0) {
        // Brak niezsynchronizowanych - scrolluj w dół
        console.log('WhatsApp Sync: No unsynced chats visible, scrolling down...');

        const previousScrollTop = sidePanel.scrollTop;
        sidePanel.scrollTop = sidePanel.scrollTop + 500;
        await new Promise(r => setTimeout(r, 1000));

        // Poczekaj na wstrzyknięcie wskaźników
        await new Promise(r => setTimeout(r, 1500));

        // Sprawdź ponownie
        unsyncedChats = findUnsyncedChats();

        if (unsyncedChats.length === 0) {
          noMoreUnsyncedScrolls++;
          console.log(`WhatsApp Sync: Still no unsynced after scroll (${noMoreUnsyncedScrolls})`);

          // Jeśli scroll się nie zmienił lub 3 scrolle bez niezsynchronizowanych
          if (sidePanel.scrollTop === previousScrollTop || noMoreUnsyncedScrolls >= 3) {
            console.log('WhatsApp Sync: No more unsynced chats to find');
            break;
          }
          continue;
        } else {
          noMoreUnsyncedScrolls = 0;
        }
      }

      // Weź pierwszy niezsynchronizowany czat
      const { chatEl, phone } = unsyncedChats[0];
      const syncBtn = chatEl.querySelector('.crm-quick-sync-btn');
      processedPhones.add(phone);
      chatIndex++;

      try {
        // Zmień ikonę na loading
        if (syncBtn) {
          syncBtn.style.background = '#25D366';
          syncBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;">
              <circle cx="12" cy="12" r="10" stroke-dasharray="50" stroke-dashoffset="10"/>
            </svg>
            <span>...</span>
          `;
        }

        // Scrolluj do elementu jeśli nie jest widoczny
        const rect = chatEl.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
          chatEl.scrollIntoView({ block: 'center' });
          await new Promise(r => setTimeout(r, 300));
        }

        const newRect = chatEl.getBoundingClientRect();
        const centerX = Math.round(newRect.left + newRect.width / 2);
        const centerY = Math.round(newRect.top + newRect.height / 2);

        console.log(`WhatsApp Sync: Clicking chat ${chatIndex} (${phone})`);

        // Kliknij przez debugger API
        await new Promise((resolve) => {
          chrome.runtime.sendMessage({
            type: 'REAL_CLICK',
            x: centerX,
            y: centerY,
            tabId: tabId
          }, resolve);
        });

        // Poczekaj na załadowanie czatu
        await new Promise(r => setTimeout(r, 2000));

        // Deep Sync - pobierz wszystkie wiadomości
        const chatPhone = getCurrentChatPhone();
        const name = getCurrentChatName();

        if (chatPhone) {
          // Użyj deep sync zamiast zwykłego sync (skipLock = true bo już jesteśmy w pętli)
          const result = await performDeepSync(chatPhone, name, true);
          const newMessages = result.inserted || 0;

          results.push({ phone: chatPhone, name, ...result });
          totalInserted += newMessages;
          totalSkipped += result.skipped || 0;

          console.log(`WhatsApp Sync: Chat ${chatIndex} (${name || chatPhone}): +${newMessages} new, ${result.skipped || 0} skipped`);

          // Zmień ikonę na zielony checkmark
          if (syncBtn) {
            const indicator = syncBtn.parentElement;
            if (indicator) {
              indicator.innerHTML = `
                <div style="
                  background: rgba(37, 211, 102, 0.15);
                  border-radius: 4px;
                  padding: 4px 6px;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                " title="CRM: zsynchronizowane (+${newMessages})">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              `;
            }
          }

          // Sprawdź czy były nowe wiadomości
          if (newMessages === 0) {
            consecutiveSynced++;
            console.log(`WhatsApp Sync: Already synced (${consecutiveSynced} consecutive)`);
          } else {
            consecutiveSynced = 0;
          }

          // Wyczyść cache statusu dla tego numeru
          clearSyncStatusCache(chatPhone);

          // Powiadom popup
          if (isExtensionContextValid()) {
            chrome.runtime.sendMessage({
              type: 'SYNC_PROGRESS',
              data: {
                current: chatIndex,
                total: '?',
                name: name || chatPhone,
                inserted: totalInserted
              }
            }).catch(() => {});
          }

          // Sprawdź limit po każdym syncu
          if (syncAllLimit > 0 && totalInserted >= syncAllLimit) {
            console.log(`WhatsApp Sync: Reached syncAllLimit (${syncAllLimit}) after this chat`);
            break;
          }
        } else {
          console.log(`WhatsApp Sync: Chat ${chatIndex}: no phone, skipping`);
        }

        // Przerwa między czatami
        await new Promise(r => setTimeout(r, 800));

      } catch (err) {
        console.error('WhatsApp Sync: Error processing chat', chatIndex, err);
        // Przywróć ikonę błędu
        if (syncBtn) {
          syncBtn.style.background = '#ff5252';
          syncBtn.innerHTML = `<span>Błąd</span>`;
        }
      }
    }

    // Odłącz debugger po zakończeniu
    if (isExtensionContextValid()) {
      chrome.runtime.sendMessage({ type: 'DETACH_DEBUGGER' }).catch(() => {});
    }

    let reason = 'Zakończono';
    if (syncAllLimit > 0 && totalInserted >= syncAllLimit) {
      reason = `Osiągnięto limit ${syncAllLimit} zapisanych`;
    } else if (consecutiveSynced >= 5) {
      reason = 'Dotarliśmy do zsynchronizowanych czatów';
    } else if (chatIndex >= maxChats) {
      reason = 'Osiągnięto max limit czatów';
    } else {
      reason = 'Brak więcej niezsynchronizowanych czatów';
    }

    console.log(`WhatsApp Sync: Complete - ${results.length} chats, ${totalInserted} new messages. ${reason}`);

    return {
      success: true,
      chatsProcessed: results.length,
      totalInserted,
      totalSkipped,
      reason,
      details: results
    };
  }

  // Cache dla statusów sync (phone -> boolean)
  let syncStatusCache = {};
  let syncStatusCheckInProgress = false;

  // Cache dla danych leadów (phone -> lead data)
  let leadDataCache = {};

  // Pipeline stages - ładowane z ustawień
  let pipelineStages = [];
  let pipelineStagesLoaded = false;

  // Załaduj pipeline stages z ustawień
  async function loadPipelineStages() {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_KEY) return;

    try {
      const response = await fetch(
        `${CONFIG.SUPABASE_URL}/rest/v1/settings?key=eq.pipeline_stages&select=value`,
        {
          headers: {
            'apikey': CONFIG.SUPABASE_KEY,
            'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0 && data[0].value) {
          pipelineStages = data[0].value;
          console.log('WhatsApp Sync: Loaded pipeline stages:', pipelineStages);
        }
      }
    } catch (err) {
      console.error('WhatsApp Sync: Error loading pipeline stages', err);
    }
  }

  // Pobierz nazwę statusu
  function getStatusName(statusId) {
    if (statusId === 'won') return 'Wygrany';
    if (statusId === 'lost') return 'Przegrany';
    if (statusId === 'abandoned') return 'Porzucony';
    const stage = pipelineStages.find(s => s.id === statusId);
    return stage?.name || statusId || 'Nowy';
  }

  // Pobierz kolor statusu
  function getStatusColor(statusId) {
    if (statusId === 'won') return '#22c55e';
    if (statusId === 'lost') return '#ef4444';
    if (statusId === 'abandoned') return '#71717a';
    const stageIndex = pipelineStages.findIndex(s => s.id === statusId);
    const colors = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#06b6d4', '#ec4899'];
    return colors[stageIndex % colors.length] || '#71717a';
  }

  // Oblicz czas od daty (np. "3d", "2tyg", "1mies")
  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'dziś';
    if (diffDays === 1) return '1d';
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}tyg`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mies`;
    return `${Math.floor(diffDays / 365)}r`;
  }

  // Formatuj datę (DD.MM)
  function formatShortDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
  }

  // Aktualizuj status leada (przez Edge Function)
  async function updateLeadStatus(leadId, newStatus) {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SYNC_API_KEY || !leadId || !newStatus) return null;

    try {
      const response = await fetch(
        `${CONFIG.SUPABASE_URL}/functions/v1/whatsapp-lead-update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-sync-api-key': CONFIG.SYNC_API_KEY
          },
          body: JSON.stringify({ leadId, status: newStatus })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Wyczyść cache dla tego leada
          Object.keys(leadDataCache).forEach(key => {
            if (leadDataCache[key]?.id === leadId) {
              leadDataCache[key].status = newStatus;
            }
          });
          return data.lead;
        }
      }
    } catch (err) {
      console.error('WhatsApp Sync: Error updating lead status', err);
    }
    return null;
  }

  // ============ OFFER MODAL ============

  // Cache dla ofert
  let offersCache = null;

  // Pobierz listę ofert
  async function fetchOffers() {
    if (offersCache) return offersCache;
    if (!CONFIG.SUPABASE_URL || !CONFIG.SYNC_API_KEY) return [];

    try {
      const response = await fetch(
        `${CONFIG.SUPABASE_URL}/functions/v1/whatsapp-offers`,
        { headers: { 'x-sync-api-key': CONFIG.SYNC_API_KEY } }
      );

      if (response.ok) {
        const data = await response.json();
        offersCache = data.offers || [];
        return offersCache;
      }
    } catch (err) {
      console.error('WhatsApp Sync: Error fetching offers', err);
    }
    return [];
  }

  // Utwórz client offer
  async function createClientOffer(leadId, offerId, offerType, validDays, customPrice) {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SYNC_API_KEY) return null;

    try {
      const response = await fetch(
        `${CONFIG.SUPABASE_URL}/functions/v1/whatsapp-create-offer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-sync-api-key': CONFIG.SYNC_API_KEY
          },
          body: JSON.stringify({ leadId, offerId, offerType, validDays, customPrice: customPrice || null })
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (err) {
      console.error('WhatsApp Sync: Error creating offer', err);
    }
    return null;
  }

  // Pobierz istniejącą ofertę dla leada
  async function fetchExistingOffer(leadId) {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SYNC_API_KEY || !leadId) return null;

    try {
      const response = await fetch(
        `${CONFIG.SUPABASE_URL}/functions/v1/whatsapp-client-offer?leadId=${leadId}`,
        { headers: { 'x-sync-api-key': CONFIG.SYNC_API_KEY } }
      );

      if (response.ok) {
        const data = await response.json();
        return data.exists ? data.clientOffer : null;
      }
    } catch (err) {
      console.error('WhatsApp Sync: Error fetching existing offer', err);
    }
    return null;
  }

  // Usuń ofertę dla leada
  async function deleteClientOffer(leadId) {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SYNC_API_KEY || !leadId) return false;

    try {
      const response = await fetch(
        `${CONFIG.SUPABASE_URL}/functions/v1/whatsapp-client-offer?leadId=${leadId}`,
        {
          method: 'DELETE',
          headers: { 'x-sync-api-key': CONFIG.SYNC_API_KEY }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.success;
      }
    } catch (err) {
      console.error('WhatsApp Sync: Error deleting offer', err);
    }
    return false;
  }

  // Pokaż modal z zarządzaniem istniejącą ofertą
  function showExistingOfferModal(leadId, leadName, existingOffer) {
    const modal = document.createElement('div');
    modal.id = 'crm-offer-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const offerName = existingOffer.offer?.name || 'Oferta';
    const offerPrice = existingOffer.custom_price || existingOffer.offer?.price || 0;
    const validUntil = existingOffer.valid_until ? new Date(existingOffer.valid_until).toLocaleDateString('pl-PL') : '-';
    const createdAt = existingOffer.created_at ? new Date(existingOffer.created_at).toLocaleDateString('pl-PL') : '-';

    modal.innerHTML = `
      <div style="
        background: #0a0a0a;
        border: 1px solid #262626;
        border-radius: 12px;
        width: 380px;
        max-width: 90vw;
        overflow: hidden;
      ">
        <!-- Header -->
        <div style="
          padding: 16px 20px;
          border-bottom: 1px solid #262626;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <div>
            <h3 style="color: #fafafa; font-size: 14px; font-weight: 600; margin: 0;">Aktywna oferta</h3>
            <p style="color: #71717a; font-size: 12px; margin: 4px 0 0;">${leadName || 'Lead'}</p>
          </div>
          <button id="crm-offer-close" style="
            background: none;
            border: none;
            color: #71717a;
            cursor: pointer;
            padding: 4px;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Info -->
        <div style="padding: 20px;">
          <div style="
            background: #052e16;
            border: 1px solid #166534;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
          ">
            <div style="color: #22c55e; font-size: 13px; font-weight: 600; margin-bottom: 8px;">
              ${offerName}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
              <div>
                <span style="color: #71717a;">Cena:</span>
                <span style="color: #86efac; font-weight: 600;"> ${offerPrice.toLocaleString('pl-PL')} PLN</span>
              </div>
              <div>
                <span style="color: #71717a;">Typ:</span>
                <span style="color: #86efac;"> ${existingOffer.offer_type === 'starter' ? 'Startowy' : 'Pełen pakiet'}</span>
              </div>
              <div>
                <span style="color: #71717a;">Ważna do:</span>
                <span style="color: #86efac;"> ${validUntil}</span>
              </div>
              <div>
                <span style="color: #71717a;">Utworzona:</span>
                <span style="color: #86efac;"> ${createdAt}</span>
              </div>
            </div>
          </div>

          <!-- URL -->
          <div style="margin-bottom: 16px;">
            <label style="display: block; color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Link do oferty</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="crm-offer-url" readonly value="${existingOffer.url}" style="
                flex: 1;
                background: #171717;
                border: 1px solid #262626;
                border-radius: 6px;
                padding: 10px 12px;
                color: #a1a1aa;
                font-size: 11px;
                font-family: monospace;
                outline: none;
              ">
              <button id="crm-offer-copy" style="
                background: #262626;
                border: 1px solid #3f3f46;
                border-radius: 6px;
                padding: 8px 12px;
                color: #fafafa;
                font-size: 11px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
              ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Kopiuj
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; gap: 8px;">
            <button id="crm-offer-open" style="
              flex: 1;
              background: #262626;
              color: #fafafa;
              border: 1px solid #3f3f46;
              border-radius: 8px;
              padding: 10px;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              Otwórz
            </button>
            <button id="crm-offer-delete" style="
              background: transparent;
              color: #ef4444;
              border: 1px solid #7f1d1d;
              border-radius: 8px;
              padding: 10px 16px;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Usuń
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event handlers
    modal.querySelector('#crm-offer-close').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    modal.querySelector('#crm-offer-open').onclick = () => {
      window.open(existingOffer.url, '_blank');
    };

    modal.querySelector('#crm-offer-copy').onclick = () => {
      const urlInput = modal.querySelector('#crm-offer-url');
      urlInput.select();
      document.execCommand('copy');
      const copyBtn = modal.querySelector('#crm-offer-copy');
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Skopiowano
      `;
      setTimeout(() => {
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Kopiuj
        `;
      }, 1500);
    };

    modal.querySelector('#crm-offer-delete').onclick = async () => {
      if (!confirm('Czy na pewno chcesz usunąć tę ofertę? Link przestanie działać.')) return;

      const deleteBtn = modal.querySelector('#crm-offer-delete');
      deleteBtn.disabled = true;
      deleteBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
        </svg>
        Usuwanie...
      `;

      const success = await deleteClientOffer(leadId);

      if (success) {
        modal.remove();
        // Otwórz modal tworzenia nowej oferty
        showCreateOfferModal(leadId, leadName);
      } else {
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Usuń
        `;
        alert('Błąd podczas usuwania oferty');
      }
    };

    // ESC to close
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  }

  // Pokaż modal z tworzeniem oferty
  async function showOfferModal(leadId, leadName) {
    // Usuń istniejący modal
    const existingModal = document.getElementById('crm-offer-modal');
    if (existingModal) existingModal.remove();

    // Najpierw sprawdź czy lead ma już ofertę
    const existingOffer = await fetchExistingOffer(leadId);
    if (existingOffer) {
      showExistingOfferModal(leadId, leadName, existingOffer);
      return;
    }

    // Brak oferty - pokaż modal tworzenia
    showCreateOfferModal(leadId, leadName);
  }

  // Modal tworzenia nowej oferty
  async function showCreateOfferModal(leadId, leadName) {
    // Usuń istniejący modal
    const existingModal = document.getElementById('crm-offer-modal');
    if (existingModal) existingModal.remove();

    // Pobierz oferty
    const offers = await fetchOffers();
    if (!offers.length) {
      alert('Brak dostępnych ofert');
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'crm-offer-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const defaultOffer = offers.find(o => o.is_default) || offers[0];

    modal.innerHTML = `
      <div style="
        background: #0a0a0a;
        border: 1px solid #262626;
        border-radius: 12px;
        width: 380px;
        max-width: 90vw;
        overflow: hidden;
      ">
        <!-- Header -->
        <div style="
          padding: 16px 20px;
          border-bottom: 1px solid #262626;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <div>
            <h3 style="color: #fafafa; font-size: 14px; font-weight: 600; margin: 0;">Wyślij ofertę</h3>
            <p style="color: #71717a; font-size: 12px; margin: 4px 0 0;">${leadName || 'Lead'}</p>
          </div>
          <button id="crm-offer-close" style="
            background: none;
            border: none;
            color: #71717a;
            cursor: pointer;
            padding: 4px;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div style="padding: 20px;">
          <!-- Oferta -->
          <div style="margin-bottom: 16px;">
            <label style="display: block; color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Oferta</label>
            <select id="crm-offer-select" style="
              width: 100%;
              background: #171717;
              border: 1px solid #262626;
              border-radius: 8px;
              padding: 10px 12px;
              color: #fafafa;
              font-size: 13px;
              cursor: pointer;
              outline: none;
            ">
              ${offers.map(o => `
                <option value="${o.id}" data-price="${o.price}" data-type="${o.offer_type || 'full'}" ${o.id === defaultOffer?.id ? 'selected' : ''}>
                  ${o.name} (${o.price?.toLocaleString('pl-PL')} PLN)
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Typ oferty -->
          <div style="margin-bottom: 16px;">
            <label style="display: block; color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Typ</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <label id="crm-type-starter" style="
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 12px;
                background: #262626;
                border: 1px solid #3f3f46;
                border-radius: 8px;
                cursor: pointer;
                transition: border-color 0.15s;
              ">
                <input type="radio" name="crm-offer-type" value="starter" checked style="display: none;">
                <span style="color: #22c55e; font-size: 16px;">🚀</span>
                <div>
                  <div style="color: #fafafa; font-size: 12px; font-weight: 500;">Startowy</div>
                  <div style="color: #71717a; font-size: 10px;">Bez umowy</div>
                </div>
              </label>
              <label id="crm-type-full" style="
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 12px;
                background: transparent;
                border: 1px solid #262626;
                border-radius: 8px;
                cursor: pointer;
                transition: border-color 0.15s;
              ">
                <input type="radio" name="crm-offer-type" value="full" style="display: none;">
                <span style="color: #f59e0b; font-size: 16px;">📦</span>
                <div>
                  <div style="color: #a1a1aa; font-size: 12px; font-weight: 500;">Pełen pakiet</div>
                  <div style="color: #71717a; font-size: 10px;">Z umową</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Ważność -->
          <div style="margin-bottom: 16px;">
            <label style="display: block; color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Ważność oferty</label>
            <select id="crm-offer-valid" style="
              width: 100%;
              background: #171717;
              border: 1px solid #262626;
              border-radius: 8px;
              padding: 10px 12px;
              color: #fafafa;
              font-size: 13px;
              cursor: pointer;
              outline: none;
            ">
              <option value="2">2 dni</option>
              <option value="3">3 dni</option>
              <option value="7" selected>7 dni</option>
              <option value="14">14 dni</option>
            </select>
          </div>

          <!-- Cena indywidualna -->
          <div style="margin-bottom: 20px;">
            <label style="display: block; color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Cena indywidualna (opcjonalne)</label>
            <div style="position: relative;">
              <input type="number" id="crm-offer-price" placeholder="Domyślna cena" style="
                width: 100%;
                background: #171717;
                border: 1px solid #262626;
                border-radius: 8px;
                padding: 10px 50px 10px 12px;
                color: #fafafa;
                font-size: 13px;
                outline: none;
                box-sizing: border-box;
              ">
              <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #71717a; font-size: 12px;">PLN</span>
            </div>
          </div>

          <!-- Submit -->
          <button id="crm-offer-submit" style="
            width: 100%;
            background: #fafafa;
            color: #0a0a0a;
            border: none;
            border-radius: 8px;
            padding: 12px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: opacity 0.15s;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            Wygeneruj i wyślij
          </button>
        </div>

        <!-- Result (hidden initially) -->
        <div id="crm-offer-result" style="display: none; padding: 20px; border-top: 1px solid #262626;">
          <div style="
            background: #052e16;
            border: 1px solid #166534;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
          ">
            <div style="color: #22c55e; font-size: 12px; font-weight: 500; margin-bottom: 4px;">✓ Oferta wysłana</div>
            <div style="color: #86efac; font-size: 11px;" id="crm-offer-info"></div>
          </div>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="crm-offer-url" readonly style="
              flex: 1;
              background: #171717;
              border: 1px solid #262626;
              border-radius: 6px;
              padding: 8px 10px;
              color: #a1a1aa;
              font-size: 11px;
              font-family: monospace;
              outline: none;
            ">
            <button id="crm-offer-copy" style="
              background: #262626;
              border: 1px solid #3f3f46;
              border-radius: 6px;
              padding: 8px 12px;
              color: #fafafa;
              font-size: 11px;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Kopiuj
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event handlers
    const closeBtn = modal.querySelector('#crm-offer-close');
    const starterLabel = modal.querySelector('#crm-type-starter');
    const fullLabel = modal.querySelector('#crm-type-full');
    const submitBtn = modal.querySelector('#crm-offer-submit');
    const copyBtn = modal.querySelector('#crm-offer-copy');

    closeBtn.onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    // Toggle offer type
    starterLabel.onclick = () => {
      starterLabel.style.background = '#262626';
      starterLabel.style.borderColor = '#3f3f46';
      starterLabel.querySelector('div > div:first-child').style.color = '#fafafa';
      fullLabel.style.background = 'transparent';
      fullLabel.style.borderColor = '#262626';
      fullLabel.querySelector('div > div:first-child').style.color = '#a1a1aa';
      starterLabel.querySelector('input').checked = true;
    };
    fullLabel.onclick = () => {
      fullLabel.style.background = '#262626';
      fullLabel.style.borderColor = '#3f3f46';
      fullLabel.querySelector('div > div:first-child').style.color = '#fafafa';
      starterLabel.style.background = 'transparent';
      starterLabel.style.borderColor = '#262626';
      starterLabel.querySelector('div > div:first-child').style.color = '#a1a1aa';
      fullLabel.querySelector('input').checked = true;
    };

    // Submit
    submitBtn.onclick = async () => {
      const offerId = modal.querySelector('#crm-offer-select').value;
      const offerType = modal.querySelector('input[name="crm-offer-type"]:checked').value;
      const validDays = parseInt(modal.querySelector('#crm-offer-valid').value);
      const customPrice = modal.querySelector('#crm-offer-price').value ? parseInt(modal.querySelector('#crm-offer-price').value) : null;

      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
      submitBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
        </svg>
        Generuję...
      `;

      const result = await createClientOffer(leadId, offerId, offerType, validDays, customPrice);

      if (result?.success) {
        // Show result
        modal.querySelector('#crm-offer-result').style.display = 'block';
        modal.querySelector('#crm-offer-info').textContent = `${result.offer.name} • ${result.offer.price?.toLocaleString('pl-PL')} PLN`;
        modal.querySelector('#crm-offer-url').value = result.clientOffer.url;

        // Hide form
        submitBtn.style.display = 'none';
      } else {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          Wygeneruj i wyślij
        `;
        alert('Błąd: ' + (result?.error || 'Nieznany błąd'));
      }
    };

    // Copy URL
    copyBtn.onclick = () => {
      const urlInput = modal.querySelector('#crm-offer-url');
      urlInput.select();
      document.execCommand('copy');
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Skopiowano
      `;
      setTimeout(() => {
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Kopiuj
        `;
      }, 1500);
    };

    // ESC to close
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  }

  // ============ NOTES MODAL ============

  // Pobierz notatki dla leada
  async function fetchNotes(leadId) {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SYNC_API_KEY || !leadId) return [];

    try {
      const response = await fetch(
        `${CONFIG.SUPABASE_URL}/functions/v1/whatsapp-notes?leadId=${leadId}`,
        { headers: { 'x-sync-api-key': CONFIG.SYNC_API_KEY } }
      );

      if (response.ok) {
        const data = await response.json();
        return data.notes || [];
      }
    } catch (err) {
      console.error('WhatsApp Sync: Error fetching notes', err);
    }
    return [];
  }

  // Dodaj nową notatkę
  async function addNote(leadId, content) {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SYNC_API_KEY || !leadId || !content) return null;

    try {
      const response = await fetch(
        `${CONFIG.SUPABASE_URL}/functions/v1/whatsapp-notes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-sync-api-key': CONFIG.SYNC_API_KEY
          },
          body: JSON.stringify({ leadId, content, createdBy: CONFIG.SYNC_USER || 'WhatsApp' })
        }
      );

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.error('WhatsApp Sync: Error adding note', err);
    }
    return null;
  }

  // Formatuj datę notatki
  function formatNoteDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'teraz';
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours}h temu`;
    if (diffDays < 7) return `${diffDays}d temu`;

    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Pokaż modal z notatkami
  async function showNotesModal(leadId, leadName) {
    const existingModal = document.getElementById('crm-notes-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'crm-notes-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    modal.innerHTML = `
      <div style="
        background: #0a0a0a;
        border: 1px solid #262626;
        border-radius: 12px;
        width: 420px;
        max-width: 90vw;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
        <div style="
          padding: 16px 20px;
          border-bottom: 1px solid #262626;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        ">
          <div>
            <h3 style="color: #fafafa; font-size: 14px; font-weight: 600; margin: 0; display: flex; align-items: center; gap: 8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              Notatki
            </h3>
            <p style="color: #71717a; font-size: 12px; margin: 4px 0 0;">${leadName || 'Lead'}</p>
          </div>
          <button id="crm-notes-close" style="background: none; border: none; color: #71717a; cursor: pointer; padding: 4px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div style="padding: 16px 20px; border-bottom: 1px solid #262626; flex-shrink: 0;">
          <textarea id="crm-note-input" placeholder="Napisz notatkę... (Ctrl+Enter aby zapisać)" style="
            width: 100%;
            background: #171717;
            border: 1px solid #262626;
            border-radius: 8px;
            padding: 10px 12px;
            color: #fafafa;
            font-size: 13px;
            resize: none;
            outline: none;
            min-height: 60px;
            box-sizing: border-box;
            font-family: inherit;
          "></textarea>
          <button id="crm-note-submit" style="
            margin-top: 8px;
            background: #fafafa;
            color: #0a0a0a;
            border: none;
            border-radius: 6px;
            padding: 8px 16px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Dodaj notatkę
          </button>
        </div>

        <div id="crm-notes-list" style="flex: 1; overflow-y: auto; padding: 16px 20px;">
          <div style="text-align: center; padding: 20px; color: #71717a;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite; margin: 0 auto;">
              <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
            </svg>
            <p style="margin-top: 8px; font-size: 12px;">Ładowanie...</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#crm-notes-close');
    const noteInput = modal.querySelector('#crm-note-input');
    const submitBtn = modal.querySelector('#crm-note-submit');
    const notesList = modal.querySelector('#crm-notes-list');

    closeBtn.onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    const renderNotes = (notes) => {
      if (!notes || notes.length === 0) {
        notesList.innerHTML = `
          <div style="text-align: center; padding: 30px; color: #71717a;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto; opacity: 0.5;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <p style="margin-top: 12px; font-size: 13px;">Brak notatek</p>
          </div>
        `;
        return;
      }

      const sorted = [...notes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      notesList.innerHTML = sorted.map(note => `
        <div style="background: #171717; border: 1px solid #262626; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
          <div style="color: #fafafa; font-size: 13px; white-space: pre-wrap; line-height: 1.5;">${escapeHtml(note.content)}</div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #262626; font-size: 11px; color: #71717a;">
            <span style="background: #262626; padding: 2px 6px; border-radius: 4px;">${note.performed_by_name || note.created_by || 'System'}</span>
            <span>${formatNoteDate(note.created_at)}</span>
          </div>
        </div>
      `).join('');
    };

    const notes = await fetchNotes(leadId);
    renderNotes(notes);

    submitBtn.onclick = async () => {
      const content = noteInput.value.trim();
      if (!content) return;

      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';

      const result = await addNote(leadId, content);

      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';

      if (result?.success) {
        noteInput.value = '';
        const updatedNotes = await fetchNotes(leadId);
        renderNotes(updatedNotes);
      } else {
        alert('Błąd zapisywania notatki');
      }
    };

    noteInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        submitBtn.click();
      }
    });

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
    noteInput.focus();
  }

  // ============ DATE PICKER ============

  // Aktualizuj datę zamknięcia leada
  async function updateLeadExpectedClose(leadId, newDate) {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SYNC_API_KEY || !leadId) return null;

    try {
      const response = await fetch(
        `${CONFIG.SUPABASE_URL}/functions/v1/whatsapp-lead-update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-sync-api-key': CONFIG.SYNC_API_KEY
          },
          body: JSON.stringify({ leadId, expected_close: newDate })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          Object.keys(leadDataCache).forEach(key => {
            if (leadDataCache[key]?.id === leadId) {
              leadDataCache[key].expected_close = newDate;
            }
          });
          return data.lead;
        }
      }
    } catch (err) {
      console.error('WhatsApp Sync: Error updating expected close', err);
    }
    return null;
  }

  // Pokaż date picker
  function showDatePicker(leadId, currentDate, targetElement) {
    const existingPicker = document.getElementById('crm-date-picker');
    if (existingPicker) existingPicker.remove();

    const picker = document.createElement('div');
    picker.id = 'crm-date-picker';
    picker.style.cssText = `
      position: fixed;
      background: #0a0a0a;
      border: 1px solid #262626;
      border-radius: 8px;
      padding: 12px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    `;

    const rect = targetElement.getBoundingClientRect();
    picker.style.left = `${rect.left}px`;
    picker.style.top = `${rect.bottom + 4}px`;

    const currentDateStr = currentDate ? new Date(currentDate).toISOString().split('T')[0] : '';

    picker.innerHTML = `
      <label style="display: block; color: #71717a; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Data zamknięcia</label>
      <input type="date" id="crm-date-input" value="${currentDateStr}" style="
        background: #171717;
        border: 1px solid #262626;
        border-radius: 6px;
        padding: 8px 10px;
        color: #fafafa;
        font-size: 13px;
        outline: none;
        cursor: pointer;
      ">
      <div style="display: flex; gap: 6px; margin-top: 8px;">
        <button id="crm-date-save" style="
          flex: 1;
          background: #fafafa;
          color: #0a0a0a;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        ">Zapisz</button>
        <button id="crm-date-clear" style="
          background: transparent;
          color: #ef4444;
          border: 1px solid #ef444444;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 11px;
          cursor: pointer;
        ">Usuń</button>
      </div>
    `;

    document.body.appendChild(picker);

    const dateInput = picker.querySelector('#crm-date-input');
    const saveBtn = picker.querySelector('#crm-date-save');
    const clearBtn = picker.querySelector('#crm-date-clear');

    // Show native date picker
    setTimeout(() => dateInput.showPicker?.(), 50);

    saveBtn.onclick = async () => {
      const newDate = dateInput.value || null;
      saveBtn.disabled = true;
      saveBtn.textContent = '...';

      const result = await updateLeadExpectedClose(leadId, newDate);
      picker.remove();

      if (result) {
        injectSyncButton();
      }
    };

    clearBtn.onclick = async () => {
      clearBtn.disabled = true;
      const result = await updateLeadExpectedClose(leadId, null);
      picker.remove();

      if (result) {
        injectSyncButton();
      }
    };

    const closePicker = (e) => {
      if (!picker.contains(e.target) && e.target !== targetElement) {
        picker.remove();
        document.removeEventListener('click', closePicker);
      }
    };
    setTimeout(() => document.addEventListener('click', closePicker), 10);
  }

  // Pokaż dropdown ze statusami (styl Vercel)
  function showStatusDropdown(leadId, currentStatus, targetElement) {
    // Usuń istniejący dropdown
    const existingDropdown = document.getElementById('crm-status-dropdown');
    if (existingDropdown) existingDropdown.remove();

    const dropdown = document.createElement('div');
    dropdown.id = 'crm-status-dropdown';
    dropdown.style.cssText = `
      position: fixed;
      background: #0a0a0a;
      border: 1px solid #262626;
      border-radius: 8px;
      padding: 4px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      min-width: 160px;
    `;

    // Pozycjonuj dropdown
    const rect = targetElement.getBoundingClientRect();
    dropdown.style.left = `${rect.left}px`;
    dropdown.style.top = `${rect.bottom + 4}px`;

    // Dodaj opcje statusów
    const allStatuses = [
      ...pipelineStages,
      { id: 'won', name: 'Wygrany' },
      { id: 'lost', name: 'Przegrany' }
    ];

    allStatuses.forEach(stage => {
      const option = document.createElement('div');
      const isSelected = stage.id === currentStatus;
      const color = getStatusColor(stage.id);

      option.style.cssText = `
        padding: 8px 10px;
        cursor: pointer;
        border-radius: 6px;
        font-size: 13px;
        color: ${isSelected ? '#fafafa' : '#a1a1aa'};
        background: ${isSelected ? '#262626' : 'transparent'};
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.1s, color 0.1s;
      `;

      option.innerHTML = `
        <span style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${color};
          flex-shrink: 0;
        "></span>
        <span style="flex: 1;">${stage.name}</span>
        ${isSelected ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fafafa" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}
      `;

      option.onmouseenter = () => {
        if (!isSelected) {
          option.style.background = '#1a1a1a';
          option.style.color = '#fafafa';
        }
      };
      option.onmouseleave = () => {
        if (!isSelected) {
          option.style.background = 'transparent';
          option.style.color = '#a1a1aa';
        }
      };

      option.onclick = async (e) => {
        e.stopPropagation();
        if (stage.id === currentStatus) {
          dropdown.remove();
          return;
        }

        // Pokaż loading
        option.style.opacity = '0.5';
        option.style.pointerEvents = 'none';

        const result = await updateLeadStatus(leadId, stage.id);
        dropdown.remove();

        if (result) {
          injectSyncButton();
        } else {
          alert('Błąd przy zmianie statusu');
        }
      };

      dropdown.appendChild(option);
    });

    document.body.appendChild(dropdown);

    // Zamknij dropdown po kliknięciu poza nim lub ESC
    const closeDropdown = (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    setTimeout(() => {
      document.addEventListener('click', closeDropdown);
      document.addEventListener('keydown', handleKeydown);
    }, 10);
  }

  // Pobierz dane leada dla numeru telefonu (przez Edge Function)
  async function fetchLeadData(phone) {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SYNC_API_KEY || !phone) return null;

    // Jeśli stages nie są załadowane, zawsze pobierz z API
    // Jeśli stages są załadowane i lead jest w cache, użyj cache
    if (pipelineStagesLoaded && leadDataCache[phone]) {
      return leadDataCache[phone];
    }

    try {
      console.log('WhatsApp Sync fetchLeadData: phone=', phone);

      // Użyj Edge Function z weryfikacją API key
      const response = await fetch(
        `${CONFIG.SUPABASE_URL}/functions/v1/whatsapp-lead-lookup?phone=${phone}`,
        {
          headers: {
            'x-sync-api-key': CONFIG.SYNC_API_KEY
          }
        }
      );

      console.log('WhatsApp Sync fetchLeadData: response status=', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('WhatsApp Sync fetchLeadData: data=', data);

        // Zaktualizuj pipeline stages jeśli są w odpowiedzi
        if (data.pipelineStages) {
          // Parse JSON string jeśli trzeba (Supabase może zwrócić string)
          pipelineStages = typeof data.pipelineStages === 'string'
            ? JSON.parse(data.pipelineStages)
            : data.pipelineStages;
          pipelineStagesLoaded = true;
          console.log('WhatsApp Sync: Updated pipeline stages:', pipelineStages);
        }

        if (data.found && data.lead) {
          leadDataCache[phone] = data.lead;
          return data.lead;
        }
      } else {
        const errorText = await response.text();
        console.error('WhatsApp Sync fetchLeadData: error=', errorText);
      }
    } catch (err) {
      console.error('WhatsApp Sync: Error fetching lead data', err);
    }

    return null;
  }

  // Sprawdź status sync dla numeru telefonu w CRM
  // Zwraca ostatnią zsynchronizowaną wiadomość lub null
  async function checkSyncStatus(phoneNumber) {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SYNC_API_KEY || !phoneNumber) {
      return null;
    }

    // Sprawdź cache
    if (syncStatusCache[phoneNumber] !== undefined) {
      return syncStatusCache[phoneNumber];
    }

    try {
      // Użyj Edge Function z weryfikacją API key
      const response = await fetch(
        `${CONFIG.SUPABASE_URL}/functions/v1/whatsapp-sync-status?phone=${phoneNumber}`,
        {
          headers: {
            'x-sync-api-key': CONFIG.SYNC_API_KEY
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.synced && data.lastMessage) {
          syncStatusCache[phoneNumber] = data.lastMessage.message_text;
          return data.lastMessage.message_text;
        }
        syncStatusCache[phoneNumber] = null;
      } else if (response.status === 401) {
        console.warn('WhatsApp Sync: Invalid API key for sync status check');
      }
    } catch (err) {
      console.error('WhatsApp Sync: Error checking sync status', err);
    }

    return null;
  }

  // Normalizuj tekst do porównania (usuń emoji, whitespace, lowercase, wielokropki)
  function normalizeTextForComparison(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // emoji twarze
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // symbole
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // transport
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // misc
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // dingbats
      .replace(/…/g, '')                       // wielokropek (ucięte wiadomości)
      .replace(/\.{3,}/g, '')                  // trzy lub więcej kropek
      .replace(/\s+/g, ' ')                    // wiele spacji -> jedna
      .trim();
  }

  // Wyczyść cache statusów (np. po sync)
  function clearSyncStatusCache(phoneNumber = null) {
    if (phoneNumber) {
      delete syncStatusCache[phoneNumber];
    } else {
      syncStatusCache = {};
    }
  }

  // Pobierz numer telefonu z elementu czatu na liście
  function getPhoneFromChatItem(chatItem) {
    // Szukaj numeru w tytule lub podtytule czatu
    const phonePatterns = [
      /\+?48[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{3}/,
      /\+?\d{10,15}/
    ];

    const textElements = chatItem.querySelectorAll('span[dir="auto"], span[title]');
    for (const el of textElements) {
      const text = el.textContent || el.getAttribute('title') || '';
      for (const pattern of phonePatterns) {
        const match = text.match(pattern);
        if (match) {
          return normalizePhoneNumber(match[0]);
        }
      }
    }

    return null;
  }

  // Pobierz ostatnią wiadomość z elementu czatu na liście
  function getLastMessageFromChatItem(chatItem) {
    function cleanMessageText(text) {
      if (!text) return '';
      // Usuń prefix "Ty: " lub "You: "
      let cleaned = text.replace(/^(Ty|You):\s*/i, '');
      return cleaned.trim();
    }

    function isValidMessage(text) {
      if (!text || text.length < 3) return false;
      // Ignoruj numery telefonów
      if (text.match(/^\+?\d[\d\s\-]{8,}/)) return false;
      // Ignoruj czas
      if (text.match(/^\d{1,2}:\d{2}(\s*(AM|PM))?$/i)) return false;
      // Ignoruj daty
      if (text === 'wczoraj' || text === 'yesterday' || text.match(/^(pn|wt|śr|cz|pt|sb|nd|poniedziałek|wtorek)/i)) return false;
      // Ignoruj WhatsApp internals
      if (text.match(/^(default-|status-|msg-|testid-)/i)) return false;
      return true;
    }

    // Szukaj w cell-frame-secondary - to jest kontener z ostatnią wiadomością
    const secondaryFrame = chatItem.querySelector('[data-testid="cell-frame-secondary"]');
    if (secondaryFrame) {
      // Najpierw szukaj spana z dir="ltr" lub dir="auto" - to zazwyczaj tekst wiadomości
      const messageSpans = secondaryFrame.querySelectorAll('span[dir="ltr"], span[dir="auto"]');
      for (const span of messageSpans) {
        const text = cleanMessageText(span.textContent || '');
        if (isValidMessage(text) && text.length > 5) {
          return text;
        }
      }

      // Fallback - znajdź najdłuższy tekst
      let longestText = '';
      const spans = secondaryFrame.querySelectorAll('span');
      for (const span of spans) {
        const text = cleanMessageText(span.textContent || '');
        if (isValidMessage(text) && text.length > longestText.length) {
          longestText = text;
        }
      }
      if (longestText.length > 3) {
        return longestText;
      }
    }

    return null;
  }

  // Wstrzyknij wskaźniki sync do listy czatów
  async function injectSyncIndicators() {
    if (syncStatusCheckInProgress) return;
    syncStatusCheckInProgress = true;

    // Dodaj style animacji jeśli nie ma
    if (!document.getElementById('crm-sync-styles')) {
      const style = document.createElement('style');
      style.id = 'crm-sync-styles';
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .crm-quick-sync-btn:hover {
          background: #e53935 !important;
          transform: scale(1.02);
        }
        .crm-quick-sync-btn:active {
          transform: scale(0.98);
        }
      `;
      document.head.appendChild(style);
    }

    await loadConfig();

    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_KEY) {
      syncStatusCheckInProgress = false;
      return;
    }

    const sidePanel = document.querySelector('#pane-side');
    if (!sidePanel) {
      syncStatusCheckInProgress = false;
      return;
    }

    // Znajdź wszystkie elementy czatów
    const chatItems = sidePanel.querySelectorAll('[data-testid="cell-frame-container"], [tabindex="-1"]');

    for (const chatItem of chatItems) {
      // Sprawdź czy już ma wskaźnik
      if (chatItem.querySelector('.crm-sync-indicator')) {
        continue;
      }

      const phone = getPhoneFromChatItem(chatItem);
      if (!phone) continue;

      const lastMessage = getLastMessageFromChatItem(chatItem);
      const syncedMessage = await checkSyncStatus(phone);

      // Sprawdź czy ostatnia wiadomość jest zsynchronizowana
      let isSynced = false;
      if (syncedMessage && lastMessage) {
        // Normalizuj oba teksty i porównaj
        const syncedNorm = normalizeTextForComparison(syncedMessage);
        const lastNorm = normalizeTextForComparison(lastMessage);

        // Debug log
        console.log(`WhatsApp Sync [${phone}]: Comparing messages:`);
        console.log(`  Last in WhatsApp: "${lastNorm.substring(0, 50)}..."`);
        console.log(`  Last in CRM: "${syncedNorm.substring(0, 50)}..."`);

        // WhatsApp na liście czatów UCINA POCZĄTEK wiadomości (np. "ok, jesteś..." -> ", jesteś...")
        // Dlatego sprawdzamy czy jeden tekst ZAWIERA drugi

        // Metoda 1: Sprawdź czy WhatsApp text jest zawarty w CRM (WhatsApp ucina początek)
        if (syncedNorm.includes(lastNorm) && lastNorm.length >= 10) {
          isSynced = true;
          console.log(`  Result: SYNCED (WhatsApp text found in CRM)`);
        }
        // Metoda 2: Sprawdź czy CRM text jest zawarty w WhatsApp
        else if (lastNorm.includes(syncedNorm) && syncedNorm.length >= 10) {
          isSynced = true;
          console.log(`  Result: SYNCED (CRM text found in WhatsApp)`);
        }
        // Metoda 3: Dla krótkich wiadomości - dokładne porównanie
        else if (syncedNorm === lastNorm) {
          isSynced = true;
          console.log(`  Result: SYNCED (exact match)`);
        }
        // Metoda 4: Znajdź wspólny fragment (min 15 znaków)
        else {
          const minMatch = 15;
          for (let i = 0; i <= syncedNorm.length - minMatch; i++) {
            const fragment = syncedNorm.substring(i, i + minMatch);
            if (lastNorm.includes(fragment)) {
              isSynced = true;
              console.log(`  Result: SYNCED (common fragment: "${fragment}")`);
              break;
            }
          }
          if (!isSynced) {
            console.log(`  Result: NOT SYNCED (no common text found)`);
          }
        }
      } else if (syncedMessage && !lastMessage) {
        // Nie udało się pobrać ostatniej wiadomości z listy, ale są zsynchronizowane
        console.log(`WhatsApp Sync [${phone}]: No last message from list, but has synced - marking as synced`);
        isSynced = true;
      } else {
        console.log(`WhatsApp Sync [${phone}]: syncedMessage=${!!syncedMessage}, lastMessage=${!!lastMessage}`);
      }

      // Stwórz wskaźnik - widoczny w prawej części czatu
      const indicator = document.createElement('div');
      indicator.className = 'crm-sync-indicator';
      indicator.style.cssText = `
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        z-index: 10;
      `;

      if (isSynced) {
        // Zielony checkmark - zsynchronizowane
        indicator.innerHTML = `
          <div style="
            background: rgba(37, 211, 102, 0.15);
            border-radius: 4px;
            padding: 4px 6px;
            display: flex;
            align-items: center;
            gap: 4px;
          " title="CRM: zsynchronizowane">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        `;
      } else {
        // Czerwony przycisk sync z ikoną
        indicator.innerHTML = `
          <button class="crm-quick-sync-btn" data-phone="${phone}" style="
            background: #ff5252;
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            color: white;
            font-size: 10px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.2s;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          " title="Kliknij aby zsynchronizować z CRM">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>Sync</span>
          </button>
        `;

        // Obsługa kliknięcia przycisku sync
        const syncBtn = indicator.querySelector('.crm-quick-sync-btn');
        syncBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Zmień na loading
          syncBtn.style.background = '#25D366';
          syncBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;">
              <circle cx="12" cy="12" r="10" stroke-dasharray="50" stroke-dashoffset="10"/>
            </svg>
            <span>Sync...</span>
          `;
          syncBtn.disabled = true;

          // Kliknij na czat żeby go otworzyć - użyj debugger API dla prawdziwego kliknięcia
          const clickTarget = chatItem.querySelector('[data-testid="cell-frame-container"]') ||
                             chatItem.querySelector('[role="listitem"]') ||
                             chatItem;

          // Scrolluj do elementu jeśli nie jest widoczny
          const rect = clickTarget.getBoundingClientRect();
          if (rect.top < 0 || rect.bottom > window.innerHeight) {
            clickTarget.scrollIntoView({ block: 'center' });
            await new Promise(r => setTimeout(r, 300));
          }

          const newRect = clickTarget.getBoundingClientRect();
          const centerX = Math.round(newRect.left + newRect.width / 2);
          const centerY = Math.round(newRect.top + newRect.height / 2);

          // Użyj debugger API przez background script
          const tabId = await getTabId();
          if (tabId) {
            await new Promise((resolve) => {
              chrome.runtime.sendMessage({
                type: 'REAL_CLICK',
                x: centerX,
                y: centerY,
                tabId: tabId
              }, resolve);
            });
            console.log('WhatsApp Sync: Real click at', centerX, centerY);
          } else {
            // Fallback - zwykłe kliknięcie
            clickTarget.click();
            console.log('WhatsApp Sync: Fallback click on chat item');
          }

          // Poczekaj na załadowanie czatu - z retry
          let chatLoaded = false;
          for (let i = 0; i < 10; i++) {
            await new Promise(r => setTimeout(r, 500));
            const mainEl = document.querySelector('#main');
            const header = mainEl?.querySelector('header') ||
                          mainEl?.querySelector('[data-testid="conversation-header"]');
            if (header) {
              chatLoaded = true;
              console.log('WhatsApp Sync: Chat loaded after', (i + 1) * 500, 'ms');
              break;
            }
          }

          if (!chatLoaded) {
            throw new Error('Czat nie załadował się - spróbuj najpierw ręcznie kliknąć na czat');
          }

          // Wykonaj deep sync - przekaż znany numer telefonu
          try {
            const result = await performDeepSync(phone);

            if (result.success) {
              // Wyczyść cache dla tego numeru
              clearSyncStatusCache(phone);

              // Zmień wskaźnik na zielony checkmark
              indicator.innerHTML = `
                <div style="
                  background: rgba(37, 211, 102, 0.15);
                  border-radius: 4px;
                  padding: 4px 6px;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                " title="CRM: zsynchronizowane (+${result.inserted} nowych)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              `;

              console.log(`WhatsApp Sync: Quick sync complete for ${phone}: +${result.inserted} new`);
            } else {
              // Pokaż błąd
              syncBtn.style.background = '#ff5252';
              syncBtn.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>Błąd</span>
              `;
              syncBtn.title = result.error;
            }
          } catch (err) {
            syncBtn.style.background = '#ff5252';
            syncBtn.innerHTML = `
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>Błąd</span>
            `;
            syncBtn.title = err.message;
          }
        });
      }

      // Ustaw position relative na rodzicu jeśli trzeba
      const parent = chatItem.querySelector('[data-testid="cell-frame-secondary"]')?.parentElement || chatItem;
      if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }

      parent.appendChild(indicator);
    }

    syncStatusCheckInProgress = false;
  }

  // Obserwuj zmiany na liście czatów
  function observeChatList() {
    const sidePanel = document.querySelector('#pane-side');
    if (!sidePanel) return;

    // Wstrzyknij wskaźniki na start
    setTimeout(injectSyncIndicators, 2000);

    // Obserwuj zmiany (nowe czaty, scrollowanie)
    const observer = new MutationObserver(() => {
      // Debounce
      clearTimeout(observer._timeout);
      observer._timeout = setTimeout(injectSyncIndicators, 1000);
    });

    observer.observe(sidePanel, {
      childList: true,
      subtree: true
    });
  }

  // Wstrzyknij przycisk Deep Sync do headera czatu
  function injectSyncButton() {
    // Znajdź header czatu - różne selektory dla różnych wersji WhatsApp
    const mainEl = document.querySelector('#main');
    if (!mainEl) {
      console.log('WhatsApp Sync: #main not found');
      return;
    }

    // Szukaj headera w #main
    let header = mainEl.querySelector('header') ||
                 mainEl.querySelector('[data-testid="conversation-header"]') ||
                 mainEl.querySelector('[data-testid="conversation-panel-header"]');

    if (!header) {
      // Fallback - pierwszy div w main z określoną strukturą
      header = mainEl.querySelector('div > div > div');
      console.log('WhatsApp Sync: Using fallback header selector');
    }

    if (!header) {
      console.log('WhatsApp Sync: Header not found');
      return;
    }

    console.log('WhatsApp Sync: Header found:', header);

    // Znajdź kontener z przyciskami akcji (szukamy div z wieloma przyciskami)
    let actionsContainer = null;

    // Metoda 1: Szukaj po data-testid
    const menuBtn = header.querySelector('[data-testid="menu-btn"]');
    const searchBtn = header.querySelector('[data-testid="search-btn"]');
    const videoBtn = header.querySelector('[data-testid="video-call-btn"]');

    if (menuBtn) {
      actionsContainer = menuBtn.parentElement;
    } else if (searchBtn) {
      actionsContainer = searchBtn.parentElement;
    } else if (videoBtn) {
      actionsContainer = videoBtn.parentElement;
    }

    // Metoda 2: Szukaj div z wieloma span/button elementami (ikony)
    if (!actionsContainer) {
      const divs = header.querySelectorAll('div');
      for (const div of divs) {
        const buttons = div.querySelectorAll('span[data-icon], button, [role="button"]');
        if (buttons.length >= 2) {
          actionsContainer = div;
          break;
        }
      }
    }

    // Metoda 3: Ostatni div w headerze
    if (!actionsContainer) {
      const children = header.children;
      if (children.length > 0) {
        actionsContainer = children[children.length - 1];
      }
    }

    if (!actionsContainer) {
      actionsContainer = header;
    }

    console.log('WhatsApp Sync: Actions container:', actionsContainer);

    // Stwórz przycisk
    const btn = document.createElement('button');
    btn.id = 'crm-deep-sync-btn';
    btn.title = 'Deep Sync - pobierz wszystkie wiadomości do CRM';
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
    `;
    btn.style.cssText = `
      background: transparent;
      border: none;
      padding: 8px;
      cursor: pointer;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      color: #aebac1;
      margin-left: 4px;
    `;

    btn.onmouseenter = () => {
      btn.style.background = 'rgba(134, 150, 160, 0.15)';
    };
    btn.onmouseleave = () => {
      btn.style.background = 'transparent';
    };

    // Obsługa kliknięcia
    btn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Zmień ikonę na loading
      btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2" style="animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
        </svg>
      `;
      btn.disabled = true;

      try {
        const result = await performDeepSync();

        // Pokaż wynik
        if (result.success) {
          btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;
          btn.title = `Zsynchronizowano! +${result.inserted} nowych`;

          // Powiadom popup
          if (isExtensionContextValid()) {
            chrome.runtime.sendMessage({
              type: 'SYNC_RESULT',
              data: {
                phone: getCurrentChatPhone(),
                name: getCurrentChatName(),
                success: true,
                inserted: result.inserted,
                skipped: result.skipped
              }
            }).catch(() => {});
          }
        } else {
          btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff5252" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          `;
          btn.title = `Błąd: ${result.error}`;
        }
      } catch (err) {
        btn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff5252" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
        btn.title = `Błąd: ${err.message}`;
      }

      // Przywróć normalną ikonę po 3 sekundach
      setTimeout(() => {
        btn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        `;
        btn.title = 'Deep Sync - pobierz wszystkie wiadomości do CRM';
        btn.disabled = false;
      }, 3000);
    };

    // Dodaj style animacji
    if (!document.getElementById('crm-sync-styles')) {
      const style = document.createElement('style');
      style.id = 'crm-sync-styles';
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    // === Oba przyciski obok numeru telefonu ===

    // Znajdź element z tytułem/numerem telefonu
    const titleSelectors = [
      '[data-testid="conversation-info-header-chat-title"]',
      'header span[dir="auto"]',
      'header [title]'
    ];

    let titleEl = null;
    for (const sel of titleSelectors) {
      titleEl = header.querySelector(sel);
      if (titleEl && titleEl.textContent.trim()) {
        break;
      }
    }

    // Sprawdź czy kontener już istnieje dla tego samego chatu
    const currentPhone = getCurrentChatPhone();
    const existingContainer = document.getElementById('crm-buttons-container');

    if (existingContainer) {
      const containerPhone = existingContainer.dataset.phone;
      if (containerPhone === currentPhone) {
        // Ten sam chat - nie usuwaj, tylko wróć
        return;
      }
      // Inny chat - usuń stary kontener
      existingContainer.remove();
    }

    if (titleEl) {
      // Stwórz kontener na oba przyciski i info o leadzie
      const buttonsContainer = document.createElement('div');
      buttonsContainer.id = 'crm-buttons-container';
      buttonsContainer.dataset.phone = currentPhone || '';
      buttonsContainer.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-left: 8px;
        vertical-align: middle;
      `;

      // Dodaj kontener na info o leadzie (wypełniany asynchronicznie)
      const leadInfoContainer = document.createElement('div');
      leadInfoContainer.id = 'crm-lead-info';
      leadInfoContainer.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: #aebac1;
      `;

      // Zmniejsz przycisk Deep Sync i dodaj do kontenera
      btn.style.cssText = `
        background: transparent;
        border: none;
        padding: 4px;
        cursor: pointer;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        color: #aebac1;
      `;
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      `;

      // Stwórz przycisk otwierania leada
      const leadBtn = document.createElement('button');
      leadBtn.id = 'crm-open-lead-btn';
      leadBtn.title = 'Otwórz lead w CRM';
      leadBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      `;
      leadBtn.style.cssText = `
        background: transparent;
        border: none;
        padding: 4px;
        cursor: pointer;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        color: #25D366;
      `;

      leadBtn.onmouseenter = () => {
        leadBtn.style.background = 'rgba(37, 211, 102, 0.15)';
      };
      leadBtn.onmouseleave = () => {
        leadBtn.style.background = 'transparent';
      };

      // Obsługa kliknięcia - otwórz lead w CRM
      leadBtn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const phone = getCurrentChatPhone();
        if (!phone) {
          console.log('WhatsApp Sync: No phone number for lead');
          return;
        }

        // Zmień ikonę na loading
        leadBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
          </svg>
        `;

        try {
          // Użyj Edge Function do wyszukania leada
          console.log('WhatsApp Sync: Looking for lead with phone:', phone);

          const response = await fetch(
            `${CONFIG.SUPABASE_URL}/functions/v1/whatsapp-lead-lookup?phone=${phone}`,
            {
              headers: {
                'x-sync-api-key': CONFIG.SYNC_API_KEY
              }
            }
          );

          console.log('WhatsApp Sync: Lead search response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('WhatsApp Sync: Found lead data:', data);
            if (data.found && data.lead) {
              // Otwórz lead bezpośrednio
              const leadUrl = `https://crm.tomekniedzwiecki.pl/lead?id=${data.lead.id}`;
              console.log('WhatsApp Sync: Opening lead:', leadUrl);
              window.open(leadUrl, '_blank');
            } else {
              // Nie znaleziono - otwórz wyszukiwanie
              console.log('WhatsApp Sync: No lead found, opening search');
              window.open(`https://crm.tomekniedzwiecki.pl/leads?search=${phone}`, '_blank');
            }
          } else {
            const errorText = await response.text();
            console.error('WhatsApp Sync: Lead search error:', errorText);
            window.open(`https://crm.tomekniedzwiecki.pl/leads?search=${phone}`, '_blank');
          }
        } catch (err) {
          console.error('WhatsApp Sync: Error opening lead', err);
          window.open(`https://crm.tomekniedzwiecki.pl/leads?search=${phone}`, '_blank');
        }

        // Przywróć ikonę
        leadBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        `;
      };

      // Stwórz przycisk wysyłania oferty
      const offerBtn = document.createElement('button');
      offerBtn.id = 'crm-send-offer-btn';
      offerBtn.title = 'Wyślij ofertę';
      offerBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      `;
      offerBtn.style.cssText = `
        background: transparent;
        border: none;
        padding: 4px;
        cursor: pointer;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        color: #f59e0b;
      `;

      offerBtn.onmouseenter = () => {
        offerBtn.style.background = 'rgba(245, 158, 11, 0.15)';
      };
      offerBtn.onmouseleave = () => {
        offerBtn.style.background = 'transparent';
      };

      // Stwórz przycisk notatek
      const notesBtn = document.createElement('button');
      notesBtn.id = 'crm-notes-btn';
      notesBtn.title = 'Notatki';
      notesBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      `;
      notesBtn.style.cssText = `
        background: transparent;
        border: none;
        padding: 4px;
        cursor: pointer;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        color: #a78bfa;
      `;

      notesBtn.onmouseenter = () => {
        notesBtn.style.background = 'rgba(167, 139, 250, 0.15)';
      };
      notesBtn.onmouseleave = () => {
        notesBtn.style.background = 'transparent';
      };

      // Dodaj wszystkie przyciski do kontenera
      buttonsContainer.appendChild(btn);
      buttonsContainer.appendChild(leadBtn);
      buttonsContainer.appendChild(offerBtn);
      buttonsContainer.appendChild(notesBtn);
      buttonsContainer.appendChild(leadInfoContainer);

      // Wstaw kontener obok tytułu
      titleEl.parentElement.insertBefore(buttonsContainer, titleEl.nextSibling);
      console.log('WhatsApp Sync: CRM buttons injected next to title');

      // Asynchronicznie załaduj dane leada i wyświetl info
      const phone = getCurrentChatPhone();
      if (phone) {
        fetchLeadData(phone).then(lead => {
          if (lead) {
            const statusColor = getStatusColor(lead.status);
            const statusName = getStatusName(lead.status);
            const timeInPipeline = timeAgo(lead.created_at);

            let infoHtml = `
              <span id="crm-status-badge" data-lead-id="${lead.id}" data-status="${lead.status}" style="
                background: #262626;
                color: #fafafa;
                padding: 2px 8px 2px 6px;
                border-radius: 6px;
                font-size: 11px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                border: 1px solid #3f3f46;
                transition: border-color 0.15s;
              " title="Kliknij aby zmienić status">
                <span style="
                  width: 6px;
                  height: 6px;
                  background: ${statusColor};
                  border-radius: 50%;
                "></span>
                ${statusName}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#71717a" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
              <span style="color: #71717a; font-size: 11px;" title="W CRM od ${lead.created_at ? new Date(lead.created_at).toLocaleDateString('pl-PL') : '?'}">${timeInPipeline}</span>
            `;

            // Dodaj datę zamknięcia (zawsze - klikalna do edycji)
            infoHtml += `
              <span id="crm-expected-close-badge" data-lead-id="${lead.id}" data-date="${lead.expected_close || ''}" style="
                color: ${lead.expected_close ? '#f59e0b' : '#71717a'};
                font-size: 10px;
                display: inline-flex;
                align-items: center;
                gap: 2px;
                cursor: pointer;
                padding: 2px 4px;
                border-radius: 4px;
                transition: background 0.15s;
              " title="Kliknij aby ${lead.expected_close ? 'zmienić' : 'ustawić'} datę zamknięcia">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                ${lead.expected_close ? formatShortDate(lead.expected_close) : '+ data'}
              </span>
            `;

            // Dodaj wartość deala jeśli jest
            if (lead.deal_value) {
              const isWon = lead.status === 'won';
              infoHtml += `
                <span style="
                  color: ${isWon ? '#22c55e' : '#f59e0b'};
                  font-size: 10px;
                  font-weight: 600;
                  display: inline-flex;
                  align-items: center;
                  gap: 2px;
                " title="Wartość deala: ${lead.deal_value.toLocaleString('pl-PL')} PLN">
                  💰 ${lead.deal_value.toLocaleString('pl-PL')}
                </span>
              `;
            }

            leadInfoContainer.innerHTML = infoHtml;

            // Dodaj obsługę kliknięcia na status badge
            const statusBadge = leadInfoContainer.querySelector('#crm-status-badge');
            if (statusBadge) {
              statusBadge.onclick = (e) => {
                e.stopPropagation();
                showStatusDropdown(lead.id, lead.status, statusBadge);
              };
              statusBadge.onmouseenter = () => {
                statusBadge.style.borderColor = '#52525b';
              };
              statusBadge.onmouseleave = () => {
                statusBadge.style.borderColor = '#3f3f46';
              };
            }

            // Dodaj obsługę kliknięcia na przycisk oferty
            const offerBtnEl = document.getElementById('crm-send-offer-btn');
            if (offerBtnEl) {
              offerBtnEl.onclick = (e) => {
                e.stopPropagation();
                showOfferModal(lead.id, lead.name);
              };
            }

            // Dodaj obsługę kliknięcia na przycisk notatek
            const notesBtnEl = document.getElementById('crm-notes-btn');
            if (notesBtnEl) {
              notesBtnEl.onclick = (e) => {
                e.stopPropagation();
                showNotesModal(lead.id, lead.name);
              };
            }

            // Dodaj obsługę kliknięcia na datę zamknięcia
            const expectedCloseBadge = document.getElementById('crm-expected-close-badge');
            if (expectedCloseBadge) {
              expectedCloseBadge.onclick = (e) => {
                e.stopPropagation();
                showDatePicker(lead.id, lead.expected_close, expectedCloseBadge);
              };
              expectedCloseBadge.onmouseenter = () => {
                expectedCloseBadge.style.background = 'rgba(245, 158, 11, 0.15)';
              };
              expectedCloseBadge.onmouseleave = () => {
                expectedCloseBadge.style.background = 'transparent';
              };
            }

            console.log('WhatsApp Sync: Lead info displayed', lead);
          } else {
            // Brak leada w CRM - pokaż info
            leadInfoContainer.innerHTML = `
              <span style="
                color: #71717a;
                font-size: 10px;
                font-style: italic;
              ">Brak w CRM</span>
            `;
          }
        });
      }
    } else {
      // Fallback - dodaj przycisk Deep Sync do akcji
      actionsContainer.appendChild(btn);
      console.log('WhatsApp Sync: Title not found, Deep Sync button added to actions');
    }
  }

  // Inicjalizacja
  async function init() {
    console.log('WhatsApp CRM Sync: Initializing...');
    await loadConfig();
    await loadPipelineStages();

    // Różne selektory - WhatsApp często je zmienia
    const possibleSelectors = [
      '[data-testid="chat-list"]',
      '#pane-side',
      '[aria-label="Chat list"]',
      'div[data-tab="3"]',
      '#app [role="application"]'
    ];

    let attempts = 0;
    const maxAttempts = 30; // 30 sekund max

    // Poczekaj na załadowanie WhatsApp
    const checkReady = setInterval(() => {
      attempts++;

      for (const selector of possibleSelectors) {
        if (document.querySelector(selector)) {
          clearInterval(checkReady);
          console.log('WhatsApp CRM Sync: Ready (found:', selector, ')');
          observeChatChanges();
          startAutoSync();
          // Wstrzyknij przycisk jeśli jest otwarty czat
          setTimeout(injectSyncButton, 1000);
          // Obserwuj listę czatów i dodaj wskaźniki sync
          observeChatList();
          return;
        }
      }

      if (attempts >= maxAttempts) {
        clearInterval(checkReady);
        console.log('WhatsApp CRM Sync: Timeout waiting for WhatsApp. Starting anyway...');
        observeChatChanges();
        startAutoSync();
        setTimeout(injectSyncButton, 1000);
        observeChatList();
      }
    }, 1000);
  }

  // Start
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();
