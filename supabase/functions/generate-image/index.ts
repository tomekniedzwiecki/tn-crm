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

// Detect actual image type from magic bytes. Returns null if unknown.
// CDNs sometimes lie in Content-Type (e.g. kwcdn serves AVIF with image/jpeg header
// when /format/avif is in path), so the only reliable check is the file signature.
function sniffImageType(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null
  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return 'image/jpeg'
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
      bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A) return 'image/png'
  // WebP: RIFF....WEBP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'image/webp'
  // ISO BMFF (HEIC/HEIF/AVIF): bytes[4..7] = 'ftyp', brand at bytes[8..11]
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11])
    if (brand === 'avif' || brand === 'avis') return 'image/avif'
    if (brand === 'heic' || brand === 'heix' || brand === 'mif1' || brand === 'msf1') return 'image/heic'
    if (brand === 'heif') return 'image/heif'
  }
  return null
}

// Normalize reference URLs so CDN returns a Gemini-compatible format.
// kwcdn/Qiniu-style: replace /format/avif with /format/jpg (keeps w/h/q params intact).
// Strip Cloudinary f_auto/f_avif, imgix fm=avif, etc.
function normalizeReferenceUrl(url: string): string {
  let out = url
  // Qiniu: /format/avif -> /format/jpg (also webp; Gemini supports webp but some CDNs glitch)
  out = out.replace(/\/format\/avif\b/gi, '/format/jpg')
  // Cloudinary: f_avif -> f_jpg (inside comma-separated transform list)
  out = out.replace(/([,/])f_avif\b/gi, '$1f_jpg')
  // imgix/thumbor: fm=avif -> fm=jpg (query param)
  out = out.replace(/([?&])fm=avif\b/gi, '$1fm=jpg')
  return out
}

// Fetch image and convert to base64 (safe chunking for large images)
async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const normalizedUrl = normalizeReferenceUrl(url)
  if (normalizedUrl !== url) {
    console.log(`Normalized reference URL: ${url} -> ${normalizedUrl}`)
  }
  console.log(`Fetching reference image: ${normalizedUrl}`)
  const response = await fetch(normalizedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SupabaseEdge/1.0)',
      // Explicitly downrank AVIF/HEIC so content-negotiating CDNs pick JPEG/PNG/WebP
      'Accept': 'image/jpeg,image/png,image/webp;q=0.9,image/*;q=0.5,*/*;q=0.1'
    }
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch reference image: ${response.status}`)
  }

  let contentType = response.headers.get('content-type') || ''
  contentType = contentType.split(';')[0].trim().toLowerCase()

  const arrayBuffer = await response.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)

  // Trust magic bytes over Content-Type header — CDNs lie.
  const sniffedType = sniffImageType(uint8Array)
  if (sniffedType && sniffedType !== contentType) {
    console.warn(`Content-Type mismatch: header="${contentType}" magic="${sniffedType}". Trusting magic bytes.`)
    contentType = sniffedType
  } else if (!sniffedType && !contentType) {
    throw new Error('Could not determine image format: missing Content-Type and unrecognized magic bytes')
  }

  // Fail loudly — earlier code silently relabeled AVIF as JPEG, which then blew up
  // downstream when the bytes reached Claude/Gemini. Force the caller to supply a
  // supported format rather than lying about the mime type.
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  if (!validTypes.includes(contentType)) {
    throw new Error(
      `Unsupported reference image format: ${contentType}. ` +
      `Source URL returns a format Gemini cannot process. ` +
      `Strip CDN format parameters (e.g. /format/avif, f_avif, fm=avif) or use a JPEG/PNG/WebP source. ` +
      `Original URL: ${url}`
    )
  }

  // Chunked base64 encoding to avoid stack overflow on large images
  const CHUNK_SIZE = 32768
  let binary = ''
  for (let i = 0; i < uint8Array.length; i += CHUNK_SIZE) {
    const chunk = uint8Array.subarray(i, Math.min(i + CHUNK_SIZE, uint8Array.length))
    binary += String.fromCharCode.apply(null, Array.from(chunk))
  }
  const base64 = btoa(binary)

  console.log(`Reference image fetched: ${contentType}, ${uint8Array.length} bytes, ${base64.length} base64 chars`)
  return { base64, mimeType: contentType }
}

// Map Gemini-style aspect ratios to OpenAI sizes (GPT-image-2 supports 3 sizes + auto)
function aspectRatioToOpenAISize(ratio: string): '1024x1024' | '1536x1024' | '1024x1536' | 'auto' {
  const landscape = new Set(['3:2', '4:3', '5:4', '16:9', '21:9'])
  const portrait = new Set(['2:3', '3:4', '4:5', '9:16'])
  if (ratio === '1:1') return '1024x1024'
  if (landscape.has(ratio)) return '1536x1024'
  if (portrait.has(ratio)) return '1024x1536'
  return 'auto'
}

// Generate image using OpenAI GPT-image-2 with optional reference images.
// Uses /v1/images/edits when references exist (multipart), /v1/images/generations otherwise (JSON).
async function generateWithOpenAI(
  prompt: string,
  count: number,
  apiKey: string,
  referenceImages?: { url: string; type: 'logo' | 'product' }[],
  aspectRatio?: string
): Promise<{ images: { base64: string; mimeType: string }[] }> {
  const model = 'gpt-image-2'
  const size = aspectRatioToOpenAISize(aspectRatio || '1:1')
  const n = Math.min(Math.max(count, 1), 10) // GPT-image-2 obsługuje do 10 obrazów na call

  console.log(`Using OpenAI model: ${model}, size: ${size}, n: ${n}`)

  // Fetch reference images in parallel with retry
  const refBlobs: { blob: Blob; filename: string; type: 'logo' | 'product' }[] = []
  let productRefAdded = false
  let logoRefAdded = false
  const refErrors: string[] = []

  if (referenceImages && referenceImages.length > 0) {
    for (const ref of referenceImages) {
      let lastErr: any = null
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const { base64, mimeType } = await fetchImageAsBase64(ref.url)
          const binary = atob(base64)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
          const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg'
          refBlobs.push({
            blob: new Blob([bytes], { type: mimeType }),
            filename: `${ref.type}_${refBlobs.length}.${ext}`,
            type: ref.type
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

  const productRequested = referenceImages?.some(r => r.type === 'product')
  if (productRequested && !productRefAdded) {
    throw new Error(`Product reference image could not be loaded after retries. Errors: ${refErrors.join('; ')}`)
  }

  // Build prompt with same reference instructions as Gemini path
  let finalPrompt = prompt
  if (productRefAdded && logoRefAdded) {
    finalPrompt = `The physical product in the scene matches the first reference image exactly. The brand logo printed on the merchandise matches the second reference image — copy it pixel-perfect: same shape, same colors, same proportions, same letterforms. Do not invent a new logo.\n\n${prompt}`
  } else if (productRefAdded) {
    finalPrompt = `Using the exact product shown in the reference image as the physical object in the scene:\n\n${prompt}`
  } else if (logoRefAdded) {
    finalPrompt = `The merchandise in this scene displays the exact logo from the reference image. Copy the logo pixel-perfect onto the item — same shape, same colors, same proportions, same letterforms as shown in the reference. The logo is fixed artwork, not a design to reinterpret.\n\n${prompt}`
  }

  const images: { base64: string; mimeType: string }[] = []

  if (refBlobs.length > 0) {
    // /v1/images/edits — multipart/form-data
    const form = new FormData()
    form.append('model', model)
    form.append('prompt', finalPrompt)
    form.append('n', String(n))
    if (size !== 'auto') form.append('size', size)
    form.append('quality', 'high')
    for (const rb of refBlobs) {
      form.append('image[]', rb.blob, rb.filename)
    }

    console.log(`Calling OpenAI /v1/images/edits with ${refBlobs.length} references`)
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: form
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI edits API error:', errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    if (data.data && Array.isArray(data.data)) {
      for (const item of data.data) {
        if (item.b64_json) {
          images.push({ base64: item.b64_json, mimeType: 'image/png' })
        }
      }
    }
  } else {
    // /v1/images/generations — JSON
    const body: Record<string, unknown> = {
      model,
      prompt: finalPrompt,
      n,
      quality: 'high'
    }
    if (size !== 'auto') body.size = size

    console.log(`Calling OpenAI /v1/images/generations (no references)`)
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI generations API error:', errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    if (data.data && Array.isArray(data.data)) {
      for (const item of data.data) {
        if (item.b64_json) {
          images.push({ base64: item.b64_json, mimeType: 'image/png' })
        }
      }
    }
  }

  if (images.length === 0) {
    throw new Error('No images generated by OpenAI — prompt may have been rejected by safety filter')
  }

  return { images }
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
  if (productRefAdded && logoRefAdded) {
    // Oba: produkt + logo. Kolejnosc referenced obrazow: produkt (index 0), logo (index 1)
    finalPrompt = `The physical product in the scene matches the first reference image exactly. The brand logo printed on the merchandise matches the second reference image — copy it pixel-perfect: same shape, same colors, same proportions, same letterforms. Do not invent a new logo.

${prompt}`
  } else if (productRefAdded) {
    // Zgodnie z Google Cloud guide dla Nano Banana: krotko, pozytywnie, bez negacji.
    // Model dyfuzyjny rekonstruuje z szumu — dlugie instrukcje i "DO NOT" psuja rezultat.
    finalPrompt = `Using the exact product shown in the reference image as the physical object in the scene:

${prompt}`
  } else if (logoRefAdded) {
    // Silny pozytywny prompt dla logo-only (mockupy gadzetow).
    // Kluczowe sformulowanie: "pixel-perfect copy" + "same shape/colors/proportions".
    finalPrompt = `The merchandise in this scene displays the exact logo from the reference image. Copy the logo pixel-perfect onto the item — same shape, same colors, same proportions, same letterforms as shown in the reference. The logo is fixed artwork, not a design to reinterpret.

${prompt}`
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
    const body = await req.json()
    const { prompt, count = 1, workflow_id, type, reference_image_url, reference_images, aspect_ratio, provider: providerOverride } = body

    // Validate aspect_ratio against Gemini-supported values (GPT-image-2 path maps them internally)
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

    // Supabase client — also used to read provider setting
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Resolve provider: request override > DB setting > default 'gemini'
    let provider: 'gemini' | 'gpt-image-2' = 'gemini'
    if (providerOverride === 'gpt-image-2' || providerOverride === 'gemini') {
      provider = providerOverride
    } else {
      const { data: settingRow } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'image_provider')
        .maybeSingle()
      if (settingRow?.value === 'gpt-image-2') provider = 'gpt-image-2'
    }

    console.log(`Generating ${count} image(s) for workflow ${workflow_id}, type: ${type}, provider: ${provider}`)
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

    let result: { images: { base64: string; mimeType: string }[] }
    if (provider === 'gpt-image-2') {
      const openaiKey = Deno.env.get('OPENAI_API_KEY')
      if (!openaiKey) {
        throw new Error('Missing OPENAI_API_KEY - add it in Supabase Edge Functions Secrets')
      }
      result = await generateWithOpenAI(prompt, count, openaiKey, refImages, finalAspectRatio)
    } else {
      const apiKey = Deno.env.get('GOOGLE_AI_API_KEY')
      if (!apiKey) {
        throw new Error('Missing GOOGLE_AI_API_KEY - add it in Supabase Edge Functions Secrets')
      }
      result = await generateWithGemini(prompt, count, apiKey, refImages, finalAspectRatio)
    }

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
