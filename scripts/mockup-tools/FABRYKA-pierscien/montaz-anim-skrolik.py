# -*- coding: utf-8 -*-
"""F5 SKROLIK — montaz hero-video + ANIM-2/3 (LL-041/LL-049: kazdy viewport).
Wzorzec ambient-scene odsaczka: <video.anim-video> absolute nad img sceny
(poster=scena webp), lazy IO [data-anim-src] — skrypt IO JUZ JEST w runtime
(z montazu F4, wideo-rail). Montaz: markup w .hr-media + 2x .ez-figure oraz
globalny CSS .anim-video (dotad scoped tylko do #wideo .vd-frame)."""
import io, re, sys

sys.stdout.reconfigure(encoding='utf-8')
P = r'c:\repos_tn\tn-crm\sklepy\rafal-hoffa\skrolik\index.html'
A = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/'

s = io.open(P, encoding='utf-8').read()
assert 'data-anim-src="' + A + 'assets/hero-video.mp4"' not in s, 'hero-video juz zmontowane'

V = ('      <video class="anim-video" muted loop playsinline preload="none"\n'
     '        poster="%s" data-anim-src="%s" aria-hidden="true"></video>\n')

# 1) hero: video po otwarciu .hr-media (przed img; poster = sc-hero)
K1 = '<figure class="hr-media reveal">\n'
assert s.count(K1) == 1 and 'sc-hero.webp' in s[s.index(K1):s.index(K1) + 500]
s = s.replace(K1, K1 + V % (A + 'sceny/sc-hero.webp', A + 'assets/hero-video.mp4'), 1)

# 2) sekcja 03: dwie .ez-figure (1. kanapa, 2. kuchnia) — zamiana sekwencyjna
K2 = '<figure class="ez-figure">'
assert s.count(K2) == 2, 'ez-figure != 2'
parts = s.split(K2)
assert 'sc-kanapa.webp' in parts[1][:400] and 'sc-kuchnia.webp' in parts[2][:400], 'kolejnosc figure 03'
s = (parts[0] + K2 + '\n' + V % (A + 'sceny/sc-kanapa.webp', A + 'assets/anim-kanapa.mp4')
     + parts[1] + K2 + '\n' + V % (A + 'sceny/sc-kuchnia.webp', A + 'assets/anim-kuchnia.mp4')
     + parts[2])

# 3) CSS globalny .anim-video (hero + ez; #wideo ma wlasny scoped duplikat — te same wartosci)
CSS = '''
    /* ANIM (LL-041/LL-049): hero-video + sceny 03 — ambient na kazdym viewporcie */
    .hr-media .anim-video,
    [id="ekran-zostaje"] .ez-figure .anim-video {
      position: absolute;
      inset: 0;
      z-index: 1;
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      pointer-events: none;
      transition: opacity .6s ease;
    }

    .hr-media .anim-video.on,
    [id="ekran-zostaje"] .ez-figure .anim-video.on {
      opacity: 1;
    }

    [id="ekran-zostaje"] .ez-figure {
      position: relative;
      overflow: hidden;
      border-radius: var(--radius-lg);
    }

    .hr-media .hr-sig {
      z-index: 2;
    }

    @media (prefers-reduced-motion: reduce) {
      .hr-media .anim-video,
      [id="ekran-zostaje"] .ez-figure .anim-video {
        transition: none !important;
      }
    }
'''
KOT = '.hr-media {'
i = s.index(KOT)
j = s.index('</style>', i)
s = s[:j] + CSS + s[j:]

io.open(P, 'w', encoding='utf-8').write(s)
n = s.count('data-anim-src')
print('OK montaz ANIM skrolik: %d nosnikow data-anim-src (1 hero + 2 ez + 1 wideo-rail), %d B' % (n, len(s)))
