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

// Fetch image and convert to base64 (safe chunking for large images)
async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  console.log(`Fetching reference image: ${url}`)
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SupabaseEdge/1.0)',
      'Accept': 'image/jpeg,image/png,image/webp,*/*'
    }
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch reference image: ${response.status}`)
  }

  let contentType = response.headers.get('content-type') || 'image/jpeg'
  // Normalize content-type (strip charset, etc.)
  contentType = contentType.split(';')[0].trim().toLowerCase()

  const arrayBuffer = await response.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)

  // Chunked base64 encoding to avoid stack overflow on large images
  const CHUNK_SIZE = 32768
  let binary = ''
  for (let i = 0; i < uint8Array.length; i += CHUNK_SIZE) {
    const chunk = uint8Array.subarray(i, Math.min(i + CHUNK_SIZE, uint8Array.length))
    binary += String.fromCharCode.apply(null, Array.from(chunk))
  }
  const base64 = btoa(binary)

  // Gemini accepts image/jpeg, image/png, image/webp, image/heic, image/heif
  // Fallback to image/jpeg if unknown
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  if (!validTypes.includes(contentType)) {
    console.warn(`Unsupported mime type: ${contentType}, falling back to image/jpeg`)
    contentType = 'image/jpeg'
  }

  console.log(`Reference image fetched: ${contentType}, ${uint8Array.length} bytes, ${base64.length} base64 chars`)
  return { base64, mimeType: contentType }
}

// Generate image using Gemini with optional reference images
async function generateWithGemini(
  prompt: string,
  count: number,
  apiKey: string,
  referenceImages?: { url: string; type: 'logo' | 'product' }[],
  aspectRatio?: string
): Promise<{ images: { base64: string; mimeType: string }[] }> {

  const model = 'gemini-3-pro-image-preview'
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  console.log(`Using model: ${model}`)

  const images: { base64: string; mimeType: string }[] = []

  // Build parts array
  const parts: any[] = []

  // Add reference images if provided
  let productRefAdded = false
  let logoRefAdded = false
  const refErrors: string[] = []
  if (referenceImages && referenceImages.length > 0) {
    for (const ref of referenceImages) {
      // Retry up to 3x with exponential backoff (AliExpress rate limits)
      let lastErr: any = null
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`Fetching ${ref.type} image (attempt ${attempt}): ${ref.url}`)
          const refImage = await fetchImageAsBase64(ref.url)
          parts.push({
            inline_data: {
              mime_type: refImage.mimeType,
              data: refImage.base64
            }
          })
          if (ref.type === 'product') productRefAdded = true
          if (ref.type === 'logo') logoRefAdded = true
          lastErr = null
          break
        } catch (err) {
          lastErr = err
          console.error(`Attempt ${attempt} failed for ${ref.type}:`, err.message)
          if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 500))
        }
      }
      if (lastErr) refErrors.push(`${ref.type}: ${lastErr.message}`)
    }
  }

  // If product reference was requested but failed to load — FAIL instead of silently generating without it
  const productRequested = referenceImages?.some(r => r.type === 'product')
  if (productRequested && !productRefAdded) {
    throw new Error(`Product reference image could not be loaded after retries. Errors: ${refErrors.join('; ')}`)
  }

  // Build the prompt with STRONG reference instruction
  let finalPrompt = ''
  if (productRefAdded) {
    // Zgodnie z Google Cloud guide dla Nano Banana: krótko, pozytywnie, bez negacji.
    // Model dyfuzyjny rekonstruuje z szumu — długie instrukcje i "DO NOT" psują rezultat.
    finalPrompt = `Using the exact product shown in the reference image as the physical object in the scene:

${prompt}`
  } else if (logoRefAdded) {
    finalPrompt = `Using the brand logo from the reference image:\n\n${prompt}`
  } else {
    finalPrompt = prompt
  }

  parts.push({ text: finalPrompt })

  // Log what we're actually sending to Gemini
  const partsSummary = parts.map((p: any) => {
    if (p.inline_data) return `[INLINE_DATA ${p.inline_data.mime_type}, ${p.inline_data.data.length} b64 chars]`
    if (p.text) return `[TEXT ${p.text.length} chars]`
    return '[UNKNOWN]'
  })
  console.log(`Sending to Gemini — parts: ${JSON.stringify(partsSummary)}`)

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
          responseModalities: ['TEXT', 'IMAGE'],
          imageConfig: {
            aspectRatio: aspectRatio || '1:1'
          }
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
    const { prompt, count = 1, workflow_id, type, reference_image_url, reference_images, aspect_ratio } = body

    // Validate aspect_ratio against Gemini-supported values
    const ALLOWED_ASPECT_RATIOS = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9']
    const finalAspectRatio = aspect_ratio && ALLOWED_ASPECT_RATIOS.includes(aspect_ratio)
      ? aspect_ratio
      : '1:1'
    if (aspect_ratio && aspect_ratio !== finalAspectRatio) {
      console.warn(`Unsupported aspect_ratio "${aspect_ratio}" — falling back to 1:1. Allowed: ${ALLOWED_ASPECT_RATIOS.join(', ')}`)
    }

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Generating ${count} image(s) for workflow ${workflow_id}, type: ${type}`)
    console.log(`Prompt: ${prompt.substring(0, 100)}...`)

    // Support both old format (reference_image_url) and new format (reference_images array)
    let refImages: { url: string; type: 'logo' | 'product' }[] = []
    if (reference_images && Array.isArray(reference_images)) {
      refImages = reference_images
      console.log(`Reference images: ${refImages.length} (new format)`)
    } else if (reference_image_url) {
      refImages = [{ url: reference_image_url, type: 'logo' }]
      console.log(`Reference image: ${reference_image_url} (legacy format)`)
    }

    console.log(`Aspect ratio: ${finalAspectRatio}`)
    const result = await generateWithGemini(prompt, count, apiKey, refImages, finalAspectRatio)

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
