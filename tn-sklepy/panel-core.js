/* ============================================================================
   panel-core.js — WSPÓLNY RDZEŃ WIDOKU panelu TN Sklepy.
   Jedno źródło renderowania dla panelu admina (projekt.html) i portalu
   klienta (portal.html). Rdzeń jest CZYSTY: operuje wyłącznie na globalnym
   stanie `P` i na DOM; NIE zna Supabase ani żadnej logiki zapisu (zapisy żyją
   w bootstrapie każdej strony). Wszelkie ścieżki edycji w trybie klienta są
   martwe — rdzeń renderuje wtedy widok tylko do odczytu.

   Stan globalny (inicjalizowany przez bootstrap strony):
     P = {
       mode: 'admin' | 'client',
       projectId, project, stepDefs, steps, products, artifacts, notes,
       sales, adStats, costs, genMap, ordersCount,
       WS,            // słownik opisów kroków (admin: WS; klient: CLIENT_WS)
       hooks: {       // pola opcjonalne — admin wpina swoje bloki edycji
         renderDrawerBody(st, d, p),   // admin buduje ciało + stopkę drawera
         onOpenStep(key, productId),   // np. tracking otwarcia kroku
         onMediaView(item),            // np. tracking podglądu media
       }
     }
   ============================================================================ */

var P = (typeof P !== 'undefined' && P) || {
    mode: 'admin',
    projectId: null, project: null,
    stepDefs: [], steps: [], products: [], artifacts: [], notes: [],
    sales: [], adStats: [], costs: [], genMap: {}, ordersCount: 0,
    WS: {}, hooks: {},
};

// stan widoku współdzielony w obrębie strony
let activeStage = 1;
let drawerCtx = null;      // { key, productId }
let lbItems = [];          // [{ url, cap }]
let lbIdx = 0;
let lbGroupSeq = 0;
let _matrixDefs = null;    // ostatnio wyrenderowana kolumna macierzy (do odświeżenia po „podejrzyj")

/* ── stałe widoku ──────────────────────────────────────────────────────── */
const PROJECT_STATUSES = ['start','budowa','sklep','kampanie','testy','stery','monthly','zamkniety'];
const STATUS_LABELS = { start:'Start', budowa:'Budowa', sklep:'Sklep', kampanie:'Kampanie', testy:'Testy', stery:'Stery', monthly:'Monthly', zamkniety:'Zamknięty' };
const PRODUCT_STATUS_META = {
    kandydat:     { label:'Kandydat',     cls:'bg-zinc-500/15 text-zinc-300' },
    zaakceptowany:{ label:'Zaakceptowany',cls:'bg-[#0070f3]/10 text-[#52a8ff]' },
    w_budowie:    { label:'W budowie',    cls:'bg-[#0070f3]/10 text-[#52a8ff]' },
    gotowy:       { label:'Gotowy',       cls:'bg-[#0070f3]/10 text-[#52a8ff]' },
    live:         { label:'LIVE',         cls:'bg-[#45a557]/10 text-[#62c073]' },
    test:         { label:'W teście',     cls:'bg-[#f5a623]/10 text-[#f5b955]' },
    winner:       { label:'WINNER',       cls:'bg-[#45a557]/20 text-[#62c073] font-semibold' },
    kill:         { label:'KILL',         cls:'bg-[#e5484d]/10 text-[#f26d78]' },
    skala:        { label:'Skala',        cls:'bg-[#0070f3]/10 text-[#52a8ff]' },
};
const STEP_LABELS = { pending:'Do zrobienia', in_progress:'W trakcie', done:'Ukończone', skipped:'Pominięte', blocked:'Zablokowane' };
const STEP_ICON = { pending:'ph-circle', in_progress:'ph-circle-notch', done:'ph-check-circle', skipped:'ph-minus-circle', blocked:'ph-x-circle' };
const OWNER_LABEL = { admin:'Tomek', client:'Klient', auto:'Auto' };
const PORTFOLIO_TARGET = 3;

/* ── pomocnicze ────────────────────────────────────────────────────────── */
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function moneyPL(n) { return (Number(n)||0).toLocaleString('pl-PL',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' zł'; }
function relTime(iso) {
    if (!iso) return '';
    const d = new Date(iso); const mins = Math.round((Date.now()-d.getTime())/60000);
    if (mins < 60) return mins + ' min temu';
    if (mins < 1440) return Math.round(mins/60) + ' godz. temu';
    return d.toLocaleDateString('pl-PL');
}
function showToast(message, type='info') {
    const toast = document.createElement('div');
    const bg = type==='success' ? '#45a557' : type==='error' ? '#ef4444' : '#3b82f6';
    toast.style.cssText = `position:fixed;top:20px;right:20px;z-index:9999;background:${bg};color:#fff;padding:12px 20px;border-radius:6px;font:14px/1 sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.3);transition:opacity .3s`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity='0'; setTimeout(()=>toast.remove(),300); }, 2200);
}
function mdLite(md) {
    let h = escapeHtml(md).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    const lines = h.split(/\r?\n/); let out = '', inUl = false;
    for (const ln of lines) {
        if (/^\s*-\s+/.test(ln)) { if (!inUl) { out += '<ul class="list-disc pl-4 space-y-1">'; inUl = true; } out += '<li>' + ln.replace(/^\s*-\s+/, '') + '</li>'; }
        else { if (inUl) { out += '</ul>'; inUl = false; } if (ln.trim()) out += '<p>' + ln + '</p>'; }
    }
    if (inUl) out += '</ul>';
    return out;
}
// miniatura z render API Storage (?width) — pełny obraz w lightboxie
function thumbUrl(url, w) {
    if (!url) return '';
    const m = url.match(/^(https:\/\/[^/]+)\/storage\/v1\/object\/public\/([^?]+)(?:\?(.*))?$/);
    if (!m) return url;
    const q = m[3] ? m[3] + '&' : '';
    return `${m[1]}/storage/v1/render/image/public/${m[2]}?${q}width=${w || 360}&resize=contain`;
}

// Obrazek się nie wczytał (najczęściej wygasły podpis CDN TikToka → 403/ORB, ale też
// skasowany plik w Storage). Podmieniamy na placeholder w rozmiarze kafla — bez tego
// przeglądarka rysuje systemową ikonę „zepsuty obrazek" albo zostaje pusta dziura.
function imgFallback(img, cls) {
    if (!img || img.dataset.f) return;
    img.dataset.f = '1';
    if (!img.parentElement) return;
    const d = document.createElement('div');
    d.className = cls || 'w-full aspect-square bg-[#111] rounded flex items-center justify-center';
    d.innerHTML = '<i class="ph ph-image text-zinc-700 text-xl"></i>';
    img.replaceWith(d);
}

/* ── lightbox z nawigacją ──────────────────────────────────────────────── */
function openLightbox(url) { if (!url) return; lbItems = [{ url: url, cap: '' }]; lbIdx = 0; lbShow(); }
function openLightboxG(el) {
    const gid = el.getAttribute('data-lb-group');
    const nodes = gid ? Array.from(document.querySelectorAll('[data-lb-group="' + gid + '"]')) : [el];
    lbItems = nodes.map(n => ({ url: n.getAttribute('data-lb-url') || '', cap: n.getAttribute('data-lb-cap') || '' })).filter(it => it.url);
    if (!lbItems.length) return;
    lbIdx = Math.max(0, nodes.indexOf(el));
    lbShow();
}
function lbShow() {
    const it = lbItems[lbIdx]; if (!it) return;
    document.getElementById('lightbox-img').src = it.url;
    const multi = lbItems.length > 1;
    document.getElementById('lb-prev').classList.toggle('hidden', !multi);
    document.getElementById('lb-next').classList.toggle('hidden', !multi);
    const hud = document.getElementById('lb-hud');
    hud.textContent = (lbIdx + 1) + ' / ' + lbItems.length;
    hud.classList.toggle('hidden', !multi);
    const cap = document.getElementById('lb-cap');
    cap.textContent = it.cap || '';
    cap.classList.toggle('hidden', !it.cap);
    document.getElementById('lightbox').classList.remove('hidden');
    if (P.hooks && P.hooks.onMediaView) { try { P.hooks.onMediaView(it); } catch (_) {} }
}
function lbStep(dir) { if (!lbItems.length) return; lbIdx = (lbIdx + dir + lbItems.length) % lbItems.length; lbShow(); }
function closeLightbox() { document.getElementById('lightbox').classList.add('hidden'); lbItems = []; }
function lbBgClose(e) { if (e.target === e.currentTarget) closeLightbox(); }
document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('lightbox');
    if (lb && !lb.classList.contains('hidden')) {
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') lbStep(-1);
        else if (e.key === 'ArrowRight') lbStep(1);
        return;
    }
    if (e.key === 'Escape') { const plb = document.getElementById('prodlb'); if (plb && !plb.classList.contains('hidden')) closeProductLB(); }
});

/* ── lightbox produktu: duże zdjęcie + aukcja dostawcy + wideo TikTok (lazy) ─ */
let plbVids = [];   // tiktoki z mp4 (odtwarzacz)
function openProductLB(pid) {
    const p = (P.products || []).find(x => x.id === pid); if (!p) return;
    const admin = P.mode === 'admin';
    const tiktoks = (Array.isArray(p.tiktoks) ? p.tiktoks : []).filter(t => t && t.url);
    plbVids = tiktoks.filter(t => t.mp4);
    const linkOnly = tiktoks.filter(t => !t.mp4);
    const cover = p.cover_url || '';
    const coverHtml = cover
        ? `<img class="plb-cover" src="${escapeHtml(cover)}" data-url="${escapeHtml(cover)}" onclick="openLightbox(this.dataset.url)" alt="" onerror="this.style.display='none'">`
        : `<div class="plb-cover plb-cover-empty"><i class="ph ph-package"></i></div>`;
    const statusMeta = PRODUCT_STATUS_META[p.status] || PRODUCT_STATUS_META.kandydat;
    // pasek akcji
    const actions = [];
    if (p.supplier_url) actions.push(`<a class="plb-btn" href="${escapeHtml(p.supplier_url)}" target="_blank" rel="noopener"><i class="ph ph-shopping-cart"></i> Aukcja dostawcy <i class="ph ph-arrow-square-out plb-ext"></i></a>`);
    if (admin) actions.push(`<button class="plb-btn plb-btn-ghost" onclick="closeProductLB();openCard('${p.id}')"><i class="ph ph-identification-card"></i> Karta produktu</button>`);
    if (p.platform_page_url) actions.push(`<a class="plb-btn plb-btn-ghost" href="${escapeHtml(p.platform_page_url)}" target="_blank" rel="noopener"><i class="ph ph-rocket-launch"></i> Landing <i class="ph ph-arrow-square-out plb-ext"></i></a>`);
    // sekcja wideo
    let videoHtml = '';
    if (plbVids.length || linkOnly.length) {
        const thumbs = [];
        plbVids.forEach((v, i) => thumbs.push(`<button class="plb-thumb plb-thumb-vid ${i === 0 ? 'is-active' : ''}" onclick="plbSetVideo(${i})" title="Wideo ${i + 1}">
            ${v.poster ? `<img src="${escapeHtml(v.poster)}" loading="lazy" onerror="this.style.display='none'">` : '<i class="ph ph-tiktok-logo"></i>'}
            <span class="plb-thumb-badge"><i class="ph ph-play-fill"></i></span></button>`));
        linkOnly.forEach(v => thumbs.push(`<a class="plb-thumb plb-thumb-link" href="${escapeHtml(v.url)}" target="_blank" rel="noopener" title="TikTok ↗">
            ${v.poster ? `<img src="${escapeHtml(v.poster)}" loading="lazy" onerror="this.style.display='none'">` : '<i class="ph ph-tiktok-logo"></i>'}
            <span class="plb-thumb-badge"><i class="ph ph-arrow-square-out"></i></span></a>`));
        videoHtml = `<div class="plb-vidsec">
            <div class="plb-vidhead"><i class="ph ph-tiktok-logo"></i> Wideo z TikToka <span class="plb-count">${tiktoks.length}</span></div>
            ${plbVids.length ? '<div class="plb-player" id="plb-player"></div>' : `<div class="plb-noplayer">Podglądy odtwarzają się w TikToku — kliknij miniaturę.</div>`}
            <div class="plb-thumbs">${thumbs.join('')}</div>
        </div>`;
    }
    document.getElementById('prodlb-panel').innerHTML = `
        <div class="plb-head">
            <div class="min-w-0"><div class="plb-title">${escapeHtml(p.name || 'Produkt')}</div>
            <div class="plb-sub">${p.slug ? `<span class="plb-slug">/${escapeHtml(p.slug)}</span>` : ''}<span class="plb-status ${statusMeta.cls}">${statusMeta.label}</span></div></div>
            <button class="plb-x" onclick="closeProductLB()" aria-label="Zamknij"><i class="ph ph-x"></i></button>
        </div>
        <div class="plb-body">
            <div class="plb-media">${coverHtml}</div>
            <div class="plb-side">
                ${actions.length ? `<div class="plb-actions">${actions.join('')}</div>` : ''}
                ${videoHtml || '<div class="plb-noplayer">Brak podpiętych materiałów wideo.</div>'}
            </div>
        </div>`;
    document.getElementById('prodlb').classList.remove('hidden');
    if (plbVids.length) plbSetVideo(0);
    if (P.hooks && P.hooks.onMediaView && cover) { try { P.hooks.onMediaView({ url: cover, cap: p.name || 'produkt' }); } catch (_) {} }
}
function plbSetVideo(idx) {
    const v = plbVids[idx]; if (!v) return;
    const player = document.getElementById('plb-player'); if (!player) return;
    player.innerHTML = `<video class="plb-video" controls playsinline autoplay preload="metadata"${v.poster ? ` poster="${escapeHtml(v.poster)}"` : ''} src="${escapeHtml(v.mp4)}"></video>`;
    document.querySelectorAll('#prodlb-panel .plb-thumb-vid').forEach((el, i) => el.classList.toggle('is-active', i === idx));
    if (P.hooks && P.hooks.onMediaView) { try { P.hooks.onMediaView({ url: v.mp4, cap: 'wideo TikTok' }); } catch (_) {} }
}
function closeProductLB() {
    const el = document.getElementById('prodlb'); if (!el) return;
    el.classList.add('hidden');
    const panel = document.getElementById('prodlb-panel'); if (panel) panel.innerHTML = '';  // zatrzymuje wideo
    plbVids = [];
}

/* ── model kroków (czyste funkcje na P) ────────────────────────────────── */
function stageNums() { return [...new Set(P.stepDefs.map(d=>d.stage))].sort((a,b)=>a-b); }
function defsForStage(n) { return P.stepDefs.filter(d=>d.stage===n && !d.sub_of); }
function subDefsFor(parentKey) { return P.stepDefs.filter(d=>d.sub_of===parentKey).sort((a,b)=>(a.sort||0)-(b.sort||0)); }
function defFor(key) { return P.stepDefs.find(d => d.key===key); }
function stepFor(key, productId) {
    return P.steps.find(s => s.step_key===key && (productId ? s.product_id===productId : !s.product_id));
}
function stageProgress(n) {
    const keys = defsForStage(n).map(d=>d.key);
    const inst = P.steps.filter(s => keys.includes(s.step_key) && s.status!=='skipped');
    const done = inst.filter(s=>s.status==='done').length;
    return { done, total: inst.length, pct: inst.length ? Math.round(done/inst.length*100) : 0 };
}
function milestones() {
    let total = 0, done = 0;
    P.stepDefs.filter(d => d.milestone_label).forEach(d => {
        if (d.scope === 'project') {
            total += 1;
            const st = stepFor(d.key, null);
            if (st && st.status === 'done') done += 1;
        } else {
            P.products.forEach(p => {
                total += 1;
                const st = stepFor(d.key, p.id);
                if (st && st.status === 'done') done += 1;
            });
        }
    });
    return { done, total };
}
function stageHasMilestone(n) {
    return defsForStage(n).some(d => d.milestone_label && (
        d.scope === 'project'
            ? (stepFor(d.key, null)?.status === 'done')
            : P.products.some(p => stepFor(d.key, p.id)?.status === 'done')
    ));
}
function artifactsFor(productId, stepKey) {
    return P.artifacts.filter(a => (productId ? a.product_id === productId : !a.product_id) && (!stepKey || a.step_key === stepKey));
}
function productProgress(pid, defsSubset) {
    const keys = (defsSubset && defsSubset.length ? defsSubset : P.stepDefs.filter(d=>d.scope==='product')).map(d=>d.key);
    const inst = P.steps.filter(s => s.product_id === pid && keys.includes(s.step_key) && s.status !== 'skipped');
    const done = inst.filter(s => s.status === 'done').length;
    return { done, total: inst.length, pct: inst.length ? Math.round(done/inst.length*100) : 0 };
}
// czy krok ma oglądalne media (obraz/wideo) — do wskaźnika „kliknij i podejrzyj"
function stepMediaCount(pid, stepKey) {
    return artifactsFor(pid, stepKey).filter(a => {
        const u = a.url || ''; if (!/^https?:/.test(u)) return false;
        return /\.(png|jpe?g|webp|avif|gif|mp4|webm|mov)(\?|$)/i.test(u)
            || ['mockup','makieta','makieta_mobile','scena','dowod','proof','ad_creative','screenshot_final','styl_master','gallery','branding','brand','video'].includes(a.kind);
    }).length;
}
// media artefaktów kroku (obrazy + wideo web-widoczne) → pasek miniatur w kartach kroków
const MEDIA_IMG_KINDS = ['mockup','makieta','makieta_mobile','scena','dowod','proof','ad_creative','screenshot_final','styl_master','gallery','branding','brand'];
function stepMediaItems(pid, stepKey) {
    return artifactsFor(pid, stepKey).map(a => {
        const u = a.url || '';
        if (!/^https?:/.test(u) || a.storage === 'repo' || a.storage === 'desktop') return null;
        const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(u) || a.kind === 'video';
        const isImg = !isVideo && (/\.(png|jpe?g|webp|avif|gif)(\?|$)/i.test(u) || MEDIA_IMG_KINDS.includes(a.kind));
        if (!isVideo && !isImg) return null;
        const cap = (a.meta && a.meta.section) ? a.meta.section : (a.label || a.kind);
        // logotypy/branding: kadrowanie 4:3 ucina wordmarki — te kafle dopasowują bez przycinania
        const contain = ['branding','brand','logo','favicon','styl_master'].includes(a.kind);
        return { url: u, isVideo, poster: (a.meta && a.meta.poster) || '', cap, label: a.label || a.kind, contain };
    }).filter(Boolean);
}
// filmstrip osi procesu: duże, oglądalne kadry (obrazy → lightbox całej galerii kroku;
// wideo → poster+play w nowej karcie); max 5 + kafel „+N pozostałych". Klik zdejmuje badge „nowe".
function stepFilmstrip(items, pid, stepKey) {
    if (!items.length) return '';
    const gid = 'flm-' + (++lbGroupSeq);
    const pidJs = pid ? `'${pid}'` : 'null';
    const MAX = 5;
    const show = items.slice(0, MAX);
    const more = items.length - show.length;
    const shownImg = new Set(show.filter(i => !i.isVideo).map(i => i.url));
    const cells = show.map(it => {
        if (it.isVideo) {
            return `<a class="proc-frame proc-frame-vid" href="${escapeHtml(it.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation();markStepSeen(${pidJs},'${stepKey}')" title="${escapeHtml(it.label)}">
                ${it.poster ? `<img src="${escapeHtml(it.poster)}" loading="lazy" onerror="this.style.display='none'">` : ''}
                <span class="proc-frame-play"><i class="ph ph-play-fill"></i></span></a>`;
        }
        return `<a class="proc-frame${it.contain ? ' pf-contain' : ''}" href="javascript:void(0)" data-lb-group="${gid}" data-lb-url="${escapeHtml(it.url)}" data-lb-cap="${escapeHtml(it.cap)}"
            onclick="event.stopPropagation();procFrameOpen(this,${pidJs},'${stepKey}')" title="${escapeHtml(it.label)}">
            <img src="${escapeHtml(thumbUrl(it.url, 320))}" loading="lazy" onerror="this.parentElement.style.display='none'"></a>`;
    }).join('');
    // obrazy poza podglądem dokładam jako ukryte węzły grupy → lightbox nawiguje PEŁNĄ galerię kroku
    const hidden = items.filter(i => !i.isVideo && !shownImg.has(i.url))
        .map(it => `<a class="hidden" data-lb-group="${gid}" data-lb-url="${escapeHtml(it.url)}" data-lb-cap="${escapeHtml(it.cap)}"></a>`).join('');
    const moreTile = more > 0
        ? `<button class="proc-frame proc-frame-more" onclick="event.stopPropagation();procFrameOpen(this.closest('.proc-film').querySelector('[data-lb-url]'),${pidJs},'${stepKey}')"><span class="pfm-n">+${more}</span><span class="pfm-l">pozostałych</span></button>`
        : '';
    return `<div class="proc-film">${cells}${moreTile}${hidden}</div>`;
}

/* ── „Kliknij i podejrzyj": pamięć obejrzanych komórek (localStorage) ───── */
function peekSeenKey() { return 'wf2_seen_' + (P.projectId || ''); }
function peekSeenList() { try { return JSON.parse(localStorage.getItem(peekSeenKey()) || '[]'); } catch (_) { return []; } }
function isPeekSeen(pid, key) { return peekSeenList().includes(pid + ':' + key); }
function markPeekSeen(pid, key) {
    try { const l = peekSeenList(); const t = pid + ':' + key; if (!l.includes(t)) { l.push(t); localStorage.setItem(peekSeenKey(), JSON.stringify(l)); } } catch (_) {}
}
// klik w komórkę macierzy: zapamiętaj (zdejmuje glow) i otwórz warsztat/podgląd kroku
function peekOpen(key, pid) {
    markPeekSeen(pid, key);
    openStep(key, pid);
    if (_matrixDefs) renderMatrix(_matrixDefs);
}
// oś procesu: klik w wiersz kroku. Krok kliencki w portalu → karta zadania (hook), inaczej drawer.
function procOpen(key, productId) {
    const d = defFor(key);
    if (P.mode === 'client' && d && d.owner === 'client' && P.hooks && P.hooks.openClientTask) { P.hooks.openClientTask(key); return; }
    const hadNew = stepMediaItems(productId || null, key).length && !isPeekSeen(productId || null, key);
    openStep(key, productId);
    if (hadNew) { markPeekSeen(productId || null, key); renderStage(); }
}
// klik w kadr filmstripa: otwórz lightbox galerii, zdejmij badge „nowe", odśwież oś
function procFrameOpen(el, pid, key) { openLightboxG(el); markStepSeen(pid, key); }
function markStepSeen(pid, key) { if (isPeekSeen(pid || null, key)) return; markPeekSeen(pid || null, key); renderStage(); }


// Pasek „Podglądy" (wf2_projects.links) — akcje addLink/removeLink = globalne w bootstrapie admina
function renderLinks() {
    const wrap = document.getElementById('p-links');
    const links = Array.isArray(P.project.links) ? P.project.links : [];
    wrap.innerHTML = links.map((l, i) => `
        <span class="inline-flex items-center bg-[#0a0a0a] border border-[#262626] rounded-md overflow-hidden">
            <a href="${escapeHtml(l.url)}" target="_blank" class="flex items-center gap-1.5 pl-2 pr-1.5 py-1 text-[11px] text-zinc-400 hover:text-white hover:bg-white/[.04]">
                <i class="ph ${escapeHtml(l.icon || 'ph-link')} text-[#52a8ff] text-[12px]"></i>${escapeHtml(l.label || l.url)}</a>
            <button onclick="removeLink(${i})" class="pl-0.5 pr-1.5 py-1 text-zinc-700 hover:text-[#f26d78]" data-tip-title="Usuń podgląd"><i class="ph ph-x text-[10px]"></i></button>
        </span>`).join('')
        + `<button onclick="addLink()" class="inline-flex items-center gap-1 border border-dashed border-[#2a2a2a] hover:border-[#0070f3]/50 rounded-md px-2 py-1 text-[11px] text-zinc-600 hover:text-zinc-300"><i class="ph ph-plus"></i> podgląd</button>`;
}

function renderPills() {
    const wrap = document.getElementById('stage-pills');
    const nums = stageNums();
    wrap.style.setProperty('--stages', nums.length);
    // Desktop (≥640px): pasek segmentów. Mobile (<640px): pager pojedynczego etapu.
    // Oba warianty renderujemy zawsze; widoczność steruje media query w panel.css
    // (sturdier niż matchMedia — działa na obrót ekranu bez nasłuchu resize).
    const segs = nums.map(n => {
        const pr = stageProgress(n);
        const label = defsForStage(n)[0]?.stage_label || ('Etap ' + n);
        const complete = pr.total>0 && pr.done===pr.total;
        const flag = stageHasMilestone(n) ? '<i class="ph ph-flag-checkered text-[#4cb782] text-[11px]" title="kamień milowy osiągnięty"></i>' : '';
        return `<button type="button" class="stage-seg ${n===activeStage?'active':''} ${complete?'completed':''}" onclick="switchStage(${n})">
            <div class="flex items-center gap-2 w-full">
                <span class="stage-num">${complete ? '<i class="ph ph-check"></i>' : n}</span>
                ${flag}
                <span class="ml-auto text-[10px] font-mono text-zinc-500">${pr.done}/${pr.total}</span>
            </div>
            <span class="seg-label">${escapeHtml(label)}</span>
            <div class="seg-bar"><div style="width:${pr.pct}%"></div></div>
        </button>`;
    }).join('');
    wrap.innerHTML = segs + renderStagePager(nums);
}
// Mobile: karta aktywnego etapu — strzałki ‹ › (przełącz etap) + „Etap N z M" + nazwa
// + licznik kroków + pasek postępu; pod spodem rząd klikalnych kropek (aktywna/ukończone).
function renderStagePager(nums) {
    if (!nums.length) return '';
    const idx = Math.max(0, nums.indexOf(activeStage));
    const n = nums[idx];
    const pr = stageProgress(n);
    const label = defsForStage(n)[0]?.stage_label || ('Etap ' + n);
    const prevN = idx > 0 ? nums[idx - 1] : null;
    const nextN = idx < nums.length - 1 ? nums[idx + 1] : null;
    const mile = stageHasMilestone(n) ? '<i class="ph ph-flag-checkered sp-mileflag" title="kamień milowy osiągnięty"></i>' : '';
    const dots = nums.map(k => {
        const kp = stageProgress(k);
        const done = kp.total > 0 && kp.done === kp.total;
        const cls = k === n ? 'sp-dot sp-dot-active' : (done ? 'sp-dot sp-dot-done' : 'sp-dot');
        return `<button type="button" class="${cls}" onclick="switchStage(${k})" aria-label="Etap ${k}${done ? ' — ukończony' : ''}" title="Etap ${k}: ${escapeHtml(defsForStage(k)[0]?.stage_label || ('Etap ' + k))}"><span></span></button>`;
    }).join('');
    return `<div class="stage-pager">
        <div class="sp-main">
            <button type="button" class="sp-arrow" ${prevN == null ? 'disabled' : `onclick="switchStage(${prevN})"`} aria-label="Poprzedni etap"><i class="ph ph-caret-left"></i></button>
            <div class="sp-center">
                <div class="sp-kicker">Etap ${n} z ${nums.length}${mile}</div>
                <div class="sp-name">${escapeHtml(label)}</div>
                <div class="sp-meta"><span class="sp-count">${pr.done}/${pr.total}</span> kroków<span class="sp-bar"><span style="width:${pr.pct}%"></span></span></div>
            </div>
            <button type="button" class="sp-arrow" ${nextN == null ? 'disabled' : `onclick="switchStage(${nextN})"`} aria-label="Następny etap"><i class="ph ph-caret-right"></i></button>
        </div>
        <div class="sp-dots">${dots}</div>
    </div>`;
}
function switchStage(n) { activeStage = n; renderPills(); renderStage(); }

// „Następny krok" = pierwsza AKCJONOWALNA instancja wg kolejności etap→sort
function nextStep() {
    let waiting = null;
    const probe = (d, p) => {
        const st = stepFor(d.key, p ? p.id : null);
        if (!st || st.status === 'done' || st.status === 'skipped') return null;
        if (st.status === 'in_progress' && (d.owner !== 'admin' || d.waits_external)) { if (!waiting) waiting = { d, p, st }; return null; }
        return { d, p, st };
    };
    for (const d of P.stepDefs) {
        if (d.sub_of) continue;
        if (d.scope === 'project') {
            const hit = probe(d, null);
            if (hit) return hit;
        } else {
            for (const p of P.products) {
                const hit = probe(d, p);
                if (hit) return hit;
            }
        }
    }
    return waiting;
}
function renderNextStep() {
    const el = document.getElementById('next-step');
    const nx = nextStep();
    if (!nx) { el.innerHTML = '<div class="bg-[#45a557]/[.06] px-4 py-3 text-[12.5px] text-[#62c073]"><i class="ph ph-flag-checkered"></i> Wszystkie kroki ukończone — projekt w trybie prowadzenia.</div>'; return; }
    if (!P.products.length && nx.d.stage === 1) {
        el.innerHTML = `<div class="flex items-center gap-3 bg-[#0070f3]/[.05] px-4 py-3 flex-wrap">
            <span class="text-[10px] font-mono uppercase tracking-wider text-[#52a8ff] flex-shrink-0">Następny krok</span>
            <span class="text-[12.5px] text-white min-w-0 truncate"><i class="ph ph-shopping-bag-open text-[#52a8ff]"></i> Dobierz portfel produktów <span class="text-zinc-600">(cel ${PORTFOLIO_TARGET}; losowanie z /trendy albo ręczny wybór — marka sklepu rusza PO wyborze)</span></span>
            <button onclick="openPicker()" class="ml-auto inline-flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors flex-shrink-0">＋ Produkty</button>
        </div>`; return;
    }
    const { d, p, st } = nx;
    el.innerHTML = `<div class="flex items-center gap-3 bg-[#0070f3]/[.05] px-4 py-3 flex-wrap">
        <span class="text-[10px] font-mono uppercase tracking-wider text-[#52a8ff] flex-shrink-0">Następny krok</span>
        <span class="text-[12.5px] text-white min-w-0 truncate"><i class="ph ${escapeHtml(d.icon)} text-[#52a8ff]"></i> ${escapeHtml(d.label)}${p ? ` — <span class="text-zinc-300">${escapeHtml(p.name)}</span>` : ''} <span class="text-zinc-600">(Etap ${d.stage}${st.status === 'in_progress' ? ' · w trakcie' : ''}${st.status === 'blocked' ? ' · ZABLOKOWANY' : ''})</span></span>
        <button onclick="activeStage=${d.stage};renderPills();renderStage();openStep('${d.key}', ${p ? `'${p.id}'` : 'null'})" class="ml-auto inline-flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors flex-shrink-0">Otwórz warsztat <i class="ph ph-arrow-right"></i></button>
    </div>`;
}

function clientLagBadge(d, st) {
    if (d.owner !== 'client' || st.status !== 'in_progress' || !st.updated_at) return '';
    const days = Math.floor((Date.now() - new Date(st.updated_at).getTime()) / 86400000);
    if (days < 1) return '';
    const cls = days > 5 ? 'text-[#f26d78]' : days > 2 ? 'text-[#f5b955]' : 'text-zinc-500';
    return `<span class="${cls}">u klienta od ${days} dni${days > 5 ? ' — followup!' : ''}</span>`;
}

function renderStage() {
    const defs = defsForStage(activeStage);
    const projDefs = defs.filter(d=>d.scope==='project');
    const prodDefs = defs.filter(d=>d.scope==='product');
    const admin = P.mode === 'admin';

    renderStageAxis(projDefs, admin ? 'steps-grid' : 'steps-axis');

    const showMatrix = prodDefs.length > 0 || activeStage === 1;
    if (admin) {
        const box = document.getElementById('portfolio-box');
        if (box) box.classList.toggle('hidden', !showMatrix);
        if (showMatrix) renderMatrix(prodDefs);
    } else {
        // portal: sekcja osi widoczna gdy etap ma kroki projektowe; matryca gdy ma kroki produktowe i są produkty
        const secProc = document.getElementById('sec-process');
        if (secProc) secProc.classList.toggle('hidden', projDefs.length === 0);
        const lblEl = document.getElementById('proc-stage-label');
        if (lblEl) lblEl.textContent = projDefs[0] ? (projDefs[0].stage_label || ('Etap ' + activeStage)) : '';
        const sec = document.getElementById('sec-portfolio');
        const hasProd = P.products.length > 0 && prodDefs.length > 0;
        if (sec) sec.classList.toggle('hidden', !hasProd);
        if (hasProd) renderMatrix(prodDefs);
    }
}

// ── OŚ PROCESU: pionowy timeline kroków projektowych etapu (admin + portal) ──
function renderStageAxis(projDefs, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const admin = P.mode === 'admin';
    if (!projDefs.length) { el.innerHTML = ''; return; }

    const rows = projDefs.map(d => ({ d, st: stepFor(d.key) || { status:'pending', data:{} } }));

    el.innerHTML = rows.map((r, i) => {
        const { d, st } = r;
        const media = stepMediaItems(null, d.key);
        const isMile = !!d.milestone_label;
        const mileDone = isMile && st.status === 'done';
        const isClient = d.owner === 'client';
        const clientPending = isClient && st.status !== 'done' && st.status !== 'skipped';

        // węzeł statusu
        let nodeIcon = '', nodeCls;
        if (mileDone)                 { nodeIcon = 'ph-flag-checkered'; nodeCls = 'pn-mile'; }
        else if (st.status === 'done'){ nodeIcon = 'ph-check';          nodeCls = 'pn-done'; }
        else if (clientPending)       { nodeIcon = 'ph-user';           nodeCls = 'pn-client'; }
        else if (st.status === 'in_progress') { nodeIcon = isMile ? 'ph-flag' : 'ph-circle-notch'; nodeCls = 'pn-progress'; }
        else if (st.status === 'blocked')     { nodeIcon = 'ph-x';       nodeCls = 'pn-blocked'; }
        else if (st.status === 'skipped')     { nodeIcon = 'ph-minus';   nodeCls = 'pn-skipped'; }
        else                          { nodeIcon = isMile ? 'ph-flag' : ''; nodeCls = 'pn-pending'; }

        // meta w wierszu
        const clientChip = isClient ? `<span class="proc-chip proc-chip-client"><i class="ph ph-user"></i>Klient</span>` : '';
        const dateStr = st.completed_at ? relTime(st.completed_at) : (admin ? clientLagBadge(d, st) : '');
        const dateEl = dateStr ? `<span class="proc-date">${dateStr}</span>` : '';
        const stBtn = admin
            ? `<button class="proc-statusbtn proc-st-${st.status}" onclick="event.stopPropagation();cycleStep('${d.key}', null)" data-tip-title="Klik = przełącz status" data-tip-desc="do zrobienia → w trakcie → ukończone; pełna kontrola w warsztacie kroku"><i class="ph ${STEP_ICON[st.status]}"></i>${STEP_LABELS[st.status]}</button>`
            : `<span class="proc-statusbtn proc-st-${st.status}" style="cursor:default"><i class="ph ${STEP_ICON[st.status]}"></i>${STEP_LABELS[st.status]}</span>`;

        // podlinijki: kamień (zielony) + notatka (tylko admin)
        const note = admin && st.data && st.data.note ? String(st.data.note) : '';
        const mileLine = isMile ? `<span class="proc-mile"><i class="ph ph-flag-checkered"></i>${escapeHtml(d.milestone_label)}</span>` : '';
        const noteLine = note ? `<span class="proc-note"><i class="ph ph-note"></i>${escapeHtml(note)}</span>` : '';
        const sub = (mileLine || noteLine) ? `<div class="proc-subline">${mileLine}${noteLine}</div>` : '';

        // badge „nowe" na krokach z mediami nieobejrzanymi
        const newDot = (media.length && !isPeekSeen(null, d.key)) ? '<span class="proc-newdot" title="nowe materiały"></span>' : '';
        // 'marka': bez paska kafli logo w boxie (decyzja Tomka 21.07) — pełny lockup żyje
        // na karcie tożsamości projektu (p-brand); warianty nadal w warsztacie kroku
        const film = (media.length && d.key !== 'marka') ? stepFilmstrip(media, null, d.key) : '';

        const tip = admin
            ? `data-tip-title="${i+1}. ${escapeHtml(d.label)}${isMile ? ' 🏁' : ''}" data-tip-sub="${OWNER_LABEL[d.owner] || ''}${isMile ? ' · kamień: ' + escapeHtml(d.milestone_label) : ''}" data-tip-desc="${escapeHtml((P.WS[d.key] && P.WS[d.key].desc) ? String(P.WS[d.key].desc).slice(0,140) : '')}"`
            : '';
        return `<div class="sbx${mileDone ? ' sbx-mile-done' : (isMile ? ' sbx-mile' : '')}" onclick="procOpen('${d.key}', null)">
            <div class="sbx-head">
                <span class="proc-node ${nodeCls}${mileDone ? ' pn-big' : ''}" ${tip}>${nodeIcon ? `<i class="ph ${nodeIcon}"></i>` : ''}</span>
                <div class="sbx-tt">
                    <div class="sbx-title-row"><span class="sbx-idx">${i+1}</span><span class="sbx-title">${escapeHtml(d.label)}</span>${newDot}</div>
                    ${sub}
                </div>
                <div class="sbx-meta">${clientChip}${dateEl}${stBtn}<i class="ph ph-caret-right proc-caret"></i></div>
            </div>
            ${film}
        </div>`;
    }).join('');
}

/* ── macierz portfela (współdzielona: admin edytowalna, klient read-only) ─ */
function renderMatrix(prodDefs) {
    _matrixDefs = prodDefs;
    const admin = P.mode === 'admin';
    const cntEl = document.getElementById('portfolio-count');
    if (cntEl) cntEl.textContent = P.products.length ? `(${P.products.length}/${PORTFOLIO_TARGET})` : '';
    const rrBtn = document.getElementById('reroll-btn');
    if (rrBtn) {
        const show = admin && P.products.length > 0;
        rrBtn.classList.toggle('hidden', !show);
        rrBtn.classList.toggle('inline-flex', show);
    }

    const head = ['<th class="px-3 py-2.5">Produkt</th>', '<th class="px-3 py-2.5">Status</th>'];
    if (admin) {
        head.push('<th class="px-3 py-2.5 text-right">Zakup</th>');
        head.push('<th class="px-3 py-2.5 text-right">Sprzedaż</th>');
        head.push('<th class="px-3 py-2.5 text-right">Zysk/szt.</th>');
    }
    head.push('<th class="px-3 py-2.5 min-w-[90px]">Postęp</th>');
    prodDefs.forEach((d, i) => {
        const desc = (P.WS[d.key] && P.WS[d.key].desc) ? String(P.WS[d.key].desc) : '';
        const short = desc.length > 140 ? desc.slice(0, 140).replace(/\s+\S*$/, '') + '…' : desc;
        const tip = admin
            ? `data-tip-title="${i+1}. ${escapeHtml(d.label)}${d.milestone_label ? ' 🏁' : ''}" data-tip-sub="${OWNER_LABEL[d.owner] || ''}${d.milestone_label ? ' · kamień: ' + escapeHtml(d.milestone_label) : ''}" data-tip-desc="${escapeHtml(short)}"`
            : `title="${i+1}. ${escapeHtml(d.label)}${short ? ' — ' + escapeHtml(short) : ''}"`;
        head.push(`<th class="px-2 py-1.5 text-center"><div class="mx-head" ${tip}>
            <i class="ph ${escapeHtml(d.icon)} text-xl text-zinc-300"></i>
            <span class="text-[9.5px] font-mono text-zinc-500">${i+1}</span>
        </div></th>`);
    });
    if (admin) head.push('<th class="px-3 py-2.5"></th>');
    document.getElementById('matrix-head').innerHTML = head.join('');
    const emptyEl = document.getElementById('matrix-empty');
    if (emptyEl) emptyEl.classList.toggle('hidden', P.products.length > 0);

    document.getElementById('matrix-body').innerHTML = P.products.map(p => {
        const sm = PRODUCT_STATUS_META[p.status] || PRODUCT_STATUS_META.kandydat;
        const profit = p.unit_profit;
        const profitCls = profit === null || p.price === null ? 'text-zinc-600' : profit > 0 ? 'text-[#4cb782]' : 'text-[#f5b955]';
        const pr = productProgress(p.id, prodDefs);
        const prAll = productProgress(p.id, null);
        const cells = prodDefs.map(d => {
            const st = stepFor(d.key, p.id) || { status:'pending' };
            const icon = st.status==='done' ? 'ph-check' : st.status==='in_progress' ? 'ph-circle-half' : st.status==='skipped' ? 'ph-minus' : st.status==='blocked' ? 'ph-x' : 'ph-circle';
            const peek = st.status === 'done' && stepMediaCount(p.id, d.key) > 0 && !isPeekSeen(p.id, d.key);
            const tip = admin
                ? `data-tip-title="${escapeHtml(d.label)}" data-tip-sub="${escapeHtml(p.name || '')} · ${STEP_LABELS[st.status]}" data-tip-desc="${peek ? 'Kliknij, aby zobaczyć' : 'klik otwiera warsztat kroku'}"`
                : `title="${escapeHtml(d.label)} · ${STEP_LABELS[st.status]}${peek ? ' — Kliknij, aby zobaczyć' : ''}"`;
            return `<td class="px-2 py-2"><div class="mx-cell mx-${st.status}${peek ? ' mx-peek' : ''}" ${tip}
                onclick="peekOpen('${d.key}', '${p.id}')"><i class="ph ${icon} text-[13px]"></i>${peek ? '<span class="mx-peek-lupa"><i class="ph ph-magnifying-glass-plus"></i></span>' : ''}</div></td>`;
        }).join('');
        // miniatura zdjęcia → lightbox produktu (oba tryby: szybka ocena bez wchodzenia w kartę)
        const cover = p.cover_url
            ? `<img src="${escapeHtml(p.cover_url)}" class="w-9 h-9 rounded-lg object-cover flex-shrink-0 cursor-pointer" onclick="event.stopPropagation();openProductLB('${p.id}')" onerror="this.style.display='none'" data-tip-title="${escapeHtml(p.name || 'Produkt')}" data-tip-sub="Klik otwiera podgląd" data-tip-img="${escapeHtml(p.cover_url)}">`
            : `<div class="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 cursor-pointer" onclick="event.stopPropagation();openProductLB('${p.id}')" title="Podgląd produktu"><i class="ph ph-package text-zinc-600"></i></div>`;
        // ikonki wiersza: koszyk (aukcja) + wideo (lightbox produktu) — subtelne, gdy dane istnieją
        const hasVid = Array.isArray(p.tiktoks) && p.tiktoks.length > 0;
        const rowIcons = (p.supplier_url || hasVid) ? `<span class="mx-rowics">${
            (p.supplier_url ? `<a href="${escapeHtml(p.supplier_url)}" target="_blank" rel="noopener" class="mx-rowic" onclick="event.stopPropagation()" title="Aukcja dostawcy"><i class="ph ph-shopping-cart"></i></a>` : '')
            + (hasVid ? `<button class="mx-rowic" onclick="event.stopPropagation();openProductLB('${p.id}')" title="Wideo TikTok"><i class="ph ph-play-circle"></i></button>` : '')
        }</span>` : '';
        const nameCell = admin
            ? `<div class="text-white text-[12.5px] font-medium truncate max-w-[220px] cursor-pointer hover:text-[#52a8ff]" onclick="openCard('${p.id}')">${p.gen_session_id ? '<i class="ph ph-sparkle text-[#52a8ff] text-[10px]" title="ma generacje z rozmowy /sklep"></i> ' : ''}${escapeHtml(p.name||'(bez nazwy)')}</div>`
            : `<div class="text-white text-[12.5px] font-medium truncate max-w-[220px]">${escapeHtml(p.name||'(bez nazwy)')}</div>`;
        const subLine = admin
            ? `<div class="flex items-center gap-1.5 text-[10px] text-zinc-600">${p.slug ? `<span class="font-mono">/${escapeHtml(p.slug)}</span>` : ''}${p.platform_page_url?`<a href="${escapeHtml(p.platform_page_url)}" target="_blank" class="text-[#3291ff] hover:text-[#52a8ff]" onclick="event.stopPropagation()">landing ↗</a>`:''}${rowIcons}</div>`
            : `<div class="flex items-center gap-1.5 text-[10px] text-zinc-600">${p.platform_page_url?`<a href="${escapeHtml(p.platform_page_url)}" target="_blank" class="text-[#3291ff] hover:text-[#52a8ff]" onclick="event.stopPropagation()">zobacz stronę ↗</a>`:''}${rowIcons}</div>`;
        return `<tr class="border-b border-[#1f1f1f] hover:bg-white/[.02]">
            <td class="px-3 py-2.5"><div class="flex items-center gap-2.5 min-w-[180px]">${cover}
                <div class="min-w-0">${nameCell}${subLine}</div></div></td>
            <td class="px-3 py-2.5"><span class="inline-block px-2 py-0.5 rounded-md text-[10.5px] ${sm.cls}">${sm.label}</span></td>
            ${admin ? `<td class="px-3 py-2.5 text-right font-mono text-xs text-zinc-400">${p.cost_purchase != null ? moneyPL(p.cost_purchase) : '—'}</td>` : ''}
            ${admin ? `<td class="px-3 py-2.5 text-right font-mono text-xs text-zinc-200">${p.price != null ? moneyPL(p.price) : '—'}</td>` : ''}
            ${admin ? `<td class="px-3 py-2.5 text-right font-mono text-xs ${profitCls}">${p.price !== null && profit !== null ? moneyPL(profit) : '—'}</td>` : ''}
            <td class="px-3 py-2.5">
                <div class="pp-bar" title="Etap: ${pr.done}/${pr.total} · Całość: ${prAll.done}/${prAll.total}"><div style="width:${pr.pct}%"></div></div>
                <div class="text-[9.5px] text-zinc-600 mt-1 font-mono">${pr.done}/${pr.total} · całość ${prAll.pct}%</div>
            </td>
            ${cells}
            ${admin ? `<td class="px-3 py-2.5 text-right whitespace-nowrap">
                <button class="p-1 ${p.pinned ? 'text-[#f5a623]' : 'text-zinc-600 hover:text-zinc-300'}" onclick="event.stopPropagation();togglePin('${p.id}')" data-tip-title="${p.pinned ? 'Zaznaczony — zostaje przy przelosowaniu' : 'Zaznacz produkt'}" data-tip-desc="„Przelosuj" wymienia wyłącznie produkty bez pinezki"><i class="${p.pinned ? 'ph-fill' : 'ph'} ph-push-pin"></i></button>
                <button class="text-zinc-600 hover:text-[#52a8ff] p-1" onclick="openCard('${p.id}')" title="Karta produktu"><i class="ph ph-identification-card"></i></button>
                <button class="text-zinc-600 hover:text-white p-1" onclick="openProductModal('${p.id}')" title="Edycja"><i class="ph ph-pencil-simple"></i></button>
                <button class="text-zinc-600 hover:text-[#e5484d] p-1" onclick="event.stopPropagation();deleteProduct('${p.id}')" title="Usuń produkt"><i class="ph ph-trash"></i></button>
            </td>` : ''}
        </tr>`;
    }).join('');

    // ── Mobile (<640px): matryca tabelaryczna jest nieczytelna → lista kart produktów.
    // Kontener #matrix-cards wstrzykujemy dynamicznie (sibling tabeli), więc działa w portalu,
    // panelu admina i harnessie bez edycji HTML. Widoczność (tabela vs karty) steruje panel.css.
    renderMatrixCards(prodDefs);
}

// karty produktów na mobile — cover + nazwa + status (+ admin: zysk) + pasek postępu etapu,
// pod spodem rząd DUŻYCH kółek kroków bieżącego etapu (peek-glow + lupka, klik → drawer/peekOpen)
function renderMatrixCards(prodDefs) {
    const tbody = document.getElementById('matrix-body');
    if (!tbody) return;
    const table = tbody.closest('table');
    const wrap = table ? table.parentElement : null;
    if (!wrap) return;
    wrap.classList.add('mx-tablewrap');           // marker do ukrycia na mobile (panel.css)
    let cards = document.getElementById('matrix-cards');
    if (!cards) {
        cards = document.createElement('div');
        cards.id = 'matrix-cards';
        cards.className = 'mx-cards';
        wrap.parentNode.insertBefore(cards, wrap.nextSibling);
    }
    const admin = P.mode === 'admin';
    if (!P.products.length) { cards.innerHTML = ''; return; }
    const stageLabel = defsForStage(activeStage)[0]?.stage_label || ('Etap ' + activeStage);

    cards.innerHTML = P.products.map(p => {
        const sm = PRODUCT_STATUS_META[p.status] || PRODUCT_STATUS_META.kandydat;
        const profit = p.unit_profit;
        const profitCls = profit === null || p.price === null ? 'text-zinc-600' : profit > 0 ? 'text-[#4cb782]' : 'text-[#f5b955]';
        const pr = productProgress(p.id, prodDefs);
        const prAll = productProgress(p.id, null);
        const cover = p.cover_url
            ? `<img src="${escapeHtml(p.cover_url)}" class="mxc-cover" onclick="openProductLB('${p.id}')" onerror="this.style.display='none'" alt="" title="Podgląd produktu">`
            : `<button class="mxc-cover mxc-cover-empty" onclick="openProductLB('${p.id}')" title="Podgląd produktu"><i class="ph ph-package"></i></button>`;
        const hasVid = Array.isArray(p.tiktoks) && p.tiktoks.length > 0;
        const rowIcons = (p.supplier_url || hasVid) ? `<span class="mx-rowics">${
            (p.supplier_url ? `<a href="${escapeHtml(p.supplier_url)}" target="_blank" rel="noopener" class="mx-rowic" onclick="event.stopPropagation()" title="Aukcja dostawcy"><i class="ph ph-shopping-cart"></i></a>` : '')
            + (hasVid ? `<button class="mx-rowic" onclick="event.stopPropagation();openProductLB('${p.id}')" title="Wideo TikTok"><i class="ph ph-play-circle"></i></button>` : '')
        }</span>` : '';
        const nameInner = `${p.gen_session_id ? '<i class="ph ph-sparkle text-[#52a8ff] text-[10px]" title="ma generacje z rozmowy /sklep"></i> ' : ''}${escapeHtml(p.name || '(bez nazwy)')}`;
        const nameCell = admin
            ? `<button class="mxc-name mxc-name-btn" onclick="openCard('${p.id}')">${nameInner}</button>`
            : `<span class="mxc-name">${nameInner}</span>`;
        const link = p.platform_page_url
            ? `<a href="${escapeHtml(p.platform_page_url)}" target="_blank" class="mxc-link" onclick="event.stopPropagation()">${admin ? 'landing' : 'zobacz stronę'} <i class="ph ph-arrow-square-out"></i></a>`
            : '';
        const adminActions = admin
            ? `<div class="mxc-actions">
                <button class="mxc-act${p.pinned ? '' : ' mxc-act-dim'}" style="${p.pinned ? 'color:#f5a623' : ''}" onclick="event.stopPropagation();togglePin('${p.id}')" title="${p.pinned ? 'Zaznaczony — zostaje przy przelosowaniu' : 'Zaznacz (Przelosuj go nie wymieni)'}"><i class="${p.pinned ? 'ph-fill' : 'ph'} ph-push-pin"></i></button>
                <button class="mxc-act" onclick="openCard('${p.id}')" title="Karta produktu"><i class="ph ph-identification-card"></i></button>
                <button class="mxc-act" onclick="openProductModal('${p.id}')" title="Edycja"><i class="ph ph-pencil-simple"></i></button>
                <button class="mxc-act mxc-act-del" onclick="event.stopPropagation();deleteProduct('${p.id}')" title="Usuń produkt"><i class="ph ph-trash"></i></button>
            </div>` : '';
        const circles = prodDefs.map(d => {
            const st = stepFor(d.key, p.id) || { status: 'pending' };
            const icon = st.status === 'done' ? 'ph-check' : st.status === 'in_progress' ? 'ph-circle-half' : st.status === 'skipped' ? 'ph-minus' : st.status === 'blocked' ? 'ph-x' : 'ph-circle';
            const peek = st.status === 'done' && stepMediaCount(p.id, d.key) > 0 && !isPeekSeen(p.id, d.key);
            return `<button class="mx-bigcell mx-${st.status}${peek ? ' mx-peek' : ''}" onclick="peekOpen('${d.key}', '${p.id}')"
                title="${escapeHtml(d.label)} · ${STEP_LABELS[st.status]}${peek ? ' — Kliknij, aby zobaczyć' : ''}"><i class="ph ${icon}"></i>${peek ? '<span class="mx-peek-lupa"><i class="ph ph-magnifying-glass-plus"></i></span>' : ''}</button>`;
        }).join('');
        return `<div class="mx-card">
            <div class="mx-card-top">
                ${cover}
                <div class="mxc-info">
                    <div class="mxc-namerow">${nameCell}${rowIcons}</div>
                    <div class="mxc-badges">
                        <span class="mxc-status ${sm.cls}">${sm.label}</span>
                        ${admin && p.price !== null && profit !== null ? `<span class="mxc-profit ${profitCls}">${p.cost_purchase != null ? moneyPL(p.cost_purchase).replace(' zł', '') + ' → ' : ''}${moneyPL(p.price)} · ${profit >= 0 ? '+' : ''}${moneyPL(profit).replace(' zł', '')}/szt.</span>` : ''}
                        ${link}
                    </div>
                    <div class="mxc-prog">
                        <span class="pp-bar"><span style="width:${pr.pct}%"></span></span>
                        <span class="mxc-prog-n">${pr.done}/${pr.total} · całość ${prAll.pct}%</span>
                    </div>
                </div>
                ${adminActions}
            </div>
            ${prodDefs.length ? `<div class="mx-card-steps">
                <div class="mxc-steps-label">Kroki etapu: <span>${escapeHtml(stageLabel)}</span></div>
                <div class="mxc-circles">${circles}</div>
            </div>` : ''}
        </div>`;
    }).join('');
}

/* ── galeria artefaktów kroku (współdzielona) ──────────────────────────── */
function artifactsGallery(list) {
    if (!list.length) return '';
    const KIND_ICON = { mockup:'ph-layout', makieta:'ph-layout', makieta_mobile:'ph-device-mobile', brand:'ph-palette', branding:'ph-palette', styl_master:'ph-paint-brush', proof:'ph-git-diff', dowod:'ph-git-diff', scena:'ph-image', gallery:'ph-images', ad_creative:'ph-megaphone', video:'ph-film-slate', doc:'ph-file-text', link:'ph-link', screenshot_final:'ph-monitor', gate_check:'ph-seal-check', landing_live:'ph-rocket-launch' };
    const vp = a => (a.meta && a.meta.viewport) || '';
    const isMobile  = a => a.kind === 'makieta_mobile' || vp(a) === 'mobile';
    const isDesktop = a => !isMobile(a) && (a.kind === 'makieta' || vp(a) === 'desktop');
    const mobile  = list.filter(isMobile);
    const desktop = list.filter(isDesktop);
    const rest    = list.filter(a => !isMobile(a) && !isDesktop(a));

    const tile = (a, gid, mobileTile) => {
        const webVisible = a.storage !== 'repo' && a.storage !== 'desktop';
        const isVideo = webVisible && (/\.(mp4|webm|mov)(\?|$)/i.test(a.url || '') || a.kind === 'video');
        if (isVideo && a.url && /^https?:/.test(a.url)) {
            const poster = (a.meta && a.meta.poster) ? a.meta.poster : '';
            return `<a class="art-tile${mobileTile ? ' art-mobile' : ''}" href="${escapeHtml(a.url)}" target="_blank" rel="noopener"
                data-tip-title="${escapeHtml(a.label || a.kind)}" data-tip-sub="${escapeHtml(a.kind)}${a.meta && a.meta.section ? ' · ' + escapeHtml(a.meta.section) : ''}" data-tip-desc="klik = pełne wideo w nowej karcie" title="${escapeHtml(a.label || a.kind)}">
                <video src="${escapeHtml(a.url)}"${poster ? ` poster="${escapeHtml(poster)}"` : ''} muted loop autoplay playsinline preload="metadata"
                    style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.parentElement.style.display='none'"></video>
                <span class="art-label">${escapeHtml(a.label || a.kind)}</span></a>`;
        }
        const isImg = webVisible && (/\.(png|jpe?g|webp|avif|gif)(\?|$)/i.test(a.url || '') || ['mockup','makieta','makieta_mobile','scena','dowod','proof','ad_creative','screenshot_final','styl_master','gallery','branding','brand'].includes(a.kind));
        if (isImg && a.url && /^https?:/.test(a.url)) {
            const cap = (a.meta && a.meta.section) ? a.meta.section : (a.label || a.kind);
            return `<a class="art-tile${mobileTile ? ' art-mobile' : ''}" href="javascript:void(0)"
                data-lb-group="${gid}" data-lb-url="${escapeHtml(a.url)}" data-lb-cap="${escapeHtml(cap)}" onclick="openLightboxG(this)"
                data-tip-title="${escapeHtml(a.label || a.kind)}" data-tip-sub="${escapeHtml(a.kind)}${a.meta && a.meta.section ? ' · ' + escapeHtml(a.meta.section) : ''}" data-tip-desc="klik = pełny podgląd + nawigacja" title="${escapeHtml(a.label || a.kind)}">
                <img src="${escapeHtml(thumbUrl(a.url, 360))}" loading="lazy" onerror="this.parentElement.style.display='none'">
                <span class="art-label">${escapeHtml(a.label || a.kind)}</span></a>`;
        }
        const icon = KIND_ICON[a.kind] || 'ph-file';
        const clickable = a.url && /^https?:/.test(a.url);
        const openAttr = clickable ? `href="${escapeHtml(a.url)}" target="_blank"` : '';
        return `<${clickable?'a':'div'} ${openAttr} class="art-tile flex items-center gap-2 p-2.5" style="aspect-ratio:auto">
            <i class="ph ${icon} text-[#52a8ff]"></i><span class="text-[11px] text-zinc-300 truncate">${escapeHtml(a.label || a.kind)}</span></${clickable?'a':'div'}>`;
    };
    const group = (items, title, gridCls, mobileTile) => {
        if (!items.length) return '';
        const gid = 'lbg-' + (++lbGroupSeq);
        return `<div class="mb-3"><div class="art-group-head"><span class="agh-title">${escapeHtml(title)}</span><span class="agh-count">${items.length}</span></div>
            <div class="grid ${gridCls} gap-2">${items.map(a => tile(a, gid, mobileTile)).join('')}</div></div>`;
    };

    if (!desktop.length && !mobile.length) {
        const gid = 'lbg-' + (++lbGroupSeq);
        return `<div><div class="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Artefakty (${rest.length})</div>
            <div class="grid grid-cols-3 gap-2">${rest.map(a => tile(a, gid, false)).join('')}</div></div>`;
    }
    return `<div>${group(desktop, 'Makiety desktop', 'grid-cols-3', false)}${group(mobile, 'Makiety mobile', 'grid-cols-4 sm:grid-cols-5', true)}${group(rest, 'Pozostałe', 'grid-cols-3', false)}</div>`;
}

/* ── drawer (warsztat / podgląd kroku) ─────────────────────────────────── */
function drawerStep() { return drawerCtx ? stepFor(drawerCtx.key, drawerCtx.productId) : null; }
function drawerProduct() { return drawerCtx && drawerCtx.productId ? P.products.find(p => p.id === drawerCtx.productId) : null; }

function mergedChecklist(ws, st) {
    const stored = (st.data && Array.isArray(st.data.checklist)) ? st.data.checklist.slice() : [];
    const tpl = (ws && ws.check) || [];
    tpl.forEach(t => { if (!stored.some(x => x.t === t)) stored.push({ t, done: false }); });
    stored.sort((a, b) => { const ia = tpl.indexOf(a.t), ib = tpl.indexOf(b.t); return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib); });
    return stored;
}

function openStep(key, productId) {
    drawerCtx = { key, productId: productId || null };
    renderDrawer();
    document.getElementById('step-drawer-wrap').classList.remove('hidden');
    if (P.mode === 'admin') syncDeepLink();
    if (P.hooks && P.hooks.onOpenStep) { try { P.hooks.onOpenStep(key, productId || null); } catch (_) {} }
}
function closeStep() { document.getElementById('step-drawer-wrap').classList.add('hidden'); drawerCtx = null; if (P.mode === 'admin') syncDeepLink(); }
function sdSwitchProduct(pid) { if (!drawerCtx) return; drawerCtx.productId = pid; renderDrawer(); if (P.mode === 'admin') syncDeepLink(); }

// deep-link do warsztatu kroku (?id&p&s) — tylko admin (portal trzyma token w #hashu)
function syncDeepLink() {
    const q = new URLSearchParams(location.search);
    if (drawerCtx && drawerCtx.key) {
        q.set('s', drawerCtx.key);
        if (drawerCtx.productId) q.set('p', drawerCtx.productId); else q.delete('p');
    } else { q.delete('s'); q.delete('p'); }
    history.replaceState(null, '', location.pathname + '?' + q.toString());
}
function applyDeepLink() {
    const q = new URLSearchParams(location.search);
    const sk = q.get('s'), pid = q.get('p');
    if (!sk) return;
    const def = defFor(sk);
    if (def && typeof def.stage === 'number') { activeStage = def.stage; renderPills(); renderStage(); }
    openStep(sk, pid);
    setTimeout(() => {
        const g = document.querySelector('#step-drawer-wrap .art-group-head, #step-drawer-wrap .art-tile');
        if (g) g.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
}

function renderDrawer() {
    const st = drawerStep(); const d = defFor(drawerCtx.key);
    if (!st || !d) { closeStep(); return; }
    const p = drawerProduct();
    const ws = (P.WS && P.WS[d.key]) || {};
    document.getElementById('sd-title').innerHTML = `<i class="ph ${escapeHtml(d.icon)} text-[#3291ff]"></i> ${escapeHtml(d.label)}`;
    const sub = document.getElementById('sd-sub');
    if (sub) sub.innerHTML = `<span class="owner-tag owner-${d.owner}">${OWNER_LABEL[d.owner]}</span> <span class="ml-1 text-zinc-600">Etap ${d.stage} · ${escapeHtml(d.stage_label || '')}</span>`
        + (d.milestone_label ? ` <span class="mile-badge ml-1"><i class="ph ph-flag-checkered"></i> ${escapeHtml(d.milestone_label)}</span>` : '');

    const prodEl = document.getElementById('sd-product');
    if (prodEl) {
        prodEl.classList.toggle('hidden', !p);
        prodEl.classList.toggle('flex', !!p);
        if (p && P.mode === 'admin') {
            const cov = p.cover_url ? `<img src="${escapeHtml(p.cover_url)}" class="w-7 h-7 rounded object-cover">` : '<i class="ph ph-package text-zinc-500"></i>';
            prodEl.innerHTML = `${cov}
                <select onchange="sdSwitchProduct(this.value)" class="bg-[#0a0a0a] border border-[#2e2e2e] rounded-md px-2 py-1 text-[11.5px] text-white focus:outline-none max-w-[220px]">
                    ${P.products.map(x => `<option value="${x.id}" ${x.id===p.id?'selected':''}>${escapeHtml(x.name)}</option>`).join('')}
                </select>
                <button onclick="openCard('${p.id}')" class="text-[10.5px] text-[#52a8ff] hover:text-[#78b6ff]">karta produktu</button>`;
        } else if (p) {
            const cov = p.cover_url ? `<img src="${escapeHtml(p.cover_url)}" class="w-7 h-7 rounded object-cover">` : '<i class="ph ph-package text-zinc-500"></i>';
            prodEl.innerHTML = `${cov}<span class="text-[12.5px] text-white font-medium">${escapeHtml(p.name || '')}</span>`;
        }
    }

    if (P.mode === 'client') { renderDrawerClient(ws, st, d, p); return; }
    // admin: całe ciało + stopkę buduje bootstrap panelu przez hook (bloki edycji,
    // pola i akcje adminowe zostają w projekt.html)
    if (P.hooks && P.hooks.renderDrawerBody) P.hooks.renderDrawerBody(st, d, p);
}

// klient: wersja READ-ONLY — opis kroku, galeria artefaktów, status. Zero pól/akcji/żargonu.
function renderDrawerClient(ws, st, d, p) {
    let h = '';
    if (ws.desc) h += `<p class="text-zinc-300 text-[13px] leading-relaxed">${escapeHtml(ws.desc)}</p>`;
    // checklista kroku (dostarczana przez serwer już po filtrze treści) — klient widzi,
    // co konkretnie jest zrobione, a co jeszcze przed nami
    const cl = Array.isArray(st.checklist) ? st.checklist : [];
    if (cl.length) {
        const doneN = cl.filter(c => c.done).length;
        h += `<div class="mt-4 border border-[#1f1f1f] rounded-lg bg-[#0d0d0d] p-4">
            <div class="flex items-center gap-2.5 mb-2.5">
                <span class="text-[10.5px] font-mono uppercase tracking-[.07em] text-zinc-400">Co robimy w tym kroku</span>
                <span class="text-[10.5px] font-mono text-[#52a8ff]">${doneN}/${cl.length}</span>
                <div class="pp-bar flex-1 max-w-[120px]"><div style="width:${cl.length ? Math.round(doneN / cl.length * 100) : 0}%"></div></div>
            </div>
            <ul class="space-y-1.5">${cl.map(c => `<li class="flex items-start gap-2 text-[12.5px] leading-snug ${c.done ? 'text-zinc-300' : 'text-zinc-500'}">
                <i class="ph ${c.done ? 'ph-check-circle-fill text-[#4cb782]' : 'ph-circle text-[#3f3f46]'} text-[15px] mt-px flex-shrink-0"></i>
                <span>${escapeHtml(c.t)}</span></li>`).join('')}</ul>
        </div>`;
    }
    const arts = artifactsFor(drawerCtx.productId, d.key);
    const gal = artifactsGallery(arts);
    if (gal) h += gal;
    else h += `<div class="text-zinc-500 text-[12.5px] py-2">Materiały pojawią się tutaj, gdy ten etap będzie gotowy.</div>`;
    const doneCls = st.status === 'done' ? 'st-done' : st.status === 'in_progress' ? 'st-in_progress' : 'st-pending';
    const doneLbl = st.status === 'done' ? 'Zrobione' : st.status === 'in_progress' ? 'W trakcie' : 'Zaplanowane';
    h += `<div class="pt-1"><span class="st-btn ${doneCls}" style="cursor:default"><i class="ph ${st.status==='done'?'ph-check-circle':st.status==='in_progress'?'ph-circle-half':'ph-circle'}"></i> ${doneLbl}${st.completed_at ? ' · ' + relTime(st.completed_at) : ''}</span></div>`;
    document.getElementById('sd-body').innerHTML = h;
}

function renderDrawerFooter(st) {
    const skip = document.getElementById('sd-skip');
    if (skip) skip.textContent = st.status === 'skipped' ? 'Przywróć krok' : 'Pomiń krok';
    const btns = document.getElementById('sd-statusbtns');
    if (btns) btns.innerHTML = ['pending', 'in_progress', 'done'].map(s =>
        `<button onclick="sdSetStatus('${s}')" class="st-btn ${st.status === s ? 'st-' + s : 'st-pending opacity-50 hover:opacity-100'}">${STEP_LABELS[s]}</button>`).join('');
}
