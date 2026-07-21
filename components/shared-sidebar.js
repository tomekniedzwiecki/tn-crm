/**
 * TN Shared Sidebar Component
 * Single source of truth for navigation across all apps
 * (CRM, Biznes, Sklep, Sklepy workflow, Aplikacje, Aplikacje workflow, Workflow[legacy])
 *
 * Usage: Sidebar.render({ appId: 'crm' })
 * Panele bez sidebara (tn-sklep, tn-aplikacje): Sidebar.mountPanelSwitcher({ email })
 */

// ============================================
// APP CONFIGURATION
// ============================================
// Pola: id/name/sub (podtytuł w boxie) / group (glowne|sklepy|aplikacje|stare)
// / icon / color (kafelek) / defaultPage / legacy (stary system) / shortcut (Alt+N).
const APPS = [
    { id: 'crm', name: 'CRM', sub: 'Leady · oferty · zamówienia', group: 'glowne', icon: 'ph-lightning', color: 'bg-white text-black', defaultPage: 'dashboard', shortcut: 1 },
    { id: 'biznes', name: 'Biznes', sub: 'Finanse firmy', group: 'glowne', icon: 'ph-currency-dollar', color: 'bg-amber-500 text-white', defaultPage: 'dashboard', shortcut: 2 },
    { id: 'sklep', name: 'Sklep', sub: 'Leady — lejek AI', group: 'sklepy', icon: 'ph-storefront', color: 'bg-[#0070f3] text-white', defaultPage: 'index', shortcut: 3 },
    { id: 'sklepy', name: 'Sklepy workflow', sub: 'Prowadzenie sklepów', group: 'sklepy', icon: 'ph-factory', color: 'bg-[#0891b2] text-white', defaultPage: 'index', shortcut: 4 },
    { id: 'aplikacje', name: 'Aplikacje', sub: 'Leady — lejek AI', group: 'aplikacje', icon: 'ph-rocket-launch', color: 'bg-[#8b5cf6] text-white', defaultPage: 'index', shortcut: 5 },
    { id: 'app', name: 'Aplikacje workflow', sub: 'Budowa aplikacji SaaS', group: 'aplikacje', icon: 'ph-app-window', color: 'bg-[#c026d3] text-white', defaultPage: 'index', shortcut: 6 },
    { id: 'workflow', name: 'Workflow', sub: 'Stary system — do wygaszenia', group: 'stare', icon: 'ph-path', color: 'bg-emerald-600 text-white', defaultPage: 'workflows', legacy: true, shortcut: 7 }
];

const APP_BASES = {
    crm: '',
    workflow: '/tn-workflow',
    biznes: '/tn-biznes',
    aplikacje: '/tn-aplikacje',
    sklep: '/tn-sklep',
    sklepy: '/tn-sklepy',
    app: '/tn-app'
};

const APP_AVATAR_COLORS = {
    crm: 'from-emerald-600 to-emerald-700',
    workflow: 'from-emerald-600 to-emerald-700',
    biznes: 'from-amber-500 to-amber-600',
    aplikacje: 'from-violet-500 to-violet-700',
    sklep: 'from-[#0070f3] to-[#0761d1]',
    sklepy: 'from-[#0891b2] to-[#0e7490]',
    app: 'from-[#c026d3] to-[#a21caf]'
};

// Nagłówki i kolejność grup w boxie przełącznika
const APP_GROUPS = [
    { id: 'glowne', label: 'Główne' },
    { id: 'sklepy', label: 'Sklepy' },
    { id: 'aplikacje', label: 'Aplikacje' },
    { id: 'stare', label: 'Stare' }
];

// ============================================
// NAVIGATION ITEMS PER APP
// ============================================
const NAV_ITEMS_CRM = [
    { id: 'dashboard', icon: 'ph-house', label: 'Overview' },
    { id: 'target', icon: 'ph-target', label: 'Target', ownerEmails: ['tomekniedzwiecki@gmail.com', 'kanczewski.maciej@gmail.com', 'maciej@tomekniedzwiecki.pl'] },
    { id: 'leads', icon: 'ph-users', label: 'Leady', showCount: true },
    { id: 'pipeline', icon: 'ph-kanban', label: 'Pipeline' },
    { id: 'whatsapp', icon: 'ph-whatsapp-logo', label: 'WhatsApp' },
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
    { id: 'kampanie', icon: 'ph-chart-line-up', label: 'Kampanie', showCount: true, countHiddenAtZero: true },
    { id: 'automations', icon: 'ph-lightning', label: 'Automatyzacje' },
    { id: 'email-templates', icon: 'ph-file-code', label: 'Szablony emaili' },
    { id: 'email-log', icon: 'ph-envelope', label: 'Historia emaili' },
    { id: 'settings', icon: 'ph-gear', label: 'Ustawienia' },
];

// TN Aplikacje (lejek Stworzę) — panel jest single-page z wewnętrznymi
// zakładkami (Dashboard/Pipeline/Sesje/Koszty/Ustawienia w treści)
const NAV_ITEMS_APLIKACJE = [
    { id: 'index', icon: 'ph-rocket-launch', label: 'Aplikacja' },
];

// TN Sklep (lejek Zbuduję / AWE e-commerce) — single-page z wewnętrznymi zakładkami
const NAV_ITEMS_SKLEP = [
    { id: 'index', icon: 'ph-storefront', label: 'Sklep' },
];

// TN Sklepy (workflow v2 — prowadzenie wspólnych biznesów po rezerwacji /sklep)
const NAV_ITEMS_SKLEPY = [
    { id: 'index', icon: 'ph-list-checks', label: 'Projekty' },
    { id: 'ceny', icon: 'ph-tag', label: 'Ceny' },
];

// TN App (workflow budowy aplikacji SaaS po pełnej płatności /aplikacja)
const NAV_ITEMS_APP = [
    { id: 'index', icon: 'ph-list-checks', label: 'Projekty' },
    { id: 'skrzynki', icon: 'ph-tray', label: 'Skrzynki' },
    { id: 'activation', icon: 'ph-chart-line-up', label: 'Aktywacja' },
    { id: 'rozliczenia', icon: 'ph-receipt', label: 'Rozliczenia AI' },
];

const NAV_ITEMS_BIZNES = [
    { id: 'dashboard', icon: 'ph-chart-pie', label: 'Przegląd' },
    { id: 'analytics', icon: 'ph-chart-bar', label: 'Analytics' },
    { id: 'costs', icon: 'ph-wallet', label: 'Koszty' },
    { id: 'revenues', icon: 'ph-money', label: 'Przychody' },
    { id: 'employees', icon: 'ph-users', label: 'Pracownicy' },
    { id: 'taxes', icon: 'ph-calculator', label: 'Rozliczenia' },
    { id: 'optymalizacja', icon: 'ph-strategy', label: 'Optymalizacja' },
    { id: 'plans', icon: 'ph-target', label: 'Plany' },
];

function getNavItemsForApp(appId) {
    switch (appId) {
        case 'workflow': return NAV_ITEMS_WORKFLOW;
        case 'biznes': return NAV_ITEMS_BIZNES;
        case 'aplikacje': return NAV_ITEMS_APLIKACJE;
        case 'sklepy': return NAV_ITEMS_SKLEPY;
        case 'sklep': return NAV_ITEMS_SKLEP;
        case 'app': return NAV_ITEMS_APP;
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

    @keyframes brainPulse {
        0% { transform: scale(1); }
        30% { transform: scale(1.15); }
        60% { transform: scale(0.95); }
        100% { transform: scale(1); }
    }
    nav a:hover .ph-brain { animation: brainPulse 0.5s ease-out; }

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

    /* Box przełącznika: limit wysokości na niskich viewportach + cienki scrollbar */
    #app-switcher-dropdown, #panel-switcher-dropdown {
        max-height: 80vh;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #3f3f46 transparent;
    }
    #app-switcher-dropdown::-webkit-scrollbar, #panel-switcher-dropdown::-webkit-scrollbar { width: 8px; }
    #app-switcher-dropdown::-webkit-scrollbar-track, #panel-switcher-dropdown::-webkit-scrollbar-track { background: transparent; }
    #app-switcher-dropdown::-webkit-scrollbar-thumb, #panel-switcher-dropdown::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 99px; }
    #app-switcher-dropdown::-webkit-scrollbar-thumb:hover, #panel-switcher-dropdown::-webkit-scrollbar-thumb:hover { background: #52525b; }

    /* Podświetlenie nawigacji klawiaturą (↑/↓) — widoczne też na bieżącej apce */
    .sw-row.sw-hl { background: rgba(255,255,255,0.06); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.22); }
    [aria-current].sw-row.sw-hl { background: rgba(255,255,255,0.16); }
`;

// ============================================
// APP ACCESS RESTRICTIONS
// ============================================
const APP_RESTRICTIONS = {
    // Apps that are only visible to specific users
    // Use full email format - the function will handle username-only input
    biznes: ['tomekniedzwiecki@gmail.com'],
    // Panele lejków (lead pipeline, kasa, prompty) — tylko Tomek + Maciej.
    // Maciej loguje się przez Google (kanczewski.maciej@gmail.com) lub maila firmowego.
    aplikacje: ['tomekniedzwiecki@gmail.com', 'kanczewski.maciej@gmail.com', 'maciej@tomekniedzwiecki.pl'],
    sklep: ['tomekniedzwiecki@gmail.com', 'kanczewski.maciej@gmail.com', 'maciej@tomekniedzwiecki.pl']
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
// APP SWITCHER BOX (jedno źródło: sidebar + header switcher)
// ============================================
// Buduje wnętrze boxu przełącznika: grupy z nagłówkami, każdy wiersz z kafelkiem,
// nazwą, podtytułem, skrótem Alt+N; bieżąca aplikacja podświetlona z ph-check;
// legacy (workflow) wyszarzona z badge „STARE". Filtruje po dostępach użytkownika.
function buildSwitcherHtml(userEmail, currentAppId) {
    const available = getAvailableApps(userEmail);
    let html = '';
    APP_GROUPS.forEach(group => {
        const apps = available.filter(a => (a.group || 'glowne') === group.id);
        if (!apps.length) return;
        const spacing = html ? ' mt-1 pt-2 border-t border-white/5' : '';
        html += `<div class="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold px-3 pt-1 pb-1${spacing}">${group.label}</div>`;
        html += apps.map(app => {
            const isCurrent = app.id === currentAppId;
            const legacyRow = app.legacy ? ' opacity-60' : '';
            const legacyBadge = app.legacy
                ? '<span class="text-[9px] uppercase bg-zinc-800 text-zinc-400 border border-white/10 rounded px-1 py-px leading-none">STARE</span>'
                : '';
            const stateClasses = isCurrent
                ? 'bg-white/10 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-white/5';
            const right = isCurrent
                ? '<i class="ph-bold ph-check text-emerald-400 text-sm ml-auto shrink-0"></i>'
                : (app.shortcut
                    ? `<kbd class="ml-auto shrink-0 text-[10px] text-zinc-600 border border-white/10 rounded px-1 font-mono">Alt+${app.shortcut}</kbd>`
                    : '');
            const tag = isCurrent ? 'div' : 'a';
            const attrs = isCurrent
                ? ' aria-current="page"'
                : ` href="${getAppPath(app.id)}"`;
            return `
        <${tag}${attrs} data-app-id="${app.id}" class="sw-row flex items-center gap-3 px-3 py-2 rounded-lg transition-colors${legacyRow} ${stateClasses}">
            <div class="w-6 h-6 ${app.color} rounded flex items-center justify-center shrink-0">
                <i class="ph-bold ${app.icon} text-xs"></i>
            </div>
            <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                    <span class="text-sm font-medium truncate">${app.name}</span>
                    ${legacyBadge}
                </div>
                ${app.sub ? `<div class="text-[11px] text-zinc-500 truncate leading-tight">${app.sub}</div>` : ''}
            </div>
            ${right}
        </${tag}>`;
        }).join('');
    });
    return html;
}

// ============================================
// INTERNAL STATE
// ============================================
let _currentAppId = 'crm';
let _userEmail = null;
// Toggle boxu przełącznika w panelach bez sidebara (ustawiany przez mountPanelSwitcher)
let _panelSwitcherToggle = null;

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

// Czy dana strona (item.id) jest bezpieczna do przywrócenia dla appId:
// musi być pozycją NAV danej apki, i (bezpiecznik uprawnień) nie może być
// adminOnly ani ownerEmails, których bieżący _userEmail nie przechodzi.
function isNavPageAllowed(appId, pageId) {
    const item = getNavItemsForApp(appId).find(i => i.id === pageId);
    if (!item) return false;
    if (item.adminOnly) return false; // brak pewności co do admina → fallback
    if (item.ownerEmails) {
        const userUsername = (_userEmail || '').toLowerCase().split('@')[0];
        const allowed = item.ownerEmails.some(e => {
            const u = e.toLowerCase().includes('@') ? e.toLowerCase().split('@')[0] : e.toLowerCase();
            return u === userUsername;
        });
        if (!allowed) return false;
    }
    return true;
}

// Ostatnio odwiedzana zakładka apki (localStorage), jeśli whitelistowana; inaczej defaultPage.
function pageForApp(appId) {
    const app = APPS.find(a => a.id === appId);
    const def = app ? app.defaultPage : 'dashboard';
    try {
        const last = localStorage.getItem('tn_last_page_' + appId);
        if (last && isNavPageAllowed(appId, last)) return last;
    } catch (_) { /* prywatny tryb / brak localStorage */ }
    return def;
}

function getAppPath(appId) {
    const app = APPS.find(a => a.id === appId);
    if (!app) return '/';
    const base = APP_BASES[appId] || '';
    const page = pageForApp(appId);
    if (isLocalhost()) {
        // Detect if we're running from parent folder
        const path = location.pathname;
        const hasParentPrefix = path.includes('/tn-crm/');

        if (hasParentPrefix) {
            return `/tn-crm${base}/${page}.html`;
        }
        return `${base}/${page}.html`;
    }
    return `${base}/${page}`;
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
    if (path.includes('/tn-biznes')) return 'biznes';
    if (path.includes('/tn-workflow')) return 'workflow';
    if (path.includes('/tn-aplikacje')) return 'aplikacje';
    // '/tn-app' NIE koliduje z '/tn-aplikacje' (apl ≠ app), ale trzymamy po nim dla jasności
    if (path.includes('/tn-app')) return 'app';
    // UWAGA: '/tn-sklepy' PRZED '/tn-sklep' — includes() złapałby prefiks
    if (path.includes('/tn-sklepy')) return 'sklepy';
    if (path.includes('/tn-sklep')) return 'sklep';
    return 'crm';
}

// ============================================
// RENDER SIDEBAR
// ============================================
function renderSidebar(config = {}) {
    // Support old signature: renderSidebar('sidebar') or renderSidebar({ appId: 'biznes' })
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

    // Zapamiętaj ostatnią zakładkę — TYLKO gdy to pozycja NAV (nie widok szczegółu:
    // lead/offer/projekt/board itp.). Przywracana przez pageForApp() w getAppPath.
    try {
        if (navItems.some(i => i.id === currentPage)) {
            localStorage.setItem('tn_last_page_' + _currentAppId, currentPage);
        }
    } catch (_) { /* prywatny tryb / brak localStorage */ }

    // Build app switcher box HTML (grupy + dostępy) — wspólna funkcja
    const appSwitcherDropdown = buildSwitcherHtml(_userEmail, _currentAppId);
    // Badge „STARE" przy nazwie w przycisku, gdy bieżąca apka jest legacy
    const currentLegacyBadge = currentApp && currentApp.legacy
        ? '<span class="ml-2 text-[9px] uppercase bg-zinc-800 text-zinc-400 border border-white/10 rounded px-1 py-px leading-none">STARE</span>'
        : '';

    // Build navigation HTML
    const navHtml = navItems.map(item => {
        const isActive = item.id === currentPage;
        // Hide by default if: adminOnly (until showAdminNav called) OR ownerEmails (until email verified)
        let hiddenClass = '';
        if (item.adminOnly) hiddenClass = ' hidden';
        if (item.ownerEmails) {
            // Hide unless current user email is in ownerEmails
            const userUsername = (_userEmail || '').toLowerCase().split('@')[0];
            const allowed = item.ownerEmails.some(e => {
                const u = e.toLowerCase().includes('@') ? e.toLowerCase().split('@')[0] : e.toLowerCase();
                return u === userUsername;
            });
            if (!allowed) hiddenClass = ' hidden';
        }
        const itemId = `id="nav-${item.id}"`;

        const activeClasses = isActive
            ? 'bg-white/10 text-white rounded-lg border border-white/5 shadow-sm'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg transition-all';

        let countHtml = '';
        if (item.showCount) {
            const hideZero = item.countHiddenAtZero ? ' hidden' : '';
            countHtml = `<span id="nav-${item.id}-count" class="ml-auto text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono border border-white/5${hideZero}">0</span>`;
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
                <span class="font-medium text-base text-zinc-200">${currentApp.name}</span>${currentLegacyBadge}
                <i class="ph-bold ph-caret-up-down ml-auto text-zinc-500"></i>
            </button>

            <!-- Dropdown (stała szerokość w-72; wystaje poza sidebar, by pełne nazwy/suby się mieściły) -->
            <div id="app-switcher-dropdown" class="app-switcher-dropdown absolute top-full left-2 w-72 bg-zinc-900 border border-white/10 rounded-lg mt-1 p-2 shadow-xl z-50">
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
        if (dropdown.classList.contains('open')) highlightCurrentRow(dropdown);
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

    // Globalne skróty (Alt+N, Ctrl/Cmd+K) — rejestrowane raz
    registerSwitcherKeys();
}

// ============================================
// GLOBALNE SKRÓTY KLAWISZOWE
// ============================================
// Alt+1..7 → nawigacja do apki o danym shortcut (respektuje dostępy).
// Ctrl+K / Cmd+K → toggle boxu przełącznika. Escape zamyka (obsługa lokalna).
// AltGr (polski układ) ustawia ctrlKey+altKey — wykluczamy przez !e.ctrlKey.
function toggleSwitcherDropdown() {
    const sb = document.getElementById('app-switcher-dropdown');
    if (sb) {
        sb.classList.toggle('open');
        if (sb.classList.contains('open')) highlightCurrentRow(sb);
        return;
    }
    if (typeof _panelSwitcherToggle === 'function') _panelSwitcherToggle();
}

function isTypingTarget() {
    const ae = document.activeElement;
    if (!ae) return false;
    const tag = ae.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || ae.isContentEditable;
}

// ---- Nawigacja klawiaturą w OTWARTYM boxie (↑/↓/Enter/1-7) — wspólna dla obu wariantów ----
function getOpenSwitcher() {
    const sb = document.getElementById('app-switcher-dropdown');
    if (sb && sb.classList.contains('open')) return sb;
    const pn = document.getElementById('panel-switcher-dropdown');
    if (pn && !pn.classList.contains('hidden')) return pn;
    return null;
}
function switcherRows(dd) {
    return dd ? [...dd.querySelectorAll('.sw-row[data-app-id]')] : [];
}
function highlightCurrentRow(dd) {
    const rows = switcherRows(dd);
    rows.forEach(r => r.classList.remove('sw-hl'));
    if (!rows.length) return;
    // start = bieżąca aplikacja
    const cur = rows.find(r => r.getAttribute('data-app-id') === _currentAppId) || rows[0];
    cur.classList.add('sw-hl');
}
function moveSwitcherHighlight(dd, dir) {
    const rows = switcherRows(dd);
    if (!rows.length) return;
    let idx = rows.findIndex(r => r.classList.contains('sw-hl'));
    rows.forEach(r => r.classList.remove('sw-hl'));
    idx = (idx === -1) ? (dir > 0 ? 0 : rows.length - 1) : (idx + dir + rows.length) % rows.length; // zawijanie
    rows[idx].classList.add('sw-hl');
    rows[idx].scrollIntoView({ block: 'nearest' });
}
function activateSwitcherHighlight(dd) {
    const row = dd.querySelector('.sw-row.sw-hl[data-app-id]') || dd.querySelector('.sw-row[data-app-id]');
    if (row) window.location.href = getAppPath(row.getAttribute('data-app-id'));
}
// Skok do apki o danym shortoucie (respektuje dostępy). Zwraca true, jeśli wykonano.
function navToShortcut(n) {
    const app = APPS.find(a => a.shortcut === n);
    if (!app) return false;
    if (!getAvailableApps(_userEmail).some(a => a.id === app.id)) return false;
    window.location.href = getAppPath(app.id);
    return true;
}

function registerSwitcherKeys() {
    if (window.__tnSwitcherKeys) return;
    window.__tnSwitcherKeys = true;
    document.addEventListener('keydown', (e) => {
        // Ctrl+K / Cmd+K → toggle przełącznika
        if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            toggleSwitcherDropdown();
            return;
        }
        // Nawigacja WEWNĄTRZ otwartego boxu (bez modyfikatorów, focus nie w inpucie)
        const openDd = getOpenSwitcher();
        if (openDd && !e.altKey && !e.ctrlKey && !e.metaKey && !isTypingTarget()) {
            if (e.key === 'ArrowDown') { e.preventDefault(); moveSwitcherHighlight(openDd, 1); return; }
            if (e.key === 'ArrowUp') { e.preventDefault(); moveSwitcherHighlight(openDd, -1); return; }
            if (e.key === 'Enter') { e.preventDefault(); activateSwitcherHighlight(openDd); return; }
            const dm = e.code && e.code.match(/^Digit([1-7])$/);
            if (dm) { if (navToShortcut(parseInt(dm[1], 10))) e.preventDefault(); return; }
        }
        // Alt+1..7 → skok do aplikacji globalnie (bez AltGr: ten ustawia ctrlKey+altKey)
        if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            const m = e.code && e.code.match(/^Digit([1-7])$/);
            if (!m) return;
            if (isTypingTarget()) return;
            if (navToShortcut(parseInt(m[1], 10))) e.preventDefault();
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

// Wewnętrzny rdzeń: ustawia _userEmail, egzekwuje dostęp, przebudowuje box i pozycje
// ownerEmails. updateLabel=false → nie nadpisuj kosmetycznej etykiety #user-email
// (strony ustawiają ją same, często samym username). Używany też przez bezpiecznik
// w setupLogout, więc KAŻDA strona (nawet nie wołająca setUserEmail) dostaje pełny box.
function applyUserEmail(email, { updateLabel = true } = {}) {
    if (updateLabel) {
        const el = document.getElementById('user-email');
        if (el) el.textContent = email;
    }

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

    // Show/hide per-user ownerEmails nav items (e.g. Target for Tomek only)
    const userUsername = (_userEmail || '').toLowerCase().split('@')[0];
    const navItems = getNavItemsForApp(_currentAppId);
    navItems.filter(item => item.ownerEmails).forEach(item => {
        const el = document.getElementById(`nav-${item.id}`);
        if (!el) return;
        const allowed = item.ownerEmails.some(e => {
            const u = e.toLowerCase().includes('@') ? e.toLowerCase().split('@')[0] : e.toLowerCase();
            return u === userUsername;
        });
        if (allowed) el.classList.remove('hidden');
        else el.classList.add('hidden');
    });
}

// Publiczne API — sygnatura bez zmian (zawsze aktualizuje etykietę)
function setUserEmail(email) {
    applyUserEmail(email, { updateLabel: true });
}

function updateAppSwitcherVisibility() {
    const dropdown = document.getElementById('app-switcher-dropdown');
    if (!dropdown) return;
    dropdown.innerHTML = buildSwitcherHtml(_userEmail, _currentAppId);
}

// ============================================
// PANEL SWITCHER (panele bez sidebara: tn-sklep, tn-aplikacje)
// ============================================
// Model mentalny: trigger = nagłówek w lewym górnym rogu panelu (#panel-switcher-btn,
// statyczny w HTML panelu). Klik/​Ctrl+K otwiera TEN SAM box (buildSwitcherHtml).
// Box doklejamy do <body> z position:fixed liczonym z rectu triggera — omija to
// przycinanie przez overflow oraz transform mobilnego #appnav. Idempotentny.
function mountPanelSwitcher(opts = {}) {
    if (window.__tnPanelSwitcher) return;

    // Panele nie wołają render() → same ustalamy bieżącą apkę i email
    _currentAppId = detectCurrentApp();
    _userEmail = opts.email || _userEmail;

    const trigger = document.getElementById('panel-switcher-btn');
    if (!trigger) return;
    window.__tnPanelSwitcher = true;

    if (!document.getElementById('sidebar-styles')) {
        const style = document.createElement('style');
        style.id = 'sidebar-styles';
        style.textContent = SIDEBAR_CSS;
        document.head.appendChild(style);
    }

    const dd = document.createElement('div');
    dd.id = 'panel-switcher-dropdown';
    dd.className = 'hidden fixed w-72 bg-zinc-900 border border-white/10 rounded-lg p-2 shadow-xl z-[60]';
    document.body.appendChild(dd);

    const position = () => {
        const r = trigger.getBoundingClientRect();
        let left = Math.round(r.left);
        // docisk do prawej krawędzi viewportu (box = 288px)
        left = Math.min(left, window.innerWidth - 288 - 8);
        left = Math.max(8, left);
        const top = Math.round(r.bottom + 6);
        dd.style.left = left + 'px';
        dd.style.top = top + 'px';
        // fixed box nie może wyjść poza dół viewportu — clamp (reszta scrolluje)
        dd.style.maxHeight = Math.max(160, window.innerHeight - top - 12) + 'px';
    };
    const open = () => { dd.innerHTML = buildSwitcherHtml(_userEmail, _currentAppId); position(); dd.classList.remove('hidden'); highlightCurrentRow(dd); };
    const close = () => dd.classList.add('hidden');
    const toggle = () => { if (dd.classList.contains('hidden')) open(); else close(); };
    _panelSwitcherToggle = toggle;

    trigger.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
    document.addEventListener('click', (e) => { if (!dd.contains(e.target) && !trigger.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if (!dd.classList.contains('hidden')) position(); });

    // Globalne skróty (Alt+N, Ctrl/Cmd+K)
    registerSwitcherKeys();
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

// Uniwersalny badge liczbowy przy dowolnej pozycji nav (id = item.id).
// Wywoływać PO Sidebar.render(). Tworzy span raz, potem tylko aktualizuje.
// Ukryty gdy count <= 0. Strona sama fetchuje liczbę — sidebar nie robi zapytań.
function setNavBadge(id, count) {
    const link = document.getElementById(`nav-${id}`);
    if (!link) return;
    let badge = document.getElementById(`nav-${id}-badge`);
    if (!badge) {
        badge = document.createElement('span');
        badge.id = `nav-${id}-badge`;
        badge.className = 'ml-auto bg-[#0070f3] text-white rounded-full text-[10px] px-1.5 py-0.5 font-mono leading-none min-w-[18px] text-center';
        link.appendChild(badge);
    }
    const n = Number(count) || 0;
    badge.textContent = n;
    badge.classList.toggle('hidden', n <= 0);
}

function setupLogout(supabaseClient) {
    const btn = document.getElementById('logout-btn');
    if (btn) {
        btn.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
            window.location.href = getLoginPath();
        });
    }
    // Badge "Kampanie" (TN Workflow) — setupLogout to jedyny punkt, gdzie każda strona
    // przekazuje supabaseClient, więc badge ładuje się wszędzie bez zmian w stronach
    if (_currentAppId === 'workflow') loadWorkflowCampaignBadge(supabaseClient);

    // Centralny bezpiecznik: wypełnij _userEmail z sesji, jeśli strona nie zawołała
    // setUserEmail. Dzięki temu box przełącznika (getAvailableApps) i skróty Alt+N
    // działają na KAŻDEJ stronie — także lead.html / discount-codes.html / email-log.html.
    // Całość w try/catch — nie może wywalić strony. Nie nadpisuje etykiety, jeśli już jest.
    (async () => {
        try {
            const { data } = await supabaseClient.auth.getSession();
            const email = data && data.session && data.session.user && data.session.user.email;
            if (!email) return;
            const labelEl = document.getElementById('user-email');
            const hasLabel = !!(labelEl && labelEl.textContent && labelEl.textContent.trim());
            applyUserEmail(email, { updateLabel: !hasLabel });
        } catch (_) { /* bezpiecznik — nie blokuj strony */ }
    })();
}

// Badge "Kampanie": nierozwiązane blokery (owner tomek/klient) + raporty nowsze niż
// ostatnia wizyta w Centrum Kampanii (localStorage tn_kampanie_last_seen)
async function loadWorkflowCampaignBadge(supabaseClient) {
    const el = document.getElementById('nav-kampanie-count');
    if (!el || !supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('workflow_ads')
            .select('blockers, report_generated_at');
        if (error || !data) return;
        const lastSeen = localStorage.getItem('tn_kampanie_last_seen') || '1970-01-01';
        let count = 0;
        data.forEach(row => {
            (Array.isArray(row.blockers) ? row.blockers : []).forEach(b => {
                if (b && !b.resolved && b.owner !== 'claude') count++;
            });
            if (row.report_generated_at && row.report_generated_at > lastSeen) count++;
        });
        el.textContent = count;
        if (count > 0) {
            el.classList.remove('hidden', 'bg-zinc-800', 'text-zinc-400', 'border-white/5');
            el.classList.add('bg-amber-500/20', 'text-amber-400', 'border-amber-500/30');
        } else {
            el.classList.add('hidden');
        }
    } catch (_) { /* badge jest opcjonalny — nie blokuj strony */ }
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
// TOOLTIP (opt-in, globalny): element z [data-tip-title] dostaje stylowany dymek
// zamiast natywnego title (motyw z macierzy tn-sklepy — decyzja Tomka 18.07).
// Atrybuty: data-tip-title (wymagany), data-tip-sub (niebieski wiersz), data-tip-desc (szary opis).
// Pozycja fixed + docisk do viewportu — nie tnie go overflow przewijanych tabel.
// ============================================
(function initTnTooltip() {
    if (window.__tnTooltipInit) return; window.__tnTooltipInit = true;
    const style = document.createElement('style');
    style.textContent = `
        #tn-tooltip { position:fixed; z-index:9998; background:#111; border:1px solid #333; border-radius:6px;
            padding:9px 11px; font-size:11.5px; line-height:1.45; color:#e5e5e5; max-width:280px;
            pointer-events:none; box-shadow:0 8px 24px rgba(0,0,0,.55); display:none;
            font-family:Inter,sans-serif; text-transform:none; letter-spacing:normal; white-space:normal; }
        #tn-tooltip .tt-img { max-width:220px; max-height:220px; border-radius:8px; display:block; margin-bottom:6px; object-fit:cover; }
        #tn-tooltip .tt-title { color:#fff; font-weight:600; font-size:12px; }
        #tn-tooltip .tt-sub { color:#52a8ff; font-size:10px; margin-top:2px; }
        #tn-tooltip .tt-desc { color:#a1a1aa; margin-top:3px; font-size:11px; }`;
    document.head.appendChild(style);
    let box = null;
    function ensureBox() {
        if (!box) { box = document.createElement('div'); box.id = 'tn-tooltip'; document.body.appendChild(box); }
        return box;
    }
    const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    document.addEventListener('mouseover', (ev) => {
        const el = ev.target && ev.target.closest ? ev.target.closest('[data-tip-title]') : null;
        if (!el) return;
        const b = ensureBox();
        const sub = el.dataset.tipSub || '', desc = el.dataset.tipDesc || '', img = el.dataset.tipImg || '';
        b.innerHTML = (img ? `<img class="tt-img" src="${esc(img)}" alt="" onerror="this.style.display='none'">` : '')
            + `<div class="tt-title">${esc(el.dataset.tipTitle)}</div>`
            + (sub ? `<div class="tt-sub">${esc(sub)}</div>` : '')
            + (desc ? `<div class="tt-desc">${esc(desc)}</div>` : '');
        b.style.display = 'block';
        const r = el.getBoundingClientRect(), bw = b.offsetWidth, bh = b.offsetHeight;
        let x = r.left + r.width / 2 - bw / 2;
        x = Math.max(8, Math.min(x, window.innerWidth - bw - 8));
        let y = r.bottom + 8;
        if (y + bh > window.innerHeight - 8) y = r.top - bh - 8;
        b.style.left = x + 'px'; b.style.top = Math.max(8, y) + 'px';
    });
    document.addEventListener('mouseout', (ev) => {
        const el = ev.target && ev.target.closest ? ev.target.closest('[data-tip-title]') : null;
        if (!el) return;
        if (ev.relatedTarget && el.contains(ev.relatedTarget)) return;
        if (box) box.style.display = 'none';
    });
    document.addEventListener('click', () => { if (box) box.style.display = 'none'; }, true);
})();

// ============================================
// EXPORT
// ============================================
window.Sidebar = {
    render: renderSidebar,
    mountPanelSwitcher,
    showAdminNav,
    setUserEmail,
    setUserName,
    setUserColor,
    setLeadsCount,
    setNavBadge,
    refreshKampanieBadge: loadWorkflowCampaignBadge,
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
