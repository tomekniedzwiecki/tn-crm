# -*- coding: utf-8 -*-
"""
test-gate-check.py — testy jednostkowe bramek gate-check.py (stdlib unittest, bez pytest).

Uruchom:  python test-gate-check.py            (albo .venv/Scripts/python.exe test-gate-check.py)

Rdzen: bramki KAPITALIZACJI (check_kapitalizacja_deposit / check_reuse_preflight) — egzekucja
flywheel reuse (KAPITALIZACJA-OPS §1 retrieval + §4 depozyt). Plus sanity-regresja istniejacego
check_cta, zeby wychwycic przypadkowe zlamanie wspoldzielonych helperow.

gate-check.py ma mysnik w nazwie -> ladowany przez importlib (nie 'import gate_check').
"""
import os, sys, json, copy, tempfile, importlib.util, unittest

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))


def load_gate():
    spec = importlib.util.spec_from_file_location("gatecheck_under_test",
                                                  os.path.join(HERE, "gate-check.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def load_manifest():
    with open(os.path.join(HERE, "gate-manifest.json"), encoding="utf-8") as f:
        return json.load(f)


GC = load_gate()


def rows_of(res, cat):
    """(status, name, detail) dla kategorii."""
    return [(st, nm, det) for (c, nm, st, det) in res.rows if c == cat]


def statuses(res, cat):
    return [st for (c, nm, st, det) in res.rows if c == cat]


def write(path, txt):
    with open(path, "w", encoding="utf-8") as f:
        f.write(txt)


# EXEMPLARY-INDEX o formacie wiersza [slug](.../slug/) — jak realny plik.
INDEX_WITH_FOO = (
    "# EXEMPLARY-INDEX\n\n"
    "| Slug (link) | ... |\n|---|---|\n"
    "| **[foo](https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/foo/)** | ... |\n"
)

LEKCJE_NO_FOO = (
    "# LEKCJE LANDINGOW\n\n"
    "| ID | Data | Źródło | Typ | Lekcja | Status | Nośnik |\n"
    "|----|------|--------|-----|--------|--------|--------|\n"
    "| LL-001 | 2026-07-16 | RETRO Baru (inny landing) | DOKTRYNA | cos | WDROŻONA | STANDARD |\n"
)

LEKCJE_WITH_FOO = (
    "# LEKCJE LANDINGOW\n\n"
    "| ID | Data | Źródło | Typ | Lekcja | Status | Nośnik |\n"
    "|----|------|--------|-----|--------|--------|--------|\n"
    "| LL-002 | 2026-07-16 | RETRO foo (cos poszlo nie tak) | DOKTRYNA | cos | WDROŻONA | STANDARD |\n"
)

TOKENS_NO_ROOT = "# TOKEN-KONTRAKT\n\n_(zasiew: foo / bar — do uzupelnienia)_\n"
TOKENS_WITH_FOO = "# TOKEN-KONTRAKT\n\n### foo\n```css\n:root{ --cta:#D97716; --ink:#111; }\n```\n"


class DepositBase(unittest.TestCase):
    """Buduje manifest z blokiem kapitalizacja_deposit wskazujacym na fixture (absolutne sciezki)."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.d = self.tmp.name
        self.M = load_manifest()
        # sanity: blok istnieje w realnym manifescie
        self.assertIn("kapitalizacja_deposit", self.M, "brak bloku w gate-manifest.json")

    def tearDown(self):
        self.tmp.cleanup()

    def _paths(self, index=INDEX_WITH_FOO, lekcje=LEKCJE_WITH_FOO, tokens=TOKENS_WITH_FOO,
               index_exists=True):
        ip = os.path.join(self.d, "EXEMPLARY-INDEX.md")
        lp = os.path.join(self.d, "LEKCJE-LANDINGI.md")
        tp = os.path.join(self.d, "TOKEN-KONTRAKT.md")
        if index_exists:
            write(ip, index)
        write(lp, lekcje)
        write(tp, tokens)
        m = self.M["kapitalizacja_deposit"]
        m["index_plik"] = ip if index_exists else os.path.join(self.d, "NIE-MA.md")
        m["lekcje_plik"] = lp
        m["tokens_plik"] = tp

    def _run(self, slug):
        res = GC.Results()
        GC.check_kapitalizacja_deposit(res, self.M, {"slug": slug})
        return res


class TestDepositIndex(DepositBase):

    def test_a_slug_w_indexie_deposit_pass(self):
        """(a) slug w indexie -> wiersz EXEMPLARY-INDEX = PASS, zero FAIL w kategorii."""
        self._paths()
        res = self._run("foo")
        idx_rows = [(st, det) for (st, nm, det) in rows_of(res, "kapitalizacja") if "EXEMPLARY-INDEX" in nm]
        self.assertTrue(idx_rows, "brak wiersza EXEMPLARY-INDEX")
        self.assertEqual(idx_rows[0][0], "PASS", "slug w indexie powinien dac PASS")
        self.assertNotIn("FAIL", statuses(res, "kapitalizacja"))

    def test_b_slug_spoza_indexu_deposit_fail(self):
        """(b) slug spoza indexu -> wiersz EXEMPLARY-INDEX = FAIL (blokuje DONE)."""
        self._paths()
        res = self._run("bar")  # indexu nie ma wiersza 'bar'
        idx_rows = [(st, det) for (st, nm, det) in rows_of(res, "kapitalizacja") if "EXEMPLARY-INDEX" in nm]
        self.assertTrue(idx_rows, "brak wiersza EXEMPLARY-INDEX")
        self.assertEqual(idx_rows[0][0], "FAIL", "slug spoza indexu powinien dac FAIL")
        self.assertIn("depozytu wzorca", idx_rows[0][1].lower())

    def test_index_brak_pliku_skip(self):
        """Brak pliku indexu = SKIP (config, nie karzemy landinga FAIL-em)."""
        self._paths(index_exists=False)
        res = self._run("foo")
        idx_rows = [(st, det) for (st, nm, det) in rows_of(res, "kapitalizacja") if "EXEMPLARY-INDEX" in nm]
        self.assertEqual(idx_rows[0][0], "SKIP")
        self.assertNotIn("FAIL", statuses(res, "kapitalizacja"))

    def test_slug_nie_jest_podciagiem_innego(self):
        """Kotwice /slug/ i [slug] chronia przed kolizja podciagu: 'foo' nie zapala sie na 'foobar'."""
        self._paths()  # ustawia sciezki fixture
        # nadpisz index samym wierszem 'foobar' — 'foo' NIE moze sie z nim dopasowac:
        write(self.M["kapitalizacja_deposit"]["index_plik"], "| **[foobar](https://x/foobar/)** |\n")
        res = self._run("foo")
        idx_rows = [(st, det) for (st, nm, det) in rows_of(res, "kapitalizacja") if "EXEMPLARY-INDEX" in nm]
        self.assertEqual(idx_rows[0][0], "FAIL", "'foo' nie moze dopasowac sie do wiersza 'foobar'")


class TestDepositLesson(DepositBase):

    def test_c_brak_lekcji_warn_nie_fail(self):
        """(c) brak lekcji sluga w kolumnie Źródło -> WARN (nie FAIL); kategoria bez FAIL."""
        self._paths(lekcje=LEKCJE_NO_FOO)  # index MA foo -> index PASS; lekcje NIE ma foo
        res = self._run("foo")
        lek_rows = [(st, det) for (st, nm, det) in rows_of(res, "kapitalizacja") if "LEKCJE" in nm]
        self.assertTrue(lek_rows)
        self.assertEqual(lek_rows[0][0], "WARN", "brak lekcji ma byc WARN, nie FAIL")
        self.assertNotIn("FAIL", statuses(res, "kapitalizacja"),
                         "brak lekcji NIE moze podniesc FAIL")

    def test_lekcja_obecna_pass(self):
        """Lekcja sluga w kolumnie Źródło -> PASS."""
        self._paths(lekcje=LEKCJE_WITH_FOO)
        res = self._run("foo")
        lek_rows = [(st, det) for (st, nm, det) in rows_of(res, "kapitalizacja") if "LEKCJE" in nm]
        self.assertEqual(lek_rows[0][0], "PASS")


class TestDepositTokens(DepositBase):

    def test_brak_root_bloku_warn(self):
        """Brak bloku :root sluga w TOKEN-KONTRAKT -> WARN (nie FAIL)."""
        self._paths(tokens=TOKENS_NO_ROOT)
        res = self._run("foo")
        tok_rows = [(st, det) for (st, nm, det) in rows_of(res, "kapitalizacja") if "TOKEN-KONTRAKT" in nm]
        self.assertEqual(tok_rows[0][0], "WARN")
        self.assertNotIn("FAIL", statuses(res, "kapitalizacja"))

    def test_root_blok_obecny_pass(self):
        """Blok :root poprzedzony naglowkiem sluga -> PASS."""
        self._paths(tokens=TOKENS_WITH_FOO)
        res = self._run("foo")
        tok_rows = [(st, det) for (st, nm, det) in rows_of(res, "kapitalizacja") if "TOKEN-KONTRAKT" in nm]
        self.assertEqual(tok_rows[0][0], "PASS")


class TestReusePreflight(unittest.TestCase):

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.d = self.tmp.name
        self.M = load_manifest()
        self.assertIn("reuse_preflight", self.M)

    def tearDown(self):
        self.tmp.cleanup()

    def _run(self):
        res = GC.Results()
        GC.check_reuse_preflight(res, self.M, {"archiwum": self.d})
        return res

    def test_d_plan_bez_markera_warn(self):
        """(d) PLAN.md bez '## WZORCE' -> WARN (nie FAIL)."""
        write(os.path.join(self.d, "PLAN.md"), "# PLAN\n\narchetyp-hero: A\n\n## MANIFEST SEKCJI\n")
        res = self._run()
        rows = rows_of(res, "reuse_preflight")
        self.assertTrue(rows)
        self.assertEqual(rows[0][0], "WARN", "PLAN bez markera ma byc WARN")
        self.assertNotIn("FAIL", statuses(res, "reuse_preflight"))

    def test_plan_z_markerem_pass(self):
        write(os.path.join(self.d, "PLAN.md"), "# PLAN\n\n## WZORCE\n- masazer\n- mata\n")
        res = self._run()
        self.assertEqual(rows_of(res, "reuse_preflight")[0][0], "PASS")

    def test_brak_planu_skip(self):
        """Brak PLAN.md -> SKIP (landing sprzed reguly; nie psuje baseline)."""
        res = self._run()  # katalog pusty
        rows = rows_of(res, "reuse_preflight")
        self.assertEqual(rows[0][0], "SKIP")
        self.assertNotIn("FAIL", statuses(res, "reuse_preflight"))
        self.assertNotIn("WARN", statuses(res, "reuse_preflight"))


class TestRegistration(unittest.TestCase):

    def test_checki_zarejestrowane_blisko_panel_sync(self):
        names = [n for (n, _fn) in GC.CHECK_ORDER]
        self.assertIn("kapitalizacja_deposit", names)
        self.assertIn("reuse_preflight", names)
        # deposit bramkuje DONE -> tuz po panel_sync
        self.assertEqual(names[names.index("panel_sync") + 1], "kapitalizacja_deposit")
        # preflight = F1 -> tuz po sekcje_plan
        self.assertEqual(names[names.index("sekcje_plan") + 1], "reuse_preflight")

    def test_funkcje_zmapowane(self):
        d = dict(GC.CHECK_ORDER)
        self.assertIs(d["kapitalizacja_deposit"], GC.check_kapitalizacja_deposit)
        self.assertIs(d["reuse_preflight"], GC.check_reuse_preflight)


class TestExistingCtaRegression(unittest.TestCase):
    """Sanity-regresja: istniejacy check_cta nadal dziala (guard wspoldzielonych helperow
       strip_scripts/_alias_groups/_cta_section_spans)."""

    def setUp(self):
        self.M = load_manifest()

    def _ctx(self, html):
        return {"html": html, "sections": GC.parse_sections(html)}

    def test_za_malo_cta_fail(self):
        html = '<section id="hero"><a data-checkout href="#">Kup</a></section>'
        res = GC.Results()
        GC.check_cta(res, self.M, self._ctx(html))
        liczba = [(st, det) for (st, nm, det) in rows_of(res, "cta") if "liczba" in nm]
        self.assertTrue(liczba, "brak wiersza 'liczba [data-checkout]'")
        self.assertEqual(liczba[0][0], "FAIL", "1 CTA < min_count -> FAIL")

    def test_brak_html_skip(self):
        res = GC.Results()
        GC.check_cta(res, self.M, {"html": None, "sections": []})
        self.assertEqual(statuses(res, "cta"), ["SKIP"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
