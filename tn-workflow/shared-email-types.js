// ============================================
// SHARED EMAIL TYPES & TRIGGERS
// Used by: automation-builder.html, email-templates.html
// ============================================

const EMAIL_TEMPLATE_CATEGORIES = {
    leady: {
        label: 'Leady',
        description: 'Maile dla nowych leadów',
        templates: ['zapisy_confirmation', 'lead_intro_video']
    },
    oferty: {
        label: 'Oferty',
        description: 'Maile związane z ofertami',
        templates: ['offer_created', 'offer_reminder_halfway', 'offer_expired']
    },
    platnosci: {
        label: 'Płatności',
        description: 'Maile związane z płatnościami i fakturami',
        templates: ['contract_sent', 'proforma_generated', 'invoice_sent']
    },
    projektowe: {
        label: 'Etap 1 - Marka',
        description: 'Maile związane z realizacją projektów',
        templates: ['workflow_created', 'products_shared', 'report_published', 'branding_delivered', 'sales_page_shared']
    },
    video: {
        label: 'Etap 2 - Video',
        description: 'Maile związane z nagraniami video',
        templates: ['video_activated', 'scenarios_shared']
    },
    takedrop: {
        label: 'Etap 3 - Konfiguracja sklepu',
        description: 'Maile związane z konfiguracją TakeDrop',
        templates: ['takedrop_activated', 'landing_page_connected', 'test_ready']
    },
    reklamy: {
        label: 'Etap 4 - Reklamy',
        description: 'Maile związane z kampaniami reklamowymi',
        templates: ['ads_activated']
    }
};

const EMAIL_TEMPLATE_DEFINITIONS = {
    'zapisy_confirmation': {
        name: 'Potwierdzenie zapisu',
        description: 'Wysyłany po zapisaniu się przez formularz',
        icon: 'ph-user-plus',
        color: 'emerald'
    },
    'lead_intro_video': {
        name: 'Video wprowadzające',
        description: 'Wysyłany 7 minut po zapisie z linkiem do YT',
        icon: 'ph-youtube-logo',
        color: 'red'
    },
    'offer_created': {
        name: 'Oferta utworzona',
        description: 'Wysyłany gdy tworzona jest nowa oferta',
        icon: 'ph-paper-plane-tilt',
        color: 'emerald'
    },
    'offer_reminder_halfway': {
        name: 'Przypomnienie o ofercie',
        description: 'Wysyłany w połowie ważności oferty',
        icon: 'ph-bell',
        color: 'amber'
    },
    'offer_expired': {
        name: 'Oferta wygasła',
        description: 'Wysyłany gdy oferta traci ważność',
        icon: 'ph-clock-countdown',
        color: 'red'
    },
    'contract_sent': {
        name: 'Umowa wysłana',
        description: 'Wysyłany wraz z umową do podpisu',
        icon: 'ph-file-text',
        color: 'orange'
    },
    'proforma_generated': {
        name: 'Faktura proforma',
        description: 'Wysyłany wraz z fakturą proforma',
        icon: 'ph-file-pdf',
        color: 'orange'
    },
    'invoice_sent': {
        name: 'Faktura wystawiona',
        description: 'Wysyłany wraz z fakturą',
        icon: 'ph-receipt',
        color: 'orange'
    },
    'workflow_created': {
        name: 'Powitanie klienta',
        description: 'Wysyłany gdy workflow jest utworzony',
        icon: 'ph-play',
        color: 'violet'
    },
    'products_shared': {
        name: 'Produkty udostępnione',
        description: 'Wysyłany gdy udostępniane są produkty',
        icon: 'ph-package',
        color: 'cyan'
    },
    'report_published': {
        name: 'Raport opublikowany',
        description: 'Wysyłany gdy publikowany jest raport',
        icon: 'ph-file-doc',
        color: 'cyan'
    },
    'branding_delivered': {
        name: 'Branding dostarczony',
        description: 'Wysyłany gdy branding jest gotowy',
        icon: 'ph-paint-brush',
        color: 'cyan'
    },
    'sales_page_shared': {
        name: 'Strona sprzedażowa',
        description: 'Wysyłany gdy udostępniana jest strona',
        icon: 'ph-globe',
        color: 'cyan'
    },
    'video_activated': {
        name: 'Aktywuj Video',
        description: 'Wysyłany gdy admin aktywuje zakładkę Video',
        icon: 'ph-video-camera',
        color: 'cyan'
    },
    'scenarios_shared': {
        name: 'Scenariusze udostępnione',
        description: 'Wysyłany gdy admin udostępni scenariusze video',
        icon: 'ph-film-script',
        color: 'cyan'
    },
    'takedrop_activated': {
        name: 'Aktywuj TakeDrop',
        description: 'Wysyłany gdy admin aktywuje zakładkę TakeDrop',
        icon: 'ph-storefront',
        color: 'sky'
    },
    'landing_page_connected': {
        name: 'Strona podłączona',
        description: 'Wysyłany gdy strona zostanie podłączona do TakeDrop',
        icon: 'ph-link',
        color: 'sky'
    },
    'test_ready': {
        name: 'Test sklepu gotowy',
        description: 'Wysyłany gdy sklep jest gotowy do testów przez klienta',
        icon: 'ph-browser',
        color: 'cyan'
    },
    // Etap 4 - Reklamy
    'ads_activated': {
        name: 'Etap 4 aktywowany',
        description: 'Wysyłany gdy admin oznaczy testy jako zakończone',
        icon: 'ph-megaphone-simple',
        color: 'rose'
    }
};

// Flat version for backward compatibility
const EMAIL_TYPES_FLAT = Object.values(EMAIL_TEMPLATE_CATEGORIES).reduce((acc, cat) => {
    cat.templates.forEach(type => {
        if (EMAIL_TEMPLATE_DEFINITIONS[type]) {
            acc[type] = EMAIL_TEMPLATE_DEFINITIONS[type].name;
        }
    });
    return acc;
}, {});

// Grouped version for dropdowns
const EMAIL_TYPES_GROUPED = Object.entries(EMAIL_TEMPLATE_CATEGORIES).reduce((acc, [key, cat]) => {
    acc[cat.label] = {};
    cat.templates.forEach(type => {
        if (EMAIL_TEMPLATE_DEFINITIONS[type]) {
            acc[cat.label][type] = EMAIL_TEMPLATE_DEFINITIONS[type].name;
        }
    });
    return acc;
}, {});

// Triggers grouped by category
const TRIGGERS_BY_CATEGORY = {
    lead: [
        { value: 'lead_created', label: 'Nowy lead' }
    ],
    offer: [
        { value: 'offer_created', label: 'Oferta utworzona' },
        { value: 'offer_viewed', label: 'Oferta obejrzana' },
        { value: 'offer_expired', label: 'Oferta wygasła' }
    ],
    payment: [
        { value: 'payment_received', label: 'Płatność otrzymana' },
        { value: 'contract_signed', label: 'Umowa podpisana' },
        { value: 'invoice_sent', label: 'Faktura wystawiona' },
        { value: 'proforma_generated', label: 'Proforma wygenerowana' }
    ],
    workflow: [
        { value: 'workflow_created', label: 'Workflow utworzony' },
        { value: 'stage_completed', label: 'Etap ukończony' },
        { value: 'products_shared', label: 'Produkty udostępnione' },
        { value: 'report_published', label: 'Raport opublikowany' },
        { value: 'branding_delivered', label: 'Branding dostarczony' },
        { value: 'sales_page_shared', label: 'Sales page udostępniony' },
        { value: 'video_activated', label: 'Aktywuj Video' },
        { value: 'scenarios_shared', label: 'Scenariusze udostępnione' },
        { value: 'takedrop_activated', label: 'Aktywuj TakeDrop' },
        { value: 'landing_page_connected', label: 'Strona podłączona' },
        { value: 'test_ready', label: 'Test sklepu gotowy' },
        { value: 'ads_activated', label: 'Etap 4 aktywowany' }
    ]
};

// Trigger definitions with icons
const TRIGGER_DEFINITIONS = {
    // Leady
    lead_created: { label: 'Nowy lead', icon: 'ph-user-plus', color: 'emerald' },
    // Oferty
    offer_created: { label: 'Oferta utworzona', icon: 'ph-file-text', color: 'blue' },
    offer_viewed: { label: 'Oferta obejrzana', icon: 'ph-eye', color: 'blue' },
    offer_expired: { label: 'Oferta wygasła', icon: 'ph-clock-countdown', color: 'blue' },
    // Płatności
    payment_received: { label: 'Płatność otrzymana', icon: 'ph-credit-card', color: 'green' },
    contract_signed: { label: 'Umowa podpisana', icon: 'ph-signature', color: 'green' },
    invoice_sent: { label: 'Faktura wystawiona', icon: 'ph-receipt', color: 'green' },
    proforma_generated: { label: 'Proforma wygenerowana', icon: 'ph-file-dashed', color: 'green' },
    // Etap 1
    workflow_created: { label: 'Workflow utworzony', icon: 'ph-play', color: 'purple' },
    stage_completed: { label: 'Etap ukończony', icon: 'ph-check-circle', color: 'purple' },
    products_shared: { label: 'Produkty udostępnione', icon: 'ph-package', color: 'purple' },
    report_published: { label: 'Raport opublikowany', icon: 'ph-file-doc', color: 'purple' },
    branding_delivered: { label: 'Branding dostarczony', icon: 'ph-paint-brush', color: 'purple' },
    sales_page_shared: { label: 'Sales page udostępniony', icon: 'ph-globe', color: 'purple' },
    // Etap 2 - Video
    video_activated: { label: 'Aktywuj Video', icon: 'ph-video-camera', color: 'cyan' },
    scenarios_shared: { label: 'Scenariusze udostępnione', icon: 'ph-film-script', color: 'cyan' },
    // Etap 3 - TakeDrop
    takedrop_activated: { label: 'Aktywuj TakeDrop', icon: 'ph-storefront', color: 'sky' },
    landing_page_connected: { label: 'Strona podłączona', icon: 'ph-link', color: 'sky' },
    test_ready: { label: 'Test sklepu gotowy', icon: 'ph-browser', color: 'cyan' },
    // Etap 4 - Reklamy
    ads_activated: { label: 'Etap 4 aktywowany', icon: 'ph-megaphone-simple', color: 'rose' }
};
