// bud-funnel-report — CODZIENNY raport lejka /sklep na Slacka (dedykowany webhook Tomka,
// decyzja 2026-07-02). Porównanie ostatnich 24 h z poprzednimi 24 h: sesje → produkt →
// raport → mail → budżet → makiety → styl → telefon → sklep → zielone → PAID + koszty API.
// Cron: codziennie 06:05 UTC (08:05 PL). ⚠️ DEPLOY: --no-verify-jwt. Auth: x-cron-secret.
import { createClient } from "jsr:@supabase/supabase-js@2";

function pct(a: number, b: number): string { return b ? Math.round((a / b) * 100) + '%' : '—' }

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'metoda_niedozwolona' }), { status: 405 })
  const CRON = Deno.env.get('SPAR_CRON_SECRET') || ''
  if (!CRON || req.headers.get('x-cron-secret') !== CRON) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 })
  const WEBHOOK = Deno.env.get('BUD_FUNNEL_SLACK_WEBHOOK') || ''
  if (!WEBHOOK) return new Response(JSON.stringify({ error: 'brak_webhooka' }), { status: 500 })
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const now = Date.now()
    const day = 24 * 3600 * 1000

    const win = async (fromMs: number, toMs: number) => {
      const { data } = await supabase.from('bud_sessions')
        .select('id, chosen_product, market_report, email, budget_declared, mockups, chosen_style, phone, landing_html, verdict, paid_at')
        .eq('is_test', false).is('archived_at', null)
        .gte('created_at', new Date(fromMs).toISOString()).lt('created_at', new Date(toMs).toISOString())
        .limit(1000)
      const rows = data || []
      // deno-lint-ignore no-explicit-any
      const c = (f: (s: any) => boolean) => rows.filter(f).length
      return {
        sesje: rows.length,
        produkt: c((s) => !!s.chosen_product),
        raport: c((s) => !!s.market_report),
        mail: c((s) => !!s.email),
        budzet: c((s) => !!s.budget_declared),
        makiety: c((s) => Array.isArray(s.mockups) && s.mockups.length > 0),
        styl: c((s) => !!s.chosen_style),
        telefon: c((s) => !!s.phone),
        sklep: c((s) => !!s.landing_html),
        zielone: c((s) => s.verdict === 'zielony'),
        paid: c((s) => !!s.paid_at),
      }
    }
    const today = await win(now - day, now)
    const prev = await win(now - 2 * day, now - day)

    const { data: usage } = await supabase.from('bud_usage').select('cost_usd')
      .gte('created_at', new Date(now - day).toISOString()).limit(5000)
    const cost = (usage || []).reduce((a, r) => a + (Number(r.cost_usd) || 0), 0)
    const { count: mailsSent } = await supabase.from('bud_emails').select('id', { count: 'exact', head: true })
      .gte('sent_at', new Date(now - day).toISOString())
    const { count: smsSent } = await supabase.from('bud_sms').select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(now - day).toISOString())

    type K = keyof typeof today
    const d = (k: K) => {
      const diff = today[k] - prev[k]
      return `*${today[k]}*${diff ? ` (${diff > 0 ? '+' : ''}${diff})` : ''}`
    }
    const text = [
      `📊 *Lejek /sklep — ostatnie 24 h* _(w nawiasie zmiana vs poprzednia doba)_`,
      `Sesje: ${d('sesje')} → wybrany produkt: ${d('produkt')} (${pct(today.produkt, today.sesje)}) → raport: ${d('raport')}`,
      `Mail: ${d('mail')} → budżet: ${d('budzet')} → makiety: ${d('makiety')} → styl: ${d('styl')} → telefon: ${d('telefon')}`,
      `Sklep: ${d('sklep')} → 🟢 zielone światło: ${d('zielone')} → 💰 *REZERWACJE: ${d('paid')}*`,
      `Koszty API 24 h: *$${cost.toFixed(2)}* · followupy: ${mailsSent ?? 0} mail(i), ${smsSent ?? 0} SMS`,
    ].join('\n')

    const res = await fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
    if (!res.ok) console.error('[bud-funnel-report] webhook HTTP', res.status, await res.text().catch(() => ''))
    return new Response(JSON.stringify({ ok: res.ok, today }), { status: res.ok ? 200 : 502, headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    console.error('[bud-funnel-report] ERROR:', e)
    return new Response(JSON.stringify({ error: 'blad_serwera' }), { status: 500 })
  }
})
