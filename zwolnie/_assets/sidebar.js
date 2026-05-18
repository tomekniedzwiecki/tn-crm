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
          <button onclick="ZE_Auth.logout()"
                  class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
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

  return { render, setBadge };
})();
