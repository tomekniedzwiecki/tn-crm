import postgres from 'https://deno.land/x/postgresjs@v3.4.4/mod.js'
Deno.serve(async (req) => {
  if (req.headers.get('x-ddl-secret') !== (Deno.env.get('BUD_TOOLS_SECRET') || '')) return new Response('forbidden', { status: 403 })
  const { b64 } = await req.json().catch(() => ({ b64: '' }))
  if (!b64) return new Response('no sql', { status: 400 })
  const q = new TextDecoder().decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0)))
  const sql = postgres(Deno.env.get('SUPABASE_DB_URL') || '', { prepare: false, ssl: 'require', max: 1 })
  try { const rows = await sql.unsafe(q); await sql.end(); return new Response(JSON.stringify({ ok: true, rows }), { headers: { 'content-type': 'application/json' } }) }
  catch (e) { try { await sql.end() } catch {} return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 }) }
})
