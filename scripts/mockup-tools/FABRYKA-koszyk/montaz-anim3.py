# -*- coding: utf-8 -*-
"""F6 ODSACZEK — montaz 2 scen ANIM-3 (LL-041; LL-049: gra na kazdym viewporcie).
Wzorzec ambient-scene: <video.anim-video> absolute nad img sceny (poster=scena),
lazy przez IO (src przy zblizeniu, rootMargin 240px), canplay->play->.on; guard
TYLKO prefers-reduced-motion. Sceny: #zawies (.zw-photo) + #mid-cta (.mc-scene)."""
import io, re, sys

sys.stdout.reconfigure(encoding='utf-8')
P = r'c:\repos_tn\tn-crm\sklepy\rafal-hoffa\odsaczek\index.html'
A = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/'

s = io.open(P, encoding='utf-8').read()
assert 'anim-video' not in s, 'ANIM-3 juz zmontowane'

# 1) markup: video przed img w .zw-photo i .mc-scene
V = ('        <video class="anim-video" muted loop playsinline preload="none"\n'
     '          poster="%s" data-anim-src="%s"></video>\n')
K1 = '<figure class="zw-photo reveal">\n'
assert s.count(K1) == 1 and 'sc-zawieszony.webp' in s[s.index(K1):s.index(K1) + 500]
s = s.replace(K1, K1 + V % (A + 'sc-zawieszony.webp', A + 'anim-zawieszony.mp4'), 1)

K2 = '<figure class="mc-scene reveal">\n'
assert s.count(K2) == 1 and 'mc-scena.webp' in s[s.index(K2):s.index(K2) + 500]
s = s.replace(K2, K2 + V % (A + 'mc-scena.webp', A + 'anim-mc.mp4'), 1)

# 2) CSS: przy bloku ambient hero (kotwica .hr-video.on)
CSS = """
    /* ANIM-3 (LL-041): sceny ambient zawies + mid-cta; LL-049 — kazdy viewport */
    .anim-video {
      position: absolute;
      inset: 0;
      z-index: 1;
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--mo-dur-l) var(--mo-ease);
    }

    .anim-video.on {
      opacity: 1;
    }

    #mid-cta .mc-scene .anim-video {
      object-position: center 62%;
      border-radius: var(--radius-lg);
    }

    #mid-cta .mc-chips {
      z-index: 2;
    }

    @media (prefers-reduced-motion: reduce) {
      .anim-video {
        transition: none !important;
      }
    }
"""
KOT = """    .hr-video.on {
      opacity: 1;
    }
"""
assert KOT in s
s = s.replace(KOT, KOT + CSS, 1)

# 3) JS: przed LANDING RUNTIME (obok startera hero-video)
JS = """<script>
  (() => {
    // ANIM-3: lazy ambient sceny [data-anim-src] — kazdy viewport (LL-049)
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

    const vids = document.querySelectorAll("video.anim-video[data-anim-src]");
    if (!vids.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const v = en.target;
        if (!en.isIntersecting) { if (v._on) v.pause(); return; }
        if (!v.src) {
          v.addEventListener("canplay", () => {
            const p = v.play();
            const ok = () => { v.classList.add("on"); v._on = true; };
            if (p && typeof p.then === "function") p.then(ok).catch(() => {});
            else ok();
          }, { once: true });
          v.src = v.getAttribute("data-anim-src");
          v.load();
        } else if (v._on) {
          const p = v.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        }
      });
    }, { rootMargin: "240px 0px", threshold: 0.15 });

    vids.forEach((v) => io.observe(v));
  })();
</script>

"""
KOT2 = '<!--\n  LANDING RUNTIME'
assert KOT2 in s
s = s.replace(KOT2, JS + KOT2, 1)

io.open(P, 'w', encoding='utf-8').write(s)
print('OK montaz ANIM-3: zawies + mid-cta (%d B)' % len(s))
