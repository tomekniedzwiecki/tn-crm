import { createClient } from "jsr:@supabase/supabase-js@2";

// CORS headers - allow Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-whatsapp-sync-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// API key for WhatsApp sync - set in Supabase secrets
const WHATSAPP_SYNC_KEY = Deno.env.get("WHATSAPP_SYNC_KEY") || "";

interface WhatsAppMessage {
  phone_number: string      // Znormalizowany numer (np. "48123456789")
  contact_name?: string     // Nazwa kontaktu z WhatsApp
  message_text: string
  message_timestamp: string // ISO timestamp
  direction: 'inbound' | 'outbound'
  message_hash: string      // MD5 hash do deduplikacji
  synced_by?: string        // Kto synchronizował (tomek/maciek)
}

interface SyncRequest {
  messages: WhatsAppMessage[]
}

// Simple MD5 hash for Deno (fallback if not provided by extension)
async function md5(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('MD5', data).catch(() => null);

  if (!hashBuffer) {
    // Fallback: simple hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify API key
    const providedKey = req.headers.get('x-whatsapp-sync-key')
    if (!WHATSAPP_SYNC_KEY || providedKey !== WHATSAPP_SYNC_KEY) {
      console.error('WhatsApp sync: Invalid or missing API key')
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    console.log('WhatsApp sync request received')

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    const data: SyncRequest = await req.json()

    if (!data.messages || !Array.isArray(data.messages)) {
      throw new Error('messages array is required')
    }

    console.log(`Received ${data.messages.length} messages to sync`)

    let inserted = 0
    let skipped = 0
    let errors: string[] = []

    for (const msg of data.messages) {
      try {
        // Validate required fields
        if (!msg.phone_number || !msg.message_text || !msg.message_timestamp || !msg.direction) {
          errors.push(`Missing required fields for message`)
          continue
        }

        // Generate hash if not provided
        const hash = msg.message_hash || await md5(
          `${msg.phone_number}|${msg.message_timestamp}|${msg.direction}|${msg.message_text}`
        )

        // Insert with ON CONFLICT DO NOTHING
        const { error } = await supabase
          .from('whatsapp_messages')
          .insert({
            phone_number: msg.phone_number,
            contact_name: msg.contact_name || null,
            message_text: msg.message_text,
            message_timestamp: msg.message_timestamp,
            direction: msg.direction,
            message_hash: hash,
            synced_by: msg.synced_by || null
          })

        if (error) {
          if (error.code === '23505') {
            // Duplicate - skip silently
            skipped++
          } else {
            errors.push(`Error inserting message: ${error.message}`)
          }
        } else {
          inserted++
        }
      } catch (msgError) {
        errors.push(`Error processing message: ${msgError.message}`)
      }
    }

    // Update sync status for each unique phone number
    const phoneNumbers = [...new Set(data.messages.map(m => m.phone_number))]

    for (const phone of phoneNumbers) {
      const latestTimestamp = data.messages
        .filter(m => m.phone_number === phone)
        .map(m => new Date(m.message_timestamp))
        .sort((a, b) => b.getTime() - a.getTime())[0]

      if (latestTimestamp) {
        await supabase
          .from('whatsapp_sync_status')
          .upsert({
            phone_number: phone,
            last_message_timestamp: latestTimestamp.toISOString(),
            last_synced_at: new Date().toISOString()
          }, { onConflict: 'phone_number' })
      }
    }

    console.log(`Sync complete: ${inserted} inserted, ${skipped} duplicates skipped, ${errors.length} errors`)

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        skipped,
        errors: errors.length > 0 ? errors : undefined,
        message: `Synced ${inserted} new messages, ${skipped} duplicates skipped`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('WhatsApp sync error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
