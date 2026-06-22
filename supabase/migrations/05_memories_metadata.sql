-- Migration: 05_memories_metadata.sql
-- Description: Adds a metadata JSONB column to the memories table to support storing additional context (e.g., expected_answer for gatekeeper challenges).

ALTER TABLE memories ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
