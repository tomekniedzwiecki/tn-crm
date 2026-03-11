import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sync-api-key',
}

// Pobiera pending follow-upy dla rozszerzenia Chrome
// Wymaga x-sync-api-key header

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Weryfikuj API key
    const syncApiKey = req.headers.get('x-sync-api-key')
    const expectedKey = Deno.env.get('WHATSAPP_SYNC_KEY')

    console.log('get-followups: received key:', syncApiKey ? syncApiKey.substring(0, 10) + '...' : 'none')
    console.log('get-followups: expected key:', expectedKey ? expectedKey.substring(0, 10) + '...' : 'none')

    if (!syncApiKey || syncApiKey !== expectedKey) {
      console.log('get-followups: key mismatch, returning 401')
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid API key' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const supabase = createClient(
      SUPABASE_URL || 'https://yxmavwkwnfuphjqbelws.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Pobierz pending follow-upy
    const { data, error } = await supabase
      .from('whatsapp_followups')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, followups: data || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('get-followups error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
