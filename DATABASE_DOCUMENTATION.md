# SaaS on AWS - Database Documentation (Version 5.0)

**Project:** Multi-tenant SaaS Application
**Database:** PostgreSQL
**Multi-tenancy Strategy:** Schema-per-Tenant
**Version:** 5.0
**Last Updated:** January 2026

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Tenancy Architecture](#tenancy-architecture)
3. [Entity Relationship Summary](#entity-relationship-summary)
4. [Tables (Version 5.0)](#tables-version-5-0)
5. [Enums & Types](#enums--types)
6. [Relationship Explanations](#relationship-explanations)
7. [Enterprise Features (V5)](#enterprise-features-v5)
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

## Tables (Version 5.0)

### 1. tenants (public schema)

Global registry of companies.

```sql
CREATE TABLE public.tenants ( ... );
```

### 2. users (public schema)

Company owners/admins.

```sql
CREATE TABLE public.users ( ... );
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
  project_id UUID REFERENCES projects(id) ON DELETE RESTRICT, -- No Cascade!
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
  project_id UUID REFERENCES projects(id) ON DELETE RESTRICT, -- No Cascade!
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  status task_status_enum DEFAULT 'TODO',
  priority task_priority_enum DEFAULT 'MEDIUM',
  type task_type_enum DEFAULT 'TASK',    -- [NEW V5]
  due_date TIMESTAMP,                    -- [NEW V5]
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_task_project_presence CHECK (project_id IS NOT NULL)
);
```

### 7. task_assignees (tenant schema)

Many-to-Many task assignment.

```sql
CREATE TABLE "tenant_xxx".task_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  role VARCHAR(30) DEFAULT 'CONTRIBUTOR', -- [NEW V5]
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(task_id, employee_id)
);
```

### 8. task_activity (tenant schema)

Audit Log for all task changes.

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
  edited_at TIMESTAMP,                   -- [NEW V5]
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

### Task Type [NEW V5]

```sql
CREATE TYPE task_type_enum AS ENUM ('EPIC', 'TASK', 'BUG');
```

---

## Enterprise Features (V5)

### 1. Safety & Correctness

- **No Cascades**: `ON DELETE CASCADE` removed for Projects. Admin scripts or soft-deletes are required.
- **Hierarchy Validation**: Subtasks are enforced to belong to the same project as their parent.

### 2. Domain Improvements

- **Due Dates**: Tasks now track deadlines.
- **Assignee Roles**: Differentiates between 'OWNER', 'REVIEWER', 'CONTRIBUTOR'.
- **Task Types**: Distinguishes Epics vs Bugs vs Tasks.

### 3. Performance

- **Partial Indexes**: `CREATE INDEX ... WHERE is_deleted = FALSE` ensures fast queries on active data.
- **Covered Indexes**: On `due_date`, `status` for reporting.

---

## Data Integrity & Constraints

### Cascading Delete Rules (Strict V5)

| Operation       | Effect                                  | Tables Affected |
| --------------- | --------------------------------------- | --------------- |
| Delete project  | **RESTRICT** (Fails if tasks exist)     | -               |
| **Soft Delete** | **Recommended** (Set `is_deleted=TRUE`) | projects        |

**Breaking Change V5**: The application MUST NOT rely on DB cascades to clean up project data. Used `updateTask` to soft delete.

---

_Documentation Updated for Version 5.0 Release_
