# SaaS on AWS - Database Documentation (Version 2.0)

**Project:** Multi-tenant SaaS Application
**Database:** PostgreSQL
**Multi-tenancy Strategy:** Schema-per-Tenant
**Version:** 2.0
**Last Updated:** January 2026

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Tenancy Architecture](#tenancy-architecture)
3. [Entity Relationship Summary](#entity-relationship-summary)
4. [Tables Created in Version 2](#tables-created-in-version-2)
5. [Relationship Explanations](#relationship-explanations)
6. [Data Integrity & Constraints](#data-integrity--constraints)
7. [Design Decisions](#design-decisions)
8. [Limitations](#limitations)

---

## Database Overview

### Purpose

This PostgreSQL database powers a multi-tenant SaaS platform that enables companies (tenants) to manage projects, employees, and tasks with complete data isolation. Each tenant operates within its own isolated database schema.

### Multi-Tenancy Strategy: Schema-Per-Tenant

The application implements a **schema-per-tenant isolation model**:

- **Complete Data Isolation:** Each tenant's data exists in a separate PostgreSQL schema (`tenant_<uuid>`)
- **Logical Separation:** No cross-tenant data queries are possible at the database level

### Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              PostgreSQL Database                             │
│  ┌────────────────┐    ┌────────────────┐                   │
│  │  public        │    │  tenant_abc... │                   │
│  │  ┌──────────┐  │    │  ┌──────────┐  │                   │
│  │  │ tenants  │  │    │  │ projects │  │                   │
│  │  │ users    │  │    │  │ employees│  │                   │
│  │  └──────────┘  │    │  │ project_ │  │                   │
│  │                │    │  │  members │  │                   │
│  └────────────────┘    └────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Entity Relationship Summary

### High-Level Relationships

**GLOBAL CONTEXT (public schema):**

- **Tenants** (1) ──── (many) **Users** (Admins)

**TENANT CONTEXT (tenant_xxx schema):**

- **Projects** (1) ──── (many) **Tasks**
- **Employees** (M) ──── (N) **Projects** (Via `project_members` table)

### Version 2 Changes (The "Decoupling")

In Version 1, employees were tied directly to a project.
In **Version 2**, we introduced a **Many-to-Many** relationship:

- An Employee can belong to **ZERO** projects (e.g., just hired).
- An Employee can belong to **MULTIPLE** projects.
- Deleting a Project **does NOT** delete the Employee.

---

## Tables Created in Version 2

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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. employees (tenant schema)

Company staff. **Note: No `project_id` column.**

```sql
CREATE TABLE "tenant_xxx".employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'EMPLOYEE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. project_members (tenant schema) [NEW IN V2]

The Join Table linking Employees to Projects.

```sql
CREATE TABLE "tenant_xxx".project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'MEMBER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, employee_id)
);
```

### 6. tasks (tenant schema)

```sql
CREATE TABLE "tenant_xxx".tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Relationship Explanations

### Assigning Users to Projects

We uses the `project_members` table.

1.  **Assign**: Insert a record into `project_members` with `{ project_id, employee_id }`.
2.  **Unassign**: Delete that record.
3.  **Check**: Query `SELECT * FROM project_members WHERE project_id = ...`.

### Task Association

Tasks are still directly linked to `projects`.

- Deleting a Project **will** delete its Tasks (Cascade).
- Tasks are not directly assigned to users in the database yet (Version 3 feature).

---

## Data Integrity & Constraints

### Cascading Delete Rules (Revised)

| Operation           | Effect                               | Tables Affected                   |
| ------------------- | ------------------------------------ | --------------------------------- |
| Delete tenant       | Cascades to users                    | tenants → users                   |
| **Delete project**  | **Deletes Tasks & Memberships ONLY** | projects → tasks, project_members |
| **Delete employee** | **Deletes Memberships ONLY**         | employees → project_members       |

**Key Safety Feature:**
Deleting a `project` triggers a cascade on `project_members`, so the _relationship_ is removed, but the `employee` record remains intact.

### Unique Constraints

- **(project_id, employee_id)**: An employee cannot be added to the same project twice.

---

## Design Decisions

### Why Join Tables (Many-to-Many)?

**Decision:** Move from direct `project_id` to `project_members` table.
**Rationale:**

- **Real-world modeling**: People usually multitask across projects.
- **Data Safety**: We needed to prevent accidental employee deletion when closing projects.
- **Scalability**: Allows per-project roles (e.g., 'Lead' on Project A, 'Member' on Project B) in the future.

---

## Limitations

1.  **Task Assignments**: Tasks are still project-global; specific user assignment requires a `task_assignees` table (Next Version).
2.  **Explicit Teams**: We still lack a "Department/Team" grouping (e.g., "Marketing Dept").

---

_Documentation Generated for Version 2.0 Release_
