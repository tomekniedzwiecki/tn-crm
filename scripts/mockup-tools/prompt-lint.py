#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
prompt-lint.py — GLOBALNY guard doktryny generacji grafik produktowych (feedback Tomka 18.07).

Zasada (GRAFIKA-Z-MAKIETY §ZASADA NADRZĘDNA PROMPTU): prompt do generatora opisuje TYLKO wizję
SCENY; wygląd produktu definiuje WYŁĄCZNIE referencja (image[0]) + prefix „reproduce unchanged".
Słowny opis cech produktu w prompcie KONKURUJE z referencją → losowy dryf produktu.

Ten lint wykrywa (a) opisy cech produktu w prompcie (czerwone flagi) oraz (b) BRAK prefiksu
referencji przy generacji z produktem. Uruchamiać PRZED każdą generacją sceny produktowej
(agent) oraz w audycie (gate na promptach zapisanych w LEDGER).

Użycie:
  prompt-lint.py "<prompt>"                         # pojedynczy prompt z argv
  echo "<prompt>" | prompt-lint.py -                # ze stdin
  prompt-lint.py --file prompts.txt                 # jeden prompt na linię (# = komentarz)
  prompt-lint.py "<prompt>" --expect-product-ref    # dodatkowo wymagaj prefiksu referencji
Exit: 0 = czysto · 1 = ≥1 czerwona flaga (opis produktu) lub brak wymaganego prefiksu.
"""
import sys, re, argparse

for _s in (sys.stdout, sys.stderr):
    try: _s.reconfigure(encoding="utf-8")
    except Exception: pass

# Prefiks referencji (produkt) — jego OBECNOŚĆ jest wymagana (nie flagowana): to on mówi
# modelowi „odwzoruj produkt z obrazu". Wykrywamy go, by (1) nie skanować go jak wizji sceny,
# (2) sprawdzić że jest, gdy --expect-product-ref.
REF_PREFIX_RE = re.compile(r'image\s*1\s+is\s+the\s+exact|reproduce\s+it\s+unchanged|single\s+source\s+of\s+truth', re.I)

# CZERWONE FLAGI — opis CECH PRODUKTU w wizji sceny (to psuje wierność). Dobrane wąsko, by nie
# łapać opisu SCENY (np. „wooden floor" = scena OK; „wooden board/edge" = produkt ŹLE).
FLAGS = [
    (re.compile(r'\b\d+\s*[-–—]\s*\d+\s*cm\b', re.I),                      'wymiar produktu (np. „2-3 cm")'),
    (re.compile(r'\b\d+\s*(cm|mm|inch|inches)\b', re.I),                   'wymiar'),
    (re.compile(r'\bNOT\s+(a\s+)?(metal|box|block|thick|plastic|bulky)\b', re.I), 'negatywny opis produktu („NOT metal/box")'),
    (re.compile(r'\b(flat|thin|thick|slim|bulky)\s+(board|plate|panel|deck|scratch\w*|pad)\b', re.I), 'opis kształtu/profilu produktu'),
    (re.compile(r'\b(sliding|hidden|pull-?out)\s+(drawer|compartment|tray)\b', re.I), 'element produktu (schowek/szuflada)'),
    (re.compile(r'\bremovable\s+(panel|sheet|sandpaper|pad|surface)\b', re.I), 'element produktu (wymienny panel)'),
    (re.compile(r'\b(side\s+)?loop\s+(on|at|attached)', re.I),            'element produktu (pętla)'),
    (re.compile(r'\b(sandpaper|abrasive)\s+(surface|top|layer|sheet)\b', re.I), 'materiał produktu (papier ścierny)'),
    (re.compile(r'\bwooden\s+(edge|rim|frame|board|panel|base|sides?)\b', re.I), 'materiał produktu (drewno jako element produktu)'),
    (re.compile(r'\b(the|a)\s+(board|product|item|mat|pad)\s+(is|has|with|features|made)\b', re.I), 'bezpośredni opis wyglądu produktu'),
    (re.compile(r'\btwo\s+(sliding|stacked|overlapping)\s+(boards?|plates?|panels?)\b', re.I), 'opis konstrukcji produktu'),
]

def strip_ref_prefix(prompt):
    """Odetnij zdanie(a) prefiksu referencji — reszta to wizja sceny do sprawdzenia."""
    m = REF_PREFIX_RE.search(prompt)
    if not m:
        return prompt, False
    # prefix zwykle to 1-2 pierwsze zdania; tnij do podwójnego newline lub po ~2 zdaniach
    parts = re.split(r'\n\n+', prompt, maxsplit=1)
    if len(parts) == 2 and REF_PREFIX_RE.search(parts[0]):
        return parts[1], True
    # fallback: usuń zdania zawierające sygnał prefiksu
    sents = re.split(r'(?<=[.!?])\s+', prompt)
    scene = ' '.join(s for s in sents if not REF_PREFIX_RE.search(s))
    return scene, True

def lint(prompt, expect_ref=False):
    scene, has_ref = strip_ref_prefix(prompt)
    hits = []
    for rx, label in FLAGS:
        for m in rx.finditer(scene):
            hits.append((label, m.group(0)))
    problems = []
    if hits:
        problems.append("OPIS PRODUKTU w prompcie (psuje wierność — opisuj TYLKO scenę, produkt z referencji):")
        seen = set()
        for label, frag in hits:
            key = (label, frag.lower())
            if key in seen: continue
            seen.add(key)
            problems.append(f"   • {label}: '{frag}'")
    if expect_ref and not has_ref:
        problems.append("BRAK PREFIKSU REFERENCJI — dodaj prefiks 'Image 1 is the EXACT product ... reproduce unchanged, change only the scene' przed wizja sceny.")
    return problems

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("prompt", nargs="?", help="prompt (albo '-' dla stdin)")
    ap.add_argument("--file", help="plik: jeden prompt na linię (# = komentarz)")
    ap.add_argument("--expect-product-ref", action="store_true", help="wymagaj prefiksu referencji produktu")
    a = ap.parse_args()

    prompts = []
    if a.file:
        with open(a.file, encoding="utf-8") as f:
            prompts = [l.strip() for l in f if l.strip() and not l.strip().startswith("#")]
    elif a.prompt == "-" or (not a.prompt and not sys.stdin.isatty()):
        prompts = [sys.stdin.read().strip()]
    elif a.prompt:
        prompts = [a.prompt]
    else:
        ap.error("podaj prompt, '-' (stdin) albo --file")

    bad = 0
    for i, p in enumerate(prompts):
        probs = lint(p, a.expect_product_ref)
        head = f"[{i+1}] " if len(prompts) > 1 else ""
        if probs:
            bad += 1
            print(f"{head}✗ FAIL")
            for pr in probs: print(f"   {pr}")
        else:
            print(f"{head}✓ OK — prompt czysto scenowy" + (" (+ prefiks referencji)" if a.expect_product_ref else ""))
    if bad:
        print(f"\n{bad}/{len(prompts)} promptow lamie doktryne 'prompt=wizja, produkt=referencja'.")
    return 1 if bad else 0

if __name__ == "__main__":
    sys.exit(main())
