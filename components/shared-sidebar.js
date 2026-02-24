/**
 * TN Shared Sidebar Component
 * Single source of truth for navigation across all apps (CRM, Workflow, Todo, Stack)
 *
 * Usage: Sidebar.render({ appId: 'crm' })
 */

// ============================================
// APP CONFIGURATION
// ============================================
const APPS = [
    { id: 'crm', name: 'TN CRM', icon: 'ph-lightning', color: 'bg-white text-black', defaultPage: 'dashboard' },
    { id: 'workflow', name: 'TN Workflow', icon: 'ph-path', color: 'bg-emerald-500 text-white', defaultPage: 'workflows' },
    { id: 'todo', name: 'TN Todo', icon: 'ph-checks', color: 'bg-violet-500 text-white', defaultPage: 'boards' },
    { id: 'stack', name: 'TN Stack', icon: 'ph-stack', color: 'bg-amber-500 text-white', defaultPage: 'dashboard' },
    { id: 'biznes', name: 'TN Biznes', icon: 'ph-chart-line-up', color: 'bg-teal-500 text-white', defaultPage: 'dashboard' }
];

const APP_BASES = {
    crm: '',
    workflow: '/tn-workflow',
    todo: '/tn-todo',
    stack: '/tn-stack',
    biznes: '/tn-biznes'
};

const APP_AVATAR_COLORS = {
    crm: 'from-emerald-600 to-emerald-700',
    workflow: 'from-emerald-600 to-emerald-700',
    todo: 'from-violet-600 to-violet-700',
    stack: 'from-amber-600 to-amber-700',
    biznes: 'from-teal-600 to-teal-700'
};

// ============================================
// NAVIGATION ITEMS PER APP
// ============================================
const NAV_ITEMS_CRM = [
    { id: 'dashboard', icon: 'ph-house', label: 'Overview' },
    { id: 'leads', icon: 'ph-users', label: 'Leady', showCount: true },
    { id: 'pipeline', icon: 'ph-kanban', label: 'Pipeline' },
    { id: 'whatsapp', icon: 'ph-whatsapp-logo', label: 'WhatsApp', href: '/whatsapp/logs' },
    { id: 'calendar', icon: 'ph-calendar', label: 'Kalendarz' },
    { id: 'offers', icon: 'ph-package', label: 'Oferty' },
    { id: 'orders', icon: 'ph-shopping-cart', label: 'Zamówienia' },
    { id: 'commissions', icon: 'ph-percent', label: 'Prowizje' },
    { id: 'outreach', icon: 'ph-megaphone', label: 'Kampanie' },
    { id: 'settings', icon: 'ph-gear', label: 'Ustawienia', adminOnly: true },
    { id: 'logi', icon: 'ph-list-bullets', label: 'Logi' },
];

const NAV_ITEMS_WORKFLOW = [
    { id: 'workflows', icon: 'ph-list-checks', label: 'Projekty' },
    { id: 'products', icon: 'ph-package', label: 'Produkty' },
    { id: 'automations', icon: 'ph-lightning', label: 'Automatyzacje' },
    { id: 'email-templates', icon: 'ph-file-code', label: 'Szablony emaili' },
    { id: 'email-log', icon: 'ph-envelope', label: 'Historia emaili' },
    { id: 'settings', icon: 'ph-gear', label: 'Ustawienia' },
];

const NAV_ITEMS_TODO = [
    { id: 'boards', icon: 'ph-kanban', label: 'Tablice' },
    { id: 'my-tasks', icon: 'ph-user-circle', label: 'Moje zadania' },
    { id: 'notes', icon: 'ph-note-pencil', label: 'Notatki' },
];

const NAV_ITEMS_STACK = [
    { id: 'dashboard', icon: 'ph-chart-pie', label: 'Dashboard' },
    { id: 'categories', icon: 'ph-folders', label: 'Kategorie' },
];

const NAV_ITEMS_BIZNES = [
    { id: 'dashboard', icon: 'ph-chart-pie', label: 'Przegląd' },
    { id: 'costs', icon: 'ph-wallet', label: 'Koszty' },
    { id: 'revenues', icon: 'ph-money', label: 'Przychody' },
    { id: 'employees', icon: 'ph-users', label: 'Pracownicy' },
    { id: 'taxes', icon: 'ph-calculator', label: 'Rozliczenia' },
    { id: 'plans', icon: 'ph-target', label: 'Plany' },
];

function getNavItemsForApp(appId) {
    switch (appId) {
        case 'workflow': return NAV_ITEMS_WORKFLOW;
        case 'todo': return NAV_ITEMS_TODO;
        case 'stack': return NAV_ITEMS_STACK;
        case 'biznes': return NAV_ITEMS_BIZNES;
        default: return NAV_ITEMS_CRM;
    }
}

// ============================================
// CSS ANIMATIONS (merged from all apps)
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

    /* CRM animations */
    @keyframes houseBounce {
        0% { transform: translateY(0); }
        30% { transform: translateY(-4px); }
        50% { transform: translateY(0); }
        70% { transform: translateY(-2px); }
        100% { transform: translateY(0); }
    }
    nav a:hover .ph-house { animation: houseBounce 0.5s ease-out; }

    @keyframes usersHuddle {
        0% { transform: scale(1) rotate(0deg); }
        20% { transform: scale(1.1) rotate(-5deg); }
        40% { transform: scale(1.15) rotate(3deg); }
        60% { transform: scale(1.1) rotate(-2deg); }
        80% { transform: scale(1.05) rotate(1deg); }
        100% { transform: scale(1) rotate(0deg); }
    }
    nav a:hover .ph-users { animation: usersHuddle 0.6s ease-out; }

    @keyframes kanbanSlide {
        0% { transform: translateX(0); }
        20% { transform: translateX(-3px); }
        40% { transform: translateX(4px); }
        60% { transform: translateX(-2px); }
        80% { transform: translateX(2px); }
        100% { transform: translateX(0); }
    }
    nav a:hover .ph-kanban { animation: kanbanSlide 0.6s ease-in-out; }

    @keyframes calendarFlip {
        0% { transform: rotateY(0deg); }
        50% { transform: rotateY(-20deg); }
        100% { transform: rotateY(0deg); }
    }
    nav a:hover .ph-calendar { animation: calendarFlip 0.5s ease-in-out; }

    @keyframes packageBounce {
        0% { transform: translateY(0) scale(1); }
        30% { transform: translateY(-5px) scale(1.1); }
        50% { transform: translateY(-2px) scale(1.05); }
        70% { transform: translateY(-3px) scale(1.08); }
        100% { transform: translateY(0) scale(1); }
    }
    nav a:hover .ph-package { animation: packageBounce 0.5s ease-out; }

    @keyframes cartBounce {
        0% { transform: translateX(0); }
        25% { transform: translateX(3px); }
        50% { transform: translateX(-2px); }
        75% { transform: translateX(1px); }
        100% { transform: translateX(0); }
    }
    nav a:hover .ph-shopping-cart { animation: cartBounce 0.4s ease-out; }

    @keyframes pathFlow {
        0% { transform: translateX(0); }
        50% { transform: translateX(3px); }
        100% { transform: translateX(0); }
    }
    nav a:hover .ph-path { animation: pathFlow 0.5s ease-in-out; }

    @keyframes megaphoneShake {
        0% { transform: rotate(0deg); }
        20% { transform: rotate(-10deg); }
        40% { transform: rotate(10deg); }
        60% { transform: rotate(-5deg); }
        80% { transform: rotate(5deg); }
        100% { transform: rotate(0deg); }
    }
    nav a:hover .ph-megaphone { animation: megaphoneShake 0.5s ease-out; }

    @keyframes whatsappPop {
        0% { transform: scale(1); }
        30% { transform: scale(1.2) rotate(-10deg); }
        60% { transform: scale(1.1) rotate(5deg); }
        100% { transform: scale(1) rotate(0deg); }
    }
    nav a:hover .ph-whatsapp-logo { animation: whatsappPop 0.5s ease-out; }

    @keyframes gearSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(180deg); }
    }
    nav a:hover .ph-gear { animation: gearSpin 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }

    @keyframes shieldPulse {
        0% { transform: scale(1); }
        30% { transform: scale(1.15); }
        60% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    nav a:hover .ph-shield-check { animation: shieldPulse 0.5s ease-out; }

    @keyframes noteWiggle {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(-5deg); }
        50% { transform: rotate(5deg); }
        75% { transform: rotate(-3deg); }
        100% { transform: rotate(0deg); }
    }
    nav a:hover .ph-note-pencil { animation: noteWiggle 0.4s ease-out; }

    @keyframes listBulletSlide {
        0% { transform: translateX(0); }
        50% { transform: translateX(3px); }
        100% { transform: translateX(0); }
    }
    nav a:hover .ph-list-bullets { animation: listBulletSlide 0.4s ease-out; }

    nav a:hover .ph-list-checks { animation: listBulletSlide 0.4s ease-out; }

    /* Todo animations */
    @keyframes userBounce {
        0% { transform: scale(1); }
        50% { transform: scale(1.15); }
        100% { transform: scale(1); }
    }
    nav a:hover .ph-user-circle { animation: userBounce 0.4s ease-out; }

    /* Stack animations */
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

    /* Biznes animations */
    @keyframes walletBounce {
        0% { transform: scale(1); }
        30% { transform: scale(1.15); }
        60% { transform: scale(0.95); }
        100% { transform: scale(1); }
    }
    nav a:hover .ph-wallet { animation: walletBounce 0.4s ease-out; }

    @keyframes moneyFloat {
        0% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-4px) rotate(5deg); }
        100% { transform: translateY(0) rotate(0deg); }
    }
    nav a:hover .ph-money { animation: moneyFloat 0.5s ease-out; }

    @keyframes targetPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    nav a:hover .ph-target { animation: targetPulse 0.4s ease-out; }

    @keyframes chartLineUp {
        0% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
        100% { transform: translateY(0); }
    }
    nav a:hover .ph-chart-line-up { animation: chartLineUp 0.5s ease-out; }

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
// APP ACCESS RESTRICTIONS
// ============================================
const APP_RESTRICTIONS = {
    // Apps that are only visible to specific users
    // Use full email format - the function will handle username-only input
    biznes: ['tomekniedzwiecki@gmail.com']
};

function canAccessApp(appId, userEmail) {
    const allowedEmails = APP_RESTRICTIONS[appId];
    if (!allowedEmails) return true; // No restriction = everyone can access
    if (!userEmail) return false;

    // Normalize: extract username if full email, or use as-is if already username
    const inputUsername = userEmail.includes('@') ? userEmail.split('@')[0] : userEmail;

    // Check against allowed list (compare usernames)
    return allowedEmails.some(allowed => {
        const allowedUsername = allowed.includes('@') ? allowed.split('@')[0] : allowed;
        return allowedUsername.toLowerCase() === inputUsername.toLowerCase();
    });
}

function getAvailableApps(userEmail) {
    return APPS.filter(app => canAccessApp(app.id, userEmail));
}

// ============================================
// INTERNAL STATE
// ============================================
let _currentAppId = 'crm';
let _userEmail = null;

// ============================================
// PATH HELPERS
// ============================================
function isLocalhost() {
    return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
}

function getBasePath() {
    if (isLocalhost()) {
        const path = location.pathname;
        const match = path.match(/^(\/[^\/]+)\//);
        return match ? match[1] : '';
    }
    return '';
}

function getPagePath(page) {
    if (isLocalhost()) {
        // Detect if we're running from parent folder (c:\repos_tn) or from tn-crm folder
        const path = location.pathname;
        const hasParentPrefix = path.includes('/tn-crm/');

        const base = APP_BASES[_currentAppId] || '';

        // If URL contains /tn-crm/, we're running from parent folder - add /tn-crm prefix
        if (hasParentPrefix) {
            return `/tn-crm${base}/${page}.html`;
        }
        // Running from tn-crm folder - use base directly
        return `${base}/${page}.html`;
    }
    const base = APP_BASES[_currentAppId] || '';
    return `${base}/${page}`;
}

function getAppPath(appId) {
    const app = APPS.find(a => a.id === appId);
    if (!app) return '/';
    const base = APP_BASES[appId] || '';
    if (isLocalhost()) {
        // Detect if we're running from parent folder
        const path = location.pathname;
        const hasParentPrefix = path.includes('/tn-crm/');

        if (hasParentPrefix) {
            return `/tn-crm${base}/${app.defaultPage}.html`;
        }
        return `${base}/${app.defaultPage}.html`;
    }
    return `${base}/${app.defaultPage}`;
}

function getLoginPath() {
    if (isLocalhost()) {
        // Login is always in main tn-crm folder (APP_BASES['crm'] = '')
        const path = location.pathname;
        const hasParentPrefix = path.includes('/tn-crm/');
        return hasParentPrefix ? '/tn-crm/index.html' : '/index.html';
    }
    return '/';
}

function getCurrentPage() {
    const path = location.pathname;

    // Handle sub-paths like /whatsapp/logs, /whatsapp/settings
    // Return the parent path (whatsapp) for sidebar highlighting
    const subPathMatch = path.match(/^\/([^\/]+)\/[^\/]+$/);
    if (subPathMatch) {
        return subPathMatch[1]; // e.g., "whatsapp" from "/whatsapp/logs"
    }

    const match = path.match(/\/([^\/]+)\.html$/) || path.match(/\/([^\/]+)$/);
    if (match) {
        const page = match[1];
        if (page === 'index') {
            // Default page per app
            const app = APPS.find(a => a.id === _currentAppId);
            return app ? app.defaultPage : 'dashboard';
        }
        return page;
    }
    const app = APPS.find(a => a.id === _currentAppId);
    return app ? app.defaultPage : 'dashboard';
}

// Detect current app based on URL (fallback if no appId provided)
function detectCurrentApp() {
    const path = location.pathname;
    if (path.includes('/tn-todo')) return 'todo';
    if (path.includes('/tn-stack')) return 'stack';
    if (path.includes('/tn-biznes')) return 'biznes';
    if (path.includes('/tn-workflow')) return 'workflow';
    return 'crm';
}

// ============================================
// RENDER SIDEBAR
// ============================================
function renderSidebar(config = {}) {
    // Support old signature: renderSidebar('sidebar') or renderSidebar({ appId: 'todo' })
    let containerId = 'sidebar';
    let appId = null;

    if (typeof config === 'string') {
        containerId = config;
    } else {
        containerId = config.containerId || 'sidebar';
        appId = config.appId || null;
        _userEmail = config.userEmail || null;
    }

    // Set current app
    _currentAppId = appId || detectCurrentApp();

    // Note: Access check is performed in setUserEmail() after user is loaded
    // This allows sidebar to render first, then check access when email is known

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
    const currentApp = APPS.find(a => a.id === _currentAppId);
    const navItems = getNavItemsForApp(_currentAppId);
    const avatarColor = APP_AVATAR_COLORS[_currentAppId] || APP_AVATAR_COLORS.crm;

    // Build app switcher dropdown HTML (filtered by user access)
    const availableApps = getAvailableApps(_userEmail);
    const appSwitcherDropdown = availableApps.filter(a => a.id !== _currentAppId).map(app => `
        <a href="${getAppPath(app.id)}" class="flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <div class="w-6 h-6 ${app.color} rounded flex items-center justify-center">
                <i class="ph-bold ${app.icon} text-xs"></i>
            </div>
            <span class="text-sm font-medium">${app.name}</span>
        </a>
    `).join('');

    // Build navigation HTML
    const navHtml = navItems.map(item => {
        const isActive = item.id === currentPage;
        const hiddenClass = item.adminOnly ? ' hidden' : '';
        const itemId = `id="nav-${item.id}"`;

        const activeClasses = isActive
            ? 'bg-white/10 text-white rounded-lg border border-white/5 shadow-sm'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg transition-all';

        let countHtml = '';
        if (item.showCount) {
            countHtml = `<span id="nav-${item.id}-count" class="ml-auto text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono border border-white/5">0</span>`;
        }

        // Build correct href based on app (bez .html - Vercel ma rewrites)
        let href = item.href || `/${item.id}`;
        if (!item.href) {
            if (_currentAppId === 'biznes') {
                href = `/tn-biznes/${item.id}`;
            } else if (_currentAppId === 'workflow') {
                href = `/tn-workflow/${item.id}`;
            }
        }

        return `
            <a href="${href}" data-page="${item.id}" ${itemId} class="flex items-center gap-3 px-3 py-2.5 ${activeClasses} mb-1${hiddenClass}">
                <i class="ph ${item.icon} text-xl"></i>
                <span class="font-medium">${item.label}</span>
                ${countHtml}
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
                <div id="user-avatar" class="w-9 h-9 rounded-full bg-gradient-to-b ${avatarColor} border border-white/10 flex items-center justify-center text-sm font-medium text-white">--</div>
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

    // Update hrefs for correct paths
    updateNavLinks();

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
        dropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dropdown.classList.remove('open');
        }
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
    const navItems = getNavItemsForApp(_currentAppId);
    navItems.filter(item => item.adminOnly).forEach(item => {
        const el = document.getElementById(`nav-${item.id}`);
        if (el) el.classList.remove('hidden');
    });
}

function setUserEmail(email) {
    const el = document.getElementById('user-email');
    if (el) el.textContent = email;

    // Store for access checks
    _userEmail = email;

    // Check if user can access current app
    if (!canAccessApp(_currentAppId, _userEmail)) {
        // Redirect to CRM if user doesn't have access
        window.location.href = getAppPath('crm');
        return;
    }

    // Re-render app switcher with proper permissions
    updateAppSwitcherVisibility();
}

function updateAppSwitcherVisibility() {
    const dropdown = document.getElementById('app-switcher-dropdown');
    if (!dropdown) return;

    const availableApps = getAvailableApps(_userEmail);
    const appSwitcherDropdown = availableApps.filter(a => a.id !== _currentAppId).map(app => `
        <a href="${getAppPath(app.id)}" class="flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <div class="w-6 h-6 ${app.color} rounded flex items-center justify-center">
                <i class="ph-bold ${app.icon} text-xs"></i>
            </div>
            <span class="text-sm font-medium">${app.name}</span>
        </a>
    `).join('');

    dropdown.innerHTML = `
        <div class="text-[10px] uppercase tracking-wider text-zinc-500 px-3 py-1.5 font-semibold">Przełącz na</div>
        ${appSwitcherDropdown}
    `;
}

function setUserName(name) {
    const el = document.getElementById('user-name');
    if (el) el.textContent = name || '';

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

    avatar.className = avatar.className.replace(/from-\w+-\d+ to-\w+-\d+/g, '');
    const gradientClass = colorClasses[color] || colorClasses['emerald'];
    avatar.classList.add(...gradientClass.split(' '));
}

function setLeadsCount(count) {
    const el = document.getElementById('nav-leads-count');
    if (el) el.textContent = count;
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
            // Always navigate to CRM settings (APP_BASES['crm'] = '')
            if (isLocalhost()) {
                const path = location.pathname;
                const hasParentPrefix = path.includes('/tn-crm/');
                window.location.href = hasParentPrefix ? '/tn-crm/settings.html?tab=account' : '/settings.html?tab=account';
            } else {
                window.location.href = '/settings?tab=account';
            }
        });
    }
}

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
    showAdminNav,
    setUserEmail,
    setUserName,
    setUserColor,
    setLeadsCount,
    setupLogout,
    setupProfileClick,
    getPagePath,
    getLoginPath,
    getBasePath,
    getCurrentPage,
    updateLinks: updateNavLinks,
    toggle: toggleMobileSidebar,
    close: closeMobileSidebar,
    canAccessApp
};
