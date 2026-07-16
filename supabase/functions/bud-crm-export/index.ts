// Most z radaru trendów (/trendy → bud_tt_products) do biblioteki produktów CRM
// (workflow_products, workflow_id = null). Admin-gated (team_members | x-tools-secret,
// jak bud-tt-ingest). Wejście: POST { keys: string[] } (max 100 kluczy bud_tt_products.key).
//
// Dla każdego klucza kopiuje ZATWIERDZONY produkt (status='approved') do biblioteki,
// dedupując po `bud_key` (najpierw SELECT po bud_key → UPDATE, inaczej INSERT).
// Przy UPDATE NIE nadpisuje pól, które admin mógł zmienić ręcznie:
//   report_screenshot_url (PDF do raportów), is_active, visible_to_client.
// Aktualizuje tylko: name / image_url / source_url / tiktok_url / orders_sold /
//   orders_sold_source / rating / review_count.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { adminGate } from '../_shared/bud-owner.ts'

const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST, OPTIONS' }
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'content-type': 'application/json' } })

// Pierwsza litera wielka (reszta bez zmian). Obsługuje polskie znaki (ł→Ł itd.).
function capitalize(s: string): string {
  const t = String(s || '').trim()
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t
}
const toInt = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? Math.round(n) : null
}
const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

// SEZONOWOŚĆ: produkt w oknie sprzedażowym? from/to='MM-DD', today='MM-DD'.
// Brak from/to (all_year) → true. Obsługa wrap-around (from>to, np. zima 09-15→01-31).
function inWindow(from: string | null, to: string | null, today: string): boolean {
  if (!from || !to) return true
  if (from <= to) return today >= from && today <= to
  return today >= from || today <= to
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  if (!(await adminGate(req, supabase))) return json({ error: 'wymagane_logowanie_admin' }, 403)

  const body = await req.json().catch(() => ({}))
  const force = body.force === true // pomiń filtr sezonowy (eksportuj mimo bycia poza oknem)
  const todayMMDD = new Date().toISOString().slice(5, 10)
  let keys = Array.isArray(body.keys) ? body.keys : []
  keys = [...new Set(keys.filter((k: unknown) => typeof k === 'string' && k.trim()).map((k: string) => k.trim()))]
  if (!keys.length) return json({ error: 'brak_keys' }, 400)
  if (keys.length > 100) return json({ error: 'za_duzo_keys', max: 100 }, 400)

  let exported = 0 // nowe wiersze (INSERT)
  let updated = 0 // istniejące (UPDATE po bud_key)
  const skipped: Array<{ key: string; reason: string }> = []

  for (const key of keys) {
    const { data: src, error: srcErr } = await supabase.from('bud_tt_products')
      .select('key,pl_name,status,chosen_link,ali_candidates,ali_snapshot,tt_shop,tiktok_url,cover,season_type,season_label,sell_from,sell_to')
      .eq('key', key).maybeSingle()
    if (srcErr) { skipped.push({ key, reason: 'db_error: ' + srcErr.message }); continue }
    if (!src) { skipped.push({ key, reason: 'nie_znaleziono' }); continue }
    if (src.status !== 'approved') { skipped.push({ key, reason: 'status_' + (src.status || 'brak') }); continue }
    // Produkt sezonowy poza oknem sprzedażowym → nie eksportuj (cel: nie sprzedawać po sezonie),
    // chyba że body {force:true}. all_year / brak season_type → zawsze przechodzi.
    if (!force && src.season_type === 'seasonal' && !inWindow(src.sell_from, src.sell_to, todayMMDD)) {
      skipped.push({ key, reason: 'poza_sezonem' }); continue
    }

    // deno-lint-ignore no-explicit-any
    const snap: any = src.ali_snapshot || {}
    // deno-lint-ignore no-explicit-any
    const tt: any = src.tt_shop || {}

    // Kanoniczny link aukcji: z chosen_link wyciągnij /item/<id>.html.
    let source_url: string | null = null
    const m = String(src.chosen_link || '').match(/\/item\/(\d+)\.html/)
    if (m) {
      source_url = `https://pl.aliexpress.com/item/${m[1]}.html`
    } else {
      const cands = Array.isArray(src.ali_candidates) ? src.ali_candidates : []
      source_url = (cands[0] && cands[0].link) || src.chosen_link || null
    }

    const image_url = snap.main_image || (Array.isArray(snap.images) ? snap.images[0] : null) || src.cover || null
    const orders_sold = toInt(tt?.sold_count)
    const orders_sold_source = orders_sold != null ? 'tiktok_shop' : null
    // Ocena: TikTok Shop (product_rating → rating) lub średnia z opinii AliExpress.
    const rating = toNum(tt?.product_rating ?? tt?.rating ?? snap?.review_stats?.avg)
    const review_count = toInt(tt?.review_count ?? snap?.review_stats?.numRatings)

    // Pola aktualizowane przy każdym eksporcie (bezpieczne — nie ruszają decyzji admina).
    const fields = {
      name: capitalize(src.pl_name || key),
      image_url,
      source_url,
      tiktok_url: src.tiktok_url || null,
      orders_sold,
      orders_sold_source,
      rating,
      review_count,
      season_label: src.season_label || null,
      sell_from: src.sell_from || null,
      sell_to: src.sell_to || null,
    }

    // Dedup po bud_key (nie maybeSingle — teoretycznie mogłoby być >1 wiersza).
    const { data: exRows, error: exErr } = await supabase.from('workflow_products').select('id').eq('bud_key', key).limit(1)
    if (exErr) { skipped.push({ key, reason: 'lookup_error: ' + exErr.message }); continue }
    const existing = (exRows || [])[0]

    if (existing) {
      const { error: upErr } = await supabase.from('workflow_products').update(fields).eq('id', existing.id)
      if (upErr) { skipped.push({ key, reason: 'update_error: ' + upErr.message }); continue }
      updated++
    } else {
      const { error: insErr } = await supabase.from('workflow_products').insert({
        workflow_id: null,
        bud_key: key,
        status: 'proposal',
        visible_to_client: true,
        is_active: true,
        ...fields,
      })
      if (insErr) { skipped.push({ key, reason: 'insert_error: ' + insErr.message }); continue }
      exported++
    }
  }

  return json({ exported, updated, skipped })
})
