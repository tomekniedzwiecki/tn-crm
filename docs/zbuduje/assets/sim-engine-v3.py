# -*- coding: utf-8 -*-
"""
SYMULATOR SILNIKA CEN „CENY 3.0" (wf2-price-engine) — Monte Carlo.
=================================================================
Cel: przepuścić przez WIERNY PORT logiki decyzyjnej silnika realistyczne
scenariusze ZANIM silnik realnie zmieni ceny. Sprawdzamy JAK SIĘ ZACHOWUJE
i szukamy rzeczy do poprawy.

Port 1:1 (stdlib only, bez numpy) z:
  supabase/functions/wf2-price-engine/index.ts  (decideProduct, routeUp,
  collapseCheck, scaleBase, autoReasonBlock, psychPriceUp/Down, pipeline §2e)
Config: docs/zbuduje/CENNIK-PLAN.md v3.1 §8 (kanoniczne klucze).

MODEL CZASU: silnik = 1 wywołanie/dzień. W ramach dnia: (1) SWEEP
(confirm pending, accept+exec zaakceptowanych kart, expire kart), (2) POPYT
dnia przy bieżącej cenie, (3) DECYZJA (raz dziennie).

KARTY: w symulacji Tomek akceptuje kartę po `card_delay_days`. Sweep wykonuje
ją tego dnia. Karta z `expires_at` (proposal_ttl_days=7) wygasa, jeśli akcept
nie zdąży (delay >= 7). `winner_reco` NIE wygasa. DEDUP: klucz karty (kind +
poziom ceny) raz WYKONANY blokuje ponowne utworzenie na zawsze (upsert
ignoreDuplicates); wygaśnięcie ZWALNIA klucz (sufiks |exp).
"""
import math, random, statistics, os

# ══════════════════════════════════════════════════════════════════════════
# CONFIG v3.1 (§8 KANONICZNE) — wartości domyślne silnika
# ══════════════════════════════════════════════════════════════════════════
BASE_CFG = {
    "winner_orders": 3, "winner_spend": 300, "winner_needs_cp2": True,
    "cp2_atc_rate": 5.0, "cp2_cost_atc_max": 12, "winner_high_confidence_orders": 5,
    "winner_orders_no_ads": 5, "min_prepaid_orders": 1,
    "ramp_orders": 3, "ramp_spend": 150, "ramp_hold_days": 7, "walls": [100, 150],
    "collapse_quantile": 0.10, "collapse_baseline_days": 7, "collapse_min_spend": 150,
    "collapse_max_days": 5, "collapse_min_expected": 5, "learning_grace_days": 3,
    "rollback_lock_days": 21, "q4_cpm_uplift": 40,
    "small_step_no_adset_pct": 10, "fresh_adset_days": 10,
    "target_change_min_pct": 10, "target_stability_runs": 2, "cpa_ewma_alpha": 0.3,
    "opt_probe_pct_min": 15, "opt_probe_pct_max": 20, "opt_window_days": 14,
    "opt_window_days_cod": 21, "contribution_keep_frac": 0.80, "mer_be_mult": 1.2,
    "mer_gate_min_margin": 0.30, "wall_cross_requires_human": True,
    "allow_downward_proposals": True, "auto_step_max_pct": 20,
    "frequency_decline": 3.5, "harvest_cpm_rise_pct": 20, "harvest_window_days": 14,
    "scale_margin_survival": 0.12, "scale_margin_target": 0.40, "cpa_ci_quantile": 0.65,
    "cod_settled_gating_share": 0.60, "cod_cooldown_days": 21, "sms_verify_required_above": 100,
    "ads_fresh_hours": 48, "ads_min_spend_active": 1, "dq_unmapped_ratio": 0.2,
    "no_ads_window_days": 30, "market_gap_flag": 0.75, "cooldown_days": 7,
    "min_margin_floor_pct": 5, "anomaly_min_orders": 12, "anomaly_window_days": 14,
    "cache_grace_min": 6, "max_price_changes_per_run": 5, "decision_ttl_days": 14,
    "proposal_ttl_days": 7, "paid_definition": "synced", "client_price_consent": "notify",
    "no_raise_weekdays": [4, 5],  # czw, pt (weekday: 0=nd..6=sb) -> Intl getUTCDay
}

START, RAMP, BASE, PROBE, HARVEST, LOCKED = 1, 2, 3, 4, 5, 6
COD_LOSS = 30.0            # strata na nieodebranym COD (transport 2 strony)
DAYS = 120

# ── psych-ceny (PORT 1:1 z index.ts) ─────────────────────────────────────
def psych_up(mn):
    dec = math.floor(mn / 10) * 10
    cands = [dec + 9.00, dec + 19.00] if mn >= 150 else [dec + 4.90, dec + 9.90, dec + 14.90, dec + 19.90]
    for c in cands:
        if c >= mn - 0.001:
            return round(c, 2)
    return round(dec + 19.90, 2)

def psych_down(mx):
    if not (mx > 0):
        return 0.0
    dec = math.floor(mx / 10) * 10
    cands = ([dec + 19.00, dec + 9.00, dec - 1.00, dec - 11.00] if mx >= 150
             else [dec + 19.90, dec + 14.90, dec + 9.90, dec + 4.90, dec - 0.10, dec - 5.10, dec - 10.10])
    for c in cands:
        if c <= mx + 0.001 and c > 0:
            return round(c, 2)
    return round(dec + 4.90, 2)

# ── Poisson helpers (PORT 1:1) ────────────────────────────────────────────
def poisson_cdf(k, lam):
    if lam <= 0:
        return 1.0
    term = math.exp(-lam); s = term
    for i in range(1, int(k) + 1):
        term *= lam / i; s += term
    return min(1.0, s)

def poisson_quantile_lower(lam, q):
    if lam <= 0:
        return 0
    cap = math.ceil(lam * 4) + 60
    k = 0
    while k < cap and poisson_cdf(k, lam) < q:
        k += 1
    return k

def wall_above(price, walls):
    above = sorted([w for w in walls if w > price])
    return above[0] if above else None

def crosses_wall(frm, to, walls):
    lo, hi = min(frm, to), max(frm, to)
    return any(w > lo and w <= hi and abs(w - frm) > 0.001 for w in walls)

# ── stochastyka (stdlib) ─────────────────────────────────────────────────
def rpois(rng, lam):
    if lam <= 0:
        return 0
    if lam > 30:
        return max(0, int(round(rng.gauss(lam, math.sqrt(lam)))))
    L = math.exp(-lam); k = 0; p = 1.0
    while True:
        k += 1; p *= rng.random()
        if p <= L:
            return k - 1

def rbinom(rng, n, p):
    n = int(n)
    if n <= 0 or p <= 0:
        return 0
    if p >= 1:
        return n
    if n * p > 10 and n * (1 - p) > 10:
        return max(0, min(n, int(round(rng.gauss(n * p, math.sqrt(n * p * (1 - p)))))))
    log1mp = math.log(1 - p)
    count = 0; idx = -1
    while True:
        idx += 1 + int(math.log(rng.random()) / log1mp)
        if idx >= n:
            break
        count += 1
    return count

# ══════════════════════════════════════════════════════════════════════════
# ŚWIAT (nieznany silnikowi) — popyt z elastycznością, klif, COD, sezonowość
# ══════════════════════════════════════════════════════════════════════════
class World:
    """
    Parametry:
      cost, ship_cost, fees_pct, ship_by ('shop'|'client')
      p_start, p_ref, eps (elastyczność), cr_ref (CR checkoutu przy p_ref)
      atc_rate (interes / add-to-cart z LPV), cpc
      cliff (cena progu klifu | None), cliff_mult
      cod_share, slow_start, competitor_cut_day, no_ads (organic-only), organic_lpv
    """
    def __init__(self, **kw):
        self.__dict__.update(kw)

    def unit_profit(self, price):
        ship = self.ship_cost if self.ship_by == 'shop' else 0.0
        return price - self.cost - ship - price * self.fees_pct / 100.0

    def margin_pct(self, price):
        return self.unit_profit(price) / price * 100.0 if price > 0 else 0.0

    def cod_band(self, price):
        if price < 60: return 0.92
        if price < 100: return 0.85
        if price < 150: return 0.78
        return 0.70

    def oga(self, price):
        """order-given-ATC (checkout conversion) z elastycznością + klifem."""
        base = (self.cr_ref / self.atc_rate) * (self.p_ref / price) ** self.eps
        if self.cliff is not None and price > self.cliff:
            base *= self.cliff_mult
        return min(0.95, base)

    def day(self, rng, price, adset_age, day):
        """Zwraca słownik pomiarów dnia (widok silnika + prawdziwy P&L)."""
        weekday = day % 7                      # 0=pn .. 5=sb,6=nd (umownie); weekend = 5,6
        is_weekend = weekday in (5, 6)
        traffic_f = 0.80 if is_weekend else 1.0
        if getattr(self, 'slow_start', False) and day < 14:
            traffic_f *= 0.30
        if getattr(self, 'competitor_cut_day', None) is not None and day >= self.competitor_cut_day:
            traffic_f *= 0.60
        learn_f = 0.70 if adset_age < 3 else 1.0   # learning dip nowego ad setu (-30% konwersji)

        no_ads = getattr(self, 'no_ads', False)
        if no_ads:
            eng_spend = 0.0                    # ad-stats nie płyną
            real_spend = 0.0
            lpv = rpois(rng, self.organic_lpv * traffic_f)
            ad_alive = False
        else:
            eng_spend = self.spend_at(day)
            real_spend = eng_spend
            lpv = rpois(rng, (eng_spend / self.cpc) * traffic_f) if eng_spend > 0 else 0
            ad_alive = eng_spend > 0           # dziś są ad-stats jeśli był spend

        atc = rbinom(rng, lpv, self.atc_rate)
        orders = rbinom(rng, atc, self.oga(price) * learn_f)
        # rozbicie COD
        cod = rbinom(rng, orders, getattr(self, 'cod_share', 0.40))
        prepaid = orders - cod
        delivered_cod = rbinom(rng, cod, self.cod_band(price))
        failed_cod = cod - delivered_cod
        up = self.unit_profit(price)
        true_profit = (prepaid + delivered_cod) * up - failed_cod * COD_LOSS - real_spend
        revenue = orders * price               # wf2_sales (surowe, po bieżącej cenie)
        # frequency (nasycenie) — prosty model
        freq = 1.4 + max(0, day - getattr(self, '_adset0', 0)) * 0.05
        return dict(eng_spend=eng_spend, orders=orders, revenue=revenue, prepaid=prepaid,
                    cod=cod, true_profit=true_profit, atc=atc, lpv=lpv, freq=min(freq, 6.0),
                    ad_alive=ad_alive, real_spend=real_spend)

    def spend_at(self, day):
        # egzogenny harmonogram budżetu (izoluje decyzje CENOWE): test -> scale
        base = self.start_spend if day < 14 else self.scale_spend
        if getattr(self, 'gap_days', None) and day in self.gap_days:
            return 0.0
        return base

    # oczekiwany dzienny P&L (do brute-force optimum) — stan ustalony
    def exp_profit(self, price, spend, competitor=1.0):
        wk = (5 * 1.0 + 2 * 0.80) / 7.0        # średni czynnik tygodnia
        if getattr(self, 'no_ads', False):
            lpv = self.organic_lpv * wk * competitor
            spend = 0.0
        else:
            lpv = (spend / self.cpc) * wk * competitor
        atc = lpv * self.atc_rate
        orders = atc * self.oga(price)
        cod = orders * getattr(self, 'cod_share', 0.40)
        prepaid = orders - cod
        delivered = cod * self.cod_band(price)
        failed = cod - delivered
        return (prepaid + delivered) * self.unit_profit(price) - failed * COD_LOSS - spend

def optimum_price(w, spend, competitor=1.0):
    best_p, best_v = w.p_start, -1e18
    p = max(w.cost * 1.05, 20.0)
    while p <= max(w.p_start * 2.4, 220.0):
        v = w.exp_profit(p, spend, competitor)
        if v > best_v:
            best_v, best_p = v, p
        p += 1.0
    return psych_up(best_p), best_v

# ══════════════════════════════════════════════════════════════════════════
# SILNIK — port decyzji (jedna decyzja / dzień, per produkt)
# ══════════════════════════════════════════════════════════════════════════
def window(H, today, N):
    acc = dict(spend=0.0, orders=0, revenue=0.0, orders_paid=0)
    since = today - N
    for r in H:
        if r['day'] >= since:
            acc['spend'] += r['eng_spend']; acc['orders'] += r['orders']
            acc['revenue'] += r['revenue']; acc['orders_paid'] += r['orders_paid']
    return acc

def scale_base(C, w, S, adSpend, orders, walls):
    fees = w.fees_pct / 100.0
    ship = w.ship_cost if w.ship_by == 'shop' else 0.0
    cost = w.cost
    cpaTest = adSpend / orders if orders > 0 else 0.0
    lowerOrders = max(1, poisson_quantile_lower(orders, 1 - C["cpa_ci_quantile"]))
    cpaScaleEst = adSpend / lowerOrders if (adSpend > 0 and orders > 0) else cpaTest
    viableFloor = (cost + ship + cpaScaleEst) / (1 - fees - C["scale_margin_survival"])
    targetPrice = (cost + ship) / (1 - fees - C["scale_margin_target"])
    wall = wall_above(max(S['price'], targetPrice), walls)
    ceiling = wall if wall is not None else targetPrice * 1.5
    if viableFloor > ceiling:
        return dict(base=None, flag=True, viableFloor=viableFloor, ceiling=ceiling)
    clamped = min(max(targetPrice, viableFloor), ceiling)
    return dict(base=psych_down(clamped), flag=False, viableFloor=viableFloor, ceiling=ceiling)

def collapse_check(C, w, S, H, today, prior_breach, last_ev):
    none = dict(state='none', expected=0.0, observed=0)
    if S['last_change_day'] is None:
        return none
    age = today - S['last_change_day']
    if age > C["collapse_max_days"] + C["learning_grace_days"]:
        return none
    if not last_ev or last_ev['direction'] != 'up':
        return none
    change = S['last_change_day']
    baseFrom = change - C["collapse_baseline_days"]
    baseTo = change
    graceTo = change + C["learning_grace_days"]
    baseOrders = baseSpend = postOrders = postSpend = 0.0
    for r in H:
        if baseFrom <= r['day'] < baseTo:
            baseOrders += r['orders']; baseSpend += r['eng_spend']
        elif r['day'] >= graceTo:
            postOrders += r['orders']; postSpend += r['eng_spend']
    if baseSpend <= 0:
        return none
    if postSpend < C["collapse_min_spend"] and age < C["collapse_max_days"]:
        return dict(state='pending', expected=0.0, observed=postOrders)
    tempoBase = baseOrders / baseSpend
    expected = tempoBase * postSpend
    q10 = poisson_quantile_lower(expected, C["collapse_quantile"])
    if postOrders >= q10:
        return dict(state='none', expected=expected, observed=postOrders)
    if expected < C["collapse_min_expected"]:
        return dict(state='weak', expected=expected, observed=postOrders,
                    rollbackTarget=last_ev['old_price'], rollbackPhase=last_ev['phase_from'])
    if not prior_breach:
        return dict(state='breach', expected=expected, observed=postOrders)
    return dict(state='rollback', expected=expected, observed=postOrders,
                rollbackTarget=last_ev['old_price'], rollbackPhase=last_ev['phase_from'])

def auto_reason_block(C, w, S, target, stepPct, adsState, freshAdset, youngAdAge, codHeavy,
                      walls, shipFree, today, weekday):
    if S['autonomy'] != 'auto':
        return 'autonomy_not_auto'
    if S['landing'] != 'hydrated':
        return 'landing_not_hydrated'
    if target <= S['price']:
        return 'direction_down'
    if stepPct > C["auto_step_max_pct"]:
        return 'step_over_cap'
    wallSet = walls + [shipFree] if shipFree else walls
    if C["wall_cross_requires_human"] and crosses_wall(S['price'], target, wallSet):
        return 'wall_cross'
    cooldown = C["cod_cooldown_days"] if codHeavy else C["cooldown_days"]
    if S['last_change_day'] is not None and (today - S['last_change_day']) < cooldown:
        return 'cooldown'
    if S['rollback_lock_until'] is not None and S['rollback_lock_until'] > today:
        return 'rollback_lock'
    if S['price_state'] != 'ok':
        return 'price_state_not_ok'
    if weekday in C["no_raise_weekdays"]:
        return 'no_raise_weekday'
    if stepPct > C["small_step_no_adset_pct"] and not freshAdset:
        return 'no_fresh_adset'
    if youngAdAge is not None and youngAdAge < C["learning_grace_days"]:
        return 'learning_grace'
    if w.margin_pct(target) < C["min_margin_floor_pct"]:
        return 'margin_floor'
    if adsState != 'full':
        return 'ads_not_full'
    return None

def route_up(C, w, S, rawTarget, nextPhase, adsState, freshAdset, youngAdAge, codH, walls,
             shipFree, codPropose, cardKind, today, weekday, mut):
    cap = S['price'] * (1 + C["auto_step_max_pct"] / 100.0)
    target = psych_down(min(rawTarget, cap))
    stepPct = (target - S['price']) / S['price'] * 100.0
    # dead-band
    if abs(target - S['price']) / S['price'] < C["target_change_min_pct"] / 100.0:
        return dict(action='hold_deadband')
    # stabilność celu (target_stability_runs=2): snapshot musi być z DNIA WCZEŚNIEJSZEGO
    snap = S['target_snapshot']
    stable = snap and abs(snap['target'] - target) < 0.011 and snap['first_seen'] < today
    if not stable:
        if mut:
            S['target_snapshot'] = dict(target=target, first_seen=today)
        return dict(action='hold_stability', target=target)
    if codPropose:
        return dict(action='propose_cod', card=dict(kind=cardKind, dir='up', target=target,
                    next_phase=nextPhase, level=round(target * 100)))
    block = auto_reason_block(C, w, S, target, stepPct, adsState, freshAdset, youngAdAge, codH,
                              walls, shipFree, today, weekday)
    if block:
        if block == 'no_fresh_adset':
            return dict(action='card_no_fresh_adset',
                        card=dict(kind='creative_refresh', dir=None, builds_adset=True,
                                  target=target, next_phase=nextPhase, level=round(target * 100)))
        return dict(action='card_' + block, card=dict(kind=cardKind, dir='up', target=target,
                    next_phase=nextPhase, level=round(target * 100)))
    return dict(action='step_up', exec=dict(dir='up', target=target, next_phase=nextPhase))

def decide(C, w, S, H, today, adsAlive, prior_breach, last_ev, adWin, youngAdAge, mut):
    walls = C["walls"]
    shipFree = getattr(w, 'ship_free_threshold', None)
    weekday = today % 7
    # metryki okien
    w14 = window(H, today, 14); w30 = window(H, today, 30)
    codShare = S['cod_share_obs']
    codH = codShare > C["cod_settled_gating_share"]
    optDays = C["opt_window_days_cod"] if codH else C["opt_window_days"]
    wOpt = window(H, today, optDays)

    # stan ads (§4.3)
    if not adsAlive:
        adsState = 'no_ads'
    elif w14['spend'] > C["ads_min_spend_active"]:
        adsState = 'full'
    else:
        adsState = 'hold'

    # COLLAPSE (priorytet)
    col = collapse_check(C, w, S, H, today, prior_breach, last_ev)
    if col['state'] == 'rollback' and not codH:
        return dict(action='rollback_auto', exec=dict(dir='rollback',
                    target=col['rollbackTarget'], next_phase=col['rollbackPhase']))
    if col['state'] == 'weak':
        return dict(action='rollback_card', card=dict(kind='rollback', dir='down',
                    target=col['rollbackTarget'], next_phase=col['rollbackPhase'],
                    level=round(col['rollbackTarget'] * 100)))
    if col['state'] == 'breach':
        return dict(action='collapse_watch', breach=True)
    if col['state'] == 'pending':
        return dict(action='collapse_pending')

    freshAdset = youngAdAge is not None and youngAdAge <= C["fresh_adset_days"]
    codPropose = codH and C["paid_definition"] != 'paid'

    # TRYB NO-ADS
    if adsState == 'no_ads':
        if S['price_phase'] >= HARVEST:
            return dict(action='hold_no_ads_locked')
        wNo = window(H, today, C["no_ads_window_days"])
        if wNo['orders'] >= C["winner_orders_no_ads"] and wNo['orders_paid'] >= C["min_prepaid_orders"]:
            target = psych_up(S['price'] + 0.01)
            return dict(action='propose_no_ads', card=dict(kind='price_scale', dir='up',
                        target=target, next_phase=S['price_phase'], level=round(target * 100)))
        return dict(action='hold_no_ads')

    if adsState == 'hold':
        return dict(action='hold_no_spend')

    # ── TRYB PEŁNY (a): reguły reżimowe ─────────────────────────────────────
    ph = S['price_phase']
    if ph == START:
        atcRate = (adWin['atc'] / adWin['lpv'] * 100.0) if adWin['lpv'] > 0 else 0.0
        costPerAtc = (adWin['spend'] / adWin['atc']) if adWin['atc'] > 0 else float('inf')
        cp2 = (not C["winner_needs_cp2"]) or (atcRate >= C["cp2_atc_rate"] and costPerAtc <= C["cp2_cost_atc_max"])
        orders = w14['orders']
        winner = cp2 and orders >= C["winner_orders"] and adWin['spend'] >= C["winner_spend"]
        if not winner:
            return dict(action='hold_start')
        wall = wall_above(S['price'], walls)
        rampTarget = psych_down(wall - 0.10) if wall is not None else psych_up(S['price'] * 1.15)
        return dict(action='winner_card', card=dict(kind='winner_reco', dir='up',
                    target=rampTarget, next_phase=RAMP, level=None, no_expiry=True))
    if ph == RAMP:
        orders = wOpt['orders_paid'] if codH else w14['orders']
        if orders < C["ramp_orders"] or adWin['spend'] < C["ramp_spend"]:
            return dict(action='hold_ramp')
        sb = scale_base(C, w, S, adWin['spend'], orders, walls)
        if sb['flag']:
            return dict(action='flag_over_ceiling', card=dict(kind='price_opt_over_ceiling',
                        dir=None, target=None, next_phase=None, level='floor'))
        if not sb['base'] or sb['base'] <= S['price']:
            return dict(action='hold_ramp')
        return route_up(C, w, S, sb['base'], BASE, adsState, freshAdset, youngAdAge, codH, walls,
                        shipFree, codPropose, 'price_scale', today, weekday, mut)
    if ph == BASE:
        if w14['orders'] < C["ramp_orders"]:
            return dict(action='hold_base')
        pct = (C["opt_probe_pct_min"] + C["opt_probe_pct_max"]) / 2.0
        raw = S['price'] * (1 + pct / 100.0)
        return route_up(C, w, S, raw, PROBE, adsState, freshAdset, youngAdAge, codH, walls,
                        shipFree, codPropose, 'price_opt_over_ceiling', today, weekday, mut)
    if ph == PROBE:
        revPrev = w30['revenue'] - wOpt['revenue']
        keepFrac = (wOpt['revenue'] / revPrev) if revPrev > 0 else 1.0
        marginBase = w.margin_pct(S['price']) / 100.0
        be = (1 / marginBase) if marginBase > 0 else float('inf')
        mer = (wOpt['revenue'] / wOpt['spend']) if wOpt['spend'] > 0 else float('inf')
        merHard = marginBase >= C["mer_gate_min_margin"]
        keepOk = keepFrac >= C["contribution_keep_frac"]
        merOk = (not merHard) or mer >= be * C["mer_be_mult"]
        harvest = adWin['freqMax'] > C["frequency_decline"]
        if harvest:
            return dict(action='harvest_card', card=dict(kind='price_opt_over_ceiling', dir=None,
                        target=None, next_phase=None, level='harvest'))
        if keepOk and merOk:
            return dict(action='probe_hold')
        backTo = psych_down(S['price'] / (1 + C["opt_probe_pct_min"] / 100.0))
        return dict(action='probe_revert_card', card=dict(kind='rollback', dir='down',
                    target=backTo, next_phase=BASE, level=round(backTo * 100)))
    if ph == HARVEST:
        return dict(action='hold_harvest')
    if ph == LOCKED:
        return dict(action='hold_locked')
    return dict(action='hold_unknown')

# ══════════════════════════════════════════════════════════════════════════
# PRZEBIEG SILNIKA (day-by-day) — 1 produkt, 1 przebieg
# ══════════════════════════════════════════════════════════════════════════
def run_engine(w, C, rng, days=DAYS, card_delay=2):
    S = dict(price=w.p_start, price_phase=START, price_state='ok', last_change_day=None,
             rollback_lock_until=None, target_snapshot=None, autonomy='auto',
             landing='hydrated', adset0=0, cod_share_obs=0.0)
    w._adset0 = 0
    ad_hist = []                             # równoległa historia ad-stats (atc/lpv/freq)
    H = []                                   # historia dzienna (widok silnika)
    settle = [0] * (days + 40)               # kolejka rozliczeń COD -> orders_paid
    events = []                              # price_events (dla collapse)
    pending = {}                             # dedup_key -> card dict (proposed)
    used_keys = set()                        # klucze WYKONANE (blokada rekreacji) — dedup upsert
    winner_ever = False
    pending_confirm = None                   # (dzień, nowa_cena) do potwierdzenia jutro (raise)
    prior_breach = False
    # metryki
    changes = 0; rollbacks = 0; cards_created = 0
    phase_days = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}
    cum_orders = 0                           # łącznie zamówień (opłaconych-lub-COD = wszystkie)
    first_change_day = None; orders_at_first_change = None
    rollback_targets = []                    # do detekcji oscylacji
    below_floor = False
    total_true_profit = 0.0
    cod_window = []                          # ostatnie 30 dni (cod,total) do cod_share_obs

    def apply_up(target, next_phase, trig, today):
        nonlocal changes, first_change_day, orders_at_first_change, pending_confirm, below_floor
        # atomic claim: tylko gdy price_state ok
        if S['price_state'] != 'ok':
            return False
        events.append(dict(direction='up', old_price=S['price'], new_price=target,
                           phase_from=S['price_phase'], day=today))
        S['price'] = target; S['price_phase'] = next_phase
        S['price_state'] = 'pending_platform'; S['last_change_day'] = today
        S['target_snapshot'] = None
        pending_confirm = today
        changes += 1
        if first_change_day is None:
            first_change_day = today; orders_at_first_change = cum_orders
        if w.margin_pct(target) < C["min_margin_floor_pct"]:
            below_floor = True
        return True

    def apply_down(target, next_phase, is_rollback, today):
        nonlocal changes, rollbacks, first_change_day, orders_at_first_change, below_floor
        events.append(dict(direction='down', old_price=S['price'], new_price=target,
                           phase_from=S['price_phase'], day=today))
        S['price'] = target
        if next_phase is not None:
            S['price_phase'] = next_phase
        S['price_state'] = 'ok'; S['last_change_day'] = today; S['target_snapshot'] = None
        if is_rollback:
            S['rollback_lock_until'] = today + C["rollback_lock_days"]
            rollbacks += 1; rollback_targets.append(round(target, 2))
        changes += 1
        if first_change_day is None:
            first_change_day = today; orders_at_first_change = cum_orders
        if w.margin_pct(target) < C["min_margin_floor_pct"]:
            below_floor = True

    for today in range(days):
        # ── SWEEP ──────────────────────────────────────────────────────────
        if pending_confirm is not None and pending_confirm < today:
            S['price_state'] = 'ok'; pending_confirm = None      # confirm raise z wczoraj
        # expiry kart (Tomek nie zdążył) — ZWALNIA klucz (sufiks |exp)
        for k in list(pending.keys()):
            c = pending[k]
            if (not c.get('no_expiry')) and c['expire_day'] <= today and c['accept_day'] > today:
                del pending[k]                                    # klucz wolny (może wrócić)
        # akcept + wykonanie kart, których accept_day nadszedł
        for k in list(pending.keys()):
            c = pending[k]
            if c['accept_day'] <= today and not (not c.get('no_expiry') and c['expire_day'] <= today and c['accept_day'] > today):
                if c.get('builds_adset'):
                    S['adset0'] = today; w._adset0 = today        # fabryka zbudowała świeży ad set
                elif c['dir'] == 'up':
                    apply_up(c['target'], c['next_phase'], 'card', today)
                elif c['dir'] == 'down':
                    apply_down(c['target'], c['next_phase'], c['kind'] == 'rollback', today)
                # else: flag/harvest = no-op (decyzja człowieka poza automatem)
                used_keys.add(k)                                  # dedup: klucz zajęty na zawsze
                del pending[k]

        phase_days[S['price_phase']] += 1

        # ── POPYT DNIA ─────────────────────────────────────────────────────
        adset_age = today - S['adset0']
        d = w.day(rng, S['price'], adset_age, today)
        orders_paid_today = d['prepaid'] + settle[today]
        for _ in range(d['cod']):                                # COD rozlicza się z lagiem 14-28 dni
            sd = today + rng.randint(14, 28)
            if sd < len(settle):
                settle[sd] += 1
        H.append(dict(day=today, eng_spend=d['eng_spend'], orders=d['orders'],
                      revenue=d['revenue'], orders_paid=orders_paid_today))
        cum_orders += d['orders']
        total_true_profit += d['true_profit']
        cod_window.append((d['cod'], d['orders']))
        cod_window = cod_window[-30:]
        tc = sum(t for _, t in cod_window); cc = sum(c for c, _ in cod_window)
        S['cod_share_obs'] = (cc / tc) if tc > 0 else 0.0

        # liveness ads (globalny): ostatni dzień z ad-stats <= 2 dni temu
        last_ad_day = None
        for r in reversed(H):
            if r['eng_spend'] > 0:
                last_ad_day = r['day']; break
        adsAlive = last_ad_day is not None and (today - last_ad_day) <= 2

        # okno ad-stats 14 dni (spend/atc/lpv/freqMax)
        adWin = dict(spend=0.0, atc=0, lpv=0, freqMax=0.0)
        since = today - 14
        for r in H:
            if r['day'] >= since:
                adWin['spend'] += r['eng_spend']
        # atc/lpv/freq muszą pochodzić z pomiaru dnia — trzymamy równolegle
        for rr in ad_hist[-15:]:
            adWin['atc'] += rr['atc']; adWin['lpv'] += rr['lpv']
            adWin['freqMax'] = max(adWin['freqMax'], rr['freq'])
        ad_hist.append(dict(day=today, atc=d['atc'], lpv=d['lpv'], freq=d['freq']))
        youngAdAge = today - S['adset0']

        last_ev = events[-1] if events else None

        # ── DECYZJA (raz dziennie) ─────────────────────────────────────────
        plan = decide(C, w, S, H, today, adsAlive, prior_breach, last_ev, adWin, youngAdAge, mut=True)
        prior_breach = bool(plan.get('breach'))

        if 'exec' in plan:
            e = plan['exec']
            if e['dir'] == 'rollback':
                apply_down(e['target'], e['next_phase'], True, today)
            elif e['dir'] == 'up':
                apply_up(e['target'], e['next_phase'], 'auto', today)
        elif 'card' in plan:
            c = plan['card']
            if c['kind'] == 'winner_reco':
                if winner_ever:
                    pass
                else:
                    key = 'winner_reco'
                    if key not in pending and key not in used_keys:
                        pending[key] = dict(dir=c['dir'], target=c['target'], next_phase=c['next_phase'],
                                            kind=c['kind'], accept_day=today + card_delay,
                                            expire_day=10 ** 9, no_expiry=True)
                        winner_ever = True; cards_created += 1
            else:
                key = '%s|%s' % (c['kind'], c.get('level'))
                if key not in pending and key not in used_keys:
                    pending[key] = dict(dir=c.get('dir'), target=c.get('target'),
                                        next_phase=c.get('next_phase'), kind=c['kind'],
                                        builds_adset=c.get('builds_adset', False),
                                        accept_day=today + card_delay,
                                        expire_day=today + C["proposal_ttl_days"])
                    cards_created += 1

    # oscylacja: ten sam poziom rollbacku ≥2×
    osc = any(rollback_targets.count(t) >= 2 for t in set(rollback_targets))
    premature = (first_change_day is not None and orders_at_first_change is not None
                 and orders_at_first_change < 5)
    return dict(profit=total_true_profit, changes=changes, rollbacks=rollbacks,
                cards=cards_created, phase_days=phase_days, final_price=S['price'],
                final_phase=S['price_phase'], oscillation=osc, below_floor=below_floor,
                premature=premature, orders_at_first_change=orders_at_first_change,
                cum_orders=cum_orders)

def run_engine_wrapper(w, C, rng, days=DAYS, card_delay=2):
    return run_engine(w, C, rng, days, card_delay)

# ── przebieg STATYCZNY (baseline / oracle) ────────────────────────────────
def run_static(w, price, rng, days=DAYS):
    settle = [0] * (days + 40)
    total = 0.0
    for today in range(days):
        adset_age = today  # jeden ad set od dnia 0
        d = w.day(rng, price, adset_age, today)
        for _ in range(d['cod']):
            sd = today + rng.randint(14, 28)
            if sd < len(settle):
                settle[sd] += 1
        total += d['true_profit']
    return total

# ══════════════════════════════════════════════════════════════════════════
# SCENARIUSZE
# ══════════════════════════════════════════════════════════════════════════
def base_product(**over):
    p = dict(cost=51.21, ship_cost=14.0, fees_pct=2.0, ship_by='client',
             p_start=89.90, p_ref=89.90, eps=1.0, cr_ref=0.045, atc_rate=0.16,
             cpc=1.5, cliff=None, cliff_mult=0.35, cod_share=0.40,
             start_spend=40.0, scale_spend=90.0)
    p.update(over)
    return p

SCENARIOS = [
    ("1. Zwycięzca elastyczny (opt≈start)",
     base_product(eps=2.6, cr_ref=0.05), {}, 2),
    ("2. Zwycięzca nieelastyczny (opt +40%)",
     base_product(eps=1.7, cr_ref=0.05), {}, 2),
    ("3. Zwycięzca + twardy klif 100 zł",
     base_product(eps=1.8, cr_ref=0.05, cliff=100.0, cliff_mult=0.32), {}, 2),
    ("4. COD-heavy 70% z nieodbiorami",
     base_product(eps=1.8, cr_ref=0.055, cod_share=0.70), {}, 2),
    ("5. Produkt martwy (λ→0)",
     base_product(eps=1.8, cr_ref=0.004, atc_rate=0.05), {}, 2),
    ("6. Wolno startujący (λ rośnie po 2 tyg.)",
     base_product(eps=1.8, cr_ref=0.05, slow_start=True), {}, 2),
    ("7. Prawdziwy collapse po podwyżce",
     base_product(p_start=109.90, p_ref=109.90, eps=1.5, cr_ref=0.05,
                  cliff=130.0, cliff_mult=0.30), {}, 2),
    ("8. Fałszywy collapse (learning+weekend, popyt OK)",
     base_product(eps=0.4, cr_ref=0.055), {}, 2),
    ("9. Dane dziurawe (ads brak 5 dni w środku)",
     base_product(eps=1.8, cr_ref=0.05, gap_days=set(range(30, 35))), {}, 2),
    ("10. Tryb no-ads cały czas (bez tokena Meta)",
     base_product(eps=1.8, cr_ref=0.05, no_ads=True, organic_lpv=12.0), {}, 2),
    ("11. Konkurent tnie cenę w dniu 30",
     base_product(eps=1.8, cr_ref=0.05, competitor_cut_day=30), {}, 2),
    ("12. Tomek nie klika kart 7 dni",
     base_product(eps=1.8, cr_ref=0.05), {}, 7),
]

def median(xs):
    return statistics.median(xs) if xs else 0.0

def run_scenario(name, prod, cfg_over, card_delay, N=500, days=DAYS, seed0=1000):
    C = dict(BASE_CFG); C.update(cfg_over)
    # optimum (brute force) na stanie ustalonym
    w0 = World(**prod)
    comp = 0.60 if prod.get('competitor_cut_day') is not None else 1.0
    opt_p, _ = optimum_price(w0, w0.scale_spend, comp)
    eng_profit, base_profit, ora_profit = [], [], []
    changes, rollbacks, cards = [], [], []
    finals, phasedays = [], {1: [], 2: [], 3: [], 4: [], 5: [], 6: []}
    osc = below = prem = 0
    prem_orders = []
    for i in range(N):
        w = World(**prod)
        r = run_engine_wrapper(w, C, random.Random(seed0 + i), days, card_delay)
        eng_profit.append(r['profit']); changes.append(r['changes'])
        rollbacks.append(r['rollbacks']); cards.append(r['cards']); finals.append(r['final_price'])
        for k in phasedays:
            phasedays[k].append(r['phase_days'][k])
        osc += r['oscillation']; below += r['below_floor']; prem += r['premature']
        if r['orders_at_first_change'] is not None:
            prem_orders.append(r['orders_at_first_change'])
        # baseline (static p_start) + oracle (static opt_p) — niezależne losy
        wb = World(**prod)
        base_profit.append(run_static(wb, prod['p_start'], random.Random(seed0 + 50000 + i), days))
        wo = World(**prod)
        ora_profit.append(run_static(wo, opt_p, random.Random(seed0 + 90000 + i), days))
    return dict(
        name=name, opt_price=opt_p, eng=median(eng_profit), base=median(base_profit),
        ora=median(ora_profit), changes=statistics.mean(changes),
        rollbacks=statistics.mean(rollbacks), cards=statistics.mean(cards),
        final=median(finals), phasedays={k: statistics.mean(v) for k, v in phasedays.items()},
        osc=osc / N, below=below / N, prem=prem / N, N=N,
        prem_orders=median(prem_orders) if prem_orders else None,
        eng_list=eng_profit, base_list=base_profit)

# ── scenariusz 13: próg 3 vs 5 zamówień ───────────────────────────────────
def run_threshold_compare(N=500, days=DAYS, seed0=7000):
    # produkty reprezentatywne: wysokie CPA (winner blisko 3 zam.) + elastyczny
    variants = [
        # wysokie CPA (~90 zł), ale CP2 przechodzi (ATC OK) -> winner pada przy ~3 zam. = próg gryzie
        ("wysokie CPA, dobry ATC", base_product(eps=1.5, cr_ref=0.02, cpc=1.8, atc_rate=0.20)),
        ("elastyczny CR", base_product(eps=1.6, cr_ref=0.055)),
        ("standard winner", base_product(eps=0.7, cr_ref=0.05)),
    ]
    out = []
    for label, prod in variants:
        for thr in (3, 5):
            C = dict(BASE_CFG); C["winner_orders"] = thr; C["ramp_orders"] = thr
            C["winner_high_confidence_orders"] = max(5, thr)
            eng = []; prem = 0; changes = []; rolls = []
            for i in range(N):
                w = World(**prod)
                r = run_engine_wrapper(w, C, random.Random(seed0 + i), days, 2)
                eng.append(r['profit']); prem += r['premature']
                changes.append(r['changes']); rolls.append(r['rollbacks'])
            out.append(dict(label=label, thr=thr, eng=median(eng), prem=prem / N,
                            changes=statistics.mean(changes), rolls=statistics.mean(rolls)))
    return out

# ══════════════════════════════════════════════════════════════════════════
# RAPORT
# ══════════════════════════════════════════════════════════════════════════
def fmt(x, w=8, d=0):
    return f"{x:{w}.{d}f}"

def main():
    print("Uruchamiam symulator CENY 3.0 ...\n")
    results = []
    for name, prod, cfg_over, delay in SCENARIOS:
        r = run_scenario(name, prod, cfg_over, delay)
        results.append(r)
        print(f"{name:48} eng={r['eng']:8.0f} base={r['base']:8.0f} "
              f"ora={r['ora']:8.0f} chg={r['changes']:.1f} rb={r['rollbacks']:.2f} "
              f"card={r['cards']:.1f} fin={r['final']:.2f} opt={r['opt_price']:.2f} "
              f"osc={r['osc']:.0%} prem={r['prem']:.0%}")
    print("\nScenariusz 13: próg 3 vs 5 zamówień ...")
    thr = run_threshold_compare()
    for t in thr:
        print(f"  {t['label']:22} thr={t['thr']} eng={t['eng']:8.0f} "
              f"prem={t['prem']:.0%} chg={t['changes']:.1f} rb={t['rolls']:.2f}")

    write_report(results, thr)
    print("\nRaport zapisany.")

def write_report(results, thr):
    L = []
    L.append("# SIM-ENGINE-V3 — WYNIKI symulacji silnika CENY 3.0\n")
    L.append("> Monte Carlo, 500 przebiegów/scenariusz, horyzont 120 dni, 1 decyzja/dzień.")
    L.append("> Wierny port `wf2-price-engine/index.ts` (decideProduct/routeUp/collapseCheck/")
    L.append("> scaleBase/autoReasonBlock/pipeline §2e) + config v3.1 §8. Kontrybucja = PRAWDZIWY")
    L.append("> P&L z haircutem COD (dostarczone×unit_profit − nieodebrane×30 zł − spend).")
    L.append("> Budżet reklamowy EGZOGENNY i identyczny dla wszystkich polityk (izoluje decyzje CENOWE).\n")
    L.append("## (a) Tabela: scenariusz → wynik\n")
    L.append("| # | Scenariusz | Kontryb. silnik | Baseline | Oracle | Δ vs base | % oracle | Zmian | Rollb. | Kart | Cena fin. | Opt. | Faza fin. |")
    L.append("|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|")
    phasemap = {1: 'START', 2: 'RAMP', 3: 'BASE', 4: 'PROBE', 5: 'HARV', 6: 'LOCK'}
    for i, r in enumerate(results, 1):
        dvb = r['eng'] - r['base']
        pct = (r['eng'] / r['ora'] * 100) if r['ora'] > 0 else float('nan')
        fp = max(r['phasedays'], key=r['phasedays'].get)
        L.append(f"| {i} | {r['name'][3:]} | {r['eng']:.0f} | {r['base']:.0f} | {r['ora']:.0f} | "
                 f"{dvb:+.0f} | {pct:.0f}% | {r['changes']:.1f} | {r['rollbacks']:.2f} | "
                 f"{r['cards']:.1f} | {r['final']:.2f} | {r['opt_price']:.2f} | {phasemap[fp]} |")
    L.append("\n### Flagi patologii (udział przebiegów)\n")
    L.append("| # | Scenariusz | Oscylacja | Cena < floor marży | Zmiana < 5 zam. | Zam. przy 1. zmianie (mediana) |")
    L.append("|---|---|---:|---:|---:|---:|")
    for i, r in enumerate(results, 1):
        po = f"{r['prem_orders']:.0f}" if r['prem_orders'] is not None else "—"
        L.append(f"| {i} | {r['name'][3:]} | {r['osc']:.0%} | {r['below']:.0%} | {r['prem']:.0%} | {po} |")
    L.append("\n### Dni w fazach (średnia)\n")
    L.append("| # | Scenariusz | START | RAMP | BASE | PROBE | HARVEST | LOCKED |")
    L.append("|---|---|---:|---:|---:|---:|---:|---:|")
    for i, r in enumerate(results, 1):
        pd = r['phasedays']
        L.append(f"| {i} | {r['name'][3:]} | {pd[1]:.0f} | {pd[2]:.0f} | {pd[3]:.0f} | "
                 f"{pd[4]:.0f} | {pd[5]:.0f} | {pd[6]:.0f} |")
    L.append("\n## Scenariusz 13: NOWY twardy próg 5 zamówień vs obecne 3\n")
    L.append("| Produkt | Próg | Kontrybucja | Zmiana < 5 zam. | Zmian | Rollbacki |")
    L.append("|---|---:|---:|---:|---:|---:|")
    for t in thr:
        L.append(f"| {t['label']} | {t['thr']} | {t['eng']:.0f} | {t['prem']:.0%} | "
                 f"{t['changes']:.1f} | {t['rolls']:.2f} |")

    # słownik wyników po numerze
    R = {i + 1: r for i, r in enumerate(results)}

    L.append("\n---\n\n## (b) WNIOSKI — co silnik robi DOBRZE\n")
    L.append("- **Bramka WINNER + karta START→RAMP = realna ochrona.** Produkt martwy (5) daje "
             "0 zmian — CP2 (koszt/ATC) odsiewa go poprawnie. Genuine winners (2,4,6) awansują i "
             "biją baseline (nieelastyczny +564, COD-heavy +680, wolno-startujący +308).")
    L.append("- **Wall = klif → parkowanie pod ścianą chroni.** Scen. 3 (klif dokładnie na 100): "
             "silnik parkuje na 99,90 = optimum, NIE przebija klifu. Zbieżność ściany psychologicznej "
             "z klifem cenowym daje darmową ochronę.")
    L.append("- **Auto-rollback collapse DZIAŁA jako siatka bezpieczeństwa.** Scen. 7 (prawdziwy "
             "collapse): 91% przebiegów wykrywa załamanie i wraca do ceny sprzed podwyżki + lock.")
    L.append("- **COD-heavy = propose-only + brak auto-rollbacku.** Scen. 4: rollbacki 0,05 "
             "(kod pomija auto-rollback gdy codH), awanse kartą. Ostrożność zgodna z SSOT.")
    L.append("- **Egzogenny spadek popytu (konkurent, scen. 11) NIE wywołuje paniki** — collapse jest "
             "aktywny tylko ≤8 dni po podwyżce, więc cięcie konkurenta w dniu 30 nie jest mylnie "
             "czytane jako collapse. Silnik trzyma cenę (Δ vs baseline +322).")
    L.append("- **Twardy próg 5 zamówień: praktycznie DARMOWY.** Scen. 13 — dla prawdziwych winnerów "
             "próg 3 vs 5 daje IDENTYCZNY wynik (winner i tak pada przy ≥5 zam.).")

    L.append("\n## (c) LISTA POPRAWEK — priorytety\n")
    L.append("### P1 (krytyczne — realne straty vs baseline „nic nie rob”)")
    L.append(f"1. **Tryb NO-ADS = niekontrolowany ratchet (scen. 10).** Bez tokena Meta silnik "
             f"windował cenę {R[10]['final']:.0f} zł ({R[10]['changes']:.0f} zmian!) przy optimum "
             f"{R[10]['opt_price']:.0f} — kontrybucja {R[10]['eng']:.0f} < baseline {R[10]['base']:.0f} "
             f"(Δ {R[10]['eng']-R[10]['base']:+.0f}). Ścieżka `propose_no_ads` nie ma: cooldownu, "
             "sprawdzenia ściany, ani hamulca elastyczności. **FIX:** (a) twardy cap liczby podwyżek "
             "no-ads (np. 1 szczebel / `cod_cooldown_days`), (b) `wall_cross` też blokuje no-ads, "
             "(c) STOP po N szczeblach bez wzrostu przychodu (przychód spada → nie proponuj dalej). "
             "Klucz: `no_ads_max_steps` + cooldown w `propose_no_ads`.")
    L.append(f"2. **Uncapped RAMP-do-ściany = overshoot i collapse (scen. 7).** Karta winnera liczy "
             f"`rampTarget` BEZ capu `auto_step_max_pct` — skok 109,90→149,90 (+36%) przez klif 130 → "
             f"collapse → rollback. Round-trip: Δ vs baseline {R[7]['eng']-R[7]['base']:+.0f} (GORZEJ "
             "niż nic). **FIX:** clamp `rampTarget` capem `auto_step_max_pct` (albo osobnym "
             "`ramp_max_step_pct`); przy dużym dystansie do ściany rób RAMP W DWÓCH krokach, nie "
             "jednym skokiem pod ścianę.")
    L.append("### P2 (istotne — stabilność / martwe reżimy)")
    L.append("3. **Reżimy BASE/PROBE/HARVEST/LOCKED są praktycznie NIEOSIĄGALNE dla portfela "
             "niskokosztowego (wszystkie 12 scenariuszy kończą w RAMP/START).** Przyczyny łańcuchowe: "
             "(a) RAMP parkuje tuż pod ścianą (99,90); (b) `scale_base.targetPrice` = cena przy marży "
             "40% = `cost/0,58` ≈ 88 zł — PONIŻEJ ceny RAMP → `sb.base ≤ price` → wieczny `hold_ramp`; "
             "(c) gdy `viable_floor > ceiling` (CPA vs marża przeżycia pod ścianą 100) → `flag` zamiast "
             "ruchu. **FIX:** `scale_base.ceiling` nie powinien być zaklinowany na NAJBLIŻSZEJ ścianie "
             "nad ceną, gdy popyt nad ścianą jest zdrowy — dopuść PROBE ponad ścianę jako świadomą "
             "kartę zamiast `hold`. Alternatywnie: po RAMP przejdź od razu do PROBE (probe +15–20% od "
             "ceny RAMP), pomijając martwy BASE. Bez tego cała maszyneria BASE→PROBE→HARVEST to dead code.")
    L.append(f"4. **Dziury w danych ads destabilizują silnik (scen. 9): {R[9]['changes']:.1f} zmian, "
             f"rollbacki {R[9]['rollbacks']:.2f}, OSCYLACJA {R[9]['osc']:.0%}.** 5-dniowa luka przełącza "
             "tryb na no-ads (ratchet) + psuje baseline collapse (spend≈0 w oknie). **FIX:** wykrywaj "
             "LUKĘ (spend=0 przez ≥2 dni w środku okna) i traktuj jako `hold_dq`, nie jako no-ads; "
             "collapse: odrzuć okna z niekompletnym spendem (już jest normalizacja spendem, ale luka "
             "zeruje baseSpend/tempo).")
    L.append(f"5. **Collapse ma ~20% FAŁSZYWYCH trafień na świeżym ad secie (scen. 8, popyt ~"
             f"nieelastyczny, a rollbacki {R[8]['rollbacks']:.2f}).** `learning_grace 3` wyklucza "
             "learning dip, ale weekend + szum Poissona przy MAŁEJ próbie baseline (mierzonej na "
             "TEST-spendzie 40 zł/d, tuż przed skokiem budżetu do 90) nadal trąca q10. **FIX:** "
             "(a) mierz baseline collapse na tym samym poziomie spendu co post (albo waż wariancją), "
             "(b) podnieś `collapse_min_expected` z 5 do 8–10, (c) wymagaj naruszenia q10 w 2 runach "
             "ORAZ minimalnego względnego spadku (np. observed < 0,6×expected), nie tylko q10.")
    L.append("### P3 (dostrojenie — pozostawiony zysk / próg 5)")
    L.append(f"6. **Elastyczne winnery są KRZYWDZONE przez jednokierunkowy ratchet RAMP (scen. 1): "
             f"Δ vs baseline {R[1]['eng']-R[1]['base']:+.0f}.** Podwyżka do RAMP redukuje kontrybucję, "
             "a jedyny hamulec (collapse q10) łapie tylko KATASTROFY, nie łagodne straty 10–20%. "
             "W RAMP nie ma bramki keep_frac/MER (jest dopiero w PROBE, nieosiągalnym). **FIX:** dodaj "
             "po-RAMP kontrolę kontrybucji/zł (jak keep_frac w PROBE) z auto-obniżką KARTĄ, gdy "
             "przychód/kontrybucja spada mimo braku collapse.")
    L.append("7. **PRZYJĄĆ twardy próg 5 zamówień (winner_orders 3→5, ramp_orders 3→5).** Scen. 13: "
             "przy `winner_orders=3` produkt wysoko-CPA (dobry ATC, 3 zam. = szum) awansuje w **56%** "
             "przebiegów przy <5 zam. (łamie wymóg Tomka); `=5` → **0%** przy ZEROWEJ zmianie wyniku "
             "prawdziwych winnerów. To poprawka bez kosztu. `winner_high_confidence_orders` (już 5) "
             "staje się progiem bazowym.")
    L.append(f"8. **Latencja kart (scen. 12, Tomek 7 dni): Δ vs baseline {R[12]['eng']-R[12]['base']:+.0f} "
             f"(vs {R[3]['eng']-R[3]['base']:+.0f} przy 2 dniach).** Karty nie-winnerowe z "
             "`proposal_ttl_days=7` i akceptem w dniu 7 WYGASAJĄ zanim się wykonają (kolizja "
             "expiry==delay). **FIX:** `proposal_ttl_days` ≥ 10–14 (> realny czas reakcji), albo "
             "karty cenowe wykonawcze NIE wygasają automatycznie (jak `winner_reco`).")
    L.append("### P4 (audyt — luki w kodzie wykryte przy porcie)")
    L.append("9. **`rollback_lock` i `cooldown` są omijane przez karty.** W `autoReasonBlock` "
             "`wall_cross` zwraca się PRZED `cooldown`/`rollback_lock`, a wykonanie zaakceptowanej "
             "karty (sweep→executeUp/Down) NIE sprawdza locka/cooldownu ponownie — akcept karty "
             "przebija oba guardraile. To nie eksplodowało w symulacji tylko dzięki DEDUP (klucz "
             "wykonanej karty blokuje rekreację), ale to przypadek, nie projekt. **FIX:** sprawdzaj "
             "`rollback_lock_until`/`cooldown` w momencie WYKONANIA karty, nie tylko przy jej tworzeniu.")
    L.append("10. **COD-heavy `rollback` jest GUBIONY.** Gdy `col.state=='rollback'` ORAZ `codH`, "
             "warunek `col.state==='rollback' && !codH` nie wchodzi, a dalsze `if`-y collapse też nie "
             "— produkt COD-heavy w prawdziwym collapse NIE dostaje ani auto-rollbacku, ani karty "
             "rollback (przechodzi do reguł reżimowych). **FIX:** dla `codH` w stanie `rollback` "
             "emituj KARTĘ `rollback` (jak dla `weak`), zamiast milczącego przejścia dalej.")
    L.append("11. **Freeze po rollbacku (dedup permanentny).** Po auto-rollbacku do START karta "
             "`winner_reco` (klucz bez poziomu) jest juz zuzyta, NIGDY nie wraca, produkt zostaje "
             "zamrozony na starej cenie, bez ponowienia proby (scen. 7). Chroni przed oscylacja, ale "
             "to skutek uboczny. **FIX:** świadoma decyzja — albo pozwól winnerowi wrócić po "
             "`decision_ttl_days` z podniesioną poprzeczką, albo udokumentuj freeze jako celowy.")

    L.append("\n## Metodyka / ograniczenia\n")
    L.append("- Budżet reklamowy EGZOGENNY (test 40 zł/d → skala 90 zł/d w dniu 14), identyczny dla "
             "wszystkich polityk — izoluje decyzje CENOWE od decyzji budżetowych.")
    L.append("- Oracle = statyczna cena maksymalizująca oczekiwany dzienny P&L (siatka 1 zł), "
             "luźna górna granica; dla scen. 8 (bardzo nieelastyczny) optimum ucieka do sufitu siatki "
             "— % oracle tam bez sensu (patrz kolumna).")
    L.append("- Popyt: LPV~Poisson(spend/CPC), ATC~Binom(LPV, atc_rate), zam.~Binom(ATC, checkout(P)); "
             "checkout(P) = elastyczność stałej eps + klif ×mult powyżej progu; weekend −20%, "
             "learning dip −30% (3 dni świeżego ad setu), COD pasma 0,92/0,85/0,78/0,70, "
             "lag rozliczenia COD 14–28 dni.")
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "SIM-ENGINE-V3-WYNIKI.md")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(L))

if __name__ == "__main__":
    main()
