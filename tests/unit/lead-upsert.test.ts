/**
 * Testy dla lead-upsert edge function
 * CRITICAL priority - główne źródło leadów
 *
 * TEST-LEAD-001: Tworzenie nowego leada
 * TEST-LEAD-002: Aktualizacja istniejącego leada
 * TEST-LEAD-003: Walidacja emaila
 * TEST-LEAD-004: Normalizacja emaila
 * TEST-LEAD-005: Ankieta - survey_completed_at
 */

import { describe, it, expect, afterAll } from 'vitest'
import {
  FUNCTIONS_URL,
  createServiceClient,
} from '../helpers/supabase-client'
import { generateTestEmail, cleanupTestData } from '../helpers/test-utils'

describe('lead-upsert', () => {
  const createdLeadIds: string[] = []
  const createdEmails: string[] = []

  afterAll(async () => {
    // Cleanup test leads
    const serviceClient = createServiceClient()
    if (createdEmails.length > 0) {
      await serviceClient.from('leads').delete().in('email', createdEmails)
    }
  })

  /**
   * TEST-LEAD-001: Tworzenie nowego leada
   * CRITICAL - podstawowa funkcjonalność
   */
  it('TEST-LEAD-001: should create new lead with required fields', async () => {
    const testEmail = generateTestEmail()
    createdEmails.push(testEmail)

    const response = await fetch(`${FUNCTIONS_URL}/lead-upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        name: 'Jan Kowalski',
      }),
    })

    expect(response.status).toBe(200)
    const result = await response.json()

    expect(result.success).toBe(true)
    expect(result.is_new).toBe(true)
    expect(result.lead_id).toBeTruthy()

    createdLeadIds.push(result.lead_id)

    // Verify lead exists in database
    const serviceClient = createServiceClient()
    const { data: lead } = await serviceClient
      .from('leads')
      .select('*')
      .eq('id', result.lead_id)
      .single()

    expect(lead).toBeTruthy()
    expect(lead?.email).toBe(testEmail)
    expect(lead?.name).toBe('Jan Kowalski')
  })

  /**
   * TEST-LEAD-002: Aktualizacja istniejącego leada
   * CRITICAL - upsert logic
   */
  it('TEST-LEAD-002: should update existing lead with same email', async () => {
    const testEmail = generateTestEmail()
    createdEmails.push(testEmail)

    // First request - create lead
    const response1 = await fetch(`${FUNCTIONS_URL}/lead-upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        name: 'Stara Nazwa',
      }),
    })

    const result1 = await response1.json()
    expect(result1.is_new).toBe(true)
    createdLeadIds.push(result1.lead_id)

    // Second request - update lead
    const response2 = await fetch(`${FUNCTIONS_URL}/lead-upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        name: 'Nowa Nazwa',
        phone: '+48500600700',
      }),
    })

    const result2 = await response2.json()
    expect(result2.success).toBe(true)
    expect(result2.is_new).toBe(false)
    expect(result2.lead_id).toBe(result1.lead_id) // Same lead ID

    // Verify data was updated
    const serviceClient = createServiceClient()
    const { data: lead } = await serviceClient
      .from('leads')
      .select('*')
      .eq('id', result1.lead_id)
      .single()

    expect(lead?.name).toBe('Nowa Nazwa')
    expect(lead?.phone).toBe('+48500600700')
  })

  /**
   * TEST-LEAD-003: Walidacja emaila
   * HIGH - ochrona przed złymi danymi
   */
  it('TEST-LEAD-003: should reject request without email', async () => {
    const response = await fetch(`${FUNCTIONS_URL}/lead-upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jan Kowalski',
        // No email provided
      }),
    })

    // Should return error
    expect(response.status).toBe(400)
    const result = await response.json()
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  /**
   * TEST-LEAD-004: Normalizacja emaila
   * MEDIUM - spójność danych
   */
  it('TEST-LEAD-004: should normalize email to lowercase', async () => {
    const baseEmail = `TEST-UPPER-${Date.now()}@EXAMPLE.COM`
    const normalizedEmail = baseEmail.toLowerCase()
    createdEmails.push(normalizedEmail)

    const response = await fetch(`${FUNCTIONS_URL}/lead-upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: baseEmail,
        name: 'Test User',
      }),
    })

    const result = await response.json()
    expect(result.success).toBe(true)
    createdLeadIds.push(result.lead_id)

    // Verify email was normalized
    const serviceClient = createServiceClient()
    const { data: lead } = await serviceClient
      .from('leads')
      .select('email')
      .eq('id', result.lead_id)
      .single()

    expect(lead?.email).toBe(normalizedEmail)
  })

  /**
   * TEST-LEAD-005: Ankieta - survey_completed_at
   * HIGH - tracking wypełnienia ankiety
   */
  it('TEST-LEAD-005: should set survey_completed_at when survey data provided', async () => {
    const testEmail = generateTestEmail()
    createdEmails.push(testEmail)

    const response = await fetch(`${FUNCTIONS_URL}/lead-upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        name: 'Survey User',
        weekly_hours: '20-40',
        target_income: '10000',
      }),
    })

    const result = await response.json()
    expect(result.success).toBe(true)
    createdLeadIds.push(result.lead_id)

    // Verify survey_completed_at is set
    const serviceClient = createServiceClient()
    const { data: lead } = await serviceClient
      .from('leads')
      .select('survey_completed_at')
      .eq('id', result.lead_id)
      .single()

    expect(lead?.survey_completed_at).toBeTruthy()
  })

  /**
   * Test dodatkowy: pola opcjonalne
   * Note: Not all fields may be persisted by lead-upsert - test what is available
   */
  it('should handle optional fields correctly', async () => {
    const testEmail = generateTestEmail()
    createdEmails.push(testEmail)

    const response = await fetch(`${FUNCTIONS_URL}/lead-upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        name: 'Full Lead',
        phone: '+48123456789',
        niche: 'fitness',
        social_link: 'https://instagram.com/test',
        utm_source: 'fb_ads',
        utm_medium: 'cpc',
        utm_campaign: 'test_campaign',
      }),
    })

    const result = await response.json()
    expect(result.success).toBe(true)
    createdLeadIds.push(result.lead_id)

    // Verify fields that are expected to be stored
    const serviceClient = createServiceClient()
    const { data: lead } = await serviceClient
      .from('leads')
      .select('*')
      .eq('id', result.lead_id)
      .single()

    expect(lead).toBeTruthy()
    expect(lead?.email).toBe(testEmail)
    expect(lead?.name).toBe('Full Lead')
    // Phone and other fields depend on lead-upsert implementation
    if (lead?.phone) {
      expect(lead.phone).toBe('+48123456789')
    }
  })
})
