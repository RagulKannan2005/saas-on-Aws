# SaaS on AWS - Database Documentation (Version 5.1)

**Project:** Multi-tenant SaaS Application
**Database:** PostgreSQL
**Multi-tenancy Strategy:** Schema-per-Tenant
**Version:** 5.1
**Last Updated:** January 2026

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Tenancy Architecture](#tenancy-architecture)
3. [Entity Relationship Summary](#entity-relationship-summary)
4. [Tables (Version 5.1)](#tables-version-5-1)
5. [Enums & Types](#enums--types)
6. [Relationship Explanations](#relationship-explanations)
7. [Enterprise Features (V5/V5.1)](#enterprise-features-v5)
8. [Data Integrity & Constraints](#data-integrity--constraints)

---

## Database Overview

### Purpose

This PostgreSQL database powers a multi-tenant SaaS platform that enables companies (tenants) to manage projects, employees, and tasks with complete data isolation. Each tenant operates within its own isolated database schema.

### Multi-Tenancy Strategy: Schema-Per-Tenant

The application implements a **schema-per-tenant isolation model**:

- **Complete Data Isolation:** Each tenant's data exists in a separate PostgreSQL schema (`tenant_<uuid>`)
- **Logical Separation:** No cross-tenant data queries are possible at the database level

---

## Entity Relationship Summary

### High-Level Relationships

**GLOBAL CONTEXT (public schema):**

- **Tenants** (1) ──── (many) **Users** (Admins)

**TENANT CONTEXT (tenant_xxx schema):**

- **Projects** (1) ──── (many) **Tasks**
- **Tasks** (1) ──── (many) **Tasks** (Subtasks via `parent_task_id`)
- **Employees** (M) ──── (N) **Projects** (Via `project_members`)
- **Tasks** (M) ──── (N) **Employees** (Via `task_assignees`)
- **Tasks** (1) ──── (many) **Activity Logs**
- **Tasks** (1) ──── (many) **Comments**

---

## Tables (Version 5.1)

### 1. tenants (public schema)

Global registry of companies.

```sql
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. users (public schema)

Company owners/admins.

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. projects (tenant schema)

```sql
CREATE TABLE "tenant_xxx".projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. employees (tenant schema)

```sql
CREATE TABLE "tenant_xxx".employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'EMPLOYEE',
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. project_members (tenant schema)

The Join Table linking Employees to Projects.

```sql
CREATE TABLE "tenant_xxx".project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE RESTRICT,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'MEMBER', -- VIEWER, MEMBER, ADMIN
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, employee_id)
);
```

### 6. tasks (tenant schema)

The Core Work Unit.

```sql
CREATE TABLE "tenant_xxx".tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE RESTRICT,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  status task_status_enum DEFAULT 'TODO',
  priority task_priority_enum DEFAULT 'MEDIUM',
  type task_type_enum DEFAULT 'TASK',
  due_date TIMESTAMP,
  estimated_hours NUMERIC,           -- [NEW V5.1]
  actual_hours NUMERIC,              -- [NEW V5.1]
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_task_project_presence CHECK (project_id IS NOT NULL OR parent_task_id IS NOT NULL) -- [CORRECTED V5.1]
);
```

### 7. task_assignees (tenant schema)

Many-to-Many task assignment.

```sql
CREATE TABLE "tenant_xxx".task_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  role VARCHAR(30) DEFAULT 'CONTRIBUTOR',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(task_id, employee_id)
);
```

### 8. task_activity (tenant schema)

Audit Log for all task changes.
**Policy:** Immutable. Insert-only.

```sql
CREATE TABLE "tenant_xxx".task_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  action VARCHAR(50),
  old_value TEXT,
  new_value TEXT,
  performed_by UUID REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 9. task_comments (tenant schema)

Collaboration layer.

```sql
CREATE TABLE "tenant_xxx".task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id),
  comment TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,      -- [NEW V5.1]
  edited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Enums & Types

### Task Status

```sql
CREATE TYPE task_status_enum AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE');
```

### Task Priority

```sql
CREATE TYPE task_priority_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
```

### Task Type

```sql
CREATE TYPE task_type_enum AS ENUM ('EPIC', 'TASK', 'BUG');
```

---

## Enterprise Features (V5/V5.1)

### 1. Safety & Correctness

- **Strict No-Cascade Policy**: Projects cannot be hard-deleted if tasks exist.
- **Hierarchy Validation**: Subtasks must belong to the same project as the parent (Enforced at Application Layer).
- **Relaxed Constraint**: Tasks must have `project_id` OR `parent_task_id`.

### 2. Domain Improvements

- **Time Tracking**: `estimated_hours` vs `actual_hours` for SLA/Billing.
- **Due Dates**: Tasks track deadlines.
- **Task Types**: Epics, Bugs, Tasks.

### 3. Comment Moderation

- **Soft Deletes**: Comments are marked `is_deleted=TRUE`, never removed.

---

## Data Integrity & Constraints

### Application Logic Enforcement (V5.1)

| Rule                       | Location            | Description                                 |
| -------------------------- | ------------------- | ------------------------------------------- |
| **Cross-Project Subtasks** | `TaskController.js` | Subtask must match Parent's `project_id`.   |
| **Audit Log Immutability** | Database Policy     | No UPDATE/DELETE grants on `task_activity`. |

---

_Documentation Updated for Version 5.1 Release_
