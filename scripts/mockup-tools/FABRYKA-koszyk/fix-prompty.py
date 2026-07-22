# -*- coding: utf-8 -*-
import io, sys
sys.stdout.reconfigure(encoding='utf-8')
p = 'gen-makiety.py'
t = io.open(p, encoding='utf-8').read()
FIX = [
 ('Below: one body line "Nic nie zostaje na dnie garnka — wyjmujesz wszystko naraz."',
  'Below: one body line "Nic nie zostaje na dnie garnka — wyjmujesz wszystko naraz." Bottom row: '
  'ONLY two trust pills "Płatność przy odbiorze" and "14 dni na zwrot" plus the green CTA '
  '"Zamawiam Odsączek". STRICT: no warranty text, no guarantee years, no star ratings.'),
 ('Body line: "Gładka stal nierdzewna nie trzyma resztek — wystarczy opłukać pod '
  'bieżącą wodą." (NO dishwasher symbols).',
  'Body line: "Gładka stal nierdzewna nie trzyma resztek — wystarczy opłukać pod bieżącą wodą." '
  'Bottom band: EXACTLY three feature items, verbatim: "Stal nierdzewna" / "Składa się na '
  'płasko" / "Mycie pod bieżącą wodą". STRICT: no dishwasher, no food-safety claims, no weight '
  'or lightness claims, no durability promises, no warranty.'),
 ('micro-copy "Płatność online lub przy odbiorze · 14 dni na zwrot".',
  'micro-copy "Płatność online lub przy odbiorze · 14 dni na zwrot". Top strip: ONLY two pills '
  '"Płatność przy odbiorze" / "14 dni na zwrot". Bottom band: EXACTLY three items verbatim: '
  '"Stal nierdzewna" / "Do garnka i woka" / "Składa się na płasko". STRICT: no dishwasher, '
  'no deep-fryer, no plates, no durability promises ("na lata"), no warranty, no fat/health '
  'wording beyond "olej ocieka do garnka".'),
 ('No counters, no fake promos.',
  'No counters, no fake promos. Bottom band: EXACTLY four items verbatim: "Płatność przy '
  'odbiorze" / "14 dni na zwrot" / "Stal nierdzewna" / "Do garnka i woka". STRICT: no '
  '"talerzy", no dishwasher, no warranty.'),
]
n = 0
for old, new in FIX:
    if new in t:
        continue
    assert old in t, 'BRAK: ' + old[:60]
    t = t.replace(old, new, 1)
    n += 1
io.open(p, 'w', encoding='utf-8').write(t)
print('OK zaostrzone %d/4' % n)
