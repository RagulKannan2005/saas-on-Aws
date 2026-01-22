-- Migration: 004_version_5_hardening
-- Description: Safety fixes (remove cascades), Domain features (Due Dates, Types), and Performance Indexes
-- Author: AI Assistant
-- Date: 2026-01-23

-- Note: This migration assumes 'tenant_xxx' schema. 
-- Replace 'tenant_xxx' with the actual schema name dynamically.

-- 1. SAFETY: Remove Dangerous Cascades
-- We want to prevent hard deletion of projects from accidentally wiping out all tasks.
-- Soft deletes should be the only way.
ALTER TABLE "tenant_xxx".tasks 
  DROP CONSTRAINT IF EXISTS tasks_project_id_fkey,
  ADD CONSTRAINT tasks_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES "tenant_xxx".projects(id) ON DELETE RESTRICT;

ALTER TABLE "tenant_xxx".project_members
  DROP CONSTRAINT IF EXISTS project_members_project_id_fkey,
  ADD CONSTRAINT project_members_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES "tenant_xxx".projects(id) ON DELETE RESTRICT;

-- 2. DOMAIN: Task Types & Due Dates
-- Create Enum if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_type_enum') THEN
        CREATE TYPE task_type_enum AS ENUM ('EPIC', 'TASK', 'BUG');
    END IF;
END $$;

ALTER TABLE "tenant_xxx".tasks
  ADD COLUMN IF NOT EXISTS due_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS type task_type_enum DEFAULT 'TASK';

-- 3. DOMAIN: Assignee Roles
ALTER TABLE "tenant_xxx".task_assignees
  ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'CONTRIBUTOR'; -- OWNER, REVIEWER, etc.

-- 4. DOMAIN: Comment Editing
ALTER TABLE "tenant_xxx".task_comments
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP;

-- 5. PERFORMANCE: Indexes
-- Partial Index for Active Tasks (Huge win for default queries)
CREATE INDEX IF NOT EXISTS idx_active_tasks ON "tenant_xxx".tasks(project_id) WHERE is_deleted = FALSE;

-- Index for Due Date querying (Overdue checks)
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON "tenant_xxx".tasks(due_date);

-- Index for Project Members (finding who is on a project quickly)
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON "tenant_xxx".project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_employee_id ON "tenant_xxx".project_members(employee_id);

-- 6. DATA INTEGRITY: Hierarchy Constraint
-- Top Level: project_id NOT NULL, parent_task_id NULL
-- Subtask: project_id NOT NULL, parent_task_id NOT NULL (Must match parent's project - enforced in app, but we ensure project_id exists)
-- This constraint ensures every task belongs to a project, even if it's a subtask (denormalized for performance).
ALTER TABLE "tenant_xxx".tasks
  ADD CONSTRAINT check_task_project_presence CHECK (project_id IS NOT NULL);
