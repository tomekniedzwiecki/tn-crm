-- Migration: Add open_question column to leads table
-- This stores the optional additional information from the survey form

ALTER TABLE leads ADD COLUMN IF NOT EXISTS open_question TEXT;
