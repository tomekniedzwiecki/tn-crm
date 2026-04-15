// Content script: detect ad form fields and fill with variants
// Strategy: label text matching (PL/EN), React-compatible event dispatch,
// visual feedback overlay, mutation observer for dynamic forms.

(function () {
  if (window.__TN_ADS_FILLER__) return;
  window.__TN_ADS_FILLER__ = true;

  // ============================================================
  // Field detection
  // ============================================================

  const FIELD_PATTERNS = {
    primary_text: [
      /^podstawowy\s*tekst/i,
      /^primary\s*text/i,
      /^main\s*text/i,
      /^tekst\s*g[lł][oó]wny/i
    ],
    headline: [
      /^nag[lł][oó]wek/i,
      /^headline/i,
      /^tytu[lł]/i,
      /^title$/i
    ],
    description: [
      /^opis/i,
      /^description/i
    ],
    cta: [
      /^wezwanie\s*do\s*dzia[lł]ania/i,
      /^call\s*to\s*action/i,
      /^cta$/i,
      /^przycisk/i
    ]
  };

  // Normalise label text
  const clean = (s) => String(s || '').replace(/\s+/g, ' ').replace(/[*•·:]/g, '').trim();

  function matchFieldType(text) {
    const t = clean(text);
    if (!t) return null;
    for (const [type, patterns] of Object.entries(FIELD_PATTERNS)) {
      if (patterns.some(re => re.test(t))) return type;
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

      const label = findLabelFor(input);
      const type = matchFieldType(label);
      if (type) {
        result[type].push({ element: input, label });
      }
    }
    return result;
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

    // 5. placeholder fallback
    if (el.placeholder) return el.placeholder;

    // 6. Walk up ancestors, look for sibling heading/label-like text
    let node = el;
    for (let depth = 0; depth < 6 && node; depth++) {
      const parent = node.parentElement;
      if (!parent) break;
      // look for previous sibling with text
      let sib = parent.previousElementSibling;
      while (sib) {
        const txt = (sib.innerText || '').trim();
        if (txt && txt.length < 60 && txt.length > 1) return txt;
        sib = sib.previousElementSibling;
      }
      // look for first heading inside parent
      const heading = parent.querySelector('label, [role="heading"], h1, h2, h3, h4, h5, h6, legend, dt, [data-testid*="label" i]');
      if (heading && heading !== el && !heading.contains(el)) {
        const txt = (heading.innerText || '').trim();
        if (txt) return txt;
      }
      node = parent;
    }

    return '';
  }

  // ============================================================
  // Smart setters (React/Vue compatible)
  // ============================================================

  function setInputValue(el, value) {
    if (el.isContentEditable) {
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, value);
      return true;
    }

    const tag = el.tagName;
    const proto = tag === 'TEXTAREA' ? HTMLTextAreaElement.prototype :
                  tag === 'SELECT' ? HTMLSelectElement.prototype :
                  HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) {
      setter.call(el, value);
    } else {
      el.value = value;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
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

  function fillFields(versions, options = {}) {
    const { variantIndex = null, onlyType = null } = options;
    const fields = scanFields();
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
    try {
      if (msg.type === 'scan') {
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
          return true;
        }
        const stats = fillFields(msg.versions);
        const summary = `Wypełniono ${stats.filled} pól` +
          (stats.skipped ? ` (${stats.skipped} pominięto)` : '');
        toast(summary, stats.filled > 0 ? 'success' : 'warn');
        sendResponse({ ok: true, stats });
      } else if (msg.type === 'fill_variant') {
        const idx = msg.variant_index;
        if (!Number.isInteger(idx) || !Array.isArray(msg.versions) || !msg.versions[idx]) {
          sendResponse({ ok: false, error: 'invalid_variant' });
          return true;
        }
        const stats = fillFields(msg.versions, { variantIndex: idx });
        toast(`Wariant ${idx + 1}: wypełniono ${stats.filled} pól`, stats.filled > 0 ? 'success' : 'warn');
        sendResponse({ ok: true, stats });
      } else {
        sendResponse({ ok: false, error: 'unknown' });
      }
    } catch (e) {
      console.error('[TN Ads Filler] message error', e);
      sendResponse({ ok: false, error: e.message });
    }
    return true;
  });

  console.log('[TN Ads Filler] content script ready');
})();
