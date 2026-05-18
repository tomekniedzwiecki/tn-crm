// Slim icon-only sidebar (Linear/Raycast style) z tooltipami
window.ZE_Sidebar = (function() {
  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'ph-house', href: '/zwolnie/' },
    { id: 'leads', label: 'Leady', icon: 'ph-users-three', href: '/zwolnie/leads', badge: true },
    { id: 'pipeline', label: 'Pipeline', icon: 'ph-kanban', href: '/zwolnie/pipeline' },
    { id: 'projects', label: 'Projekty', icon: 'ph-folder-simple', href: '/zwolnie/projects' },
  ];
  const NAV_AI = [
    { id: 'prompts', label: 'Prompty AI', icon: 'ph-sparkle', href: '/zwolnie/prompts' }
  ];

  function render({ active = '', userEmail = '' } = {}) {
    const el = document.getElementById('ze-sidebar');
    if (!el) return;
    el.className = 'ds-sidebar';
    const initials = (userEmail || 'T').slice(0, 2).toUpperCase();

    const navHtml = (items) => items.map(item => {
      const isActive = item.id === active;
      return `
        <a href="${item.href}" data-label="${item.label}" class="ds-nav__item ${isActive ? 'is-active' : ''}">
          <i class="ph ${item.icon}"></i>
          ${item.badge ? `<span id="ze-sidebar-badge-${item.id}" class="ds-nav__badge ds-hidden"></span>` : ''}
        </a>
      `;
    }).join('');

    el.innerHTML = `
      <div class="ds-nav">
        <a href="/zwolnie/" class="ds-nav__brand" title="Zwolnię">
          <span class="ds-nav__brand-mark">Z</span>
        </a>

        <div class="ds-nav__section">
          ${navHtml(NAV)}
          <div class="ds-nav__divider"></div>
          ${navHtml(NAV_AI)}
        </div>

        <div class="ds-nav__footer">
          <button onclick="ZE_Sidebar.openProfile()" data-label="${userEmail}" class="ds-nav__item">
            <span style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#525252,#262626);border:1px solid var(--ds-border-hover);color:#fff;font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:center">${initials}</span>
          </button>
        </div>
      </div>
    `;
  }

  function openProfile() {
    const userEmail = document.querySelector('.ds-nav__footer .ds-nav__item')?.dataset.label || '';
    const initials = (userEmail || 'T').slice(0, 2).toUpperCase();
    const wrap = document.createElement('div');
    wrap.className = 'ds-modal-backdrop';
    wrap.innerHTML = `
      <div class="ds-modal" style="max-width: 320px;">
        <div class="ds-modal__body" style="padding: var(--ds-s-5);">
          <div class="ds-flex ds-items-center ds-gap-3 ds-mb-4">
            <span class="ds-avatar" style="width:44px;height:44px;font-size:14px;background:linear-gradient(135deg,#525252,#262626);border:1px solid var(--ds-border-hover)">${initials}</span>
            <div style="min-width:0">
              <div class="ds-fg-1 ds-truncate" style="font-weight:600;font-size:14px">${userEmail}</div>
              <div class="ds-xs">Admin</div>
            </div>
          </div>
          <div class="ds-flex-col ds-gap-1">
            <button data-act="pwd" class="ds-btn ds-btn--ghost" style="justify-content:flex-start;height:36px"><i class="ph ph-key"></i> Zmień hasło</button>
            <a href="/dashboard" class="ds-btn ds-btn--ghost" style="justify-content:flex-start;height:36px"><i class="ph ph-arrow-square-out"></i> tn-crm główne</a>
            <div class="ds-divider"></div>
            <button data-act="logout" class="ds-btn ds-btn--ghost" style="justify-content:flex-start;height:36px;color:#FCA5A5"><i class="ph ph-sign-out"></i> Wyloguj</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
    const close = () => wrap.remove();
    wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
    wrap.querySelector('[data-act="pwd"]').addEventListener('click', () => { close(); changePassword(); });
    wrap.querySelector('[data-act="logout"]').addEventListener('click', () => ZE_Auth.logout());
  }

  function setBadge(itemId, value) {
    const el = document.getElementById('ze-sidebar-badge-' + itemId);
    if (!el) return;
    if (value == null || value === 0) { el.classList.add('ds-hidden'); return; }
    el.textContent = String(value);
    el.classList.remove('ds-hidden');
  }

  async function changePassword() {
    const wrap = document.createElement('div');
    wrap.className = 'ds-modal-backdrop';
    wrap.innerHTML = `
      <div class="ds-modal" style="max-width: 400px;">
        <div class="ds-modal__header">
          <div>
            <h3 class="ds-h3">Zmień hasło</h3>
            <p class="ds-small ds-mt-2">Min. 10 znaków.</p>
          </div>
          <button data-act="cancel" class="ds-btn ds-btn--ghost ds-btn--sm"><i class="ph ph-x"></i></button>
        </div>
        <div class="ds-modal__body">
          <div class="ds-flex-col ds-gap-3">
            <div class="ds-field">
              <label class="ds-field__label">Nowe hasło</label>
              <input type="password" id="ze-newpass" minlength="10" class="ds-input ds-input--lg" autocomplete="new-password">
            </div>
            <div class="ds-field">
              <label class="ds-field__label">Powtórz</label>
              <input type="password" id="ze-newpass2" minlength="10" class="ds-input ds-input--lg" autocomplete="new-password">
            </div>
            <div id="ze-pwd-err" class="ds-field__error ds-hidden"></div>
            <button data-act="gen" class="ds-btn ds-btn--ghost ds-btn--sm" style="align-self: flex-start;"><i class="ph ph-sparkle"></i> Wygeneruj mocne</button>
          </div>
        </div>
        <div class="ds-modal__footer">
          <button data-act="cancel" class="ds-btn ds-btn--ghost">Anuluj</button>
          <button data-act="ok" class="ds-btn ds-btn--primary">Zapisz</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
    const close = () => wrap.remove();
    const i1 = wrap.querySelector('#ze-newpass');
    const i2 = wrap.querySelector('#ze-newpass2');
    const err = wrap.querySelector('#ze-pwd-err');
    setTimeout(() => i1.focus(), 50);
    wrap.querySelectorAll('[data-act="cancel"]').forEach(b => b.addEventListener('click', close));
    wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
    wrap.querySelector('[data-act="gen"]').addEventListener('click', () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
      const arr = new Uint32Array(16);
      crypto.getRandomValues(arr);
      const s = Array.from(arr).map(n => chars[n % chars.length]).join('');
      i1.type = 'text'; i2.type = 'text';
      i1.value = s; i2.value = s;
    });
    wrap.querySelector('[data-act="ok"]').addEventListener('click', async () => {
      err.classList.add('ds-hidden');
      if (i1.value.length < 10) { err.textContent = 'Min. 10 znaków.'; err.classList.remove('ds-hidden'); return; }
      if (i1.value !== i2.value) { err.textContent = 'Hasła się różnią.'; err.classList.remove('ds-hidden'); return; }
      const { error } = await ZE_SB.auth.updateUser({ password: i1.value });
      if (error) { err.textContent = error.message; err.classList.remove('ds-hidden'); return; }
      close();
      ZE.toast('Hasło zmienione.', 'success', 5000);
    });
  }

  // Global ⌘K palette
  function openPalette() {
    const wrap = document.createElement('div');
    wrap.className = 'ds-modal-backdrop';
    wrap.style.alignItems = 'flex-start';
    wrap.style.paddingTop = '15vh';
    wrap.innerHTML = `
      <div class="ds-modal" style="max-width: 560px;">
        <div style="padding: 4px;">
          <div class="ds-input-group" style="margin: 0;">
            <i class="ph ph-magnifying-glass ds-input-group__icon"></i>
            <input id="palette-input" type="text" class="ds-input ds-input--lg" placeholder="Idź do, szukaj..." style="border:none;background:transparent;height:48px;font-size:15px" autocomplete="off">
          </div>
        </div>
        <div id="palette-list" style="max-height: 360px; overflow-y: auto; padding: 6px; border-top: 1px solid var(--ds-border);"></div>
      </div>
    `;
    document.body.appendChild(wrap);
    const input = wrap.querySelector('#palette-input');
    const list = wrap.querySelector('#palette-list');
    setTimeout(() => input.focus(), 50);
    const close = () => wrap.remove();
    wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    const items = [
      { label: 'Dashboard', href: '/zwolnie/', icon: 'ph-house', section: 'Idź do' },
      { label: 'Leady', href: '/zwolnie/leads', icon: 'ph-users-three', section: 'Idź do' },
      { label: 'Pipeline', href: '/zwolnie/pipeline', icon: 'ph-kanban', section: 'Idź do' },
      { label: 'Projekty', href: '/zwolnie/projects', icon: 'ph-folder-simple', section: 'Idź do' },
      { label: 'Prompty AI', href: '/zwolnie/prompts', icon: 'ph-sparkle', section: 'Idź do' },
      { label: 'Zmień hasło', action: 'pwd', icon: 'ph-key', section: 'Konto' },
      { label: 'Wyloguj', action: 'logout', icon: 'ph-sign-out', section: 'Konto' },
    ];

    function render(filter = '') {
      const q = filter.toLowerCase();
      const filtered = items.filter(i => !q || i.label.toLowerCase().includes(q));
      if (!filtered.length) { list.innerHTML = '<div class="ds-empty"><div class="ds-empty__desc">Nic nie znaleziono</div></div>'; return; }
      let html = '';
      let lastSection = '';
      filtered.forEach((it, idx) => {
        if (it.section !== lastSection) {
          html += `<div style="padding: 8px 12px 4px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ds-fg-5);">${it.section}</div>`;
          lastSection = it.section;
        }
        html += `<button data-idx="${idx}" class="palette-item" style="display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;border-radius:6px;background:transparent;border:none;color:var(--ds-fg-2);font-size:13px;text-align:left;cursor:pointer">
          <i class="ph ${it.icon}" style="font-size:16px;color:var(--ds-fg-4)"></i>
          <span>${it.label}</span>
        </button>`;
      });
      list.innerHTML = html;
      list.querySelectorAll('.palette-item').forEach((btn, i) => {
        btn.addEventListener('mouseenter', () => {
          list.querySelectorAll('.palette-item').forEach(b => b.style.background = '');
          btn.style.background = 'rgba(255,255,255,0.06)';
        });
        btn.addEventListener('click', () => {
          const it = filtered[i];
          if (it.href) location.href = it.href;
          else if (it.action === 'logout') ZE_Auth.logout();
          else if (it.action === 'pwd') { close(); changePassword(); return; }
          close();
        });
      });
      const first = list.querySelector('.palette-item');
      if (first) first.style.background = 'rgba(255,255,255,0.06)';
    }
    render();
    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { list.querySelector('.palette-item')?.click(); }
    });
  }

  // Mount global keyboard shortcut once
  if (!window.__zePaletteBound) {
    window.__zePaletteBound = true;
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openPalette();
      }
    });
  }

  return { render, setBadge, changePassword, openProfile, openPalette };
})();
