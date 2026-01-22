-- Migration: 002_version_3_upgrade
-- Description: Implement Version 3.0 schema features (Task Assignments, Enums, Soft Deletes, Teams)
-- Author: AI Assistant
-- Date: 2026-01-23

-- Note: This migration assumes 'tenant_xxx' schema. 
-- In a real execution, this script would be run for each tenant schema.
-- Replace 'tenant_xxx' with the actual schema name dynamically in your migration runner.

-- 1. Create ENUM types
-- We do this carefully. If they already exist, we skip.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status_enum') THEN
        CREATE TYPE task_status_enum AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority_enum') THEN
        CREATE TYPE task_priority_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
    END IF;
END $$;

-- 2. Update TASKS table
-- Add Assignees Table first (Many-to-Many)
CREATE TABLE IF NOT EXISTS "tenant_xxx".task_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES "tenant_xxx".tasks(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES "tenant_xxx".employees(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(task_id, employee_id)
);

-- Modify tasks table columns
-- Handle Status Conversion (This might fail if data is messy, assuming clean or empty for now)
-- First, altering the column to use the new ENUM
ALTER TABLE "tenant_xxx".tasks 
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE task_status_enum USING status::task_status_enum,
  ALTER COLUMN status SET DEFAULT 'TODO';

-- Add Priority Column
ALTER TABLE "tenant_xxx".tasks 
  ADD COLUMN IF NOT EXISTS priority task_priority_enum DEFAULT 'MEDIUM';

-- Add Soft Delete Columns to TASKS
ALTER TABLE "tenant_xxx".tasks 
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- 3. Update PROJECTS table (Soft Deletes)
ALTER TABLE "tenant_xxx".projects 
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- 4. Update EMPLOYEES table (Soft Deletes)
ALTER TABLE "tenant_xxx".employees 
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- 5. Create TEAMS and TEAM_MEMBERS tables
CREATE TABLE IF NOT EXISTS "tenant_xxx".teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "tenant_xxx".team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES "tenant_xxx".teams(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES "tenant_xxx".employees(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, employee_id)
);
