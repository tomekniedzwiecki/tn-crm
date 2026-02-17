import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://yxmavwkwnfuphjqbelws.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bWF2d2t3bmZ1cGhqcWJlbHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjQyNTUsImV4cCI6MjA4NDM0MDI1NX0.i4Ov_SLSHGchSNjYJwu5mTLVBMPOSLcNpqDQhqfb7gs'
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''
export const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

/**
 * Create Supabase client with anon key (simulates anonymous user)
 */
export function createAnonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Create Supabase client with service role key (admin access)
 */
export function createServiceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Call edge function
 */
export async function callEdgeFunction(
  functionName: string,
  body: Record<string, unknown>,
  options: { useAnon?: boolean; headers?: Record<string, string> } = {}
): Promise<Response> {
  const { useAnon = false, headers = {} } = options
  const key = useAnon ? SUPABASE_ANON_KEY : SUPABASE_SERVICE_KEY

  return fetch(`${FUNCTIONS_URL}/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      ...headers,
    },
    body: JSON.stringify(body),
  })
}

/**
 * Call edge function without authorization (for testing --no-verify-jwt)
 */
export async function callEdgeFunctionNoAuth(
  functionName: string,
  body: string | Record<string, unknown>,
  contentType: string = 'application/json'
): Promise<Response> {
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body)

  return fetch(`${FUNCTIONS_URL}/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
    },
    body: bodyStr,
  })
}
