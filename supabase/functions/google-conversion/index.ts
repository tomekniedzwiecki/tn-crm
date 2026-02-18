import { createClient } from "jsr:@supabase/supabase-js@2"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Google Ads API configuration
const GOOGLE_ADS_API_VERSION = 'v18'

interface ConversionRequest {
  conversion_action_id: string
  gclid?: string
  email?: string
  phone?: string
  first_name?: string
  last_name?: string
  order_id?: string
  conversion_value?: number
  currency?: string
  conversion_time?: string // ISO 8601 format
}

// SHA256 hash (Google requires lowercase hex)
async function sha256Hash(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Normalize phone to E.164 format
function normalizePhone(phone: string): string {
  let normalized = phone.replace(/[\s\-\(\)\.]/g, '')
  if (normalized.startsWith('0')) {
    normalized = '+48' + normalized.substring(1)
  } else if (!normalized.startsWith('+')) {
    if (!normalized.startsWith('48')) {
      normalized = '+48' + normalized
    } else {
      normalized = '+' + normalized
    }
  }
  return normalized
}

// Get OAuth access token from refresh token
async function getAccessToken(): Promise<string | null> {
  const clientId = Deno.env.get('GOOGLE_ADS_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_ADS_CLIENT_SECRET')
  const refreshToken = Deno.env.get('GOOGLE_ADS_REFRESH_TOKEN')

  if (!clientId || !clientSecret || !refreshToken) {
    console.log('[google] OAuth credentials not configured')
    return null
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    })

    const data = await response.json()
    if (data.access_token) {
      return data.access_token
    }
    console.error('[google] Failed to get access token:', data)
    return null
  } catch (err) {
    console.error('[google] Error getting access token:', err)
    return null
  }
}

// Upload conversion to Google Ads
async function uploadConversion(data: ConversionRequest): Promise<{ success: boolean; error?: string }> {
  const customerId = Deno.env.get('GOOGLE_ADS_CUSTOMER_ID')?.replace(/-/g, '')
  const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN')

  if (!customerId || !developerToken) {
    console.log('[google] Google Ads credentials not configured, skipping')
    return { success: false, error: 'Credentials not configured' }
  }

  const accessToken = await getAccessToken()
  if (!accessToken) {
    return { success: false, error: 'Failed to get access token' }
  }

  try {
    // Build user identifiers
    const userIdentifiers: any[] = []

    if (data.email) {
      userIdentifiers.push({
        hashedEmail: await sha256Hash(data.email)
      })
    }

    if (data.phone) {
      const normalizedPhone = normalizePhone(data.phone)
      userIdentifiers.push({
        hashedPhoneNumber: await sha256Hash(normalizedPhone)
      })
    }

    if (data.first_name || data.last_name) {
      const addressInfo: any = {}
      if (data.first_name) {
        addressInfo.hashedFirstName = await sha256Hash(data.first_name)
      }
      if (data.last_name) {
        addressInfo.hashedLastName = await sha256Hash(data.last_name)
      }
      addressInfo.countryCode = 'PL'
      userIdentifiers.push({ addressInfo })
    }

    // Build conversion adjustment
    const conversionAdjustment = {
      conversionAction: `customers/${customerId}/conversionActions/${data.conversion_action_id}`,
      adjustmentType: 'ENHANCEMENT',
      orderId: data.order_id,
      gclidDateTimePair: data.gclid ? {
        gclid: data.gclid,
        conversionDateTime: data.conversion_time || new Date().toISOString().replace('T', ' ').split('.')[0] + ' Europe/Warsaw'
      } : undefined,
      userIdentifiers: userIdentifiers.length > 0 ? userIdentifiers : undefined,
      userAgent: 'Mozilla/5.0', // Required but can be generic for server-side
      restatementValue: data.conversion_value ? {
        adjustedValue: data.conversion_value,
        currencyCode: data.currency || 'PLN'
      } : undefined
    }

    // Remove undefined fields
    Object.keys(conversionAdjustment).forEach(key => {
      if (conversionAdjustment[key as keyof typeof conversionAdjustment] === undefined) {
        delete conversionAdjustment[key as keyof typeof conversionAdjustment]
      }
    })

    const url = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${customerId}:uploadConversionAdjustments`

    console.log('[google] Uploading conversion:', JSON.stringify({
      conversion_action_id: data.conversion_action_id,
      order_id: data.order_id,
      has_gclid: !!data.gclid,
      has_email: !!data.email,
      has_phone: !!data.phone,
      value: data.conversion_value
    }))

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'login-customer-id': customerId
      },
      body: JSON.stringify({
        conversionAdjustments: [conversionAdjustment],
        partialFailure: true
      })
    })

    const result = await response.json()

    if (response.ok && !result.partialFailureError) {
      console.log('[google] Conversion uploaded successfully')
      return { success: true }
    } else {
      console.error('[google] Failed to upload conversion:', result)
      return { success: false, error: result.error?.message || JSON.stringify(result.partialFailureError) }
    }
  } catch (err) {
    console.error('[google] Error uploading conversion:', err)
    return { success: false, error: err.message }
  }
}

// Main handler
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[google-conversion] Request received')

    const data: ConversionRequest = await req.json()

    if (!data.conversion_action_id) {
      throw new Error('conversion_action_id is required')
    }

    const result = await uploadConversion(data)

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 400
      }
    )
  } catch (error) {
    console.error('[google-conversion] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

export { uploadConversion, sha256Hash, normalizePhone }
