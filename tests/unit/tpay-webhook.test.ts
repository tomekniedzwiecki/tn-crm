/**
 * Testy dla tpay-webhook edge function
 * CRITICAL priority - bezpośredni wpływ na przychody
 *
 * TEST-WEBHOOK-001: Płatność udana (TRUE)
 * TEST-WEBHOOK-002: Płatność nieudana (FALSE)
 * TEST-WEBHOOK-003: Chargeback/refund
 * TEST-WEBHOOK-004: Brak tr_id
 * TEST-WEBHOOK-005: Webhook dostępny bez JWT
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  FUNCTIONS_URL,
  callEdgeFunctionNoAuth,
  createServiceClient,
} from '../helpers/supabase-client'
import { createTestOrder, cleanupTestData } from '../helpers/test-utils'

describe('tpay-webhook', () => {
  let testOrderId: string
  let testOrderNumber: string
  const createdOrderIds: string[] = []

  beforeAll(async () => {
    // Create a test order for webhook tests
    const order = await createTestOrder({ amount: 100, status: 'pending' })
    testOrderId = order.id
    testOrderNumber = order.order_number
    createdOrderIds.push(testOrderId)
  })

  afterAll(async () => {
    await cleanupTestData({ orderIds: createdOrderIds })
  })

  /**
   * TEST-WEBHOOK-005: Webhook dostępny bez JWT
   * CRITICAL - Tpay nie wysyła JWT, więc endpoint MUSI być dostępny bez autoryzacji
   */
  it('TEST-WEBHOOK-005: should be accessible without JWT (no 401)', async () => {
    const response = await fetch(`${FUNCTIONS_URL}/tpay-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'tr_id=test123&tr_status=TRUE&tr_amount=100',
    })

    // Should NOT return 401 (Unauthorized)
    expect(response.status).not.toBe(401)
    // Should return 200 (even if order not found)
    expect(response.status).toBe(200)
  })

  /**
   * TEST-WEBHOOK-001: Płatność udana (TRUE)
   * CRITICAL - główny flow przyjmowania płatności
   */
  it('TEST-WEBHOOK-001: should mark order as paid when tr_status=TRUE', async () => {
    // Create fresh order for this test
    const order = await createTestOrder({ amount: 100, status: 'pending' })
    createdOrderIds.push(order.id)

    const serviceClient = createServiceClient()

    // Update order to have payment_reference
    const transactionId = `TR-TEST-${Date.now()}`
    await serviceClient
      .from('orders')
      .update({ payment_reference: transactionId })
      .eq('id', order.id)

    // Send webhook
    const formData = new URLSearchParams({
      tr_id: transactionId,
      tr_status: 'TRUE',
      tr_amount: '100.00',
      tr_crc: order.id, // CRC contains order ID
    })

    const response = await fetch(`${FUNCTIONS_URL}/tpay-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    expect(response.status).toBe(200)
    const text = await response.text()
    expect(text).toBe('TRUE')

    // Verify order status changed
    const { data: updatedOrder } = await serviceClient
      .from('orders')
      .select('status, paid_at')
      .eq('id', order.id)
      .single()

    expect(updatedOrder?.status).toBe('paid')
    expect(updatedOrder?.paid_at).toBeTruthy()
  })

  /**
   * TEST-WEBHOOK-002: Płatność nieudana (FALSE)
   */
  it('TEST-WEBHOOK-002: should not change status when tr_status=FALSE', async () => {
    const order = await createTestOrder({ amount: 100, status: 'pending' })
    createdOrderIds.push(order.id)

    const serviceClient = createServiceClient()
    const transactionId = `TR-TEST-${Date.now()}`

    await serviceClient
      .from('orders')
      .update({ payment_reference: transactionId })
      .eq('id', order.id)

    const formData = new URLSearchParams({
      tr_id: transactionId,
      tr_status: 'FALSE',
      tr_amount: '100.00',
      tr_crc: order.id,
    })

    const response = await fetch(`${FUNCTIONS_URL}/tpay-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    expect(response.status).toBe(200)

    // Verify order status NOT changed
    const { data: updatedOrder } = await serviceClient
      .from('orders')
      .select('status')
      .eq('id', order.id)
      .single()

    expect(updatedOrder?.status).toBe('pending')
  })

  /**
   * TEST-WEBHOOK-003: Chargeback/refund
   */
  it('TEST-WEBHOOK-003: should mark order as cancelled on CHARGEBACK', async () => {
    const order = await createTestOrder({ amount: 100, status: 'paid' })
    createdOrderIds.push(order.id)

    const serviceClient = createServiceClient()
    const transactionId = `TR-TEST-${Date.now()}`

    await serviceClient
      .from('orders')
      .update({ payment_reference: transactionId })
      .eq('id', order.id)

    const formData = new URLSearchParams({
      tr_id: transactionId,
      tr_status: 'CHARGEBACK',
      tr_amount: '100.00',
      tr_crc: order.id,
    })

    const response = await fetch(`${FUNCTIONS_URL}/tpay-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    expect(response.status).toBe(200)

    // Verify order status changed to cancelled
    const { data: updatedOrder } = await serviceClient
      .from('orders')
      .select('status')
      .eq('id', order.id)
      .single()

    expect(updatedOrder?.status).toBe('cancelled')
  })

  /**
   * TEST-WEBHOOK-004: Brak tr_id
   * Note: Webhook returns 400 for invalid requests (missing tr_id)
   */
  it('TEST-WEBHOOK-004: should reject request when tr_id missing', async () => {
    const formData = new URLSearchParams({
      tr_status: 'TRUE',
      tr_amount: '100.00',
    })

    const response = await fetch(`${FUNCTIONS_URL}/tpay-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    // Webhook returns 400 for missing required fields
    expect(response.status).toBe(400)
  })

  /**
   * TEST-WEBHOOK-007: Inkrementacja kodu rabatowego
   */
  it('TEST-WEBHOOK-007: should increment discount code usage on payment', async () => {
    const serviceClient = createServiceClient()

    // Create a test discount code
    const discountCode = `TEST-DISCOUNT-${Date.now()}`
    const { data: discount, error: discountError } = await serviceClient
      .from('discount_codes')
      .insert({
        code: discountCode,
        discount_percent: 10,
        max_uses: 100,
        current_uses: 0,
        is_active: true,
      })
      .select('id, current_uses')
      .single()

    if (discountError) {
      console.warn('Could not create discount code for test:', discountError.message)
      return // Skip test if discount_codes table doesn't exist
    }

    // Create order with discount
    const order = await createTestOrder({ amount: 90, status: 'pending' })
    createdOrderIds.push(order.id)

    const transactionId = `TR-TEST-${Date.now()}`

    await serviceClient.from('orders').update({
      payment_reference: transactionId,
      discount_code_id: discount.id,
    }).eq('id', order.id)

    // Send successful payment webhook
    const formData = new URLSearchParams({
      tr_id: transactionId,
      tr_status: 'TRUE',
      tr_amount: '90.00',
      tr_crc: order.id,
    })

    await fetch(`${FUNCTIONS_URL}/tpay-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    })

    // Verify discount usage incremented
    const { data: updatedDiscount } = await serviceClient
      .from('discount_codes')
      .select('current_uses')
      .eq('id', discount.id)
      .single()

    expect(updatedDiscount?.current_uses).toBe(1)

    // Cleanup
    await serviceClient.from('discount_codes').delete().eq('id', discount.id)
  })
})
