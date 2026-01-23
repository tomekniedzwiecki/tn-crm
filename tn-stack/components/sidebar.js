/**
 * TN Stack Sidebar Component
 */

// ============================================
// APP CONFIGURATION
// ============================================
const APPS = [
    { id: 'crm', name: 'TN CRM', icon: 'ph-lightning', color: 'bg-white text-black' },
    { id: 'todo', name: 'TN Todo', icon: 'ph-checks', color: 'bg-violet-500 text-white' },
    { id: 'stack', name: 'TN Stack', icon: 'ph-stack', color: 'bg-amber-500 text-white' }
];

const CURRENT_APP = 'stack';

function getAppPath(appId) {
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (appId === 'crm') {
        return isLocal ? '/tn-crm/dashboard.html' : '/dashboard.html';
    } else if (appId === 'todo') {
        return isLocal ? '/tn-todo/boards.html' : '/tn-todo/boards.html';
    } else if (appId === 'stack') {
        return isLocal ? '/tn-stack/dashboard.html' : '/tn-stack/dashboard.html';
    }
    return '/';
}

// ============================================
// NAVIGATION ITEMS
// ============================================
const NAV_ITEMS = [
    { id: 'dashboard', icon: 'ph-chart-pie', label: 'Dashboard', path: 'dashboard' },
    { id: 'categories', icon: 'ph-folders', label: 'Kategorie', path: 'categories' }
];

// ============================================
// CSS
// ============================================
const SIDEBAR_CSS = `
    /* Mobile sidebar */
    @media (max-width: 768px) {
        #sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 100;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
        }
        #sidebar.open {
            transform: translateX(0);
        }
        #sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 99;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        #sidebar-overlay.open {
            opacity: 1;
            visibility: visible;
        }
        .mobile-menu-btn {
            display: flex !important;
        }
    }
    @media (min-width: 769px) {
        #sidebar-overlay {
            display: none !important;
        }
        .mobile-menu-btn {
            display: none !important;
        }
    }

    /* Nav icon animations */
    nav a i { display: inline-block; }

    @keyframes chartSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    nav a:hover .ph-chart-pie { animation: chartSpin 0.6s ease-out; }

    @keyframes folderBounce {
        0% { transform: translateY(0); }
        30% { transform: translateY(-4px); }
        50% { transform: translateY(0); }
        70% { transform: translateY(-2px); }
        100% { transform: translateY(0); }
    }
    nav a:hover .ph-folders { animation: folderBounce 0.5s ease-out; }
`;

// ============================================
// HELPER FUNCTIONS
// ============================================
function getBasePath() {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        return '/tn-stack';
    }
    return '/tn-stack';
}

function getPagePath(page) {
    const base = getBasePath();
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    return isLocal ? `${base}/${page}.html` : `${base}/${page}`;
}

function getLoginPath() {
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    return isLocal ? '/tn-crm/index.html' : '/';
}

function getCurrentPage() {
    const path = window.location.pathname;
    const match = path.match(/\/([^\/]+?)(?:\.html)?$/);
    return match ? match[1] : 'dashboard';
}

// ============================================
// RENDER SIDEBAR
// ============================================
function renderSidebar(containerId = 'sidebar', options = {}) {
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

    // Build navigation
    const navHtml = NAV_ITEMS.map(item => {
        const isActive = currentPage === item.id || currentPage === item.path;
        const activeClasses = isActive
            ? 'bg-white/10 text-white border border-white/5 shadow-sm'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5';

        return `
            <a href="${getPagePath(item.path)}" data-page="${item.id}" class="flex items-center gap-3 px-3 py-2.5 ${activeClasses} rounded-lg transition-all mb-1">
                <i class="ph ${item.icon} text-xl"></i>
                <span class="font-medium">${item.label}</span>
            </a>
        `;
    }).join('');

    // Add mobile overlay if not exists
    if (!document.getElementById('sidebar-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'sidebar-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', closeMobileSidebar);
    }

    // App switcher dropdown
    const appSwitcherOptions = APPS.map(app => {
        const isCurrentApp = app.id === CURRENT_APP;
        return `
            <a href="${getAppPath(app.id)}" class="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors ${isCurrentApp ? 'bg-white/5' : ''}">
                <div class="w-6 h-6 ${app.color} rounded flex items-center justify-center">
                    <i class="ph-bold ${app.icon} text-xs"></i>
                </div>
                <span class="text-sm ${isCurrentApp ? 'text-white font-medium' : 'text-zinc-400'}">${app.name}</span>
                ${isCurrentApp ? '<i class="ph ph-check ml-auto text-white"></i>' : ''}
            </a>
        `;
    }).join('');

    // Full sidebar HTML
    container.innerHTML = `
        <!-- Logo / App Switcher -->
        <div class="relative">
            <button id="app-switcher-btn" class="w-full h-16 flex items-center px-5 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5">
                <div class="w-7 h-7 ${currentApp.color} rounded flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    <i class="ph-bold ${currentApp.icon} text-sm"></i>
                </div>
                <span class="font-medium text-base text-zinc-200">${currentApp.name}</span>
                <i class="ph-bold ph-caret-up-down ml-auto text-zinc-500"></i>
            </button>

            <!-- Dropdown -->
            <div id="app-switcher-dropdown" class="hidden absolute top-full left-0 right-0 mx-3 mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 p-1">
                ${appSwitcherOptions}
            </div>
        </div>

        <nav class="flex-1 px-4 py-6 overflow-y-auto">
            <div class="text-xs uppercase tracking-wider text-zinc-500 font-semibold px-2 mb-3">Nawigacja</div>
            ${navHtml}
        </nav>

        <!-- User Profile -->
        <div class="p-4 border-t border-white/5">
            <div class="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" id="user-profile-btn">
                <div id="user-avatar" class="w-9 h-9 rounded-full bg-gradient-to-b from-amber-600 to-amber-700 border border-white/10 flex items-center justify-center text-sm font-medium text-white">--</div>
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

    // Setup app switcher
    setupAppSwitcher();

    // Close sidebar on nav link click (mobile)
    container.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', closeMobileSidebar);
    });
}

function setupAppSwitcher() {
    const btn = document.getElementById('app-switcher-btn');
    const dropdown = document.getElementById('app-switcher-dropdown');

    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dropdown.classList.add('hidden');
        }
    });
}

// ============================================
// USER FUNCTIONS
// ============================================
function setUserEmail(email) {
    const el = document.getElementById('user-email');
    if (el) el.textContent = email;
}

function setUserName(name) {
    const el = document.getElementById('user-name');
    const avatarEl = document.getElementById('user-avatar');

    if (el) el.textContent = name;
    if (avatarEl && name) {
        const parts = name.trim().split(' ');
        const initials = parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : name.substring(0, 2).toUpperCase();
        avatarEl.textContent = initials;
    }
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
            if (e.target.closest('#logout-btn')) return;
            // Navigate to CRM settings
            const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            const settingsPath = isLocal ? '/tn-crm/settings.html' : '/settings';
            window.location.href = settingsPath + '?tab=account';
        });
    }
}

// ============================================
// MOBILE FUNCTIONS
// ============================================
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open');
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
}

// ============================================
// EXPORT
// ============================================
window.Sidebar = {
    render: renderSidebar,
    setUserEmail,
    setUserName,
    setupLogout,
    setupProfileClick,
    getPagePath,
    getLoginPath,
    getBasePath,
    getCurrentPage,
    toggle: toggleMobileSidebar,
    close: closeMobileSidebar
};
