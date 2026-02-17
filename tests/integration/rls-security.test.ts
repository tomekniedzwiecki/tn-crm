/**
 * Testy RLS (Row Level Security) dla krytycznych tabel
 * CRITICAL priority - ochrona danych
 *
 * TEST-RLS-001: leads - anon blocked
 * TEST-RLS-002: orders - anon blocked
 * TEST-RLS-003: client_offers - anon token access
 * TEST-RLS-004: workflow_progress - anon blocked
 * TEST-RLS-005: Views security_invoker
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  createAnonClient,
  createServiceClient,
} from '../helpers/supabase-client'
import {
  createTestLead,
  createTestOrder,
  createTestClientOffer,
  createTestWorkflow,
  cleanupTestData,
  generateTestToken,
} from '../helpers/test-utils'

describe('RLS Security Tests', () => {
  let testLeadId: string
  let testOrderId: string
  let testClientOfferId: string
  let testClientOfferToken: string
  let testWorkflowId: string

  const createdIds = {
    leadIds: [] as string[],
    orderIds: [] as string[],
    clientOfferIds: [] as string[],
    workflowIds: [] as string[],
  }

  beforeAll(async () => {
    // Create test data using service role
    const lead = await createTestLead()
    testLeadId = lead.id
    createdIds.leadIds.push(testLeadId)

    const order = await createTestOrder({ leadId: testLeadId })
    testOrderId = order.id
    createdIds.orderIds.push(testOrderId)

    const clientOffer = await createTestClientOffer(testLeadId)
    testClientOfferId = clientOffer.id
    testClientOfferToken = clientOffer.access_token
    createdIds.clientOfferIds.push(testClientOfferId)

    const workflow = await createTestWorkflow({ orderId: testOrderId })
    testWorkflowId = workflow.id
    createdIds.workflowIds.push(testWorkflowId)
  })

  afterAll(async () => {
    await cleanupTestData(createdIds)
  })

  describe('TEST-RLS-001: leads table', () => {
    /**
     * Anon nie może czytać leadów
     */
    it('anon cannot SELECT from leads', async () => {
      const anonClient = createAnonClient()

      const { data, error } = await anonClient
        .from('leads')
        .select('*')
        .limit(1)

      // RLS should block - either empty data or error
      expect(data?.length || 0).toBe(0)
    })

    /**
     * Anon nie może wstawiać leadów bezpośrednio
     */
    it('anon cannot INSERT into leads directly', async () => {
      const anonClient = createAnonClient()

      const { data, error } = await anonClient.from('leads').insert({
        email: 'hacker@evil.com',
        name: 'Hacker',
      })

      // Should fail due to RLS
      expect(error).toBeTruthy()
    })

    /**
     * Anon nie może aktualizować leadów
     */
    it('anon cannot UPDATE leads', async () => {
      const anonClient = createAnonClient()

      const { data, error, count } = await anonClient
        .from('leads')
        .update({ name: 'Hacked' })
        .eq('id', testLeadId)
        .select()

      // Should affect 0 rows
      expect(data?.length || 0).toBe(0)
    })

    /**
     * Anon nie może usuwać leadów
     */
    it('anon cannot DELETE leads', async () => {
      const anonClient = createAnonClient()

      const { data, error, count } = await anonClient
        .from('leads')
        .delete()
        .eq('id', testLeadId)
        .select()

      // Should affect 0 rows
      expect(data?.length || 0).toBe(0)

      // Verify lead still exists
      const serviceClient = createServiceClient()
      const { data: lead } = await serviceClient
        .from('leads')
        .select('id')
        .eq('id', testLeadId)
        .single()

      expect(lead).toBeTruthy()
    })
  })

  describe('TEST-RLS-002: orders table', () => {
    /**
     * Anon nie może czytać zamówień
     */
    it('anon cannot SELECT from orders', async () => {
      const anonClient = createAnonClient()

      const { data } = await anonClient.from('orders').select('*').limit(1)

      expect(data?.length || 0).toBe(0)
    })

    /**
     * Anon nie może wstawiać zamówień bezpośrednio
     */
    it('anon cannot INSERT into orders directly', async () => {
      const anonClient = createAnonClient()

      const { error } = await anonClient.from('orders').insert({
        order_number: 'HACK-001',
        amount: 1,
        customer_email: 'hacker@evil.com',
      })

      expect(error).toBeTruthy()
    })

    /**
     * Anon nie może aktualizować zamówień
     */
    it('anon cannot UPDATE orders', async () => {
      const anonClient = createAnonClient()

      const { data } = await anonClient
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', testOrderId)
        .select()

      expect(data?.length || 0).toBe(0)
    })
  })

  describe('TEST-RLS-003: client_offers table', () => {
    /**
     * Anon MOŻE czytać client_offers przez token
     */
    it('anon CAN SELECT client_offers with valid token', async () => {
      const anonClient = createAnonClient()

      const { data, error } = await anonClient
        .from('client_offers')
        .select('id, access_token, lead_id')
        .eq('access_token', testClientOfferToken)
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data?.id).toBe(testClientOfferId)
    })

    /**
     * Anon NIE MOŻE czytać client_offers bez tokena
     */
    it('anon cannot SELECT client_offers without token', async () => {
      const anonClient = createAnonClient()

      const { data } = await anonClient
        .from('client_offers')
        .select('*')
        // No WHERE clause for token

      // Should return 0 rows (RLS blocks)
      expect(data?.length || 0).toBe(0)
    })

    /**
     * Anon NIE MOŻE czytać z nieprawidłowym tokenem
     */
    it('anon cannot SELECT with invalid token', async () => {
      const anonClient = createAnonClient()

      const { data } = await anonClient
        .from('client_offers')
        .select('*')
        .eq('access_token', 'invalid-token-12345')

      expect(data?.length || 0).toBe(0)
    })

    /**
     * Anon NIE MOŻE wstawiać client_offers
     */
    it('anon cannot INSERT client_offers', async () => {
      const anonClient = createAnonClient()

      const { error } = await anonClient.from('client_offers').insert({
        lead_id: testLeadId,
        offer_id: '00000000-0000-0000-0000-000000000000',
      })

      expect(error).toBeTruthy()
    })
  })

  describe('TEST-RLS-004: workflows table', () => {
    /**
     * Anon NIE MOŻE czytać workflows bezpośrednio
     */
    it('anon cannot SELECT all workflows', async () => {
      const anonClient = createAnonClient()

      const { data } = await anonClient.from('workflows').select('*').limit(1)

      expect(data?.length || 0).toBe(0)
    })

    /**
     * Anon MOŻE czytać workflow przez token
     */
    it('anon CAN SELECT workflow by unique_token', async () => {
      const serviceClient = createServiceClient()

      // Get the token first
      const { data: workflow } = await serviceClient
        .from('workflows')
        .select('unique_token')
        .eq('id', testWorkflowId)
        .single()

      if (!workflow?.unique_token) {
        console.warn('No unique_token on test workflow, skipping test')
        return
      }

      const anonClient = createAnonClient()
      const { data: anonData } = await anonClient
        .from('workflows')
        .select('id, unique_token, customer_name')
        .eq('unique_token', workflow.unique_token)
        .single()

      expect(anonData).toBeTruthy()
      expect(anonData?.id).toBe(testWorkflowId)
    })

    /**
     * Anon NIE MOŻE aktualizować workflows
     */
    it('anon cannot UPDATE workflows directly', async () => {
      const anonClient = createAnonClient()

      const { data } = await anonClient
        .from('workflows')
        .update({ customer_name: 'Hacked' })
        .eq('id', testWorkflowId)
        .select()

      expect(data?.length || 0).toBe(0)
    })
  })

  describe('TEST-RLS-005: Views with security_invoker', () => {
    /**
     * Views biznesowe powinny respektować RLS
     */
    it('anon cannot access business views', async () => {
      const anonClient = createAnonClient()

      // Try to access biznes_all_revenues view
      const { data: revenues } = await anonClient
        .from('biznes_all_revenues')
        .select('*')
        .limit(1)

      expect(revenues?.length || 0).toBe(0)

      // Try to access biznes_pipeline_summary view
      const { data: pipeline } = await anonClient
        .from('biznes_pipeline_summary')
        .select('*')
        .limit(1)

      expect(pipeline?.length || 0).toBe(0)
    })
  })

  describe('Additional RLS tests', () => {
    /**
     * automation_flows - anon blocked
     */
    it('anon cannot access automation_flows', async () => {
      const anonClient = createAnonClient()

      const { data } = await anonClient
        .from('automation_flows')
        .select('*')
        .limit(1)

      expect(data?.length || 0).toBe(0)
    })

    /**
     * automation_executions - anon blocked
     */
    it('anon cannot access automation_executions', async () => {
      const anonClient = createAnonClient()

      const { data } = await anonClient
        .from('automation_executions')
        .select('*')
        .limit(1)

      expect(data?.length || 0).toBe(0)
    })

    /**
     * email_tracking - anon blocked
     */
    it('anon cannot access email_tracking', async () => {
      const anonClient = createAnonClient()

      const { data } = await anonClient
        .from('email_tracking')
        .select('*')
        .limit(1)

      expect(data?.length || 0).toBe(0)
    })

    /**
     * outreach_contacts - anon blocked
     */
    it('anon cannot access outreach_contacts', async () => {
      const anonClient = createAnonClient()

      const { data } = await anonClient
        .from('outreach_contacts')
        .select('*')
        .limit(1)

      expect(data?.length || 0).toBe(0)
    })
  })
})
