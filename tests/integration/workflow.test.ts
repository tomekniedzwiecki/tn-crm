/**
 * Testy workflows (projekty klientów)
 * CRITICAL/HIGH priority
 *
 * TEST-WF-001: Automatyczne tworzenie workflow po płatności
 * TEST-WF-002: Kopiowanie milestones z oferty
 * TEST-WF-003: Generowanie unique_token
 * TEST-WF-ACCESS-001: Dostęp przez token
 * TEST-WF-ACCESS-002: Ustawianie hasła
 * TEST-WF-ACCESS-003: Reset hasła
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  createAnonClient,
  createServiceClient,
} from '../helpers/supabase-client'
import {
  createTestWorkflow,
  createTestOrder,
  cleanupTestData,
  generateTestEmail,
} from '../helpers/test-utils'

describe('Workflows', () => {
  const createdIds = {
    workflowIds: [] as string[],
    orderIds: [] as string[],
  }

  afterAll(async () => {
    const serviceClient = createServiceClient()
    if (createdIds.workflowIds.length > 0) {
      await serviceClient.from('workflows').delete().in('id', createdIds.workflowIds)
    }
    await cleanupTestData({ orderIds: createdIds.orderIds })
  })

  describe('TEST-WF-003: Token generation', () => {
    it('should generate unique_token on workflow creation', async () => {
      const workflow = await createTestWorkflow({})
      createdIds.workflowIds.push(workflow.id)

      expect(workflow.unique_token).toBeTruthy()
      expect(workflow.unique_token.length).toBeGreaterThanOrEqual(32)
    })

    it('should generate unique tokens for each workflow', async () => {
      const workflow1 = await createTestWorkflow({})
      const workflow2 = await createTestWorkflow({})

      createdIds.workflowIds.push(workflow1.id, workflow2.id)

      expect(workflow1.unique_token).not.toBe(workflow2.unique_token)
    })
  })

  describe('TEST-WF-ACCESS-001: Token access', () => {
    it('anon CAN access workflow by unique_token', async () => {
      const workflow = await createTestWorkflow({})
      createdIds.workflowIds.push(workflow.id)

      const anonClient = createAnonClient()

      const { data, error } = await anonClient
        .from('workflows')
        .select('id, customer_name, status')
        .eq('unique_token', workflow.unique_token)
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data?.id).toBe(workflow.id)
    })

    it('anon cannot access all workflows', async () => {
      const anonClient = createAnonClient()

      const { data } = await anonClient
        .from('workflows')
        .select('*')
        .limit(10)

      // Should return 0 rows (RLS blocks)
      expect(data?.length || 0).toBe(0)
    })
  })

  describe('TEST-WF-ACCESS-002: Password setting', () => {
    it('should set password via RPC function', async () => {
      const workflow = await createTestWorkflow({})
      createdIds.workflowIds.push(workflow.id)

      const anonClient = createAnonClient()

      // Use the secure RPC function to set password
      const { data, error } = await anonClient.rpc('set_workflow_client_password', {
        p_token: workflow.unique_token,
        p_password_hash: '$2a$10$test_hash_here_12345678901234567890',
      })

      expect(error).toBeNull()
      expect(data).toBe(true)

      // Verify password was set
      const serviceClient = createServiceClient()
      const { data: updated } = await serviceClient
        .from('workflows')
        .select('client_password_hash')
        .eq('id', workflow.id)
        .single()

      expect(updated?.client_password_hash).toBeTruthy()
    })

    it('should reject password set with invalid token', async () => {
      const anonClient = createAnonClient()

      const { data, error } = await anonClient.rpc('set_workflow_client_password', {
        p_token: 'invalid-token-12345',
        p_password_hash: '$2a$10$test_hash',
      })

      expect(data).toBe(false)
    })
  })

  describe('TEST-WF-ACCESS-003: Password reset', () => {
    it('should reset password via RPC function', async () => {
      const serviceClient = createServiceClient()

      // Create workflow with reset token
      const workflow = await createTestWorkflow({})
      createdIds.workflowIds.push(workflow.id)

      const resetToken = 'reset-token-' + Date.now()
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

      await serviceClient
        .from('workflows')
        .update({
          password_reset_token: resetToken,
          password_reset_expires: resetExpires.toISOString(),
        })
        .eq('id', workflow.id)

      // Use RPC to reset password
      const anonClient = createAnonClient()
      const { data, error } = await anonClient.rpc('reset_workflow_client_password', {
        p_token: workflow.unique_token,
        p_reset_token: resetToken,
        p_password_hash: '$2a$10$new_password_hash_here',
      })

      expect(error).toBeNull()
      expect(data?.success).toBe(true)

      // Verify password was updated and reset token cleared
      const { data: updated } = await serviceClient
        .from('workflows')
        .select('client_password_hash, password_reset_token')
        .eq('id', workflow.id)
        .single()

      expect(updated?.client_password_hash).toContain('new_password')
      expect(updated?.password_reset_token).toBeNull()
    })

    it('should reject reset with expired token', async () => {
      const serviceClient = createServiceClient()

      const workflow = await createTestWorkflow({})
      createdIds.workflowIds.push(workflow.id)

      const resetToken = 'expired-token-' + Date.now()
      const expiredTime = new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago

      await serviceClient
        .from('workflows')
        .update({
          password_reset_token: resetToken,
          password_reset_expires: expiredTime.toISOString(),
        })
        .eq('id', workflow.id)

      const anonClient = createAnonClient()
      const { data } = await anonClient.rpc('reset_workflow_client_password', {
        p_token: workflow.unique_token,
        p_reset_token: resetToken,
        p_password_hash: '$2a$10$should_not_work',
      })

      expect(data?.success).toBe(false)
      expect(data?.error).toContain('expired')
    })

    it('should reject reset with wrong reset token', async () => {
      const serviceClient = createServiceClient()

      const workflow = await createTestWorkflow({})
      createdIds.workflowIds.push(workflow.id)

      await serviceClient
        .from('workflows')
        .update({
          password_reset_token: 'correct-token',
          password_reset_expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        })
        .eq('id', workflow.id)

      const anonClient = createAnonClient()
      const { data } = await anonClient.rpc('reset_workflow_client_password', {
        p_token: workflow.unique_token,
        p_reset_token: 'wrong-token',
        p_password_hash: '$2a$10$should_not_work',
      })

      expect(data?.success).toBe(false)
      expect(data?.error).toContain('Invalid')
    })
  })

  describe('Workflow data', () => {
    it('should store customer information', async () => {
      const serviceClient = createServiceClient()
      const testEmail = generateTestEmail()

      const { data: workflow, error } = await serviceClient
        .from('workflows')
        .insert({
          customer_name: 'Jan Kowalski',
          customer_email: testEmail,
          customer_phone: '+48500600700',
          status: 'active',
        })
        .select('*')
        .single()

      expect(error).toBeNull()
      expect(workflow?.customer_name).toBe('Jan Kowalski')
      expect(workflow?.customer_email).toBe(testEmail)

      createdIds.workflowIds.push(workflow!.id)
    })

    it('should find workflows by customer email', async () => {
      const serviceClient = createServiceClient()
      const testEmail = generateTestEmail()

      const { data: workflow1 } = await serviceClient
        .from('workflows')
        .insert({ customer_name: 'Project 1', customer_email: testEmail, status: 'active' })
        .select('id')
        .single()

      const { data: workflow2 } = await serviceClient
        .from('workflows')
        .insert({ customer_name: 'Project 2', customer_email: testEmail, status: 'active' })
        .select('id')
        .single()

      createdIds.workflowIds.push(workflow1!.id, workflow2!.id)

      // Find by email
      const { data: found } = await serviceClient
        .from('workflows')
        .select('id, customer_name')
        .eq('customer_email', testEmail)

      expect(found?.length).toBe(2)
    })
  })
})
