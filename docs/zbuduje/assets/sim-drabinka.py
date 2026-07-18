# -*- coding: utf-8 -*-
"""
Symulacja Monte Carlo drabinki cenowej (CENNIK-PLAN.md v2.0 §2).
Pytanie: czy reguły drabinki (progi, ramp, OPT) dowożą zysk blisko optimum
i nie podejmują złych decyzji przy realnym szumie małych prób?

Model świata (nieznany silnikowi):
- CR(p) = CR_ref * (p_ref / p)^eps   (stała elastyczność eps; p_ref = cena testowa)
- ruch: spend_dzienny / CPC = kliki; zamówienia ~ Binomial(kliki, CR)
- COD: udział cod_share; nieodebrane cod_fail => strata 30 zł (transport w 2 strony),
  reszta zamówień płaci price; koszty: cost + fees*price (wysyłkę płaci klient)
- silnik widzi TYLKO zamówienia (bez statusu płatności) => orders_eff = orders*0.9

Polityki:
  LADDER   – nasza drabinka v2 (winner 5eff/200 lub 3eff/300 -> ramp 7 dni -> base -> OPT +10%)
  TOMEK10  – winner przy 10 zamówieniach (bez eff), potem od razu base
  DIRECT   – winner 5eff/200, skok od razu na base (bez ramp)
  STATIC   – zostaje na cenie testowej (baseline "nic nie rób")
  ORACLE   – zna prawdziwe parametry, od dnia 0 sprzedaje po cenie maksymalizującej
             dzienny zysk (górna granica, nieosiągalna)

Horyzont 120 dni. Wyniki: mediana zysku, % dojścia do scale, fałszywe kille,
zysk jako % oracle.
"""
import numpy as np

rng = np.random.default_rng(42)

DAYS = 120
COD_SHARE, COD_FAIL, COD_LOSS = 0.40, 0.12, 30.0
FEES = 0.02
EFF = 0.90

PRODUCTS = [  # (nazwa, koszt, cena_test, rynek_mid) — realny portfel rozwojowy
    ("koc",      51.21,  59.90, 109.0),
    ("lokowka",  72.77,  84.90, 129.0),
    ("endoskop", 30.80,  39.90,  79.0),
    ("pompka",   55.11,  64.90, 109.0),
    ("jezdzik", 208.71, 249.00, 329.0),
]

def psych_up(m):
    dec = np.floor(m / 10) * 10
    cands = [dec + 9.00, dec + 19.00] if m >= 150 else [dec + 4.90, dec + 9.90, dec + 14.90, dec + 19.90]
    for c in cands:
        if c >= m - 0.001:
            return round(c, 2)
    return round(dec + 19.90, 2)

def scale_base_formula(cost, market_mid, cpa_test):
    floor = cost / (1 - FEES - 0.40)                      # m_target 40%
    ceil_ = min(market_mid * 1.15, max(cpa_test / (1 - FEES - 0.30), floor))
    return psych_up(min(max(floor, min(market_mid, ceil_)), ceil_))

class World:
    """Prawdziwy popyt produktu — nieznany silnikowi. cliff = próg cenowy,
    powyżej którego CR dodatkowo spada ×cliff_mult (klif psychologiczny)."""
    def __init__(self, cost, p_test, market_mid, eps, cr_ref, cpc, cliff=None, cliff_mult=0.3):
        self.cost, self.p_test, self.market_mid = cost, p_test, market_mid
        self.eps, self.cr_ref, self.cpc = eps, cr_ref, cpc
        self.cliff, self.cliff_mult = cliff, cliff_mult
    def cr(self, price):
        base = self.cr_ref * (self.p_test / price) ** self.eps
        if self.cliff is not None and price > self.cliff:
            base *= self.cliff_mult
        return min(0.10, base)
    def day(self, price, spend):
        clicks = rng.poisson(spend / self.cpc)
        orders = rng.binomial(clicks, self.cr(price)) if clicks > 0 else 0
        cod = rng.binomial(orders, COD_SHARE) if orders > 0 else 0
        cod_lost = rng.binomial(cod, COD_FAIL) if cod > 0 else 0
        collected = orders - cod_lost
        unit = price * (1 - FEES) - self.cost
        profit = collected * unit - cod_lost * COD_LOSS - spend
        return orders, profit
    def daily_profit_at(self, price, spend):
        """Oczekiwany zysk/dzień przy cenie (do oracle)."""
        clicks = spend / self.cpc
        orders = clicks * self.cr(price)
        cod_lost = orders * COD_SHARE * COD_FAIL
        unit = price * (1 - FEES) - self.cost
        return (orders - cod_lost) * unit - cod_lost * COD_LOSS - spend

def oracle_price(w, spend):
    grid = np.arange(w.cost * 1.05, w.market_mid * 1.6, 1.0)
    profs = [w.daily_profit_at(p, spend) for p in grid]
    i = int(np.argmax(profs))
    return psych_up(grid[i]), profs[i]

SPEND_TEST, SPEND_SCALE = 20.0, 60.0
CAPS = {"low": 120, "mid": 180, "high": 300}

def cap_for(p_test):
    return CAPS["low"] if p_test < 50 else CAPS["mid"] if p_test <= 120 else CAPS["high"]

def run(policy, w):
    """Silnik polityk z pełnym STOP/LOCK: po teście utrzymuje stos szczebli;
    załamanie na szczeblu = rollback o JEDEN szczebel (cena niżej, reklamy dalej),
    dopiero uporczywe krwawienie po rollbacku = pauza reklam."""
    return run_impl(policy, w)

def run_impl(policy, w):
    price, phase = w.p_test, "test"
    spend_d = SPEND_TEST
    profit_total, spend_cum, orders_cum = 0.0, 0.0, 0
    base_price = None
    rungs = [w.p_test]          # stos szczebli (ostatni = bieżący)
    days_in_rung, orders_in_rung = 0, 0
    prev_rate, rolled_back = None, False
    killed = reached_scale = False
    hist = []                    # (orders, profit) bieżącego szczebla
    exp_rate_prev = None         # tempo zamówień/dzień z poprzedniego szczebla (obserwowane)
    for d in range(DAYS):
        o, pr = w.day(price, spend_d)
        profit_total += pr; spend_cum += spend_d; orders_cum += o
        hist.append((o, pr)); hist = hist[-14:]
        days_in_rung += 1; orders_in_rung += o
        if phase == "test":
            eff = orders_cum * EFF
            cpa = spend_cum / max(orders_cum, 1)
            if policy == "TOMEK10":
                win = orders_cum >= 10 and spend_cum >= 200
            else:
                win = (eff >= 5 and spend_cum >= 200) or (eff >= 3 and spend_cum >= 300)
            # KILL wg TESTY: cap = twardy STOP tylko BEZ sygnalu (0 zamowien);
            # z sygnalem produkt moze dociagnac do slow-grad (spend 300)
            hard_stop = cap_for(w.p_test) if orders_cum == 0 else 300.0
            if policy == "TOMEK10": hard_stop *= 2.0
            if not win and spend_cum >= hard_stop:
                killed = True; phase = "dead"; spend_d = 0.0; continue
            if win and policy != "STATIC":
                base_price = scale_base_formula(w.cost, w.market_mid, cpa)
                unit_base = base_price * (1 - FEES) - w.cost
                if unit_base < cpa * 1.3:
                    # kontrola krzyżowa TESTY §6 z HAMULCEM: podnies base najwyzej do rynku;
                    # jesli nawet cena rynkowa nie pokrywa CPA -> LOCK na tescie + karta
                    # (produkt sprzedaje, ale ekonomia wymaga ceny ponad rynek — decyzja czlowieka),
                    # spend wraca do poziomu testowego (nie skalujemy straty)
                    need = (cpa * 1.3 + w.cost) / (1 - FEES)
                    if need <= w.market_mid:
                        base_price = psych_up(need)
                    else:
                        phase = "flagged"; spend_d = SPEND_TEST
                        days_in_rung = 0; continue
                exp_rate_prev = orders_cum / max(d, 1) * (SPEND_SCALE / SPEND_TEST)
                if policy == "LADDER":
                    price = psych_up((price + base_price) / 2)   # ramp = arytmetyczna polowa
                elif policy == "LADDER_W":
                    # ramp PARKUJE POD najblizsza sciana psychologiczna < base (praktyk PL)
                    mid = (price + base_price) / 2
                    walls = [100, 150, 200, 300, 400]
                    under = [wl - 5.10 if wl < 150 else wl - 11.0 for wl in walls
                             if price < (wl - 5.10 if wl < 150 else wl - 11.0) < base_price]
                    price = psych_up(min(under, key=lambda u: abs(u - mid))) if under else psych_up(mid)
                else:
                    price = base_price
                rungs.append(price); phase = "scale"
                spend_d = SPEND_SCALE; reached_scale = True
                hist = []; days_in_rung = orders_in_rung = 0; prev_rate = None
        elif phase == "scale":
            # ocena szczebla po min. 7 dniach LUB 8 zamówieniach
            if days_in_rung >= 7 or orders_in_rung >= 8:
                rate_orders = orders_in_rung / days_in_rung
                rate_profit = sum(p for _, p in hist[-7:]) / min(days_in_rung, 7)
                collapse = exp_rate_prev is not None and rate_orders < 0.35 * exp_rate_prev
                worse = prev_rate is not None and rate_profit < 0.95 * prev_rate
                if collapse or (worse and rate_profit < 0):
                    # STOP/LOCK: rollback o JEDEN szczebel, reklamy jadą dalej
                    if len(rungs) >= 2 and not rolled_back:
                        rungs.pop(); price = rungs[-1]
                        rolled_back = True; phase = "locked"
                        hist = []; days_in_rung = orders_in_rung = 0
                    else:
                        phase = "locked"
                elif worse:
                    phase = "locked"                              # zysk spadł: zostań na poprzednim? nie — lock na obecnym
                else:
                    prev_rate = rate_profit
                    exp_rate_prev = rate_orders
                    if price < base_price:                        # ramp → base
                        price = base_price; rungs.append(price)
                    else:                                         # OPT +10% do ceiling
                        nxt = psych_up(price * 1.10)
                        if nxt <= base_price * 1.3:
                            price = nxt; rungs.append(price)
                        else:
                            phase = "locked"
                    hist = []; days_in_rung = orders_in_rung = 0
        # flagged: karta "ekonomia wymaga ceny ponad rynek" -> Tomek decyduje w ~7 dni (kill)
        if phase == "flagged" and days_in_rung >= 7:
            killed = True; phase = "dead"; spend_d = 0.0
        # guard kampanii: uporczywe krwawienie (14 dni gleboko pod woda) = pauza reklam
        if phase in ("scale", "locked") and days_in_rung >= 14:
            if sum(p for _, p in hist) < -14 * SPEND_SCALE * 0.5:
                spend_d = 0.0; phase = "dead"
    return profit_total, reached_scale, killed

def main():
    # CR odniesienia = CR na cenie TESTOWEJ. Produkty, ktore realnie przechodza bramke
    # winnera (5 zam./200 zl => CPA ~40), musza miec CR ~3-5% przy CPC ~1.5-2 — takie
    # tez symulujemy (dobre landingi wg STANDARD maja benchmark CR 3%+).
    # (eps, CR_ref, cliff_frac) — cliff_frac: prog klifu jako wielokrotnosc ceny testowej
    # (None = gladki popyt; 1.20 = klif ponizej rampu ~1.25x; 1.38 = klif miedzy rampem a base ~1.5x)
    scenarios = []
    for eps in (0.6, 1.0, 1.5, 2.2):
        for cr in (0.012, 0.025, 0.045):
            scenarios.append((eps, cr, None))
    for cr in (0.025, 0.045):
        scenarios.append((0.8, cr, 1.20))
        scenarios.append((0.8, cr, 1.38))
    dud = (1.0, 0.003, None)   # produkt-trup
    policies = ["LADDER", "LADDER_W", "TOMEK10", "DIRECT", "STATIC"]
    N = 400
    print(f"{'produkt':9} {'eps':4} {'CR%':5} | " + " | ".join(f"{p:>8}" for p in policies) + " |   ORACLE | LAD/ORA")
    agg = {p: [] for p in policies}; agg_o = []
    for name, cost, p_test, mid in PRODUCTS:
        for eps, cr, cf in scenarios + [dud]:
            cliff = p_test * cf if cf else None
            res = {p: [] for p in policies}
            w0 = World(cost, p_test, mid, eps, cr, cpc=2.0, cliff=cliff)
            op, orate = oracle_price(w0, SPEND_SCALE)
            oracle_profit = max(0.0, orate) * DAYS   # oracle nie pali budzetu na produkcie bez ekonomii
            for p in policies:
                for _ in range(N):
                    w = World(cost, p_test, mid, eps, cr, cpc=2.0, cliff=cliff)
                    pr, sc, kl = run(p, w)
                    res[p].append(pr)
            meds = {p: float(np.median(res[p])) for p in policies}
            for p in policies: agg[p].append(meds[p])
            agg_o.append(oracle_profit)
            if cr == 0.045:   # drukuj wysoki CR (produkty, ktore realnie przechodza bramke)
                ratio = meds['LADDER'] / oracle_profit if oracle_profit > 0 else float('nan')
                tag = f"clf{cf}" if cf else f"e{eps}"
                print(f"{name:9} {tag:7} {cr*100:4.1f} | " +
                      " | ".join(f"{meds[p]:8.0f}" for p in policies) +
                      f" | {oracle_profit:8.0f} | {ratio:6.2f}")
    print("\n=== SUMA median po wszystkich scenariuszach (5 produktow x 13 scenariuszy) ===")
    ora = sum(agg_o)
    for p in policies:
        tot = sum(agg[p])
        print(f"{p:>8}: {tot:10.0f} zl   ({(tot/ora*100) if ora else 0:5.1f}% oracle)")
    print(f"{'ORACLE':>8}: {ora:10.0f} zl (gorna granica: zna prawdziwa elastycznosc od dnia 0, nie placi za nauke)")

if __name__ == "__main__":
    main()
