import { createClient } from 'jsr:@supabase/supabase-js@2'

// Allowed origins for CORS
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

// Fetch image and convert to base64
async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  console.log(`Fetching reference image: ${url}`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch reference image: ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg'
  const arrayBuffer = await response.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)

  // Convert to base64
  let binary = ''
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i])
  }
  const base64 = btoa(binary)

  console.log(`Reference image fetched: ${contentType}, ${base64.length} chars`)
  return { base64, mimeType: contentType }
}

// Generate image using Gemini with optional reference image
async function generateWithGemini(
  prompt: string,
  count: number,
  apiKey: string,
  referenceImageUrl?: string
): Promise<{ images: { base64: string; mimeType: string }[] }> {

  const model = 'gemini-3.1-flash-image-preview'
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  console.log(`Using model: ${model}`)

  const images: { base64: string; mimeType: string }[] = []

  // Build parts array
  const parts: any[] = []

  // Add reference image if provided
  if (referenceImageUrl) {
    try {
      const refImage = await fetchImageAsBase64(referenceImageUrl)
      parts.push({
        inline_data: {
          mime_type: refImage.mimeType,
          data: refImage.base64
        }
      })
      // Modify prompt to reference the image
      parts.push({
        text: `Use this product image as reference. The generated image MUST show this EXACT same product (same shape, colors, design, details). ${prompt}`
      })
    } catch (err) {
      console.error('Failed to fetch reference image:', err)
      // Fall back to text-only prompt
      parts.push({ text: prompt })
    }
  } else {
    parts.push({ text: prompt })
  }

  // Generate images (Gemini generates 1 per request)
  for (let i = 0; i < Math.min(count, 4); i++) {
    console.log(`Generating image ${i + 1}/${count}...`)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: parts
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE']
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('API response keys:', Object.keys(data))

    // Extract image from response
    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          images.push({
            base64: part.inlineData.data,
            mimeType: part.inlineData.mimeType || 'image/png'
          })
          console.log(`Found image with mimeType: ${part.inlineData.mimeType}`)
        }
      }
    }
  }

  if (images.length === 0) {
    throw new Error('No images generated - model may not support image generation or prompt was blocked')
  }

  return { images }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY')
    if (!apiKey) {
      throw new Error('Missing GOOGLE_AI_API_KEY - add it in Supabase Edge Functions Secrets')
    }

    const body = await req.json()
    const { prompt, count = 1, workflow_id, type, reference_image_url } = body

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Generating ${count} image(s) for workflow ${workflow_id}, type: ${type}`)
    console.log(`Prompt: ${prompt.substring(0, 100)}...`)
    if (reference_image_url) {
      console.log(`Reference image: ${reference_image_url}`)
    }

    const result = await generateWithGemini(prompt, count, apiKey, reference_image_url)

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const uploadedImages = await Promise.all(
      result.images.map(async (img, index) => {
        const ext = img.mimeType.includes('jpeg') || img.mimeType.includes('jpg') ? 'jpg' : 'png'
        const filename = `ai-generated/${workflow_id || 'temp'}/${Date.now()}_${index}.${ext}`

        // Convert base64 to Uint8Array
        const binaryString = atob(img.base64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filename, bytes, { contentType: img.mimeType })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          // Return data URL as fallback
          return { url: `data:${img.mimeType};base64,${img.base64}` }
        }

        const { data: { publicUrl } } = supabase.storage
          .from('attachments')
          .getPublicUrl(filename)

        return { url: publicUrl }
      })
    )

    return new Response(JSON.stringify({ images: uploadedImages }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Generate image error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
