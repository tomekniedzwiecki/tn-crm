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

    def test_b_slug_spoza_indexu_deposit_warn(self):
        """(b) slug spoza indexu -> wiersz EXEMPLARY-INDEX = WARN (miły dodatek, NIE blokuje DONE)."""
        self._paths()
        res = self._run("bar")  # indexu nie ma wiersza 'bar'
        idx_rows = [(st, det) for (st, nm, det) in rows_of(res, "kapitalizacja") if "EXEMPLARY-INDEX" in nm]
        self.assertTrue(idx_rows, "brak wiersza EXEMPLARY-INDEX")
        self.assertEqual(idx_rows[0][0], "WARN", "slug spoza indexu = WARN (przypomnienie, nie FAIL)")
        self.assertNotIn("FAIL", statuses(res, "kapitalizacja"), "kapitalizacja NIGDY nie blokuje DONE")
        self.assertIn("depozyt wzorca", idx_rows[0][1].lower())

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
        # 'foo' NIE dopasowuje sie do 'foobar' => traktowany jak nieobecny => WARN (miły dodatek, nie FAIL)
        self.assertEqual(idx_rows[0][0], "WARN", "'foo' nie moze dopasowac sie do wiersza 'foobar' (=> WARN)")


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


def _map_md(n_funkcje=2, n_zas=6, tagged=True, tag="[SPEC]", opinie=True, n_swiaty=4, primary=True):
    """Buduje MAPA-ZASTOSOWAN.md z kanonicznymi naglowkami (## FUNKCJE / ## ZASTOSOWANIA /
       ## SHOWCASE / ## SELEKCJA) — parametryzowalna pod poszczegolne asercje gate'u."""
    out = "# MAPA ZASTOSOWAN — foo\n\n## FUNKCJE\n| # | Parametr | Funkcja |\n|---|---|---|\n"
    for i in range(1, n_funkcje + 1):
        out += "| %d | param%d | funkcja%d |\n" % (i, i, i)
    out += "\n## ZASTOSOWANIA\n| # | Zastosowanie | Klasa dowodu | Kotwica |\n|---|---|---|---|\n"
    for i in range(1, n_zas + 1):
        cls = "-" if not tagged else ("[OPINIE]" if (opinie and i == 1) else tag)
        out += "| %d | uzycie%d | %s | kotwica%d |\n" % (i, i, cls, i)
    out += "\n## SHOWCASE\n| Zastosowanie | Jak pokazac | Sila |\n|---|---|---|\n| uzycie1 | scena | 4 |\n"
    out += "\n## SELEKCJA\n"
    if primary:
        out += "**PRIMARY:** jeden kat komercyjny\n"
    out += "**SPEKTRUM:** " + " · ".join("swiat%d" % i for i in range(1, n_swiaty + 1)) + "\n"
    return out


class TestMapaZastosowan(unittest.TestCase):
    """F0.6b MAPA ZASTOSOWAN — anty-zawezenie zakresu produktu wielouzytkowego.
       Per-produkt MAPA-ZASTOSOWAN.md w archiwum; dyskryminator mtime kodu (nowy bez mapy=FAIL,
       stary=SKIP); ## ZASTOSOWANIA>=6 z klasa dowodu; SPEKTRUM>=4 tylko przy >=2 funkcjach."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.d = self.tmp.name
        self.M = load_manifest()
        self.assertIn("mapa_zastosowan", self.M, "brak bloku mapa_zastosowan w gate-manifest.json")

    def tearDown(self):
        self.tmp.cleanup()

    def _code(self, ts=None):
        """Tworzy fikcyjny index.html i (opcjonalnie) ustawia mtime; zwraca sciezke."""
        p = os.path.join(self.d, "index.html")
        write(p, "<html></html>")
        if ts is not None:
            os.utime(p, (ts, ts))
        return p

    def _run(self, md=None, code=None, sections=None):
        if md is not None:
            write(os.path.join(self.d, "MAPA-ZASTOSOWAN.md"), md)
        ctx = {"archiwum": self.d, "code": code, "html": "", "sections": sections or []}
        res = GC.Results()
        GC.check_mapa_zastosowan(res, self.M, ctx)
        return res

    def test_nowy_bez_mapy_fail(self):
        """Nowy landing (mtime kodu >= wymagany_od_data) BEZ mapy = FAIL."""
        code = self._code(ts=None)  # swiezy plik = mtime teraz (dzis 2026-07-23 >= cutoff)
        res = self._run(md=None, code=code)
        self.assertIn("FAIL", statuses(res, "mapa_zastosowan"))

    def test_stary_bez_mapy_skip(self):
        """Landing sprzed reguly (mtime kodu < wymagany_od_data) BEZ mapy = SKIP (zero regresji)."""
        import datetime as _dt
        stary = _dt.datetime(2026, 7, 1).timestamp()
        code = self._code(ts=stary)
        res = self._run(md=None, code=code)
        self.assertIn("SKIP", statuses(res, "mapa_zastosowan"))
        self.assertNotIn("FAIL", statuses(res, "mapa_zastosowan"))

    def test_pelna_mapa_pass(self):
        """Mapa kompletna (>=2 funkcje, 6 zastosowan z klasa dowodu, 4 swiaty, PRIMARY, [OPINIE],
           sekcja zastosowan w kodzie) = zero FAIL; ZASTOSOWANIA i SPEKTRUM = PASS."""
        res = self._run(md=_map_md(), sections=["hero", "zastosowania", "zamow"])
        self.assertNotIn("FAIL", statuses(res, "mapa_zastosowan"))
        zas = [(st, det) for (st, nm, det) in rows_of(res, "mapa_zastosowan") if "ZASTOSOWANIA" in nm]
        self.assertEqual(zas[0][0], "PASS")
        spk = [(st, det) for (st, nm, det) in rows_of(res, "mapa_zastosowan") if "SPEKTRUM" in nm]
        self.assertEqual(spk[0][0], "PASS")

    def test_za_malo_swiatow_fail(self):
        """Mapa >=2 funkcje ale SPEKTRUM < min_swiaty = FAIL (produkt wielofunkcyjny musi pokazac swiaty)."""
        res = self._run(md=_map_md(n_funkcje=2, n_swiaty=2), sections=["hero", "zastosowania"])
        spk = [(st, det) for (st, nm, det) in rows_of(res, "mapa_zastosowan") if "SPEKTRUM" in nm]
        self.assertEqual(spk[0][0], "FAIL")

    def test_jednofunkcyjny_waski_pass_skip(self):
        """Produkt 1-funkcyjny waski (1 funkcja, 2 swiaty, 6 zastosowan) = SPEKTRUM SKIP, zero FAIL."""
        res = self._run(md=_map_md(n_funkcje=1, n_swiaty=2))
        spk = [(st, det) for (st, nm, det) in rows_of(res, "mapa_zastosowan") if "SPEKTRUM" in nm]
        self.assertEqual(spk[0][0], "SKIP")
        self.assertNotIn("FAIL", statuses(res, "mapa_zastosowan"))

    def test_brak_tagow_klasy_dowodu_fail(self):
        """ZASTOSOWANIA bez tagow klasy dowodu = 0 wierszy kwalifikowanych = FAIL."""
        res = self._run(md=_map_md(n_funkcje=1, n_zas=6, tagged=False))
        zas = [(st, det) for (st, nm, det) in rows_of(res, "mapa_zastosowan") if "ZASTOSOWANIA" in nm]
        self.assertEqual(zas[0][0], "FAIL")

    def test_brak_opinie_warn(self):
        """Mapa kompletna ale bez klasy [OPINIE] = WARN (nie FAIL) — miekkie przypomnienie."""
        res = self._run(md=_map_md(n_funkcje=1, n_zas=6, opinie=False, tag="[SPEC]"))
        opn = [(st, det) for (st, nm, det) in rows_of(res, "mapa_zastosowan") if "OPINIE" in nm]
        self.assertTrue(opn)
        self.assertEqual(opn[0][0], "WARN")
        self.assertNotIn("FAIL", statuses(res, "mapa_zastosowan"))


class TestRegistration(unittest.TestCase):

    def test_checki_zarejestrowane_blisko_panel_sync(self):
        names = [n for (n, _fn) in GC.CHECK_ORDER]
        self.assertIn("kapitalizacja_deposit", names)
        self.assertIn("reuse_preflight", names)
        # deposit bramkuje DONE -> tuz po panel_sync
        self.assertEqual(names[names.index("panel_sync") + 1], "kapitalizacja_deposit")
        # preflight = F1 -> tuz po sekcje_plan
        self.assertEqual(names[names.index("sekcje_plan") + 1], "reuse_preflight")

    def test_mapa_zastosowan_zarejestrowany(self):
        names = [n for (n, _fn) in GC.CHECK_ORDER]
        self.assertIn("mapa_zastosowan", names)
        self.assertIs(dict(GC.CHECK_ORDER)["mapa_zastosowan"], GC.check_mapa_zastosowan)
        # mapa_zastosowan tuz po reuse_preflight, PRZED cta
        self.assertEqual(names[names.index("reuse_preflight") + 1], "mapa_zastosowan")
        self.assertEqual(names[names.index("mapa_zastosowan") + 1], "cta")
        # asercje adjacency zachowane mimo wstawki
        self.assertEqual(names[names.index("sekcje_plan") + 1], "reuse_preflight")
        self.assertEqual(names[names.index("panel_sync") + 1], "kapitalizacja_deposit")

    def test_funkcje_zmapowane(self):
        d = dict(GC.CHECK_ORDER)
        self.assertIs(d["kapitalizacja_deposit"], GC.check_kapitalizacja_deposit)
        self.assertIs(d["reuse_preflight"], GC.check_reuse_preflight)

    def test_cena_panel_zarejestrowany(self):
        names = [n for (n, _fn) in GC.CHECK_ORDER]
        self.assertIn("cena_panel", names)
        self.assertIs(dict(GC.CHECK_ORDER)["cena_panel"], GC.check_cena_panel)
        # cena_panel po kapitalizacja_deposit -> NIE psuje asercji panel_sync+1 == kapitalizacja_deposit
        self.assertEqual(names[names.index("panel_sync") + 1], "kapitalizacja_deposit")


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


class TestCenaPanel(unittest.TestCase):
    """cena_panel — zgodnosc cen zapieczonych w HTML (data-price) z wf2_products.price po slug.
       _pg_crm podmieniany na fake (bez sieci); parser cen PL testowany jednostkowo."""

    def setUp(self):
        self.M = load_manifest()
        self.assertIn("cena_panel", self.M, "brak bloku cena_panel w gate-manifest.json")
        self._orig_pg = GC._pg_crm

    def tearDown(self):
        GC._pg_crm = self._orig_pg

    def _ctx(self, html, no_net=False, with_key=True):
        env = {}
        if with_key:
            env[self.M["supabase"]["key_env"]] = "sb_secret_dummy"
        return {"html": html, "slug": "foo", "sections": GC.parse_sections(html),
                "env": env, "no_net": no_net, "timeout": 5}

    def _fake_pg(self, rows):
        def fake(M, env, table, params, timeout):
            return rows
        return fake

    def test_price_parse_pl(self):
        """Parser cen: '149,90 zł' -> 149.90, '149.90' -> 149.90, separator tysiecy, szum -> None."""
        self.assertEqual(GC._parse_price_pl("149,90 zł"), 149.90)
        self.assertEqual(GC._parse_price_pl("149.90"), 149.90)
        self.assertEqual(GC._parse_price_pl("1 299,00 zł"), 1299.00)
        self.assertIsNone(GC._parse_price_pl("zł"))
        self.assertIsNone(GC._parse_price_pl(None))

    def test_brak_html_skip(self):
        res = GC.Results()
        GC.check_cena_panel(res, self.M, {"html": None, "slug": "foo", "sections": []})
        self.assertEqual(statuses(res, "cena_panel"), ["SKIP"])

    def test_brak_dataprice_warn(self):
        """Brak elementow data-price w HTML -> WARN (nie ma czego porownac), nigdy FAIL."""
        html = '<section id="hero"><h1>Bez ceny</h1></section>'
        res = GC.Results()
        GC.check_cena_panel(res, self.M, self._ctx(html))
        rows = rows_of(res, "cena_panel")
        self.assertTrue(rows)
        self.assertEqual(rows[0][0], "WARN")
        self.assertNotIn("FAIL", statuses(res, "cena_panel"))

    def test_no_net_skip(self):
        """data-price obecne, ale --no-net -> SKIP panelu (bez sieci), nie FAIL."""
        html = '<div data-price="149,90 zł">149,90 zł</div>'
        res = GC.Results()
        GC.check_cena_panel(res, self.M, self._ctx(html, no_net=True))
        self.assertIn("SKIP", statuses(res, "cena_panel"))
        self.assertNotIn("FAIL", statuses(res, "cena_panel"))

    def test_zgodna_pass(self):
        """Ceny data-price == wf2_products.price (tol) -> PASS, zero FAIL."""
        html = '<div data-price="149,90 zł">149,90 zł</div><a data-price-raw="149.90">Kup</a>'
        GC._pg_crm = self._fake_pg([{"price": 149.90, "slug": "foo"}])
        res = GC.Results()
        GC.check_cena_panel(res, self.M, self._ctx(html))
        cmp_rows = [(st, det) for (st, nm, det) in rows_of(res, "cena_panel") if "==" in nm]
        self.assertTrue(cmp_rows, "brak wiersza porownania HTML==panel")
        self.assertEqual(cmp_rows[0][0], "PASS")
        self.assertNotIn("FAIL", statuses(res, "cena_panel"))

    def test_rozjazd_fail(self):
        """Cena w HTML != cena w panelu -> FAIL (rozjazd landing<->panel)."""
        html = '<div data-price="149,90 zł">149,90 zł</div>'
        GC._pg_crm = self._fake_pg([{"price": 159.90, "slug": "foo"}])
        res = GC.Results()
        GC.check_cena_panel(res, self.M, self._ctx(html))
        self.assertIn("FAIL", statuses(res, "cena_panel"))

    def test_brak_ceny_w_panelu_fail(self):
        """Produkt panelu istnieje, ale price NULL -> FAIL (kalkulacja niewykonana)."""
        html = '<div data-price="149,90 zł">149,90 zł</div>'
        GC._pg_crm = self._fake_pg([{"price": None, "slug": "foo"}])
        res = GC.Results()
        GC.check_cena_panel(res, self.M, self._ctx(html))
        fail_rows = [(st, det) for (st, nm, det) in rows_of(res, "cena_panel") if st == "FAIL"]
        self.assertTrue(fail_rows)
        self.assertIn("kalkulacja niewykonana", fail_rows[0][1].lower())

    def test_brak_wiersza_panelu_skip(self):
        """Landing bez projektu panelu (brak wiersza wf2_products dla sluga) -> SKIP (jak panel_sync)."""
        html = '<div data-price="149,90 zł">149,90 zł</div>'
        GC._pg_crm = self._fake_pg([])
        res = GC.Results()
        GC.check_cena_panel(res, self.M, self._ctx(html))
        self.assertIn("SKIP", statuses(res, "cena_panel"))
        self.assertNotIn("FAIL", statuses(res, "cena_panel"))


class TestTrustedSources(unittest.TestCase):
    """Gate F0 „pochodzenie danych": 'detail' i 'allegro' = ZAUFANE; 'search'/puste = NIE.
       Pinuje rozszerzenie o źródło 'allegro' (tor Allegro→Marka, 23.07) BEZ osłabiania 'detail'."""

    def test_detail_nadal_zaufane(self):
        self.assertTrue(GC.is_trusted_source("detail"))
        self.assertIn("detail", GC.TRUSTED_SNAPSHOT_SOURCES)  # nie osłabiono istniejącego pinu

    def test_allegro_zaufane(self):
        self.assertTrue(GC.is_trusted_source("allegro"))
        self.assertIn("allegro", GC.TRUSTED_SNAPSHOT_SOURCES)

    def test_search_i_puste_niezaufane(self):
        for s in ("search", "", None, "   ", "allegro-fake", "aliexpress"):
            self.assertFalse(GC.is_trusted_source(s), "%r nie może być zaufane" % (s,))

    def test_case_i_whitespace_tolerancja(self):
        self.assertTrue(GC.is_trusted_source(" Allegro "))
        self.assertTrue(GC.is_trusted_source("DETAIL"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
