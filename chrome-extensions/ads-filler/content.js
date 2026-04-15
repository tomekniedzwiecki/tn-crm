// Content script: detect ad form fields and fill with variants
// Strategy: label text matching (PL/EN), React-compatible event dispatch,
// visual feedback overlay, mutation observer for dynamic forms.

(function () {
  if (window.__TN_ADS_FILLER__) return;
  window.__TN_ADS_FILLER__ = true;

  // ============================================================
  // Log buffer — captures all [TN Ads Filler] messages
  // ============================================================
  const LOG_BUFFER = [];
  const MAX_LOGS = 200;
  ['log', 'warn', 'error'].forEach(level => {
    const orig = console[level].bind(console);
    console[level] = (...args) => {
      const msg = args.map(a => {
        try { return typeof a === 'string' ? a : JSON.stringify(a); }
        catch { return String(a); }
      }).join(' ');
      if (msg.includes('[TN Ads Filler]')) {
        LOG_BUFFER.push({ t: Date.now(), level, msg });
        if (LOG_BUFFER.length > MAX_LOGS) LOG_BUFFER.shift();
      }
      orig(...args);
    };
  });

  // ============================================================
  // Field detection
  // ============================================================

  const ADD_BUTTON_PATTERNS = {
    primary_text: [
      /dodaj.*opcj.*tekst/i,
      /dodaj.*podstawowy.*tekst/i,
      /dodaj.*tekst/i,
      /add.*primary.*text/i,
      /add.*text.*option/i
    ],
    headline: [
      /dodaj.*nag[lł][oó]wek/i,
      /dodaj.*opcj.*nag[lł]/i,
      /add.*headline/i,
      /add.*title/i
    ],
    description: [
      /dodaj.*opcj.*opis/i,
      /dodaj.*opis/i,
      /add.*description/i
    ]
  };

  const FIELD_PATTERNS = {
    primary_text: [
      /^podstawowy\s*tekst/i,
      /^primary\s*text/i,
      /^main\s*text/i,
      /^tekst\s*g[lł][oó]wny/i,
      /poinformuj\s*odbiorc/i,
      /tell people what your ad is about/i,
      /wprowad[zź].*kolejn.*wersj.*tekst/i,
      /enter another.*primary text/i
    ],
    headline: [
      /^nag[lł][oó]wek/i,
      /^headline/i,
      /^tytu[lł]/i,
      /^title$/i,
      /napisz.*kr[oó]tki.*nag[lł][oó]wek/i,
      /write a short headline/i,
      /wprowad[zź].*kolejn.*wersj.*nag[lł][oó]wk/i,
      /enter another.*headline/i
    ],
    description: [
      /^opis/i,
      /^description/i,
      /za[lł][aą]cz.*dodatkowe.*informacj/i,
      /include additional details/i,
      /include additional information/i,
      /wprowad[zź].*kolejn.*wersj.*opis/i,
      /enter another.*description/i
    ],
    cta: [
      /^wezwanie\s*do\s*dzia[lł]ania/i,
      /^call\s*to\s*action/i,
      /^cta$/i,
      /^przycisk/i
    ]
  };

  // Patterns that EXCLUDE a field from being matched (e.g. URL fields)
  const EXCLUDE_PATTERNS = [
    /adres\s*url/i,
    /wprowad[zź].*url/i,
    /website\s*url/i,
    /enter.*url/i,
    /display.*link/i,
    /link.*wy[sś]wietlan/i
  ];

  // Normalise label text
  const clean = (s) => String(s || '').replace(/\s+/g, ' ').replace(/[*•·:]/g, '').trim();

  function matchFieldType(text) {
    const t = clean(text);
    if (!t) return null;
    if (EXCLUDE_PATTERNS.some(re => re.test(t))) return null;
    for (const [type, patterns] of Object.entries(FIELD_PATTERNS)) {
      if (patterns.some(re => re.test(t))) return type;
    }
    return null;
  }

  // Collect ALL label-like text signals for a field (aria-label, labelledby, placeholder, nearby)
  function collectLabelSignals(el) {
    const signals = [];
    const aria = el.getAttribute('aria-label');
    if (aria) signals.push(aria);
    const labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      labelledBy.split(/\s+/).forEach(id => {
        const lbl = document.getElementById(id);
        if (lbl) signals.push(lbl.innerText || lbl.textContent || '');
      });
    }
    if (el.id) {
      const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lbl) signals.push(lbl.innerText);
    }
    if (el.placeholder) signals.push(el.placeholder);
    const wrap = el.closest('label');
    if (wrap) signals.push(wrap.innerText);
    // Heuristic walk
    const walked = findLabelFor(el);
    if (walked) signals.push(walked);
    return signals.filter(Boolean);
  }

  function matchFieldTypeFromSignals(signals) {
    for (const sig of signals) {
      const t = clean(sig);
      if (!t) continue;
      if (EXCLUDE_PATTERNS.some(re => re.test(t))) return null;
      for (const [type, patterns] of Object.entries(FIELD_PATTERNS)) {
        if (patterns.some(re => re.test(t))) return type;
      }
    }
    return null;
  }

  // Find all inputs/textareas/selects on page with a label that matches one of our types.
  // Groups by field type and returns arrays (preserving DOM order for 5x5 scenarios).
  function scanFields() {
    const result = { primary_text: [], headline: [], description: [], cta: [] };
    const inputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type]), textarea, [contenteditable="true"], select, [role="combobox"], [role="listbox"]'));

    for (const input of inputs) {
      // Skip hidden
      if (input.offsetParent === null && input.getClientRects().length === 0) continue;
      if (input.disabled || input.readOnly) continue;

      const signals = collectLabelSignals(input);
      const type = matchFieldTypeFromSignals(signals);
      if (type) {
        result[type].push({ element: input, label: signals[0] || '' });
      }
    }

    // Section-based fallback: find containers with the "Dodaj opcję X" button
    // and attach any unrecognized fields inside them to the matching type.
    attachByAddButton(result);

    return result;
  }

  // Find section containing "Dodaj opcję tekstu/nagłówka/opisu" button and
  // attach any visible inputs/textareas inside that section to matching type.
  function attachByAddButton(result) {
    const allKnown = new Set(Object.values(result).flat().map(f => f.element));
    const allBtns = Array.from(document.querySelectorAll('button, [role="button"]'))
      .filter(b => b.offsetParent !== null);

    const typeFromBtn = (btn) => {
      const txt = clean(btn.innerText || btn.textContent || '');
      if (!/dodaj|add/i.test(txt)) return null;
      if (ADD_BUTTON_PATTERNS.primary_text.some(re => re.test(txt))) return 'primary_text';
      if (ADD_BUTTON_PATTERNS.headline.some(re => re.test(txt))) return 'headline';
      if (ADD_BUTTON_PATTERNS.description.some(re => re.test(txt))) return 'description';
      return null;
    };

    for (const btn of allBtns) {
      const type = typeFromBtn(btn);
      if (!type) continue;
      // Walk up to find the section container (big enough to include sibling fields)
      let container = btn.parentElement;
      for (let i = 0; i < 6 && container; i++) {
        // If container has at least one known field of this type, stop here
        const hasKnown = result[type].some(f => container.contains(f.element));
        if (hasKnown) break;
        container = container.parentElement;
      }
      if (!container) continue;
      // Pick up visible textareas/inputs inside container that aren't already known
      const siblings = container.querySelectorAll(FIELD_SELECTOR);
      for (const el of siblings) {
        if (allKnown.has(el)) continue;
        if (el.offsetParent === null) continue;
        if (el.disabled || el.readOnly) continue;
        // Skip obvious URL fields
        const signals = collectLabelSignals(el);
        if (signals.some(s => EXCLUDE_PATTERNS.some(re => re.test(s)))) continue;
        result[type].push({ element: el, label: `${type} (by section)` });
        allKnown.add(el);
      }
    }
  }

  // Walk up the DOM looking for a label-like text
  function findLabelFor(el) {
    // 1. aria-label
    const aria = el.getAttribute('aria-label');
    if (aria) return aria;

    // 2. associated <label for="id">
    if (el.id) {
      const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lbl) return lbl.innerText;
    }

    // 3. aria-labelledby
    const labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      const lbl = document.getElementById(labelledBy);
      if (lbl) return lbl.innerText;
    }

    // 4. closest label (wrapping)
    const wrappingLabel = el.closest('label');
    if (wrappingLabel) return wrappingLabel.innerText;

    // 5. Walk up ancestors, look for text labels above the element
    let node = el;
    for (let depth = 0; depth < 10 && node; depth++) {
      const parent = node.parentElement;
      if (!parent) break;

      // Check all previous siblings (not just first) at this level
      let sib = node.previousElementSibling;
      while (sib) {
        // Try direct text of common label tags
        const tag = sib.tagName;
        const isLabelish = tag === 'LABEL' || tag === 'STRONG' || tag === 'B' ||
                           /^H[1-6]$/.test(tag) || tag === 'LEGEND' || tag === 'DT' ||
                           tag === 'SPAN' || tag === 'DIV' || tag === 'P';
        if (isLabelish) {
          // Strip info-icon buttons/svgs to get cleaner text
          const clone = sib.cloneNode(true);
          clone.querySelectorAll('button, svg, [role="tooltip"], [aria-hidden="true"]').forEach(n => n.remove());
          const txt = (clone.innerText || clone.textContent || '').trim();
          if (txt && txt.length > 1 && txt.length < 100) return txt;
        }
        sib = sib.previousElementSibling;
      }

      // Check for heading/label elements inside parent that come BEFORE our element
      const headings = parent.querySelectorAll('label, strong, [role="heading"], h1, h2, h3, h4, h5, h6, legend, dt, [data-testid*="label" i]');
      for (const h of headings) {
        if (h === el || h.contains(el)) continue;
        // ensure it appears before our node in DOM order
        const pos = h.compareDocumentPosition(el);
        if (!(pos & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
        const clone = h.cloneNode(true);
        clone.querySelectorAll('button, svg, [role="tooltip"]').forEach(n => n.remove());
        const txt = (clone.innerText || clone.textContent || '').trim();
        if (txt && txt.length > 1 && txt.length < 100) return txt;
      }

      node = parent;
    }

    // 6. placeholder last-ditch fallback
    if (el.placeholder) return el.placeholder;

    return '';
  }

  // ============================================================
  // Smart setters (React/Vue compatible)
  // ============================================================

  function fillContentEditable(el, value) {
    el.focus();
    // Select all existing content so it gets replaced
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch {}

    // Strategy 1: simulate paste (best for Lexical/Draft.js in Meta Ads)
    try {
      const dt = new DataTransfer();
      dt.setData('text/plain', value);
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: dt,
        bubbles: true,
        cancelable: true
      });
      // Some editors block paste; check if it was prevented
      const accepted = el.dispatchEvent(pasteEvent);
      if (accepted && el.textContent && el.textContent.includes(value.slice(0, 20))) {
        return true;
      }
    } catch {}

    // Strategy 2: beforeinput with insertFromPaste
    try {
      const dt2 = new DataTransfer();
      dt2.setData('text/plain', value);
      el.dispatchEvent(new InputEvent('beforeinput', {
        inputType: 'insertFromPaste',
        data: value,
        dataTransfer: dt2,
        bubbles: true,
        cancelable: true
      }));
      if (el.textContent && el.textContent.includes(value.slice(0, 20))) return true;
    } catch {}

    // Strategy 3: execCommand insertText (legacy but works)
    try {
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, value);
      if (el.textContent && el.textContent.includes(value.slice(0, 20))) return true;
    } catch {}

    // Strategy 4: direct textContent as last resort (may not trigger React)
    el.textContent = value;
    el.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: value, bubbles: true }));
    return true;
  }

  function setInputValue(el, value) {
    if (el.isContentEditable) {
      return fillContentEditable(el, value);
    }

    const tag = el.tagName;
    const proto = tag === 'TEXTAREA' ? HTMLTextAreaElement.prototype :
                  tag === 'SELECT' ? HTMLSelectElement.prototype :
                  HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;

    el.focus();
    if (setter) {
      setter.call(el, value);
    } else {
      el.value = value;
    }
    // React listens to input + change; some editors also want keydown/keyup
    el.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: value, bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  // CTA dropdown handling — try to match text to option
  const CTA_MAP = {
    'kup teraz': ['SHOP_NOW', 'Shop Now', 'Kup teraz'],
    'dowiedz się więcej': ['LEARN_MORE', 'Learn More', 'Dowiedz się więcej'],
    'sprawdź': ['LEARN_MORE', 'Learn More', 'Sprawdź'],
    'zarejestruj': ['SIGN_UP', 'Sign Up', 'Zarejestruj się'],
    'pobierz': ['DOWNLOAD', 'Download', 'Pobierz'],
    'zamów': ['ORDER_NOW', 'Order Now', 'Zamów'],
    'subskrybuj': ['SUBSCRIBE', 'Subscribe'],
    'zapisz się': ['SIGN_UP', 'Sign Up', 'Zapisz się']
  };

  function setSelectByText(select, wantText) {
    const want = clean(wantText).toLowerCase();
    // Try exact option text
    for (const opt of select.options) {
      if (clean(opt.textContent).toLowerCase() === want) {
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }
    // Map to known synonyms
    for (const [key, synonyms] of Object.entries(CTA_MAP)) {
      if (want.includes(key)) {
        for (const syn of synonyms) {
          const synLower = syn.toLowerCase();
          for (const opt of select.options) {
            const optText = clean(opt.textContent).toLowerCase();
            if (optText === synLower || optText.includes(synLower)) {
              select.value = opt.value;
              select.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  // ============================================================
  // Fill logic
  // ============================================================

  function highlight(el, color = '#10b981') {
    const prev = {
      outline: el.style.outline,
      outlineOffset: el.style.outlineOffset,
      transition: el.style.transition
    };
    el.style.transition = 'outline 0.2s ease';
    el.style.outline = `2px solid ${color}`;
    el.style.outlineOffset = '2px';
    setTimeout(() => {
      el.style.outline = prev.outline;
      el.style.outlineOffset = prev.outlineOffset;
      el.style.transition = prev.transition;
    }, 2000);
  }

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Find "Add option" button for a field type. Strategy: look near existing fields
  // of that type for a button/anchor whose text matches ADD_BUTTON_PATTERNS.
  function findAddButton(typeKey, existingFields) {
    const patterns = ADD_BUTTON_PATTERNS[typeKey] || [];
    if (!patterns.length) return null;

    // Collect candidate container sections — walk up from last existing field
    const searchRoots = [];
    if (existingFields && existingFields.length) {
      const last = existingFields[existingFields.length - 1].element;
      let node = last;
      for (let i = 0; i < 8 && node; i++) {
        searchRoots.push(node);
        node = node.parentElement;
      }
    }
    searchRoots.push(document);

    const isVisible = (el) => el.offsetParent !== null || el.getClientRects().length > 0;

    for (const root of searchRoots) {
      const buttons = root.querySelectorAll('button, [role="button"], a');
      for (const btn of buttons) {
        if (!isVisible(btn)) continue;
        if (btn.disabled) continue;
        const txt = clean(btn.innerText || btn.textContent || btn.getAttribute('aria-label') || '');
        if (!txt || txt.length > 80) continue;
        if (patterns.some(re => re.test(txt))) {
          return btn;
        }
      }
    }
    return null;
  }

  function dispatchRealClick(el) {
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const opts = { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, view: window };
    el.dispatchEvent(new PointerEvent('pointerdown', opts));
    el.dispatchEvent(new MouseEvent('mousedown', opts));
    el.dispatchEvent(new PointerEvent('pointerup', opts));
    el.dispatchEvent(new MouseEvent('mouseup', opts));
    el.dispatchEvent(new MouseEvent('click', opts));
  }

  const FIELD_SELECTOR = 'input[type="text"], input:not([type]), textarea, [contenteditable="true"]';

  function snapshotInputs() {
    return new Set(document.querySelectorAll(FIELD_SELECTOR));
  }

  async function waitForNewField(beforeSet, timeoutMs = 1500) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const current = document.querySelectorAll(FIELD_SELECTOR);
      for (const el of current) {
        if (!beforeSet.has(el)) return el;
      }
      await sleep(80);
    }
    return null;
  }

  // Try to reveal "Dodaj opcję X" button by interacting with last existing field
  // (Meta renders the button only after focus+blur on a sibling input)
  async function revealAddButton(typeKey, fields) {
    const last = fields[typeKey][fields[typeKey].length - 1]?.element;
    if (!last) return null;

    // Try 1: focus the last field, trigger mouseenter on its wrapper
    try {
      const wrapper = last.closest('[role="group"], [class*="field" i], [data-testid]') || last.parentElement;
      if (wrapper) {
        wrapper.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      }
      last.focus();
      await sleep(200);
      // Trigger blur to convince Meta the user "exited" the field
      last.blur();
      document.body.focus();
      await sleep(400);
    } catch (e) {
      console.warn('[TN Ads Filler] revealAddButton error', e);
    }

    return findAddButton(typeKey, fields[typeKey]);
  }

  async function ensureFieldCount(typeKey, neededCount, maxClicks = 10) {
    let fields = scanFields();
    let clicks = 0;
    console.log(`[TN Ads Filler] ${typeKey}: have ${fields[typeKey].length}, need ${neededCount}`);
    const extraFields = [];

    while (fields[typeKey].length + extraFields.length < neededCount && clicks < maxClicks) {
      let btn = findAddButton(typeKey, fields[typeKey]);
      if (!btn) {
        // Try revealing button by interacting with last field
        console.log(`[TN Ads Filler] Trying to reveal add button for ${typeKey}`);
        btn = await revealAddButton(typeKey, fields);
      }
      if (!btn) {
        console.warn(`[TN Ads Filler] No add button found for ${typeKey} even after reveal attempt`);
        break;
      }
      console.log(`[TN Ads Filler] Click #${clicks + 1} for ${typeKey}:`, btn.innerText || btn.textContent);

      const before = snapshotInputs();
      btn.scrollIntoView({ block: 'center', behavior: 'instant' });
      try { btn.focus(); } catch {}
      dispatchRealClick(btn);
      clicks++;

      const newField = await waitForNewField(before, 1500);
      if (!newField) {
        console.warn(`[TN Ads Filler] No new field appeared after click for ${typeKey}`);
        break;
      }
      const prevCount = fields[typeKey].length;
      fields = scanFields();
      if (fields[typeKey].length === prevCount) {
        extraFields.push({ element: newField, label: `${typeKey} (auto #${extraFields.length + 1})` });
        console.log(`[TN Ads Filler] Fallback: tracking new field manually for ${typeKey}`);
      }
    }

    if (extraFields.length) {
      fields[typeKey] = [...fields[typeKey], ...extraFields];
    }
    return fields;
  }

  async function fillFields(versions, options = {}) {
    const { variantIndex = null, onlyType = null } = options;

    // If filling all variants, expand field count to match versions count
    let fields = scanFields();
    if (variantIndex == null) {
      for (const typeKey of ['primary_text', 'headline', 'description']) {
        if (onlyType && onlyType !== typeKey) continue;
        const expanded = await ensureFieldCount(typeKey, versions.length);
        // Merge expanded for this type (preserves any extras tracked manually)
        fields[typeKey] = expanded[typeKey];
        // Also refresh other types in case DOM changed
        fields.headline = fields.headline || expanded.headline;
        fields.description = fields.description || expanded.description;
        fields.cta = fields.cta || expanded.cta;
      }
    }

    const stats = { filled: 0, skipped: 0, byType: {} };

    const fillOne = (items, typeKey, valueFor) => {
      if (onlyType && onlyType !== typeKey) return;
      items.forEach((item, idx) => {
        const version = variantIndex != null ? versions[variantIndex] : versions[idx % versions.length];
        if (!version) return;
        const val = valueFor(version);
        if (!val) {
          stats.skipped++;
          highlight(item.element, '#f59e0b');
          return;
        }
        try {
          let ok;
          if (typeKey === 'cta' && item.element.tagName === 'SELECT') {
            ok = setSelectByText(item.element, val);
          } else {
            ok = setInputValue(item.element, val);
          }
          if (ok) {
            stats.filled++;
            stats.byType[typeKey] = (stats.byType[typeKey] || 0) + 1;
            highlight(item.element, '#10b981');
          } else {
            stats.skipped++;
            highlight(item.element, '#ef4444');
          }
        } catch (e) {
          console.error('[TN Ads Filler] fill error', e);
          stats.skipped++;
          highlight(item.element, '#ef4444');
        }
      });
    };

    fillOne(fields.primary_text, 'primary_text', v => v.primary_text);
    fillOne(fields.headline, 'headline', v => v.headline);
    fillOne(fields.description, 'description', v => v.description);
    fillOne(fields.cta, 'cta', v => v.cta);

    return stats;
  }

  // ============================================================
  // Toast UI
  // ============================================================

  function toast(message, kind = 'success') {
    let root = document.getElementById('__tn_ads_toast__');
    if (!root) {
      root = document.createElement('div');
      root.id = '__tn_ads_toast__';
      root.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 2147483647;
        display: flex; flex-direction: column; gap: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      document.body.appendChild(root);
    }
    const bgMap = { success: '#10b981', warn: '#f59e0b', error: '#ef4444', info: '#3b82f6' };
    const iconMap = { success: '✓', warn: '!', error: '✕', info: 'i' };
    const item = document.createElement('div');
    item.style.cssText = `
      background: #111; color: #fff;
      border-left: 3px solid ${bgMap[kind] || bgMap.info};
      padding: 10px 14px; border-radius: 8px;
      font-size: 13px; line-height: 1.4; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      max-width: 360px; display: flex; gap: 10px; align-items: flex-start;
    `;
    item.innerHTML = `<span style="color:${bgMap[kind] || bgMap.info}; font-weight: 700;">${iconMap[kind] || 'i'}</span><span>${message}</span>`;
    root.appendChild(item);
    setTimeout(() => {
      item.style.transition = 'opacity 0.3s';
      item.style.opacity = '0';
      setTimeout(() => item.remove(), 300);
    }, 3500);
  }

  // ============================================================
  // Message handling
  // ============================================================

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    (async () => {
      try {
        if (msg.type === 'ping') {
          sendResponse({ ok: true, pong: true });
        } else if (msg.type === 'diagnose') {
          const fields = scanFields();
          const fieldDump = ['primary_text','headline','description','cta'].flatMap(type =>
            fields[type].map(f => ({
              type,
              tag: f.element.tagName,
              editable: f.element.isContentEditable,
              label_matched: f.label,
              aria_label: f.element.getAttribute('aria-label'),
              placeholder: f.element.placeholder,
              current_value: (f.element.value || f.element.textContent || '').slice(0, 80)
            }))
          );
          const unmatchedInputs = Array.from(document.querySelectorAll(FIELD_SELECTOR))
            .filter(el => el.offsetParent !== null && !el.disabled && !el.readOnly)
            .filter(el => !['primary_text','headline','description','cta'].some(type =>
              fields[type].some(f => f.element === el)))
            .slice(0, 10)
            .map(el => ({
              tag: el.tagName,
              editable: el.isContentEditable,
              aria_label: el.getAttribute('aria-label'),
              placeholder: el.placeholder,
              labelledby_text: (() => {
                const id = el.getAttribute('aria-labelledby');
                if (!id) return null;
                return id.split(/\s+/).map(x => document.getElementById(x)?.innerText || '').join(' | ');
              })(),
              parent_text: (el.parentElement?.innerText || '').slice(0, 80)
            }));
          const allButtons = Array.from(document.querySelectorAll('button, [role="button"], [role="switch"], [role="checkbox"]'))
            .filter(b => b.offsetParent !== null)
            .map(b => ({
              text: (b.innerText || b.textContent || '').slice(0, 60).trim(),
              aria_label: b.getAttribute('aria-label'),
              role: b.getAttribute('role'),
              testid: b.getAttribute('data-testid'),
              aria_checked: b.getAttribute('aria-checked'),
              aria_pressed: b.getAttribute('aria-pressed')
            }))
            .filter(b => b.text || b.aria_label);
          const addButtons = allButtons.filter(b =>
            /dodaj|add|opcj|option|wiele|multiple|wariant|variant/i.test((b.text + ' ' + (b.aria_label || '')))
          ).slice(0, 30);
          sendResponse({
            ok: true,
            report: {
              url: location.href,
              title: document.title,
              matched_fields: fieldDump,
              unmatched_inputs: unmatchedInputs,
              add_buttons: addButtons,
              logs: LOG_BUFFER.slice(-80),
              user_agent: navigator.userAgent
            }
          });
        } else if (msg.type === 'scan') {
          const fields = scanFields();
          sendResponse({
            ok: true,
            counts: {
              primary_text: fields.primary_text.length,
              headline: fields.headline.length,
              description: fields.description.length,
              cta: fields.cta.length
            }
          });
        } else if (msg.type === 'fill_all') {
          if (!Array.isArray(msg.versions) || msg.versions.length === 0) {
            toast('Brak wariantów do wypełnienia', 'error');
            sendResponse({ ok: false, error: 'no_versions' });
            return;
          }
          toast('Dodaję pola i wypełniam...', 'info');
          const stats = await fillFields(msg.versions);
          const summary = `Wypełniono ${stats.filled} pól` +
            (stats.skipped ? ` (${stats.skipped} pominięto)` : '');
          toast(summary, stats.filled > 0 ? 'success' : 'warn');
          sendResponse({ ok: true, stats });
        } else if (msg.type === 'fill_variant') {
          const idx = msg.variant_index;
          if (!Number.isInteger(idx) || !Array.isArray(msg.versions) || !msg.versions[idx]) {
            sendResponse({ ok: false, error: 'invalid_variant' });
            return;
          }
          const stats = await fillFields(msg.versions, { variantIndex: idx });
          toast(`Wariant ${idx + 1}: wypełniono ${stats.filled} pól`, stats.filled > 0 ? 'success' : 'warn');
          sendResponse({ ok: true, stats });
        } else {
          sendResponse({ ok: false, error: 'unknown' });
        }
      } catch (e) {
        console.error('[TN Ads Filler] message error', e);
        sendResponse({ ok: false, error: e.message });
      }
    })();
    return true;
  });

  console.log('[TN Ads Filler] content script ready');
})();
