# SaaS on AWS - Database Documentation (Version 1.0)

**Project:** Multi-tenant SaaS Application  
**Database:** PostgreSQL  
**Multi-tenancy Strategy:** Schema-per-Tenant  
**Version:** 1.0  
**Last Updated:** January 2026

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Tenancy Architecture](#tenancy-architecture)
3. [Entity Relationship Summary](#entity-relationship-summary)
4. [Tables Created in Version 1](#tables-created-in-version-1)
5. [Relationship Explanations](#relationship-explanations)
6. [Data Integrity & Constraints](#data-integrity--constraints)
7. [Version 1 Design Decisions](#version-1-design-decisions)
8. [Limitations of Version 1](#limitations-of-version-1)
9. [Future Database Enhancements (Version 2+)](#future-database-enhancements-version-2)

---

## Database Overview

### Purpose
This PostgreSQL database powers a multi-tenant SaaS platform that enables companies (tenants) to manage projects, employees, and tasks with complete data isolation. Each tenant operates within its own isolated database schema, ensuring security, compliance, and scalability.

### Multi-Tenancy Strategy: Schema-Per-Tenant

The application implements a **schema-per-tenant isolation model**, which provides:

- **Complete Data Isolation:** Each tenant's data exists in a separate PostgreSQL schema (`tenant_<uuid>`)
- **Logical Separation:** No cross-tenant data queries are possible at the database level
- **Scalability:** Schemas can be backed up, restored, and migrated independently
- **Security:** Tenants cannot access other tenants' data due to schema-level isolation
- **Performance:** Schema-specific queries are optimized without filtering by tenant_id in application code

### Why Schema-Per-Tenant Was Chosen

| Aspect | Benefit |
|--------|---------|
| **Data Security** | Complete isolation at database level; cross-tenant data breaches impossible |
| **Compliance** | GDPR/data privacy laws easier to enforce; tenant deletion removes entire schema |
| **Scalability** | Schemas can be distributed across multiple database servers |
| **Maintenance** | Per-tenant backups, restores, and schema upgrades without affecting others |
| **Performance** | No need for tenant_id filtering on every query |
| **Multi-region Deployment** | Schemas can be replicated to different geographical regions |

### Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│              (Node.js/Express Controllers)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                 Tenant Routing Layer                         │
│     (Extract tenantId from JWT, build schema name)          │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              PostgreSQL Database                             │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────┐│
│  │  public        │    │  tenant_abc... │    │  tenant_xyz││
│  │  ┌──────────┐  │    │  ┌──────────┐  │    │ ┌────────┐ ││
│  │  │ tenants  │  │    │  │ projects │  │    │ │projects│ ││
│  │  │ users    │  │    │  │ tasks    │  │    │ │tasks   │ ││
│  │  │          │  │    │  │ employees│  │    │ │employees││
│  │  └──────────┘  │    │  └──────────┘  │    │ └────────┘ ││
│  └────────────────┘    └────────────────┘    └────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Tenancy Architecture

### Registration & Schema Provisioning Flow

When a new company registers:

1. **Global Tenant Record Created** (public schema)
   - Entry in `tenants` table with UUID, company name, and timestamp
   
2. **Company Owner User Created** (public schema)
   - Entry in `users` table with COMPANY role
   - Used for company-level authentication and permissions
   
3. **Tenant-Specific Schema Provisioned** (tenant_<uuid> schema)
   - Dynamic schema created with format: `tenant_<UUID-with-underscores>`
   - Example: `tenant_550e8400_e29b_41d4_a716_446655440000`
   
4. **Tenant Schema Tables Initialized** (within tenant schema)
   - `projects` table for company projects
   - `tasks` table for project tasks
   - `employees` table for company workers

### Schema Naming Convention

```
Tenant ID: 550e8400-e29b-41d4-a716-446655440000
↓
Schema Name: tenant_550e8400_e29b_41d4_a716_446655440000
              (UUID dashes converted to underscores for SQL identifier compatibility)
```

### Global vs. Tenant-Specific Data

| Data Type | Location | Purpose | Isolation |
|-----------|----------|---------|-----------|
| **Tenants** | public schema | Company registration records | Global registry |
| **Users (Owner)** | public schema | Company owner authentication | Global user pool |
| **Projects** | tenant_xxx schema | Company-specific projects | Tenant-isolated |
| **Tasks** | tenant_xxx schema | Project-specific tasks | Tenant-isolated |
| **Employees** | tenant_xxx schema | Company staff/workers | Tenant-isolated |

---

## Entity Relationship Summary

### High-Level Relationships

```
GLOBAL CONTEXT (public schema):
    tenants (1)  ──── (many) users (Company Owner)
        │
        │ Creates & Owns
        │
        ▼
TENANT CONTEXT (tenant_xxx schema):
    
    projects (1) ──── (many) tasks
    projects (1) ──── (many) employees
    
    Relationships:
    - A project has many tasks
    - A project has many employees
    - Employees work on projects
    - Tasks belong to projects
```

### Relationship Types in Version 1

| Relationship | Type | Tables | Description |
|--------------|------|--------|-------------|
| Tenant → User | One-to-Many | tenants.id → users.tenant_id | One company has many owner/admin users |
| Project → Task | One-to-Many | projects.id → tasks.project_id | One project contains many tasks |
| Project → Employee | One-to-Many | projects.id → employees.project_id | One project has multiple employees |

### Important Note: Tasks Are NOT Directly Assigned to Users (Yet)

In Version 1, **tasks do not have direct assignment to employees**. Tasks belong to projects only. The `employees` table has a `project_id` column indicating which project they work on, but no task-assignment table exists. This is intentional for MVP simplicity and will be enhanced in Version 2 with `task_assignees` table.

---

## Tables Created in Version 1

### 1. tenants (public schema)

**Purpose:** Stores company/tenant registration information at the global level.

**Table Definition:**
```sql
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Columns:**

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique tenant identifier; used to create tenant schema |
| `name` | VARCHAR(255) | NOT NULL | Company/tenant name (e.g., "Acme Corp") |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Timestamp when tenant was registered |

**Primary Key:** `id`

**Foreign Keys:** None

**Indexes:** 
- Primary key index on `id` (implicit)

**Constraints:**
- `id` must be unique
- `name` is required (NOT NULL)

**Relationships:**
- One-to-Many with `users` table via `users.tenant_id`
- Parent table for tenant schema provisioning

**Sample Data:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Acme Corporation",
  "created_at": "2026-01-13T10:30:00Z"
}
```

---

### 2. users (public schema)

**Purpose:** Stores company owner and admin user credentials for authentication. Used for company-level access control.

**Table Definition:**
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Columns:**

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique user identifier |
| `tenant_id` | UUID | FOREIGN KEY REFERENCES tenants(id) | Links user to their company/tenant |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email; used for login; must be unique globally |
| `password` | TEXT | NOT NULL | Bcrypt-hashed password for authentication |
| `role` | VARCHAR(20) | DEFAULT 'USER' | User role: 'COMPANY' (owner) or 'USER' (admin) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Timestamp when user was created |

**Primary Key:** `id`

**Foreign Keys:**
- `tenant_id` → `tenants.id` (on delete: not specified; recommend CASCADE for data integrity)

**Indexes:**
- Primary key index on `id` (implicit)
- Unique index on `email` (implicit from UNIQUE constraint)

**Constraints:**
- `email` must be unique across the system
- `email` is required (NOT NULL)
- `password` is required (NOT NULL)
- `tenant_id` must exist in tenants table (foreign key constraint)

**Relationships:**
- Many-to-One with `tenants` table via `tenant_id`
- Represents company owner/admin level users

**Sample Data:**
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@acmecorp.com",
  "password": "$2b$10$abcdefghijklmnopqrstuvwxyz...",
  "role": "COMPANY",
  "created_at": "2026-01-13T10:30:00Z"
}
```

---

### 3. projects (tenant-specific schema)

**Purpose:** Represents projects within a tenant's workspace. Each project contains tasks and assigned employees.

**Table Definition:**
```sql
CREATE TABLE "tenant_xxx".projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Columns:**

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique project identifier within the tenant |
| `name` | VARCHAR(255) | NOT NULL | Project name (e.g., "Website Redesign") |
| `description` | TEXT | Optional | Detailed project description |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Timestamp when project was created |

**Primary Key:** `id`

**Foreign Keys:** None (exists within tenant schema; implicit tenant isolation)

**Indexes:**
- Primary key index on `id` (implicit)

**Constraints:**
- `name` is required (NOT NULL)
- `description` is optional

**Relationships:**
- One-to-Many with `tasks` table via `tasks.project_id` (ON DELETE CASCADE)
- One-to-Many with `employees` table via `employees.project_id` (ON DELETE CASCADE)

**Sample Data:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Website Redesign Q1 2026",
  "description": "Complete redesign of company website with new branding",
  "created_at": "2026-01-10T14:20:00Z"
}
```

---

### 4. tasks (tenant-specific schema)

**Purpose:** Represents work items/tasks within a project. Tasks track deliverables and their completion status.

**Table Definition:**
```sql
CREATE TABLE "tenant_xxx".tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES "tenant_xxx".projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Columns:**

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique task identifier within the tenant |
| `project_id` | UUID | FOREIGN KEY (ON DELETE CASCADE), NOT NULL | Links task to its parent project |
| `title` | VARCHAR(255) | NOT NULL | Task title/name (e.g., "Design homepage mockups") |
| `status` | VARCHAR(50) | DEFAULT 'Pending' | Task status: 'Pending', 'In Progress', 'Completed', etc. |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Timestamp when task was created |

**Primary Key:** `id`

**Foreign Keys:**
- `project_id` → `tenant_xxx.projects.id` (ON DELETE CASCADE)
  - When a project is deleted, all its tasks are automatically deleted

**Indexes:**
- Primary key index on `id` (implicit)
- **Recommendation:** Add index on `project_id` for faster task queries by project

**Constraints:**
- `title` is required (NOT NULL)
- `project_id` must exist in projects table
- Cascading delete: deleting a project deletes all its tasks

**Relationships:**
- Many-to-One with `projects` table via `project_id`
- Note: In Version 1, tasks are NOT directly assigned to employees
- Future Version 2 will add `task_assignees` table for assignments

**Sample Data:**
```json
{
  "id": "456f7890-a123-b456-c789-012345678abc",
  "project_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Create high-fidelity mockups for homepage",
  "status": "In Progress",
  "created_at": "2026-01-11T09:15:00Z"
}
```

---

### 5. employees (tenant-specific schema)

**Purpose:** Represents employees/workers within a tenant's company. Employees can log in and work on projects and tasks.

**Table Definition:**
```sql
CREATE TABLE "tenant_xxx".employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES "tenant_xxx".projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'EMPLOYEE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Columns:**

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique employee identifier within the tenant |
| `project_id` | UUID | FOREIGN KEY (ON DELETE CASCADE), Optional | Project the employee is assigned to; can be NULL |
| `name` | VARCHAR(255) | NOT NULL | Employee full name (e.g., "Jane Smith") |
| `email` | VARCHAR(255) | NOT NULL | Employee email for login and contact |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt-hashed password for employee authentication |
| `role` | VARCHAR(50) | DEFAULT 'EMPLOYEE' | Employee role: 'EMPLOYEE', 'MANAGER', 'LEAD' |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Timestamp when employee record was created |

**Primary Key:** `id`

**Foreign Keys:**
- `project_id` → `tenant_xxx.projects.id` (ON DELETE CASCADE)
  - When a project is deleted, employees assigned to it will have `project_id` set to NULL (or be deleted)

**Indexes:**
- Primary key index on `id` (implicit)
- **Recommendation:** Add UNIQUE index on `email` within tenant schema for duplicate prevention

**Constraints:**
- `name` is required (NOT NULL)
- `email` is required (NOT NULL)
- `password` is required (NOT NULL)
- `project_id` is optional (employee may not be assigned to a project initially)

**Relationships:**
- Many-to-One with `projects` table via `project_id` (optional)
- Note: In Version 1, employees are linked to projects but NOT directly to tasks
- Future Version 2 will add task assignments via `task_assignees` table

**Sample Data:**
```json
{
  "id": "789abc12-d345-e678-f901-234567890def",
  "project_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Jane Smith",
  "email": "jane.smith@acmecorp.com",
  "password": "$2b$10$xyz123abc...",
  "role": "EMPLOYEE",
  "created_at": "2026-01-12T11:45:00Z"
}
```

---

## Relationship Explanations

### 1. How Users Are Assigned to Projects

**Global Level (public schema):**
- User logs in with email/password from `public.users` table
- User receives JWT token containing `tenant_id` and `role`

**Tenant Level (tenant_xxx schema):**
- User (with COMPANY role) can view all projects in their tenant schema
- COMPANY users are not directly listed in `employees` table; only their employees are
- Employees table contains workers who are assigned to specific projects

### 2. How Teams Work Inside Projects (Version 1 Limitation)

**In Version 1:** There is no explicit `teams` table or team concept.

**Current Implementation:**
- Projects contain employees directly via `employees.project_id`
- All employees assigned to a project work on that project's tasks
- No formal team hierarchy or team-level permissions exist

**Limitation:** Version 1 treats all employees assigned to a project as one flat group. Fine-grained team structures will be added in Version 2.

### 3. How Tasks Are Associated with Teams

**In Version 1:** Tasks are NOT associated with teams because teams don't exist.

**Current Task Association:**
- Tasks are associated with **projects only** via `tasks.project_id`
- All employees on a project can theoretically work on any task
- No task-to-employee or task-to-team assignment mechanism exists yet

**Version 1 Workflow:**
```
Project
  ├── Task 1 (belongs to project)
  ├── Task 2 (belongs to project)
  └── Employees (all assigned to project)
      ├── Employee A
      └── Employee B
      
(No explicit assignment of Task 1 to Employee A)
```

### 4. How Tasks Are Assigned to Users

**In Version 1:** Tasks are NOT assigned to users/employees.

**Current Limitation:**
- `tasks` table has NO foreign key to `employees` table
- No `task_assignees` joining table exists
- Application logic must track task assignments outside the database

**Example of Missing Assignment:**
```sql
-- This assignment does NOT exist in Version 1:
SELECT * FROM tasks WHERE assigned_employee_id = 'employee-xyz'; -- INVALID

-- Tasks can only be queried by project:
SELECT * FROM tasks WHERE project_id = 'project-abc';
```

**Version 2 Requirement:** A `task_assignees` table will bridge tasks and employees.

---

## Data Integrity & Constraints

### Foreign Key Constraints

**In Public Schema:**
```sql
-- users.tenant_id → tenants.id
CONSTRAINT fk_users_tenant 
  FOREIGN KEY (tenant_id) 
  REFERENCES tenants(id)
  -- Note: ON DELETE behavior should be CASCADE for cleanup
```

**In Tenant-Specific Schemas:**
```sql
-- tasks.project_id → projects.id
CONSTRAINT fk_tasks_project 
  FOREIGN KEY (project_id) 
  REFERENCES "tenant_xxx".projects(id) 
  ON DELETE CASCADE

-- employees.project_id → projects.id
CONSTRAINT fk_employees_project 
  FOREIGN KEY (project_id) 
  REFERENCES "tenant_xxx".projects(id) 
  ON DELETE CASCADE
```

### Cascading Delete Rules

| Operation | Effect | Tables Affected |
|-----------|--------|-----------------|
| Delete tenant | Cascades to users (all company users) | tenants → users |
| Delete project | Cascades to tasks & employees | projects → tasks, employees |
| Delete task | Standalone; no cascades | No dependent data |
| Delete employee | Standalone; removes project assignment | No dependent data |

### Unique Constraints

| Table | Column | Scope | Purpose |
|-------|--------|-------|---------|
| users | email | Global (public schema) | Prevent duplicate company user emails |
| tenants | id | Primary key | Unique tenant identifier |
| projects | id | Tenant schema | Unique project within tenant |
| tasks | id | Tenant schema | Unique task within tenant |
| employees | id | Tenant schema | Unique employee within tenant |

**Recommendation for Version 2:** Add UNIQUE constraint on `employees.email` per tenant schema.

### Referential Integrity Checks

**Current State:**
- Foreign keys are enforced at database level
- Deleting a project automatically deletes related tasks and employees
- Deleting a task has no cascading effects
- Deleting an employee has no cascading effects

**Potential Issues:**
- If an employee is deleted, any tasks they were meant to work on are not cleaned up (Version 2 issue)
- Orphaned projects with no employees are allowed
- Tasks with no assigned employees are allowed

---

## Version 1 Design Decisions

### 1. Why Schema-Per-Tenant Isolation Was Chosen

**Decision:** Use separate PostgreSQL schemas for each tenant instead of row-level filtering.

**Rationale:**
- **Security:** Database itself enforces isolation; no application logic required
- **Compliance:** Easy to prove data separation for regulations (GDPR, SOC2, HIPAA)
- **Simplicity:** Developers don't need to add `WHERE tenant_id = $1` to every query
- **Scalability:** Schemas can be distributed across database clusters
- **Disaster Recovery:** Per-tenant backups and point-in-time recovery

**Trade-off:** Slightly higher operational complexity in schema provisioning

---

### 2. Why Join Tables (Many-to-Many) Were NOT Used in Version 1

**Decision:** Directly embed `project_id` in `employees` and `tasks` tables.

**Rationale for `employees.project_id`:**
- In Version 1, employees are assigned to ONE project (direct relationship)
- Avoids unnecessary complexity of a `project_employees` join table
- Simpler queries and fewer table joins

**Limitation:** Employees cannot work on multiple projects; Version 2 will use `project_members` join table.

**Rationale for Tasks (NO employee assignment):**
- MVP minimalism: task assignment deferred to Version 2
- Tasks only need to be grouped by project in Version 1
- Avoids premature schema complexity

---

### 3. Why Tasks Are NOT Directly Tied to Users in Version 1

**Decision:** Tasks belong ONLY to projects; no direct task-to-employee relationship.

**Rationale:**
- **MVP Scope:** Task assignment is an advanced feature
- **Flexibility:** Allows task management without requiring immediate user assignments
- **Simplicity:** Reduces database complexity for initial release
- **Future Extension:** Version 2 will add granular task assignments via `task_assignees` table

**Business Logic Impact:**
- Project managers can create and manage tasks independently
- Employees can see tasks in their assigned project
- Actual task assignment handled in application layer (not database)

---

### 4. Role-Based Access Control (RBAC) Structure

**User Roles (public schema):**
- `COMPANY` - Tenant owner/administrator
- `USER` - Additional admin user (rarely used in Version 1)

**Employee Roles (tenant schema):**
- `EMPLOYEE` - Standard worker
- `MANAGER` - Project/team lead
- Custom roles (allowed but not enforced by database)

**Constraint:** Managers can only create EMPLOYEE-level accounts; prevents privilege escalation.

---

### 5. Timestamp-Based Auditing

**Decision:** Every table includes `created_at` timestamp but NO `updated_at` or `deleted_at`.

**Rationale:**
- **Simplicity:** Minimal audit requirements for MVP
- **Performance:** Reduces columns and indexes
- **Future:** Version 2 will add soft deletes with `deleted_at` column

---

## Limitations of Version 1

### 1. Tasks Cannot Be Assigned to Employees

**Issue:**
```sql
-- This is IMPOSSIBLE in Version 1:
SELECT * FROM tasks WHERE assigned_to = 'employee-id';
```

**Impact:**
- Task assignments must be tracked in application memory or external system
- Database cannot enforce task ownership
- No audit trail of who owns what task

**Resolution (Version 2):** Create `task_assignees` join table
```sql
CREATE TABLE task_assignees (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

---

### 2. Employees Cannot Work on Multiple Projects

**Issue:**
```sql
-- Impossible: An employee can only have one project_id
-- To work on 2 projects, they need 2 records (duplication)
```

**Impact:**
- Violates data normalization principles
- Causes employee record duplication
- Cannot track project transitions

**Resolution (Version 2):** Create `project_members` join table
```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, project_id)
)
```

---

### 3. No Audit Logging or Change Tracking

**Issue:**
- No record of who changed what or when
- Only `created_at` exists; no `updated_at` or `deleted_at`
- Impossible to audit task status changes

**Impact:**
- No compliance audit trail
- Cannot recover deleted data
- No way to track who modified records

---

### 4. No Soft Deletes

**Issue:**
```sql
DELETE FROM tasks WHERE id = 'task-123'; -- Permanent deletion!
```

**Impact:**
- Deleted data cannot be recovered
- No audit trail of deletions
- Violates compliance requirements (GDPR right to audit)

---

### 5. No Permissions/Authorization at Database Level

**Issue:**
- Database has no knowledge of what employees can access
- All authorization is application-level (no database enforcement)
- RBAC is application-defined, not database-enforced

**Impact:**
- Application bug could expose unauthorized data
- Database cannot prevent privilege escalation
- No row-level security (RLS)

---

### 6. No Reporting/Analytics Tables

**Issue:**
- No denormalized tables for fast reporting
- Every report requires complex joins and aggregations
- Performance degradation with large datasets

---

### 7. Limited Constraints & Validation

**Issue:**
- `employees.email` can be duplicated within tenant
- `status` in tasks is free-form (no ENUM constraint)
- No check constraints for valid roles

---

### 8. No Relationship Documentation Columns

**Issue:**
- Tasks have no description, priority, or due_date
- Projects have no status or owner tracking
- Employees have no hire_date or skill tags

---

### 9. No Team Concept

**Issue:**
- No `teams` table or `team_members` join table
- All employees in a project are treated equally
- Cannot group employees into sub-teams

---

### 10. No Task Dependencies or Subtasks

**Issue:**
- Cannot mark tasks as blocking other tasks
- No subtask hierarchy
- No critical path analysis

---

## Future Database Enhancements (Version 2+)

### Phase 2A: Task Assignment & Multi-Project Support

**New Tables:**

```sql
-- Join table for task assignments
CREATE TABLE "tenant_xxx".task_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES "tenant_xxx".tasks(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES "tenant_xxx".employees(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES "tenant_xxx".employees(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'ASSIGNED', -- ASSIGNED, IN_PROGRESS, COMPLETED
  UNIQUE(task_id, employee_id)
);

-- Join table for project membership
CREATE TABLE "tenant_xxx".project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES "tenant_xxx".employees(id) ON DELETE CASCADE,
  project_id UUID REFERENCES "tenant_xxx".projects(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'MEMBER', -- MEMBER, LEAD, MANAGER
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, project_id)
);

-- Teams within projects
CREATE TABLE "tenant_xxx".teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES "tenant_xxx".projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team membership
CREATE TABLE "tenant_xxx".team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES "tenant_xxx".teams(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES "tenant_xxx".employees(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, employee_id)
);
```

---

### Phase 2B: Enhanced Task Management

**New Columns:**
```sql
ALTER TABLE "tenant_xxx".tasks ADD COLUMN (
  description TEXT,
  priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
  due_date DATE,
  estimated_hours DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'TODO', -- TODO, IN_PROGRESS, IN_REVIEW, COMPLETED, BLOCKED
  created_by UUID REFERENCES "tenant_xxx".employees(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "tenant_xxx".employees(id)
);

-- Task dependencies
CREATE TABLE "tenant_xxx".task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES "tenant_xxx".tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID REFERENCES "tenant_xxx".tasks(id) ON DELETE CASCADE,
  dependency_type VARCHAR(50) -- BLOCKS, DEPENDS_ON, RELATED_TO
);
```

---

### Phase 2C: Audit & Compliance

**New Tables:**
```sql
-- Audit log for all changes
CREATE TABLE "tenant_xxx".audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100), -- 'task', 'project', 'employee'
  entity_id UUID,
  action VARCHAR(50), -- 'CREATE', 'UPDATE', 'DELETE'
  changed_by UUID REFERENCES "tenant_xxx".employees(id),
  old_values JSONB,
  new_values JSONB,
  change_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Soft deletes
ALTER TABLE "tenant_xxx".tasks ADD COLUMN (
  deleted_at TIMESTAMP,
  deleted_by UUID REFERENCES "tenant_xxx".employees(id)
);

ALTER TABLE "tenant_xxx".projects ADD COLUMN (
  deleted_at TIMESTAMP,
  deleted_by UUID REFERENCES "tenant_xxx".employees(id)
);

ALTER TABLE "tenant_xxx".employees ADD COLUMN (
  deleted_at TIMESTAMP
);
```

---

### Phase 2D: Permissions & Authorization (Database-Level RLS)

**Implement PostgreSQL Row-Level Security (RLS):**
```sql
-- Enable RLS on tables
ALTER TABLE "tenant_xxx".projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenant_xxx".tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenant_xxx".employees ENABLE ROW LEVEL SECURITY;

-- Policies to restrict access based on employee role/membership
CREATE POLICY project_members_only ON "tenant_xxx".projects
  FOR SELECT
  USING (id IN (
    SELECT project_id FROM project_members 
    WHERE employee_id = current_user_id()
  ));
```

---

### Phase 2E: Analytics & Reporting

**New Denormalized Tables:**
```sql
-- Project metrics snapshot
CREATE TABLE "tenant_xxx".project_metrics (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES "tenant_xxx".projects(id),
  total_tasks INT,
  completed_tasks INT,
  in_progress_tasks INT,
  team_member_count INT,
  snapshot_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee activity log
CREATE TABLE "tenant_xxx".employee_activity (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES "tenant_xxx".employees(id),
  activity_type VARCHAR(100), -- 'task_completed', 'task_assigned', etc.
  related_entity_id UUID,
  related_entity_type VARCHAR(100),
  activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Phase 3: Advanced Features

**Potential Enhancements:**
- Time tracking & estimates vs. actuals
- Resource allocation & capacity planning
- Budget tracking per project
- Risk management & issue tracking
- Change management & approvals
- Document management integration
- Integration with external tools (Slack, GitHub, etc.)

---

## Index Recommendations

### Current Indexes (Implicit)
- Primary keys on all tables
- Unique constraint on `users.email`

### Recommended Indexes for Performance (Implement Before Production)

```sql
-- In public schema
CREATE INDEX idx_users_tenant_id ON users(tenant_id);

-- In tenant schemas
CREATE INDEX idx_tasks_project_id ON "tenant_xxx".tasks(project_id);
CREATE INDEX idx_tasks_status ON "tenant_xxx".tasks(status);
CREATE INDEX idx_employees_project_id ON "tenant_xxx".employees(project_id);
CREATE INDEX idx_projects_created_at ON "tenant_xxx".projects(created_at);
CREATE INDEX idx_tasks_created_at ON "tenant_xxx".tasks(created_at);
```

---

## Summary

**Version 1** provides a solid foundation for a multi-tenant SaaS application with complete tenant isolation at the schema level. The database design prioritizes simplicity and security but intentionally defers advanced features like task assignment and multi-project membership to Version 2.

The schema-per-tenant approach ensures enterprise-grade data isolation while maintaining clean application code. Future versions will build upon this foundation by adding join tables for many-to-many relationships, audit logging, soft deletes, and database-level authorization.

---

**Document Version:** 1.0  
**Last Updated:** January 13, 2026  
**Author:** Database Architecture Team  
**Status:** Ready for Version 1 Production Deployment
