import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const payload = await req.json()
    console.log('Manus webhook received:', JSON.stringify(payload, null, 2))

    const { task_id, status, result, metadata } = payload

    if (!task_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'task_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Find workflow by manus_task_id
    const { data: adsRecord, error: findError } = await supabase
      .from('workflow_ads')
      .select('id, workflow_id')
      .eq('manus_task_id', task_id)
      .maybeSingle()

    if (findError || !adsRecord) {
      console.error('Could not find workflow for task:', task_id)
      return new Response(
        JSON.stringify({ success: false, error: 'Workflow not found for task' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update based on status
    if (status === 'completed' && result) {
      // Parse the result - Manus returns the AI response
      let reportData = null

      try {
        // Try to extract JSON from the result
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          reportData = JSON.parse(jsonMatch[0])
        }
      } catch (parseErr) {
        console.error('Error parsing Manus result:', parseErr)
        reportData = { raw_result: result, parse_error: true }
      }

      // Add metadata
      if (reportData && !reportData.parse_error) {
        reportData.source = 'manus'
        reportData.fetched_at = new Date().toISOString()
        reportData.manus_task_id = task_id
      }

      const { error: updateError } = await supabase
        .from('workflow_ads')
        .update({
          report_data: reportData,
          report_generated_at: new Date().toISOString(),
          manus_task_status: 'completed'
        })
        .eq('id', adsRecord.id)

      if (updateError) {
        console.error('Error updating workflow_ads:', updateError)
        throw updateError
      }

      console.log('Report data saved for workflow:', adsRecord.workflow_id)

    } else if (status === 'failed') {
      await supabase
        .from('workflow_ads')
        .update({
          manus_task_status: 'failed',
          manus_task_error: result || 'Unknown error'
        })
        .eq('id', adsRecord.id)

    } else {
      // Update status only
      await supabase
        .from('workflow_ads')
        .update({ manus_task_status: status })
        .eq('id', adsRecord.id)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
