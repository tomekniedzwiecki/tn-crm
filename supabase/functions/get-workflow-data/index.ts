import { createClient } from 'jsr:@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://crm.tomekniedzwiecki.pl',
  'https://tomekniedzwiecki.pl',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const url = new URL(req.url)
    const workflowId = url.searchParams.get('workflow_id')
    const brandName = url.searchParams.get('brand_name')

    let query = supabase
      .from('workflows')
      .select(`
        id,
        customer_name,
        customer_email,
        offer_name,
        selected_product_id,
        sales_page_url
      `)

    if (workflowId) {
      query = query.eq('id', workflowId)
    } else if (brandName) {
      // Search by customer_name, offer_name, or sales_page_url (brand folder)
      query = query.or(`customer_name.ilike.%${brandName}%,offer_name.ilike.%${brandName}%,sales_page_url.ilike.%${brandName}%`)
    } else {
      // List all workflows if no filter (for debugging)
      const { data: allWorkflows } = await supabase
        .from('workflows')
        .select('id, customer_name, offer_name')
        .limit(20)

      return new Response(JSON.stringify({
        error: 'workflow_id or brand_name required',
        available_workflows: allWorkflows
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: workflow, error: workflowError } = await query.maybeSingle()

    if (workflowError) throw workflowError
    if (!workflow) {
      return new Response(JSON.stringify({ error: 'Workflow not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get product data if selected
    let product = null
    if (workflow.selected_product_id) {
      const { data: productData } = await supabase
        .from('workflow_products')
        .select('id, name, description, image_url, source_url, price')
        .eq('id', workflow.selected_product_id)
        .single()

      product = productData
    }

    // Get branding data
    const { data: branding } = await supabase
      .from('workflow_branding')
      .select('type, name, value, role, tagline, description')
      .eq('workflow_id', workflow.id)

    return new Response(JSON.stringify({
      workflow,
      product,
      branding
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
