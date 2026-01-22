-- Migration: 003_version_4_enterprise
-- Description: Implement Enterprise V4 features (Hierarchy, Activity, Comments, Indexes)
-- Author: AI Assistant
-- Date: 2026-01-23

-- Note: This migration assumes 'tenant_xxx' schema. 
-- Replace 'tenant_xxx' with the actual schema name dynamically.

-- 1. Task Hierarchy (Epics -> Tasks -> Subtasks)
ALTER TABLE "tenant_xxx".tasks 
  ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES "tenant_xxx".tasks(id) ON DELETE CASCADE;

-- 2. Task Activity Log (Audit Trail)
CREATE TABLE IF NOT EXISTS "tenant_xxx".task_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES "tenant_xxx".tasks(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- e.g., 'STATUS_CHANGE', 'ASSIGNMENT', 'COMMENT'
  old_value TEXT,
  new_value TEXT,
  performed_by UUID REFERENCES "tenant_xxx".employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Task Comments (Collaboration)
CREATE TABLE IF NOT EXISTS "tenant_xxx".task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES "tenant_xxx".tasks(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES "tenant_xxx".employees(id) ON DELETE SET NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Performance Indexes
-- Index for finding tasks by project (common query)
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON "tenant_xxx".tasks(project_id);

-- Index for finding tasks by status (filtering)
CREATE INDEX IF NOT EXISTS idx_tasks_status ON "tenant_xxx".tasks(status);

-- Index for finding tasks assigned to an employee
CREATE INDEX IF NOT EXISTS idx_task_assignees_employee_id ON "tenant_xxx".task_assignees(employee_id);

-- Index for finding subtasks
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON "tenant_xxx".tasks(parent_task_id);

-- Index for retrieving comments quickly
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON "tenant_xxx".task_comments(task_id);

-- Index for retrieving activity log quickly
CREATE INDEX IF NOT EXISTS idx_task_activity_task_id ON "tenant_xxx".task_activity(task_id);
