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
    el.innerHTML = `
      <div class="flex flex-col h-full">
        <div class="px-5 py-5 border-b border-white/5">
          <a href="/zwolnie/" class="flex items-center gap-2 text-white">
            <span class="w-7 h-7 rounded bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-bold text-sm">Z</span>
            <span class="font-semibold tracking-tight">Zwolnię</span>
            <span class="text-zinc-500 text-xs ml-auto">v1</span>
          </a>
        </div>

        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          ${NAV.map(item => {
            const isActive = item.id === active;
            return `
              <a href="${item.href}"
                 class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                   ? 'bg-white/10 text-white'
                   : 'text-zinc-400 hover:text-white hover:bg-white/5'}">
                <i class="ph ${item.icon} text-lg"></i>
                <span>${item.label}</span>
                ${item.badge ? `<span id="ze-sidebar-badge-${item.id}" class="ml-auto text-xs text-zinc-500"></span>` : ''}
              </a>
            `;
          }).join('')}
        </nav>

        <div class="px-3 py-3 border-t border-white/5">
          <div class="px-3 py-2 text-xs text-zinc-500 truncate">${userEmail}</div>
          <button onclick="ZE_Sidebar.changePassword()" class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
            <i class="ph ph-key text-lg"></i>
            <span>Zmień hasło</span>
          </button>
          <button onclick="ZE_Auth.logout()" class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
            <i class="ph ph-sign-out text-lg"></i>
            <span>Wyloguj</span>
          </button>
          <a href="/dashboard" class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-white hover:bg-white/5 transition-colors mt-1">
            <i class="ph ph-arrow-square-out text-lg"></i>
            <span>tn-crm główne</span>
          </a>
        </div>
      </div>
    `;
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

  return { render, setBadge, changePassword };
})();
