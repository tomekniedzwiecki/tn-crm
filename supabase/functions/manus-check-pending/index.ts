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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY')

    if (!MANUS_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'MANUS_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Find pending tasks older than 30 seconds (give Manus time to start)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString()

    const { data: pendingTasks, error: fetchError } = await supabase
      .from('workflow_ads')
      .select('id, workflow_id, manus_task_id, manus_task_created_at')
      .eq('manus_task_status', 'pending')
      .not('manus_task_id', 'is', null)
      .lt('manus_task_created_at', thirtySecondsAgo)
      .limit(10)

    if (fetchError) {
      console.error('Error fetching pending tasks:', fetchError)
      throw fetchError
    }

    console.log(`Found ${pendingTasks?.length || 0} pending Manus tasks to check`)

    const results: any[] = []

    for (const task of pendingTasks || []) {
      try {
        // Call manus-get-result to check and fetch data
        const response = await fetch(`${SUPABASE_URL}/functions/v1/manus-get-result`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_id: task.manus_task_id,
            workflow_id: task.workflow_id
          })
        })

        const result = await response.json()
        console.log(`Task ${task.manus_task_id}:`, result.status)

        results.push({
          workflow_id: task.workflow_id,
          task_id: task.manus_task_id,
          status: result.status,
          success: result.success
        })

        // If task failed or is stuck for too long (> 10 minutes), mark as failed
        const createdAt = new Date(task.manus_task_created_at)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)

        if (createdAt < tenMinutesAgo && result.status !== 'stopped' && result.status !== 'completed') {
          await supabase
            .from('workflow_ads')
            .update({
              manus_task_status: 'failed',
              manus_task_error: 'Task timeout - przekroczono 10 minut'
            })
            .eq('id', task.id)

          console.log(`Task ${task.manus_task_id} marked as failed (timeout)`)
        }

      } catch (err) {
        console.error(`Error checking task ${task.manus_task_id}:`, err)
        results.push({
          workflow_id: task.workflow_id,
          task_id: task.manus_task_id,
          error: err.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked: results.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
