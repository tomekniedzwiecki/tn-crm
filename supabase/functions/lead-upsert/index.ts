import { createClient } from "jsr:@supabase/supabase-js@2";

// CORS headers - allow all origins for this public endpoint
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface LeadData {
  email: string
  name?: string
  phone?: string
  company?: string
  source?: string
  deal_value?: number
  status?: string
  notes?: string
  // Survey fields
  traffic_source?: string
  direction?: string
  weekly_hours?: string
  target_income?: string
  experience?: string
  open_question?: string
  lead_source?: 'website' | 'outreach' | 'manual'
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Lead upsert request received')
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    const data: LeadData = await req.json()
    console.log('Received data:', JSON.stringify(data))

    if (!data.email) {
      throw new Error('Email jest wymagany')
    }

    // Normalize email
    const email = data.email.toLowerCase().trim()
    console.log('Processing lead for email:', email)

    // Check if lead already exists
    const { data: existingLead, error: selectError } = await supabase
      .from('leads')
      .select('id, created_at')
      .eq('email', email)
      .maybeSingle()

    if (selectError) {
      throw selectError
    }

    let leadId: string
    let isNewLead = false

    if (existingLead) {
      // Update existing lead - only update fields that are provided and not empty
      const updates: Record<string, any> = {}

      if (data.name) updates.name = data.name
      if (data.phone) updates.phone = data.phone
      if (data.company) updates.company = data.company
      if (data.source) updates.source = data.source
      if (data.deal_value !== undefined) updates.deal_value = data.deal_value
      if (data.notes) updates.notes = data.notes

      // Survey fields
      if (data.traffic_source) updates.traffic_source = data.traffic_source
      if (data.direction) updates.direction = data.direction
      if (data.weekly_hours) updates.weekly_hours = data.weekly_hours
      if (data.target_income) updates.target_income = data.target_income
      if (data.experience) updates.experience = data.experience
      if (data.open_question) updates.open_question = data.open_question

      // Set survey_completed_at when survey fields are submitted
      const hasSurveyData = data.weekly_hours || data.target_income || data.experience
      if (hasSurveyData) {
        updates.survey_completed_at = new Date().toISOString()
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('leads')
          .update(updates)
          .eq('id', existingLead.id)

        if (updateError) {
          throw updateError
        }
      }

      leadId = existingLead.id
      console.log(`Updated existing lead: ${email} (id: ${leadId})`)
    } else {
      // Insert new lead
      const insertData: Record<string, any> = {
        email,
        status: data.status || 'new',
        lead_source: data.lead_source || 'website'
      }

      if (data.name) insertData.name = data.name
      if (data.phone) insertData.phone = data.phone
      if (data.company) insertData.company = data.company
      if (data.source) insertData.source = data.source
      if (data.deal_value !== undefined) insertData.deal_value = data.deal_value
      if (data.notes) insertData.notes = data.notes

      // Survey fields
      if (data.traffic_source) insertData.traffic_source = data.traffic_source
      if (data.direction) insertData.direction = data.direction
      if (data.weekly_hours) insertData.weekly_hours = data.weekly_hours
      if (data.target_income) insertData.target_income = data.target_income
      if (data.experience) insertData.experience = data.experience
      if (data.open_question) insertData.open_question = data.open_question

      // Set survey_completed_at when survey fields are submitted
      const hasSurveyData = data.weekly_hours || data.target_income || data.experience
      if (hasSurveyData) {
        insertData.survey_completed_at = new Date().toISOString()
      }

      const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert([insertData])
        .select('id')
        .single()

      if (insertError) {
        throw insertError
      }

      leadId = newLead.id
      isNewLead = true
      console.log(`Created new lead: ${email} (id: ${leadId})`)
    }

    // Slack notification is sent by the form at completion (zapisy/index.html)
    // Don't send here to avoid duplicate notifications

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: leadId,
        is_new: isNewLead,
        message: isNewLead ? 'Lead created' : 'Lead updated'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Lead upsert error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
