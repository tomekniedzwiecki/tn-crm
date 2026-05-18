// Sidebar nawigacja dla sekcji /zwolnie/
// Użycie: w HTML: <aside id="ze-sidebar"></aside>
// Potem: ZE_Sidebar.render({ active: 'leads' })

window.ZE_Sidebar = (function() {
  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'ph-chart-line', href: '/zwolnie/' },
    { id: 'leads', label: 'Leady', icon: 'ph-users-three', href: '/zwolnie/leads', badge: 'leadsCount' },
    { id: 'pipeline', label: 'Pipeline', icon: 'ph-kanban', href: '/zwolnie/pipeline' },
    { id: 'projects', label: 'Projekty', icon: 'ph-folder-simple', href: '/zwolnie/projects' },
    { id: 'prompts', label: 'Prompty AI', icon: 'ph-sparkle', href: '/zwolnie/prompts' }
  ];

  function render({ active = '', userEmail = '' } = {}) {
    const el = document.getElementById('ze-sidebar');
    if (!el) return;
    const initials = (userEmail || 'T').slice(0, 2).toUpperCase();
    el.innerHTML = `
      <div class="flex flex-col h-full bg-zinc-950" style="position:relative;z-index:2">
        <div class="px-5 py-5 border-b border-white/5">
          <a href="/zwolnie/" class="flex items-center gap-2.5 text-white group">
            <span class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-bold text-sm shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">Z</span>
            <div>
              <div class="font-semibold tracking-tight text-[15px] leading-none">Zwolnię</div>
              <div class="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">CRM · v1</div>
            </div>
          </a>
        </div>

        <div class="px-5 pt-5 pb-2 text-[10px] uppercase tracking-widest text-zinc-600 font-medium">Workspace</div>
        <nav class="flex-1 px-3 space-y-0.5 overflow-y-auto">
          ${NAV.map(item => {
            const isActive = item.id === active;
            return `
              <a href="${item.href}"
                 class="ze-nav-item ${isActive ? 'is-active' : ''} flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all ${isActive
                   ? 'bg-white/[0.06] text-white font-medium'
                   : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'}">
                <i class="ph ${item.icon} text-base ${isActive ? 'text-emerald-400' : ''}"></i>
                <span>${item.label}</span>
                ${item.badge ? `<span id="ze-sidebar-badge-${item.id}" class="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium"></span>` : ''}
              </a>
            `;
          }).join('')}
        </nav>

        <div class="px-3 pb-3 pt-3 border-t border-white/5 mt-2">
          <button onclick="ZE_Sidebar.toggleProfile()" id="ze-sb-profile" class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.04] transition-all text-left">
            <span class="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">${initials}</span>
            <div class="min-w-0 flex-1">
              <div class="text-[12px] text-white font-medium truncate">${userEmail}</div>
              <div class="text-[10px] text-zinc-500">Admin · Aktywny</div>
            </div>
            <i class="ph ph-caret-up-down text-zinc-500 text-sm"></i>
          </button>
          <div id="ze-sb-profile-menu" class="hidden mt-1 pt-1 border-t border-white/5 space-y-0.5">
            <button onclick="ZE_Sidebar.changePassword()" class="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[12px] text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors">
              <i class="ph ph-key text-base"></i><span>Zmień hasło</span>
            </button>
            <a href="/dashboard" class="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[12px] text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors">
              <i class="ph ph-arrow-square-out text-base"></i><span>tn-crm główne</span>
            </a>
            <button onclick="ZE_Auth.logout()" class="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[12px] text-red-300 hover:text-red-200 hover:bg-red-500/[0.06] transition-colors">
              <i class="ph ph-sign-out text-base"></i><span>Wyloguj</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function toggleProfile() {
    document.getElementById('ze-sb-profile-menu')?.classList.toggle('hidden');
  }

  function setBadge(itemId, value) {
    const el = document.getElementById('ze-sidebar-badge-' + itemId);
    if (el) el.textContent = value != null ? String(value) : '';
  }

  async function changePassword() {
    const wrap = document.createElement('div');
    wrap.className = 'fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4';
    wrap.innerHTML = `
      <div class="bg-zinc-900 border border-white/10 rounded-xl p-5 w-full max-w-sm">
        <h3 class="text-white font-semibold mb-1">Zmień hasło</h3>
        <p class="text-xs text-zinc-500 mb-4">Min. 10 znaków. Skopiuj sobie gdzieś.</p>
        <input type="password" id="ze-newpass" autocomplete="new-password" minlength="10"
               class="ze-input w-full px-3 py-2 rounded-lg text-sm" placeholder="Nowe hasło">
        <input type="password" id="ze-newpass2" autocomplete="new-password" minlength="10"
               class="ze-input w-full px-3 py-2 rounded-lg text-sm mt-2" placeholder="Powtórz hasło">
        <div id="ze-pwd-err" class="hidden text-xs text-red-400 mt-2"></div>
        <div class="flex justify-between gap-2 mt-4">
          <button data-act="gen" class="text-xs text-zinc-500 hover:text-white">⚡ Wygeneruj</button>
          <div class="flex gap-2">
            <button data-act="cancel" class="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white">Anuluj</button>
            <button data-act="ok" class="px-4 py-2 rounded-lg text-sm bg-emerald-500 hover:bg-emerald-400 text-black font-semibold">Zapisz</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
    const close = () => wrap.remove();
    const i1 = wrap.querySelector('#ze-newpass');
    const i2 = wrap.querySelector('#ze-newpass2');
    const err = wrap.querySelector('#ze-pwd-err');
    i1.focus();
    wrap.querySelector('[data-act="cancel"]').addEventListener('click', close);
    wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
    wrap.querySelector('[data-act="gen"]').addEventListener('click', () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
      let s = '';
      const arr = new Uint32Array(16);
      crypto.getRandomValues(arr);
      for (let i = 0; i < 16; i++) s += chars[arr[i] % chars.length];
      i1.type = 'text'; i2.type = 'text';
      i1.value = s; i2.value = s;
    });
    wrap.querySelector('[data-act="ok"]').addEventListener('click', async () => {
      err.classList.add('hidden');
      if (i1.value.length < 10) { err.textContent = 'Min. 10 znaków.'; err.classList.remove('hidden'); return; }
      if (i1.value !== i2.value) { err.textContent = 'Hasła się różnią.'; err.classList.remove('hidden'); return; }
      const { error } = await ZE_SB.auth.updateUser({ password: i1.value });
      if (error) { err.textContent = error.message; err.classList.remove('hidden'); return; }
      close();
      ZE.toast('Hasło zmienione. Następnym razem zaloguj się nowym.', 'success', 5000);
    });
  }

  return { render, setBadge, changePassword, toggleProfile };
})();
