// Sidebar nawigacja dla sekcji /zwolnie/ (Design System v2)
window.ZE_Sidebar = (function() {
  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'ph-chart-line', href: '/zwolnie/' },
    { id: 'leads', label: 'Leady', icon: 'ph-users-three', href: '/zwolnie/leads', badge: true },
    { id: 'pipeline', label: 'Pipeline', icon: 'ph-kanban', href: '/zwolnie/pipeline' },
    { id: 'projects', label: 'Projekty', icon: 'ph-folder-simple', href: '/zwolnie/projects' },
    { id: 'prompts', label: 'Prompty AI', icon: 'ph-sparkle', href: '/zwolnie/prompts', magic: true }
  ];

  function render({ active = '', userEmail = '' } = {}) {
    const el = document.getElementById('ze-sidebar');
    if (!el) return;
    el.className = 'ds-sidebar';
    const initials = (userEmail || 'T').slice(0, 2).toUpperCase();
    el.innerHTML = `
      <div class="ds-nav">
        <a href="/zwolnie/" class="ds-nav__brand">
          <span class="ds-nav__brand-mark">Z</span>
          <span class="ds-nav__brand-text">
            <span class="ds-nav__brand-name">Zwolnię</span>
            <span class="ds-nav__brand-sub">CRM · v2</span>
          </span>
        </a>

        <div class="ds-nav__section">
          <div class="ds-nav__section-label">Workspace</div>
          ${NAV.map(item => {
            const isActive = item.id === active;
            const iconColor = item.magic && !isActive ? 'style="color: var(--ds-magic)"' : '';
            return `
              <a href="${item.href}" class="ds-nav__item ${isActive ? 'is-active' : ''}">
                <i class="ph ${item.icon}" ${iconColor}></i>
                <span>${item.label}</span>
                ${item.badge ? `<span id="ze-sidebar-badge-${item.id}" class="ds-nav__badge ds-hidden"></span>` : ''}
              </a>
            `;
          }).join('')}
        </div>

        <div class="ds-nav__footer">
          <button onclick="ZE_Sidebar.toggleProfile()" id="ze-sb-profile" class="ds-nav__profile">
            <span class="ds-avatar" style="width:32px;height:32px;font-size:11px;background:linear-gradient(135deg,#525252,#262626);border:1px solid var(--ds-border-hover)">${initials}</span>
            <div class="ds-nav__profile-info">
              <div class="ds-nav__profile-email">${userEmail}</div>
              <div class="ds-nav__profile-role">Admin</div>
            </div>
            <i class="ph ph-caret-up-down" style="color: var(--ds-fg-5); font-size: 14px;"></i>
          </button>
          <div id="ze-sb-profile-menu" class="ds-hidden" style="padding-top: 4px; margin-top: 4px; border-top: 1px solid var(--ds-border);">
            <button onclick="ZE_Sidebar.changePassword()" class="ds-nav__item" style="width:100%;text-align:left;background:transparent;border:none">
              <i class="ph ph-key"></i><span>Zmień hasło</span>
            </button>
            <a href="/dashboard" class="ds-nav__item">
              <i class="ph ph-arrow-square-out"></i><span>tn-crm główne</span>
            </a>
            <button onclick="ZE_Auth.logout()" class="ds-nav__item" style="width:100%;text-align:left;background:transparent;border:none;color:#FCA5A5">
              <i class="ph ph-sign-out"></i><span>Wyloguj</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function toggleProfile() {
    document.getElementById('ze-sb-profile-menu')?.classList.toggle('ds-hidden');
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
            <p class="ds-small ds-mt-2">Min. 10 znaków. Skopiuj sobie.</p>
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
          <button data-act="ok" class="ds-btn ds-btn--primary">Zapisz hasło</button>
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

  return { render, setBadge, changePassword, toggleProfile };
})();
