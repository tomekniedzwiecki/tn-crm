import { createServiceClient, createAnonClient } from './supabase-client'

/**
 * Generate unique test email
 */
export function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.example.com`
}

/**
 * Generate unique test token
 */
export function generateTestToken(): string {
  return `test-token-${Date.now()}-${Math.random().toString(36).slice(2, 16)}`
}

/**
 * Create a test lead and return its ID
 */
export async function createTestLead(email?: string): Promise<{ id: string; email: string }> {
  const serviceClient = createServiceClient()
  const testEmail = email || generateTestEmail()

  const { data, error } = await serviceClient
    .from('leads')
    .insert({
      email: testEmail,
      name: 'Test Lead',
    })
    .select('id, email')
    .single()

  if (error) throw new Error(`Failed to create test lead: ${error.message}`)
  return data
}

/**
 * Create a test order and return its ID
 */
export async function createTestOrder(options: {
  amount?: number
  status?: string
  leadId?: string
}): Promise<{ id: string; order_number: string }> {
  const serviceClient = createServiceClient()
  const { amount = 100, status = 'pending', leadId } = options

  // Create order number
  const orderNumber = `TEST-${Date.now()}`

  const { data, error } = await serviceClient
    .from('orders')
    .insert({
      order_number: orderNumber,
      amount,
      status,
      customer_email: generateTestEmail(),
      customer_name: 'Test Customer',
      description: 'Test Order',
      lead_id: leadId,
    })
    .select('id, order_number')
    .single()

  if (error) throw new Error(`Failed to create test order: ${error.message}`)
  return data
}

/**
 * Create a test client_offer with token
 */
export async function createTestClientOffer(leadId: string, offerId?: string): Promise<{
  id: string
  access_token: string
  lead_id: string
}> {
  const serviceClient = createServiceClient()

  // Get first offer if not provided
  let actualOfferId = offerId
  if (!actualOfferId) {
    const { data: offers } = await serviceClient.from('offers').select('id').limit(1).single()
    actualOfferId = offers?.id
  }

  if (!actualOfferId) {
    throw new Error('No offer found to create client_offer')
  }

  const accessToken = generateTestToken()

  const { data, error } = await serviceClient
    .from('client_offers')
    .insert({
      lead_id: leadId,
      offer_id: actualOfferId,
      access_token: accessToken,
    })
    .select('id, access_token, lead_id')
    .single()

  if (error) throw new Error(`Failed to create test client_offer: ${error.message}`)
  return data
}

/**
 * Create a test workflow
 * Note: Requires order_id in database - creates order first if not provided
 */
export async function createTestWorkflow(options: {
  customerEmail?: string
  orderId?: string
}): Promise<{ id: string; unique_token: string; orderId?: string }> {
  const serviceClient = createServiceClient()
  const { customerEmail = generateTestEmail() } = options

  // Create order first if not provided (workflows require order_id)
  let orderId = options.orderId
  if (!orderId) {
    const order = await createTestOrder({ status: 'paid' })
    orderId = order.id
  }

  const { data, error } = await serviceClient
    .from('workflows')
    .insert({
      customer_name: 'Test Customer',
      customer_email: customerEmail,
      order_id: orderId,
      status: 'active',
    })
    .select('id, unique_token')
    .single()

  if (error) throw new Error(`Failed to create test workflow: ${error.message}`)
  return { ...data, orderId }
}

/**
 * Clean up test data
 */
export async function cleanupTestData(options: {
  leadIds?: string[]
  orderIds?: string[]
  clientOfferIds?: string[]
  workflowIds?: string[]
}): Promise<void> {
  const serviceClient = createServiceClient()
  const { leadIds = [], orderIds = [], clientOfferIds = [], workflowIds = [] } = options

  // Delete in reverse order of dependencies
  if (workflowIds.length > 0) {
    await serviceClient.from('workflows').delete().in('id', workflowIds)
  }
  if (clientOfferIds.length > 0) {
    await serviceClient.from('client_offers').delete().in('id', clientOfferIds)
  }
  if (orderIds.length > 0) {
    await serviceClient.from('orders').delete().in('id', orderIds)
  }
  if (leadIds.length > 0) {
    await serviceClient.from('leads').delete().in('id', leadIds)
  }
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  timeout: number = 5000,
  interval: number = 500
): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (await condition()) return true
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
  return false
}
