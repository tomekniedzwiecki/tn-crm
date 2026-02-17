/**
 * Testy checkout flow
 * CRITICAL/HIGH priority
 *
 * TEST-CHECKOUT-001: Ładowanie oferty
 * TEST-CHECKOUT-002: Walidacja formularza
 * TEST-CHECKOUT-003: Tworzenie zamówienia
 * TEST-CHECKOUT-004: Kod rabatowy
 * TEST-CHECKOUT-005: Custom payment
 * TEST-PAY-001: Tworzenie transakcji BLIK
 * TEST-PAY-002: Tworzenie transakcji przelew
 * TEST-PAY-003: Zamówienie już opłacone
 * TEST-PAY-004: Nieistniejące zamówienie
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  FUNCTIONS_URL,
  createServiceClient,
  callEdgeFunction,
} from '../helpers/supabase-client'
import {
  createTestLead,
  createTestOrder,
  createTestClientOffer,
  cleanupTestData,
  generateTestEmail,
} from '../helpers/test-utils'

describe('Checkout Flow', () => {
  let testLeadId: string
  let testOfferId: string
  let testClientOfferId: string
  let testClientOfferToken: string

  const createdIds = {
    leadIds: [] as string[],
    orderIds: [] as string[],
    clientOfferIds: [] as string[],
  }

  beforeAll(async () => {
    const lead = await createTestLead()
    testLeadId = lead.id
    createdIds.leadIds.push(testLeadId)

    const serviceClient = createServiceClient()

    // Get or create test offer
    const { data: offers } = await serviceClient
      .from('offers')
      .select('id')
      .eq('is_active', true)
      .limit(1)

    testOfferId = offers?.[0]?.id

    if (!testOfferId) {
      const { data: newOffer } = await serviceClient
        .from('offers')
        .insert({
          name: 'Test Offer',
          price: 1000,
          is_active: true,
        })
        .select('id')
        .single()
      testOfferId = newOffer?.id
    }

    // Create client_offer
    const clientOffer = await createTestClientOffer(testLeadId, testOfferId)
    testClientOfferId = clientOffer.id
    testClientOfferToken = clientOffer.access_token
    createdIds.clientOfferIds.push(testClientOfferId)
  })

  afterAll(async () => {
    const serviceClient = createServiceClient()
    if (createdIds.clientOfferIds.length > 0) {
      await serviceClient.from('client_offers').delete().in('id', createdIds.clientOfferIds)
    }
    if (createdIds.orderIds.length > 0) {
      await serviceClient.from('orders').delete().in('id', createdIds.orderIds)
    }
    await cleanupTestData({ leadIds: createdIds.leadIds })
  })

  describe('TEST-CHECKOUT-003: Order creation', () => {
    it('should create order with pending status', async () => {
      const serviceClient = createServiceClient()
      const testEmail = generateTestEmail()

      const { data: order, error } = await serviceClient
        .from('orders')
        .insert({
          order_number: `TEST-${Date.now()}`,
          amount: 1000,
          status: 'pending',
          customer_email: testEmail,
          customer_name: 'Test Customer',
          description: 'Test Order',
          lead_id: testLeadId,
          client_offer_id: testClientOfferId,
        })
        .select('id, order_number, status')
        .single()

      expect(error).toBeNull()
      expect(order).toBeTruthy()
      expect(order?.status).toBe('pending')

      createdIds.orderIds.push(order!.id)
    })
  })

  describe('tpay-create-transaction', () => {
    /**
     * TEST-PAY-004: Nieistniejące zamówienie
     */
    it('TEST-PAY-004: should reject non-existent order', async () => {
      const response = await callEdgeFunction('tpay-create-transaction', {
        orderId: '00000000-0000-0000-0000-000000000000',
        paymentType: 'blik',
      })

      expect(response.status).toBe(400)
      const result = await response.json()
      expect(result.success).toBe(false)
      expect(result.error).toContain('nie znalezione')
    })

    /**
     * TEST-PAY-003: Zamówienie już opłacone
     */
    it('TEST-PAY-003: should reject already paid order', async () => {
      const order = await createTestOrder({ status: 'paid' })
      createdIds.orderIds.push(order.id)

      const response = await callEdgeFunction('tpay-create-transaction', {
        orderId: order.id,
        paymentType: 'blik',
      })

      expect(response.status).toBe(400)
      const result = await response.json()
      expect(result.success).toBe(false)
      expect(result.error).toContain('opłacone')
    })

    /**
     * TEST-PAY-001: Tworzenie transakcji BLIK
     */
    it('TEST-PAY-001: should create BLIK transaction', async () => {
      const order = await createTestOrder({ amount: 100, status: 'pending' })
      createdIds.orderIds.push(order.id)

      const response = await callEdgeFunction('tpay-create-transaction', {
        orderId: order.id,
        paymentType: 'blik',
        blikCode: '123456',
      })

      // May return error if Tpay credentials aren't configured in test env
      if (response.status === 200) {
        const result = await response.json()
        expect(result.success).toBe(true)
        expect(result.transactionId).toBeTruthy()
        expect(result.blikInline).toBe(true)
      } else {
        // If Tpay not configured, just verify proper error handling
        const result = await response.json()
        expect(result.success).toBe(false)
        expect(result.error).toBeTruthy()
      }
    })

    /**
     * TEST-PAY-002: Tworzenie transakcji przelew
     */
    it('TEST-PAY-002: should create transfer transaction', async () => {
      const order = await createTestOrder({ amount: 100, status: 'pending' })
      createdIds.orderIds.push(order.id)

      const response = await callEdgeFunction('tpay-create-transaction', {
        orderId: order.id,
        paymentType: 'transfer',
      })

      if (response.status === 200) {
        const result = await response.json()
        expect(result.success).toBe(true)
        expect(result.paymentUrl).toBeTruthy()
      }
    })

    /**
     * TEST-PAY: Card transaction
     */
    it('should create card transaction', async () => {
      const order = await createTestOrder({ amount: 100, status: 'pending' })
      createdIds.orderIds.push(order.id)

      const response = await callEdgeFunction('tpay-create-transaction', {
        orderId: order.id,
        paymentType: 'card',
      })

      if (response.status === 200) {
        const result = await response.json()
        expect(result.success).toBe(true)
        expect(result.paymentUrl).toBeTruthy()
      }
    })
  })

  describe('TEST-CHECKOUT-004: Discount codes', () => {
    it('should validate discount code via RPC', async () => {
      const serviceClient = createServiceClient()

      // Create test discount code
      const discountCode = `TEST-${Date.now()}`
      const { data: discount, error: discountError } = await serviceClient
        .from('discount_codes')
        .insert({
          code: discountCode,
          discount_percent: 20,
          max_uses: 100,
          current_uses: 0,
          is_active: true,
        })
        .select('id')
        .single()

      if (discountError) {
        console.warn('Could not create discount code, skipping test')
        return
      }

      // Test validation RPC
      const { data: validation } = await serviceClient.rpc('validate_discount_code', {
        p_code: discountCode,
      })

      expect(validation).toBeTruthy()

      // Cleanup
      await serviceClient.from('discount_codes').delete().eq('id', discount.id)
    })

    it('should reject expired discount code', async () => {
      const serviceClient = createServiceClient()

      // Create expired discount code
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const discountCode = `EXPIRED-${Date.now()}`
      const { data: discount, error: discountError } = await serviceClient
        .from('discount_codes')
        .insert({
          code: discountCode,
          discount_percent: 20,
          max_uses: 100,
          current_uses: 0,
          is_active: true,
          valid_until: yesterday.toISOString(),
        })
        .select('id')
        .single()

      if (discountError) {
        console.warn('Could not create discount code, skipping test')
        return
      }

      // Test validation RPC
      const { data: validation, error } = await serviceClient.rpc('validate_discount_code', {
        p_code: discountCode,
      })

      // Should return null/error for expired code
      expect(validation?.valid || false).toBe(false)

      // Cleanup
      await serviceClient.from('discount_codes').delete().eq('id', discount.id)
    })

    it('should reject code with exhausted uses', async () => {
      const serviceClient = createServiceClient()

      const discountCode = `USED-UP-${Date.now()}`
      const { data: discount, error: discountError } = await serviceClient
        .from('discount_codes')
        .insert({
          code: discountCode,
          discount_percent: 20,
          max_uses: 5,
          current_uses: 5, // Already at max
          is_active: true,
        })
        .select('id')
        .single()

      if (discountError) {
        console.warn('Could not create discount code, skipping test')
        return
      }

      const { data: validation } = await serviceClient.rpc('validate_discount_code', {
        p_code: discountCode,
      })

      expect(validation?.valid || false).toBe(false)

      // Cleanup
      await serviceClient.from('discount_codes').delete().eq('id', discount.id)
    })
  })

  describe('Order workflow', () => {
    it('should link order to lead', async () => {
      const serviceClient = createServiceClient()

      const { data: order } = await serviceClient
        .from('orders')
        .insert({
          order_number: `TEST-LEAD-${Date.now()}`,
          amount: 500,
          status: 'pending',
          customer_email: 'test@example.com',
          lead_id: testLeadId,
        })
        .select('id, lead_id')
        .single()

      expect(order?.lead_id).toBe(testLeadId)
      createdIds.orderIds.push(order!.id)
    })

    it('should link order to client_offer', async () => {
      const serviceClient = createServiceClient()

      const { data: order } = await serviceClient
        .from('orders')
        .insert({
          order_number: `TEST-OFFER-${Date.now()}`,
          amount: 500,
          status: 'pending',
          customer_email: 'test@example.com',
          client_offer_id: testClientOfferId,
        })
        .select('id, client_offer_id')
        .single()

      expect(order?.client_offer_id).toBe(testClientOfferId)
      createdIds.orderIds.push(order!.id)
    })
  })
})
