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
    AUTO_SYNC_INTERVAL: 30000, // 30 sekund
    SYNC_ON_CHAT_CHANGE: true
  };

  let currentChatPhone = null;
  let issyncing = false;
  let autoSyncEnabled = false;
  let lastSyncedHashes = new Set();

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
          autoSyncEnabled = result.autoSync || false;
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
    // Różne selektory headera - WhatsApp często je zmienia
    const headerSelectors = [
      '[data-testid="conversation-header"]',
      '#main header',
      '#main [role="banner"]',
      'header[data-testid="conversation-panel-header"]'
    ];

    let header = null;
    for (const sel of headerSelectors) {
      header = document.querySelector(sel);
      if (header) break;
    }

    if (!header) {
      console.log('WhatsApp Sync: Header not found');
      return null;
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
    const observer = new MutationObserver((mutations) => {
      const newPhone = getCurrentChatPhone();
      if (newPhone && newPhone !== currentChatPhone) {
        currentChatPhone = newPhone;
        console.log('WhatsApp Sync: Chat changed to', newPhone);

        if (autoSyncEnabled && CONFIG.SYNC_ON_CHAT_CHANGE) {
          setTimeout(performSync, 1000); // Poczekaj na załadowanie wiadomości
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
  }

  // Auto-sync co X sekund
  function startAutoSync() {
    setInterval(async () => {
      await loadConfig();
      if (autoSyncEnabled) {
        performSync();
      }
    }, CONFIG.AUTO_SYNC_INTERVAL);
  }

  // Deep sync - scrolluje w górę i pobiera starsze wiadomości
  async function performDeepSync() {
    if (issyncing) return { success: false, error: 'Sync w trakcie' };
    issyncing = true;

    await loadConfig();
    const phoneNumber = getCurrentChatPhone();
    const contactName = getCurrentChatName();

    if (!phoneNumber) {
      issyncing = false;
      return { success: false, error: 'Brak numeru telefonu' };
    }

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
      issyncing = false;
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
      issyncing = false;
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

    issyncing = false;

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
    });
  }

  // Sync wszystkich czatów - synchronizuje aż trafi na już zsynchronizowane
  async function syncAllChats() {
    await loadConfig();

    const sidePanel = document.querySelector('#pane-side');
    if (!sidePanel) {
      return { success: false, error: 'Nie znaleziono panelu bocznego' };
    }

    console.log('WhatsApp Sync: Starting sync all chats');

    const results = [];
    let totalInserted = 0;
    let totalSkipped = 0;
    let consecutiveNoNewMessages = 0;
    let chatIndex = 0;
    const maxChats = 100; // Absolutny limit bezpieczeństwa

    // Funkcja do znalezienia czatów
    function findChatItems() {
      const timeSpans = sidePanel.querySelectorAll('span[dir="auto"]');
      const chatContainers = new Set();

      timeSpans.forEach(span => {
        let parent = span.parentElement;
        for (let i = 0; i < 10 && parent; i++) {
          if (parent.getAttribute('tabindex') === '-1' && parent.querySelector('[data-icon]')) {
            chatContainers.add(parent);
            break;
          }
          parent = parent.parentElement;
        }
      });

      return Array.from(chatContainers);
    }

    const tabId = await getTabId();

    while (chatIndex < maxChats && consecutiveNoNewMessages < 3) {
      // Znajdź aktualne czaty (mogą się ładować nowe przy scrollowaniu)
      const chatItems = findChatItems();

      if (chatIndex >= chatItems.length) {
        // Scrolluj listę czatów w dół żeby załadować więcej
        console.log('WhatsApp Sync: Scrolling chat list to load more');
        sidePanel.scrollTop = sidePanel.scrollHeight;
        await new Promise(r => setTimeout(r, 1000));

        const newChatItems = findChatItems();
        if (newChatItems.length <= chatItems.length) {
          console.log('WhatsApp Sync: No more chats to load');
          break;
        }
        continue;
      }

      const chatEl = chatItems[chatIndex];
      chatIndex++;

      try {
        // Pobierz pozycję i kliknij
        const rect = chatEl.getBoundingClientRect();

        // Jeśli element nie jest widoczny, scrolluj do niego
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
          chatEl.scrollIntoView({ block: 'center' });
          await new Promise(r => setTimeout(r, 300));
        }

        const newRect = chatEl.getBoundingClientRect();
        const centerX = Math.round(newRect.left + newRect.width / 2);
        const centerY = Math.round(newRect.top + newRect.height / 2);

        console.log(`WhatsApp Sync: Clicking chat ${chatIndex}`);

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

        // Sync
        const phone = getCurrentChatPhone();
        const name = getCurrentChatName();
        const messages = getMessagesFromChat();

        if (phone && messages.length > 0) {
          const result = await syncMessages(messages, phone, name);
          const newMessages = result.inserted || 0;

          results.push({ phone, name, ...result });
          totalInserted += newMessages;
          totalSkipped += result.skipped || 0;

          console.log(`WhatsApp Sync: Chat ${chatIndex} (${name || phone}): +${newMessages} new, ${result.skipped || 0} skipped`);

          // Sprawdź czy są nowe wiadomości
          if (newMessages === 0) {
            consecutiveNoNewMessages++;
            console.log(`WhatsApp Sync: No new messages (${consecutiveNoNewMessages} consecutive)`);
          } else {
            consecutiveNoNewMessages = 0;
          }

          // Powiadom popup
          if (isExtensionContextValid()) {
            chrome.runtime.sendMessage({
              type: 'SYNC_PROGRESS',
              data: {
                current: chatIndex,
                total: '?',
                name: name || phone,
                inserted: totalInserted
              }
            }).catch(() => {});
          }
        } else {
          console.log(`WhatsApp Sync: Chat ${chatIndex}: no phone or messages, skipping`);
        }

        // Przerwa między czatami
        await new Promise(r => setTimeout(r, 800));

      } catch (err) {
        console.error('WhatsApp Sync: Error processing chat', chatIndex, err);
      }
    }

    // Odłącz debugger po zakończeniu
    if (isExtensionContextValid()) {
      chrome.runtime.sendMessage({ type: 'DETACH_DEBUGGER' }).catch(() => {});
    }

    const reason = consecutiveNoNewMessages >= 3
      ? 'Dotarliśmy do zsynchronizowanych czatów'
      : 'Osiągnięto limit czatów';

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

  // Inicjalizacja
  async function init() {
    console.log('WhatsApp CRM Sync: Initializing...');
    await loadConfig();

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
          return;
        }
      }

      if (attempts >= maxAttempts) {
        clearInterval(checkReady);
        console.log('WhatsApp CRM Sync: Timeout waiting for WhatsApp. Starting anyway...');
        observeChatChanges();
        startAutoSync();
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
