-- Migration: 005_version_5_1_corrections
-- Description: Fix constraints, add Time Tracking, and Comment Soft Deletes
-- Author: AI Assistant
-- Date: 2026-01-23

-- Note: This migration assumes 'tenant_xxx' schema. 
-- Replace 'tenant_xxx' with the actual schema name dynamically.

-- 1. CORRECTION: Relax Hierarchy Constraint
-- Users pointed out that checking ONLY project_id is too strict if subtasks rely on parent_task_id.
-- New Rule: A task must have EITHER a project_id OR a parent_task_id.
ALTER TABLE "tenant_xxx".tasks 
  DROP CONSTRAINT IF EXISTS check_task_project_presence;

ALTER TABLE "tenant_xxx".tasks 
  ADD CONSTRAINT check_task_project_presence 
  CHECK (project_id IS NOT NULL OR parent_task_id IS NOT NULL);

-- 2. FEATURE: Time Tracking (SLA / Billing)
ALTER TABLE "tenant_xxx".tasks
  ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC,
  ADD COLUMN IF NOT EXISTS actual_hours NUMERIC;

-- 3. FEATURE: Comment Soft Deletes (Moderation)
ALTER TABLE "tenant_xxx".task_comments
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- 4. POLICY ENFORCEMENT (Documentation in Code)
-- Audit Log Immutability:
-- Ideally we would revoke UPDATE/DELETE permissions here, but that is database-user specific.
-- For now, we add a comment to the table definition.
COMMENT ON TABLE "tenant_xxx".task_activity IS 'IMMUTABLE AUDIT LOG: INSERT ONLY. No Updates/Deletes allowed by policy.';
