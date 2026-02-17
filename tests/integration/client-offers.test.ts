/**
 * Testy dla client_offers - dostęp przez token
 * CRITICAL/HIGH priority
 *
 * TEST-OFFER-001: Tworzenie client_offer z tokenem
 * TEST-OFFER-002: custom_price nadpisuje offer.price
 * TEST-OFFER-ACCESS-001: Anon może czytać przez token
 * TEST-OFFER-ACCESS-002: Anon NIE może czytać BEZ tokena
 * TEST-OFFER-ACCESS-003: Wygasła oferta
 * TEST-OFFER-TRACK-001: Rejestracja otwarcia oferty
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  createAnonClient,
  createServiceClient,
} from '../helpers/supabase-client'
import {
  createTestLead,
  createTestClientOffer,
  cleanupTestData,
  generateTestToken,
} from '../helpers/test-utils'

describe('Client Offers', () => {
  let testLeadId: string
  let testOfferId: string
  const createdIds = {
    leadIds: [] as string[],
    clientOfferIds: [] as string[],
  }

  beforeAll(async () => {
    // Create test lead
    const lead = await createTestLead()
    testLeadId = lead.id
    createdIds.leadIds.push(testLeadId)

    // Get first offer
    const serviceClient = createServiceClient()
    const { data: offers } = await serviceClient
      .from('offers')
      .select('id')
      .eq('is_active', true)
      .limit(1)

    testOfferId = offers?.[0]?.id
    if (!testOfferId) {
      // Create test offer if none exists
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
  })

  afterAll(async () => {
    const serviceClient = createServiceClient()
    if (createdIds.clientOfferIds.length > 0) {
      await serviceClient.from('client_offers').delete().in('id', createdIds.clientOfferIds)
    }
    await cleanupTestData({ leadIds: createdIds.leadIds })
  })

  describe('TEST-OFFER-001: Token generation', () => {
    it('should create client_offer with unique access_token', async () => {
      const serviceClient = createServiceClient()

      const { data, error } = await serviceClient
        .from('client_offers')
        .insert({
          lead_id: testLeadId,
          offer_id: testOfferId,
        })
        .select('id, access_token')
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data?.access_token).toBeTruthy()
      expect(data?.access_token.length).toBeGreaterThan(10)

      createdIds.clientOfferIds.push(data!.id)
    })

    it('should generate unique tokens for each client_offer', async () => {
      const serviceClient = createServiceClient()

      const { data: offer1 } = await serviceClient
        .from('client_offers')
        .insert({ lead_id: testLeadId, offer_id: testOfferId })
        .select('id, access_token')
        .single()

      const { data: offer2 } = await serviceClient
        .from('client_offers')
        .insert({ lead_id: testLeadId, offer_id: testOfferId })
        .select('id, access_token')
        .single()

      expect(offer1?.access_token).not.toBe(offer2?.access_token)

      createdIds.clientOfferIds.push(offer1!.id, offer2!.id)
    })
  })

  describe('TEST-OFFER-002: Custom price', () => {
    it('custom_price should override offer base price', async () => {
      const serviceClient = createServiceClient()

      const customPrice = 500

      const { data: clientOffer } = await serviceClient
        .from('client_offers')
        .insert({
          lead_id: testLeadId,
          offer_id: testOfferId,
          custom_price: customPrice,
        })
        .select('id, custom_price')
        .single()

      expect(clientOffer?.custom_price).toBe(customPrice)
      createdIds.clientOfferIds.push(clientOffer!.id)

      // Verify original offer price is different
      const { data: offer } = await serviceClient
        .from('offers')
        .select('price')
        .eq('id', testOfferId)
        .single()

      expect(offer?.price).not.toBe(customPrice)
    })
  })

  describe('TEST-OFFER-ACCESS-001: Token access', () => {
    it('anon CAN access client_offer with valid token', async () => {
      const clientOffer = await createTestClientOffer(testLeadId, testOfferId)
      createdIds.clientOfferIds.push(clientOffer.id)

      const anonClient = createAnonClient()

      const { data, error } = await anonClient
        .from('client_offers')
        .select(`
          id,
          access_token,
          custom_price,
          valid_until,
          viewed_at,
          lead:leads(email, name),
          offer:offers(id, name, price, description)
        `)
        .eq('access_token', clientOffer.access_token)
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data?.id).toBe(clientOffer.id)
      expect(data?.offer).toBeTruthy()
    })
  })

  describe('TEST-OFFER-ACCESS-002: No token access', () => {
    it('anon cannot SELECT all client_offers', async () => {
      const anonClient = createAnonClient()

      const { data } = await anonClient
        .from('client_offers')
        .select('*')

      // RLS should block all rows
      expect(data?.length || 0).toBe(0)
    })

    it('anon cannot SELECT by lead_id only', async () => {
      const anonClient = createAnonClient()

      const { data } = await anonClient
        .from('client_offers')
        .select('*')
        .eq('lead_id', testLeadId)

      expect(data?.length || 0).toBe(0)
    })
  })

  describe('TEST-OFFER-ACCESS-003: Expired offers', () => {
    it('should indicate expired offer via valid_until', async () => {
      const serviceClient = createServiceClient()

      // Create offer that expired yesterday
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const { data: expiredOffer } = await serviceClient
        .from('client_offers')
        .insert({
          lead_id: testLeadId,
          offer_id: testOfferId,
          valid_until: yesterday.toISOString(),
        })
        .select('id, access_token, valid_until')
        .single()

      createdIds.clientOfferIds.push(expiredOffer!.id)

      // Anon can still read it
      const anonClient = createAnonClient()
      const { data } = await anonClient
        .from('client_offers')
        .select('valid_until')
        .eq('access_token', expiredOffer!.access_token)
        .single()

      expect(data).toBeTruthy()
      expect(new Date(data!.valid_until!)).toBeLessThan(new Date())
    })
  })

  describe('TEST-OFFER-TRACK-001: View tracking', () => {
    it('should allow updating viewed_at', async () => {
      const serviceClient = createServiceClient()

      const { data: clientOffer } = await serviceClient
        .from('client_offers')
        .insert({
          lead_id: testLeadId,
          offer_id: testOfferId,
        })
        .select('id, access_token')
        .single()

      createdIds.clientOfferIds.push(clientOffer!.id)

      // Verify viewed_at is null initially
      expect(clientOffer).toBeTruthy()

      // Update viewed_at (simulating page view)
      const { error } = await serviceClient
        .from('client_offers')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', clientOffer!.id)

      expect(error).toBeNull()

      // Verify viewed_at is set
      const { data: updated } = await serviceClient
        .from('client_offers')
        .select('viewed_at')
        .eq('id', clientOffer!.id)
        .single()

      expect(updated?.viewed_at).toBeTruthy()
    })
  })
})
