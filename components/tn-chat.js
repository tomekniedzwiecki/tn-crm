// ════════════════════════════════════════════════════════════════════════════
// TN Chat — WSPÓLNY komponent czatu portali klienta (window.TNChat).
// Unia cech dwóch dojrzałych czatów tn-crm:
//   • tk-* (tn-app/portal.html — testy klienta): paste, drag&drop, getDisplayMedia
//     „zrób zrzut", fullscreen, timestampy, wskaźnik pisania, upload_init/_done, soft-errory.
//   • gd-* (tn-sklepy/portal.html — przewodnik ads): drawer, overlay, Escape, X, lock w preview.
// Vanilla JS (ES2020), zero zależności, zero Tailwinda. Styl w tn-chat.css (.tnc-*).
//
// Ładowanie:
//   <link  href="/components/tn-chat.css?v=RRRRMMDDNN">
//   <script src="/components/tn-chat.js?v=RRRRMMDDNN"></script>
//   const chat = TNChat.mount(rootEl, { endpoint, ... });
//   chat.open(); chat.close(); chat.refresh(); chat.isEnabled(); chat.destroy();
//   chat.addLocalBubble('ai', text);  // dymek LOKALNY (bez zapisu/sieci) — np. powitanie per zadanie
// ════════════════════════════════════════════════════════════════════════════
(function () {
    'use strict';

    /**
     * @typedef {Object} TNChatFeatures
     * @property {boolean} [paste=true]      Wklejanie zrzutu ze schowka (Ctrl+V) w polu wiadomości.
     * @property {boolean} [dnd=true]        Przeciąganie plików na kompozytor (drag&drop).
     * @property {boolean} [capture=false]   Przycisk „zrób zrzut ekranu" (navigator.getDisplayMedia).
     * @property {boolean} [fullscreen=false] Przycisk trybu pełnoekranowego (tylko layout 'embedded').
     * @property {boolean} [timestamps=false] Czas w dymkach („5 min temu"/HH:MM, Europe/Warsaw).
     */

    /**
     * @typedef {Object} TNChatConfig
     * @property {string}   endpoint                    URL edge (wymagane). POST z akcjami history/message/upload_init/upload_done.
     * @property {'drawer'|'embedded'} [layout='embedded'] 'drawer' = overlay+Esc+X (prawy panel); 'embedded' = sekcja inline.
     * @property {string}   [title='Asystent']          Tytuł w nagłówku.
     * @property {string}   [subtitle='']               Podtytuł w nagłówku.
     * @property {string}   [intro='']                  Powitalny dymek AI, gdy historia pusta.
     * @property {string}   [height]                    (embedded) Wysokość okna rozmowy — CSS string (np. '540px'/'60svh'); aplikowana jako --tnc-chat-h.
     * @property {string}   [placeholder='Napisz wiadomość…'] Placeholder pola wiadomości.
     * @property {string|null} [icon]                   HTML ikony nagłówka (statyczny). null = brak ikony; pominięte = domyślna.
     * @property {() => Object} [auth]                  Pola auth doklejane do KAŻDEGO body (np. {token, password} albo {token, preview:true}).
     * @property {() => Object} [authHeaders]           Nagłówki HTTP (np. {Authorization:'Bearer <jwt>'} w podglądzie admina).
     * @property {boolean}  [readonly=false]            Podgląd admina: kompozytor → komunikat lock; ZERO wysyłek/uploadów/track.
     * @property {string[]} [accept=['png','jpg','jpeg','webp']] Dozwolone rozszerzenia załączników.
     * @property {number}   [maxMB=15]                  Limit rozmiaru pojedynczego załącznika.
     * @property {number}   [maxPerMsg=6]               Limit załączników składanych do jednej wiadomości.
     * @property {TNChatFeatures} [features]            Włączniki cech (patrz wyżej).
     * @property {'attachments'|'images'|string} [imageField='attachments'] Nazwa pola ze ścieżkami załączników w body message.
     * @property {((url:string)=>void)|null} [lightbox=null] Adapter podglądu obrazka; null = wbudowany minimalny lightbox.
     * @property {() => Object} [context]               Dodatkowe pola body doklejane przy akcji 'message' (np. {task_key}).
     * @property {(data:Object)=>void} [onResponse]     Hook po odpowiedzi na message (np. host odświeża zgłoszenia).
     * @property {(data:Object)=>void} [onHistory]      Hook po pobraniu historii (pełny obiekt odpowiedzi; rozszerzenie kontraktu).
     * @property {()=>void} [onOpen]                    Hook po otwarciu.
     * @property {()=>void} [onClose]                   Hook po zamknięciu.
     * @property {(action:string, desc:string)=>void} [track] Hook trackingu — wołany TYLKO gdy !readonly. Komponent emituje 'open'.
     * @property {boolean}  [closeOnOverlay=true]       Drawer: klik w tło zamyka.
     * @property {string}   [lockMessage]               Treść komunikatu readonly.
     */

    var VERSION = '1.0.0';

    // ── Ikony (inline SVG — brak zależności od Phosphor/font-icon) ──
    var IC = {
        chat:    svg('<path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8 8.38 8.38 0 0 1 8.5-8.5 8.38 8.38 0 0 1 8.5 8.5z"/>'),
        close:   svg('<path d="M6 6l12 12M18 6L6 18"/>'),
        expand:  svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
        collapse:svg('<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>'),
        image:   svg('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>'),
        monitor: svg('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
        send:    svg('<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>'),
        eye:     svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>')
    };
    function svg(inner) {
        return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" ' +
            'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
    }

    // Rozszerzenie → realny MIME (bucket przyjmuje wyłącznie image/*; octet-stream bywa odrzucany).
    var MIME_ALL = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };

    function escRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

    // Czas dymka — relatywny „przed chwilą"/„N min temu", potem HH:MM / wczoraj / DD.MM (Europe/Warsaw).
    function fmtTime(iso) {
        if (!iso) return '';
        var d = new Date(iso); if (isNaN(d.getTime())) return '';
        var now = new Date(), diff = (now.getTime() - d.getTime()) / 1000;
        if (diff >= 0 && diff < 45) return 'przed chwilą';
        if (diff >= 45 && diff < 3600) { var m = Math.max(1, Math.round(diff / 60)); return m + ' min temu'; }
        var TZ = 'Europe/Warsaw';
        var time = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: TZ });
        var dayKey = function (x) { return x.toLocaleDateString('en-CA', { timeZone: TZ }); };
        var yest = new Date(now.getTime() - 86400000), k = dayKey(d);
        if (k === dayKey(now)) return time;
        if (k === dayKey(yest)) return 'wczoraj ' + time;
        return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', timeZone: TZ }) + ', ' + time;
    }

    function el(tag, cls, txt) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (txt != null) e.textContent = txt;
        return e;
    }
    function iconBtn(cls, html, label) {
        var b = el('button', cls); b.type = 'button';
        b.setAttribute('aria-label', label); b.title = label;
        b.innerHTML = html;
        return b;
    }

    // ── Wbudowany lightbox (singleton na dokument) ──
    var _lb = null;
    function builtinLightbox(url) {
        if (!_lb) {
            _lb = el('div', 'tnc-lb');
            var close = iconBtn('tnc-lb-close', IC.close, 'Zamknij');
            var img = el('img'); img.alt = 'Podgląd załącznika';
            _lb.appendChild(close); _lb.appendChild(img);
            _lb.addEventListener('click', function () { _lb.remove(); });
            document.body.appendChild(_lb);
        }
        _lb.querySelector('img').src = url;
        if (!_lb.parentNode) document.body.appendChild(_lb);
    }

    function normalize(cfg) {
        cfg = cfg || {};
        if (!cfg.endpoint) throw new Error('TNChat.mount: brak cfg.endpoint');
        var f = cfg.features || {};
        return {
            endpoint: cfg.endpoint,
            layout: cfg.layout === 'drawer' ? 'drawer' : 'embedded',
            title: cfg.title != null ? cfg.title : 'Asystent',
            subtitle: cfg.subtitle || '',
            intro: cfg.intro || '',
            height: (typeof cfg.height === 'string' && cfg.height) ? cfg.height : '',
            placeholder: cfg.placeholder != null ? cfg.placeholder : 'Napisz wiadomość…',
            icon: cfg.icon === undefined ? IC.chat : cfg.icon,   // null = brak; pominięte = domyślna
            auth: typeof cfg.auth === 'function' ? cfg.auth : function () { return {}; },
            authHeaders: typeof cfg.authHeaders === 'function' ? cfg.authHeaders : function () { return {}; },
            readonly: !!cfg.readonly,
            accept: (cfg.accept && cfg.accept.length ? cfg.accept : ['png', 'jpg', 'jpeg', 'webp']).map(function (x) { return String(x).toLowerCase(); }),
            maxMB: cfg.maxMB > 0 ? cfg.maxMB : 15,
            maxPerMsg: cfg.maxPerMsg > 0 ? cfg.maxPerMsg : 6,
            features: {
                paste: f.paste !== false,
                dnd: f.dnd !== false,
                capture: !!f.capture,
                fullscreen: !!f.fullscreen,
                timestamps: !!f.timestamps
            },
            imageField: cfg.imageField || 'attachments',
            lightbox: typeof cfg.lightbox === 'function' ? cfg.lightbox : null,
            context: typeof cfg.context === 'function' ? cfg.context : function () { return {}; },
            onResponse: typeof cfg.onResponse === 'function' ? cfg.onResponse : null,
            onHistory: typeof cfg.onHistory === 'function' ? cfg.onHistory : null,
            onOpen: typeof cfg.onOpen === 'function' ? cfg.onOpen : null,
            onClose: typeof cfg.onClose === 'function' ? cfg.onClose : null,
            track: typeof cfg.track === 'function' ? cfg.track : null,
            closeOnOverlay: cfg.closeOnOverlay !== false,
            lockMessage: cfg.lockMessage || 'Podgląd administratora — czat tylko do odczytu.',
            softError: cfg.softError || 'Coś się przycięło — spróbuj jeszcze raz za chwilę.',
            rateError: cfg.rateError || 'Za dużo wiadomości w krótkim czasie — daj mi chwilę i spróbuj ponownie.'
        };
    }

    /**
     * Montuje komponent czatu w elemencie.
     * @param {HTMLElement} rootEl
     * @param {TNChatConfig} config
     * @returns {{open:Function, close:Function, refresh:Function, isEnabled:Function, destroy:Function, el:HTMLElement}}
     */
    function mount(rootEl, config) {
        if (!rootEl) throw new Error('TNChat.mount: brak elementu montowania');
        var cfg = normalize(config);

        // Zbiór dozwolonych MIME (do atrybutu accept + walidacji) na bazie cfg.accept.
        var allowedMimes = [];
        cfg.accept.forEach(function (ext) { var m = MIME_ALL[ext]; if (m && allowedMimes.indexOf(m) < 0) allowedMimes.push(m); });
        var acceptAttr = allowedMimes.join(',');
        var extRe = new RegExp('\\.(' + cfg.accept.map(escRe).join('|') + ')$', 'i');

        var inst = { enabled: true, loaded: false, busy: false, pending: [], lastFocus: null, destroyed: false };
        var refs = build();
        bind();
        loadHistory();  // pobierz historię już na mount (drawer renderuje do ukrytego panelu)

        // ── Budowa DOM ──
        function build() {
            var wrap = el('div', 'tnc-wrap tnc-' + cfg.layout + (cfg.readonly ? ' tnc-readonly' : ''));
            if (cfg.layout === 'drawer') wrap.classList.add('tnc-hidden');
            if (cfg.layout === 'embedded' && cfg.height) wrap.style.setProperty('--tnc-chat-h', cfg.height);

            var overlay = null;
            if (cfg.layout === 'drawer') { overlay = el('div', 'tnc-overlay'); wrap.appendChild(overlay); }

            var panel = el('div', 'tnc-panel');
            if (cfg.layout === 'drawer') {
                panel.setAttribute('role', 'dialog');
                panel.setAttribute('aria-modal', 'true');
                panel.setAttribute('aria-label', cfg.title || 'Czat');
            }

            // nagłówek
            var head = el('div', 'tnc-head');
            if (cfg.icon !== null) { var hic = el('span', 'tnc-head-ic'); hic.innerHTML = cfg.icon; head.appendChild(hic); }
            var htxt = el('div', 'tnc-head-txt');
            htxt.appendChild(el('div', 'tnc-title', cfg.title));
            if (cfg.subtitle) htxt.appendChild(el('div', 'tnc-sub', cfg.subtitle));
            head.appendChild(htxt);
            var actions = el('div', 'tnc-head-actions');
            var fsBtn = null, closeBtn = null;
            if (cfg.layout === 'embedded' && cfg.features.fullscreen) {
                fsBtn = iconBtn('tnc-fs-btn', IC.expand, 'Powiększ na cały ekran'); actions.appendChild(fsBtn);
            }
            if (cfg.layout === 'drawer') { closeBtn = iconBtn('tnc-close', IC.close, 'Zamknij'); actions.appendChild(closeBtn); }
            head.appendChild(actions);
            panel.appendChild(head);

            // rozmowa
            var chat = el('div', 'tnc-chat');
            chat.setAttribute('role', 'log'); chat.setAttribute('aria-live', 'polite'); chat.setAttribute('aria-atomic', 'false');
            panel.appendChild(chat);

            // miniatury składanych załączników
            var shots = el('div', 'tnc-shots');
            panel.appendChild(shots);

            // kompozytor lub blokada readonly
            var compose = null, input = null, sendBtn = null, attachBtn = null, capBtn = null, fileInput = null;
            if (cfg.readonly) {
                var lock = el('div', 'tnc-lock');
                var lic = el('span'); lic.innerHTML = IC.eye; lock.appendChild(lic);
                lock.appendChild(el('span', null, cfg.lockMessage));
                panel.appendChild(lock);
            } else {
                compose = el('div', 'tnc-compose');
                attachBtn = iconBtn('tnc-ic tnc-att', IC.image, 'Dodaj zrzut ekranu z pliku'); compose.appendChild(attachBtn);
                if (cfg.features.capture) { capBtn = iconBtn('tnc-ic tnc-cap', IC.monitor, 'Zrób zrzut ekranu teraz'); compose.appendChild(capBtn); }
                input = el('textarea', 'tnc-input'); input.rows = 1;
                input.placeholder = cfg.placeholder; input.setAttribute('aria-label', cfg.placeholder || 'Napisz wiadomość');
                compose.appendChild(input);
                sendBtn = iconBtn('tnc-ic tnc-snd', IC.send, 'Wyślij wiadomość'); compose.appendChild(sendBtn);
                panel.appendChild(compose);

                var hint = buildHint();
                if (hint) panel.appendChild(el('div', 'tnc-hint', hint));

                fileInput = el('input'); fileInput.type = 'file'; fileInput.className = 'tnc-hidden';
                fileInput.accept = acceptAttr; fileInput.multiple = true;
                panel.appendChild(fileInput);
            }

            wrap.appendChild(panel);
            rootEl.appendChild(wrap);
            return { wrap: wrap, overlay: overlay, panel: panel, chat: chat, shots: shots,
                compose: compose, input: input, sendBtn: sendBtn, attachBtn: attachBtn,
                capBtn: capBtn, fileInput: fileInput, fsBtn: fsBtn, closeBtn: closeBtn };
        }

        function buildHint() {
            var ways = ['dodaj z pliku'];
            if (cfg.features.capture) ways.push('zrób go teraz ikoną monitora');
            if (cfg.features.paste) ways.push('wklej ze schowka (Ctrl+V)');
            if (cfg.features.dnd) ways.push('przeciągnij tutaj');
            return 'Zrzut ekranu: ' + ways.join(', ') + '.';
        }

        // ── Sieć ──
        function headers() {
            return Object.assign({ 'Content-Type': 'application/json' }, cfg.authHeaders());
        }
        function call(extra) {
            var body = Object.assign({}, cfg.auth(), extra);
            return fetch(cfg.endpoint, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
        }

        // ── Render rozmowy ──
        function bubble(role, text, imgs, ts) {
            var b = el('div', 'tnc-b ' + (role === 'user' ? 'me' : 'ai'));
            b.textContent = text || '';
            (imgs || []).forEach(function (u) {
                if (!u) return;
                var im = el('img'); im.src = u; im.loading = 'lazy'; im.alt = 'Załącznik';
                im.addEventListener('click', function () { openLightbox(u); });
                b.appendChild(im);
            });
            if (ts && cfg.features.timestamps) b.appendChild(el('div', 'tnc-ts', fmtTime(ts)));
            return b;
        }
        function renderMessages(messages) {
            var box = refs.chat; box.innerHTML = '';
            if ((!messages || !messages.length) && cfg.intro) box.appendChild(bubble('assistant', cfg.intro, [], null));
            (messages || []).forEach(function (m) {
                box.appendChild(bubble(m.role, m.content, (m.attachments || []).map(function (a) { return a.url; }), m.created_at));
            });
            scrollBottom();
        }
        function append(role, text, imgs) {
            refs.chat.appendChild(bubble(role, text, imgs, new Date().toISOString()));
            scrollBottom();
        }
        function scrollBottom() { refs.chat.scrollTop = refs.chat.scrollHeight; }
        function typing() {
            var t = el('div', 'tnc-typing'); t.setAttribute('data-tnc-typing', '1');
            t.innerHTML = '<span></span><span></span><span></span>';
            refs.chat.appendChild(t); scrollBottom();
        }
        function hideTyping() { var t = refs.chat.querySelector('[data-tnc-typing]'); if (t) t.remove(); }
        function openLightbox(url) { if (cfg.lightbox) cfg.lightbox(url); else builtinLightbox(url); }

        // ── Historia ──
        function loadHistory() {
            inst.loaded = false;
            return call({ action: 'history' }).then(function (res) {
                return res.json().catch(function () { return {}; }).then(function (d) {
                    if (!res.ok) { inst.enabled = false; renderMessages([]); inst.loaded = true; return; }
                    // Kontrakt planu = pole `enabled`; tolerujemy też `active` (obecne wfa-test-chat) — false w którymkolwiek = wyłączony.
                    inst.enabled = (d.enabled !== false && d.active !== false);
                    renderMessages(d.messages || []);
                    inst.loaded = true;
                    if (cfg.onHistory) cfg.onHistory(d);
                });
            }).catch(function () { inst.enabled = false; renderMessages([]); inst.loaded = true; });
        }

        // ── Wysyłka ──
        function send() {
            if (cfg.readonly || inst.busy || !refs.input) return;
            var text = refs.input.value.trim();
            if (inst.pending.some(function (p) { return p.uploading; })) return;   // poczekaj aż zrzut się wgra
            var ready = inst.pending.filter(function (p) { return p.path; });
            if (!text && !ready.length) return;
            inst.busy = true; refs.sendBtn.disabled = true;
            append('user', text, ready.map(function (p) { return p.url; }));
            refs.input.value = ''; autosize();
            var paths = ready.map(function (p) { return p.path; });
            inst.pending = []; renderPending();
            typing();
            var body = Object.assign({ action: 'message', message: text }, cfg.context());
            body[cfg.imageField] = paths;
            call(body).then(function (res) {
                return res.json().catch(function () { return {}; }).then(function (d) {
                    hideTyping();
                    if (res.status === 429) { append('assistant', cfg.rateError, []); return; }
                    if (!res.ok && !d.reply) { append('assistant', cfg.softError, []); return; }
                    append('assistant', d.reply || '…', []);
                    if (cfg.onResponse) cfg.onResponse(d);
                });
            }).catch(function () { hideTyping(); append('assistant', cfg.softError, []); })
              .then(function () { inst.busy = false; if (refs.sendBtn) refs.sendBtn.disabled = false; if (refs.input) refs.input.focus(); });
        }

        // ── Załączniki ──
        function resolveCtype(file) {
            var ext = (file.name.split('.').pop() || '').toLowerCase();
            var ftype = (file.type || '').toLowerCase();
            var ctype = (cfg.accept.indexOf(ext) >= 0 && MIME_ALL[ext]) ? MIME_ALL[ext]
                : (allowedMimes.indexOf(ftype) >= 0 ? ftype : '');
            // Surowy blob bez nazwy i typu (paste / getDisplayMedia) → PNG, o ile png dopuszczony.
            if (!ctype && !ext && !ftype && cfg.accept.indexOf('png') >= 0) ctype = 'image/png';
            return ctype;
        }
        function extForCtype(ctype) {
            for (var ext in MIME_ALL) { if (MIME_ALL[ext] === ctype && cfg.accept.indexOf(ext) >= 0) return ext; }
            return cfg.accept[0] || 'png';
        }
        function putSigned(url, file, ctype) {
            return fetch(url, { method: 'PUT', headers: { 'Content-Type': ctype }, body: file })
                .then(function (r) { if (!r.ok) throw new Error('put ' + r.status); });
        }
        function uploadFile(file) {
            if (cfg.readonly || !file) return;
            if (inst.pending.length >= cfg.maxPerMsg) { append('assistant', 'Możesz dołączyć maksymalnie ' + cfg.maxPerMsg + ' zrzutów naraz.', []); return; }
            var ctype = resolveCtype(file);
            if (!ctype) { append('assistant', 'Mogę przyjąć tylko obraz w formacie: ' + cfg.accept.join(', ').toUpperCase() + '.', []); return; }
            if (file.size > cfg.maxMB * 1024 * 1024) { append('assistant', 'Ten plik jest za duży (max ' + cfg.maxMB + ' MB).', []); return; }
            var ext = extForCtype(ctype);
            var fname = extRe.test(file.name || '') ? file.name : ('zrzut.' + ext);
            var ph = { url: URL.createObjectURL(file), uploading: true, path: null };
            inst.pending.push(ph); renderPending();
            call({ action: 'upload_init', filename: fname, size_bytes: file.size, mime: ctype })
                .then(function (res) {
                    return res.json().catch(function () { return {}; }).then(function (init) {
                        if (!res.ok) throw new Error(init.message || 'init');
                        return putSigned(init.upload_url, file, ctype).then(function () {
                            return call({ action: 'upload_done', path: init.path, filename: fname, size_bytes: file.size, mime: ctype });
                        });
                    });
                })
                .then(function (res) {
                    return res.json().catch(function () { return {}; }).then(function (done) {
                        if (!res.ok) throw new Error('done');
                        ph.uploading = false; ph.path = done.path; if (done.url) ph.url = done.url; renderPending();
                    });
                })
                .catch(function () {
                    var i = inst.pending.indexOf(ph); if (i >= 0) inst.pending.splice(i, 1); renderPending();
                    append('assistant', 'Nie udało się wgrać zrzutu — spróbuj jeszcze raz.', []);
                });
        }
        function renderPending() {
            var box = refs.shots; if (!box) return; box.innerHTML = '';
            inst.pending.forEach(function (s, i) {
                var d = el('div', 'tnc-ts-thumb');
                var im = el('img'); im.src = s.url; im.alt = 'Podgląd zrzutu'; d.appendChild(im);
                if (s.uploading) { d.appendChild(el('div', 'tnc-up', '…')); }
                else {
                    var rm = iconBtn('tnc-rm', '✕', 'Usuń zrzut'); rm.textContent = '✕';
                    rm.addEventListener('click', function () { inst.pending.splice(i, 1); renderPending(); });
                    d.appendChild(rm);
                }
                box.appendChild(d);
            });
        }

        // ── Zrzut ekranu „od razu" (getDisplayMedia → klatka na canvas → PNG) ──
        function capture() {
            if (cfg.readonly) return;
            var md = navigator.mediaDevices;
            if (!md || !md.getDisplayMedia) {
                append('assistant', 'Twoja przeglądarka nie wspiera robienia zrzutu — dodaj plik ikoną obrazka albo wklej zrzut przez Ctrl+V.', []);
                return;
            }
            md.getDisplayMedia({ video: true, audio: false }).then(function (stream) {
                var video = document.createElement('video');
                video.srcObject = stream; video.muted = true; video.playsInline = true;
                return video.play().catch(function () {}).then(function () {
                    return new Promise(function (r) { setTimeout(r, 250); });   // ustabilizuj klatkę
                }).then(function () {
                    var w = video.videoWidth || 1280, h = video.videoHeight || 720;
                    var canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(video, 0, 0, w, h);
                    return new Promise(function (res) { canvas.toBlob(res, 'image/png'); }).then(function (blob) {
                        stream.getTracks().forEach(function (t) { t.stop(); });
                        if (!blob) { append('assistant', 'Nie udało się zapisać zrzutu — spróbuj ponownie.', []); return; }
                        uploadFile(new File([blob], 'zrzut-ekranu.png', { type: 'image/png' }));
                    });
                }).catch(function () {
                    try { stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
                    append('assistant', 'Nie udało się zrobić zrzutu — spróbuj ponownie albo dodaj plik ikoną obrazka.', []);
                });
            }).catch(function () {
                // Brak zgody / anulowanie — graceful fallback.
                append('assistant', 'Nie zrobiłem zrzutu (brak zgody albo anulowano). Możesz dodać plik ikoną obrazka lub wkleić zrzut przez Ctrl+V.', []);
            });
        }

        // ── Tryb pełnoekranowy (embedded) ──
        function toggleFullscreen(on) {
            if (cfg.layout !== 'embedded') return;
            var isFs = refs.wrap.classList.contains('tnc-fs');
            var next = (on === undefined) ? !isFs : on;
            refs.wrap.classList.toggle('tnc-fs', next);
            document.body.classList.toggle('tnc-fs-open', next);
            if (refs.fsBtn) {
                refs.fsBtn.innerHTML = next ? IC.collapse : IC.expand;
                var lbl = next ? 'Zwiń czat' : 'Powiększ na cały ekran';
                refs.fsBtn.setAttribute('aria-label', lbl); refs.fsBtn.title = lbl;
            }
            scrollBottom();
        }

        function autosize() {
            var i = refs.input; if (!i) return;
            i.style.height = 'auto'; i.style.height = Math.min(i.scrollHeight, 120) + 'px';
        }

        // ── Focus trap (drawer) ──
        function onPanelKeydown(e) {
            if (e.key !== 'Tab') return;
            var nodes = refs.panel.querySelectorAll('button,textarea,input,a[href],[tabindex]:not([tabindex="-1"])');
            var vis = Array.prototype.filter.call(nodes, function (x) { return !x.disabled && x.offsetParent !== null; });
            if (!vis.length) return;
            var first = vis[0], last = vis[vis.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }

        // Escape: embedded+fullscreen → wyjdź z fullscreen; drawer otwarty → zamknij.
        function onDocKeydown(e) {
            if (e.key !== 'Escape') return;
            if (cfg.layout === 'embedded' && refs.wrap.classList.contains('tnc-fs')) { toggleFullscreen(false); return; }
            if (cfg.layout === 'drawer' && !refs.wrap.classList.contains('tnc-hidden')) { api.close(); }
        }

        // ── Wiązania ──
        function bind() {
            document.addEventListener('keydown', onDocKeydown);
            if (cfg.layout === 'drawer') {
                refs.panel.addEventListener('keydown', onPanelKeydown);
                // `api` jest przypisywane po bind() — wiązać przez domknięcie, nie referencję (crash drawera).
                if (refs.closeBtn) refs.closeBtn.addEventListener('click', function () { api.close(); });
                if (refs.overlay && cfg.closeOnOverlay) refs.overlay.addEventListener('click', function () { api.close(); });
            }
            if (refs.fsBtn) refs.fsBtn.addEventListener('click', function () { toggleFullscreen(); });
            if (cfg.readonly) return;   // brak kompozytora — nic więcej nie wiążemy

            refs.sendBtn.addEventListener('click', send);
            refs.attachBtn.addEventListener('click', function () { refs.fileInput.click(); });
            refs.fileInput.addEventListener('change', function (e) {
                Array.prototype.forEach.call(e.target.files || [], uploadFile); e.target.value = '';
            });
            if (refs.capBtn) refs.capBtn.addEventListener('click', capture);

            refs.input.addEventListener('input', autosize);
            refs.input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            });
            if (cfg.features.paste) {
                refs.input.addEventListener('paste', function (e) {
                    var items = (e.clipboardData && e.clipboardData.items) || [];
                    for (var i = 0; i < items.length; i++) {
                        var it = items[i];
                        if (it.type && it.type.indexOf('image/') === 0) { var f = it.getAsFile(); if (f) { e.preventDefault(); uploadFile(f); } }
                    }
                });
            }
            if (cfg.features.dnd) {
                var comp = refs.compose;
                refs.panel.addEventListener('dragover', function (e) { e.preventDefault(); comp.classList.add('tnc-drag'); });
                refs.panel.addEventListener('dragleave', function (e) { if (e.target === refs.panel) comp.classList.remove('tnc-drag'); });
                refs.panel.addEventListener('drop', function (e) {
                    e.preventDefault(); comp.classList.remove('tnc-drag');
                    Array.prototype.forEach.call((e.dataTransfer && e.dataTransfer.files) || [], function (f) {
                        if ((f.type || '').indexOf('image/') === 0) uploadFile(f);
                    });
                });
            }
        }

        // ── Kontroler ──
        var api = {
            el: refs.wrap,
            open: function () {
                if (inst.destroyed) return;
                if (cfg.layout === 'drawer') {
                    inst.lastFocus = document.activeElement;
                    refs.wrap.classList.remove('tnc-hidden');
                    document.body.classList.add('tnc-body-lock');
                } else {
                    try { refs.wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
                }
                if (!cfg.readonly && refs.input) setTimeout(function () { refs.input.focus(); }, 0);
                if (!cfg.readonly && cfg.track) cfg.track('open', cfg.title || '');
                if (cfg.onOpen) cfg.onOpen();
                if (!inst.loaded) loadHistory();
            },
            close: function () {
                if (cfg.layout === 'drawer') {
                    refs.wrap.classList.add('tnc-hidden');
                    document.body.classList.remove('tnc-body-lock');
                    if (inst.lastFocus && inst.lastFocus.focus) { try { inst.lastFocus.focus(); } catch (e) {} }
                }
                if (cfg.onClose) cfg.onClose();
            },
            refresh: function () { inst.loaded = false; return loadHistory(); },
            // Dymek LOKALNY — renderuje jak zwykłą wiadomość (rola ai/user), BEZ zapisu i BEZ sieci; scroll na dół.
            // Wygląda identycznie jak wiadomość z historii (te same style .tnc-b, white-space:pre-wrap → \n\n = akapity).
            addLocalBubble: function (role, text) {
                if (inst.destroyed) return;
                append(role === 'user' ? 'user' : 'assistant', String(text == null ? '' : text), []);
            },
            isEnabled: function () { return inst.enabled; },
            destroy: function () {
                inst.destroyed = true;
                document.removeEventListener('keydown', onDocKeydown);
                document.body.classList.remove('tnc-body-lock', 'tnc-fs-open');
                inst.pending.forEach(function (p) { try { URL.revokeObjectURL(p.url); } catch (e) {} });
                if (refs.wrap && refs.wrap.parentNode) refs.wrap.parentNode.removeChild(refs.wrap);
            }
        };
        return api;
    }

    window.TNChat = { mount: mount, version: VERSION };
})();
