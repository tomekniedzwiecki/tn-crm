# -*- coding: utf-8 -*-
"""LL-052 (Tomek 22.07): CTA "Zamawiam" na MOBILE celuje w FORMULARZ danych (.zc-form),
nie w gorna krawedz #zamow (tam karta produktu / naglowek). Desktop bez zmian.
Montaz w oba landingi Zaradka przed markerem LANDING RUNTIME (marker jednoznaczny, LL-035)."""
import io, sys

sys.stdout.reconfigure(encoding='utf-8')

JS = """<script>
  (() => {
    // LL-052: na mobile CTA -> #zamow laduje na FORMULARZU danych (.zc-form),
    // nie na karcie produktu u gory sekcji. Desktop: karta+formularz obok siebie, bez zmian.
    const mq = matchMedia("(max-width: 899px)");
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href="#zamow"]');
      if (!a || !mq.matches) return;
      const form = document.querySelector("#zamow .zc-form");
      if (!form) return;
      e.preventDefault();
      const tb = document.querySelector(".topbar");
      const off = (tb && getComputedStyle(tb).position === "sticky" ? tb.offsetHeight : 0) + 10;
      window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - off, behavior: "smooth" });
      history.replaceState(null, "", "#zamow");
    });
  })();
</script>

"""
KOT = '<!--\n  LANDING RUNTIME'
for slug in ('odsaczek', 'ugniatek'):
    p = r'c:\repos_tn\tn-crm\sklepy\rafal-hoffa\%s\index.html' % slug
    s = io.open(p, encoding='utf-8').read()
    if 'LL-052' in s:
        print('SKIP (juz zmontowane):', slug)
        continue
    assert s.count(KOT) == 1, slug + ': marker LANDING RUNTIME niejednoznaczny'
    s = s.replace(KOT, JS + KOT, 1)
    assert '-->' not in JS and s.count('LL-052') == 1
    io.open(p, 'w', encoding='utf-8').write(s)
    print('OK montaz:', slug, len(s), 'B')
