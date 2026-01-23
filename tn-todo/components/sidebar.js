/**
 * TN Todo Sidebar Component
 * With app switcher between CRM and Todo
 */

// ============================================
// APP CONFIGURATION
// ============================================
const APPS = [
    { id: 'crm', name: 'TN CRM', icon: 'ph-lightning', color: 'bg-white text-black' },
    { id: 'todo', name: 'TN Todo', icon: 'ph-checks', color: 'bg-violet-500 text-white' }
];

const CURRENT_APP = 'todo';

function getAppPath(appId) {
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (appId === 'crm') {
        return isLocal ? '/tn-crm/dashboard.html' : '/tn-crm/dashboard.html';
    } else if (appId === 'todo') {
        return isLocal ? '/tn-todo/boards.html' : '/tn-todo/boards.html';
    }
    return '/';
}

// ============================================
// NAVIGATION ITEMS FOR TODO APP
// ============================================
const NAV_ITEMS = [
    { id: 'boards', icon: 'ph-kanban', label: 'Tablice', adminOnly: false },
    { id: 'my-tasks', icon: 'ph-user-circle', label: 'Moje zadania', adminOnly: false },
];

// ============================================
// CSS ANIMATIONS
// ============================================
const SIDEBAR_CSS = `
    /* Nav icon animations */
    nav a i { display: inline-block; }

    @keyframes kanbanSlide {
        0% { transform: translateX(0); }
        20% { transform: translateX(-3px); }
        40% { transform: translateX(4px); }
        60% { transform: translateX(-2px); }
        80% { transform: translateX(2px); }
        100% { transform: translateX(0); }
    }
    nav a:hover .ph-kanban { animation: kanbanSlide 0.6s ease-in-out; }

    @keyframes userBounce {
        0% { transform: scale(1); }
        50% { transform: scale(1.15); }
        100% { transform: scale(1); }
    }
    nav a:hover .ph-user-circle { animation: userBounce 0.4s ease-out; }

    /* App switcher dropdown */
    .app-switcher-dropdown {
        opacity: 0;
        visibility: hidden;
        transform: translateY(-5px);
        transition: all 0.2s ease;
    }
    .app-switcher-dropdown.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
`;

// ============================================
// PATH HELPERS
// ============================================
function getBasePath() {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        const path = location.pathname;
        const match = path.match(/^(\/[^\/]+)\//);
        return match ? match[1] : '';
    }
    return '';
}

function getPagePath(page) {
    const base = getBasePath();
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    return isLocal ? `${base}/${page}.html` : `/tn-todo/${page}.html`;
}

function getLoginPath() {
    return getPagePath('index');
}

function getCrmPath() {
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    return isLocal ? '/tn-crm/dashboard.html' : '/dashboard.html';
}

function getCurrentPage() {
    const path = location.pathname;
    const match = path.match(/\/([^\/]+)\.html$/) || path.match(/\/([^\/]+)$/);
    if (match) {
        const page = match[1];
        return page === 'index' ? 'boards' : page;
    }
    return 'boards';
}

// ============================================
// RENDER SIDEBAR
// ============================================
function renderSidebar(containerId = 'sidebar') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Inject CSS
    if (!document.getElementById('sidebar-styles')) {
        const style = document.createElement('style');
        style.id = 'sidebar-styles';
        style.textContent = SIDEBAR_CSS;
        document.head.appendChild(style);
    }

    const currentPage = getCurrentPage();
    const currentApp = APPS.find(a => a.id === CURRENT_APP);

    // Build navigation HTML
    const navHtml = NAV_ITEMS.map(item => {
        const isActive = item.id === currentPage;
        const hiddenClass = item.adminOnly ? ' hidden' : '';
        const itemId = `id="nav-${item.id}"`;

        const activeClasses = isActive
            ? 'bg-white/10 text-white rounded-lg border border-white/5 shadow-sm'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg transition-all';

        return `
            <a href="/${item.id}" data-page="${item.id}" ${itemId} class="flex items-center gap-3 px-3 py-2.5 ${activeClasses} mb-1${hiddenClass}">
                <i class="ph ${item.icon} text-xl"></i>
                <span class="font-medium">${item.label}</span>
            </a>
        `;
    }).join('');

    // App switcher dropdown HTML
    const appSwitcherDropdown = APPS.filter(a => a.id !== CURRENT_APP).map(app => `
        <a href="${getAppPath(app.id)}" class="flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <div class="w-6 h-6 ${app.color} rounded flex items-center justify-center">
                <i class="ph-bold ${app.icon} text-xs"></i>
            </div>
            <span class="text-sm font-medium">${app.name}</span>
        </a>
    `).join('');

    // Full sidebar HTML
    container.innerHTML = `
        <!-- Logo / App Switcher -->
        <div class="relative">
            <button id="app-switcher-btn" class="w-full h-16 flex items-center px-5 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5">
                <div class="w-7 h-7 ${currentApp.color} rounded flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                    <i class="ph-bold ${currentApp.icon} text-sm"></i>
                </div>
                <span class="font-medium text-base text-zinc-200">${currentApp.name}</span>
                <i class="ph-bold ph-caret-up-down ml-auto text-zinc-500"></i>
            </button>

            <!-- Dropdown -->
            <div id="app-switcher-dropdown" class="app-switcher-dropdown absolute top-full left-0 right-0 bg-zinc-900 border border-white/10 rounded-lg m-2 p-2 shadow-xl z-50">
                <div class="text-[10px] uppercase tracking-wider text-zinc-500 px-3 py-1.5 font-semibold">Przełącz na</div>
                ${appSwitcherDropdown}
            </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6">
            <div class="text-xs uppercase tracking-wider text-zinc-500 font-semibold px-2 mb-3">Workspace</div>
            ${navHtml}
        </nav>

        <!-- User -->
        <div class="p-4 border-t border-white/5">
            <div class="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" id="user-profile-btn">
                <div id="user-avatar" class="w-9 h-9 rounded-full bg-gradient-to-b from-violet-600 to-violet-700 border border-white/10 flex items-center justify-center text-sm font-medium text-white">--</div>
                <div class="flex-1 min-w-0">
                    <div id="user-name" class="text-sm font-medium text-zinc-200 truncate"></div>
                    <div id="user-email" class="text-xs text-zinc-500 truncate"></div>
                </div>
                <button id="logout-btn" class="p-1.5 text-zinc-500 hover:text-white transition-colors" title="Wyloguj">
                    <i class="ph ph-sign-out text-lg"></i>
                </button>
            </div>
        </div>
    `;

    // Update hrefs for local development
    updateNavLinks();

    // Setup app switcher
    setupAppSwitcher();
}

function setupAppSwitcher() {
    const btn = document.getElementById('app-switcher-btn');
    const dropdown = document.getElementById('app-switcher-dropdown');

    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', () => {
        dropdown.classList.remove('open');
    });
}

function updateNavLinks() {
    document.querySelectorAll('[data-page]').forEach(link => {
        const page = link.getAttribute('data-page');
        link.href = getPagePath(page);
    });
}

function showAdminNav(isAdmin) {
    if (!isAdmin) return;
    NAV_ITEMS.filter(item => item.adminOnly).forEach(item => {
        const el = document.getElementById(`nav-${item.id}`);
        if (el) el.classList.remove('hidden');
    });
}

function setUserEmail(email) {
    const el = document.getElementById('user-email');
    if (el) el.textContent = email;
}

function setUserName(name) {
    const el = document.getElementById('user-name');
    if (el) el.textContent = name || '';

    // Update avatar initials
    const avatar = document.getElementById('user-avatar');
    if (avatar && name) {
        const parts = name.trim().split(' ');
        const initials = parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : name.substring(0, 2).toUpperCase();
        avatar.textContent = initials;
    }
}

function setUserColor(color) {
    const avatar = document.getElementById('user-avatar');
    if (!avatar || !color) return;

    const colorClasses = {
        'violet': 'from-violet-600 to-violet-700',
        'blue': 'from-blue-600 to-blue-700',
        'emerald': 'from-emerald-600 to-emerald-700',
        'amber': 'from-amber-500 to-amber-600',
        'pink': 'from-pink-500 to-pink-600',
        'cyan': 'from-cyan-500 to-cyan-600'
    };

    // Remove old gradient classes
    avatar.className = avatar.className.replace(/from-\w+-\d+ to-\w+-\d+/g, '');

    const gradientClass = colorClasses[color] || colorClasses['violet'];
    avatar.classList.add(...gradientClass.split(' '));
}

function setupLogout(supabaseClient) {
    const btn = document.getElementById('logout-btn');
    if (btn) {
        btn.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
            window.location.href = getLoginPath();
        });
    }
}

function setupProfileClick() {
    const btn = document.getElementById('user-profile-btn');
    if (btn) {
        btn.addEventListener('click', (e) => {
            // Don't trigger if clicking logout button
            if (e.target.closest('#logout-btn')) return;
            // Navigate to CRM settings for now
            window.location.href = getCrmPath().replace('dashboard', 'settings') + '?tab=account';
        });
    }
}

// ============================================
// EXPORT
// ============================================
window.Sidebar = {
    render: renderSidebar,
    showAdminNav,
    setUserEmail,
    setUserName,
    setUserColor,
    setupLogout,
    setupProfileClick,
    getPagePath,
    getLoginPath,
    getBasePath,
    getCurrentPage,
    updateLinks: updateNavLinks
};
