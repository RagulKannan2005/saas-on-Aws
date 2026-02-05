const client = require("../src/config/databasepg");

async function fixSchemas() {
  try {
    console.log("Starting schema fix...");

    // 1. Get all tenant schemas
    const schemasRes = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
    `);

    const schemas = schemasRes.rows.map((r) => r.schema_name);
    console.log(`Found ${schemas.length} tenant schemas:`, schemas);

    for (const schema of schemas) {
      console.log(`Processing schema: ${schema}`);

      // 2. Add columns to tasks table
      // We use IF NOT EXISTS to be safe

      const queries = [
        // Priority
        `ALTER TABLE "${schema}".tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'Medium'`,

        // Type
        `ALTER TABLE "${schema}".tasks ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'TASK'`,

        // Hours
        `ALTER TABLE "${schema}".tasks ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC DEFAULT 0`,
        `ALTER TABLE "${schema}".tasks ADD COLUMN IF NOT EXISTS actual_hours NUMERIC DEFAULT 0`,

        // Soft Deletes (if missing)
        `ALTER TABLE "${schema}".tasks ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE`,
        `ALTER TABLE "${schema}".tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`,

        // Parent Task (if missing)
        `ALTER TABLE "${schema}".tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID`,

        // Due Date (if missing)
        `ALTER TABLE "${schema}".tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMP`,
      ];

      for (const query of queries) {
        try {
          await client.query(query);
          // console.log(`  Executed: ${query}`);
        } catch (e) {
          console.error(`  Failed: ${query}`, e.message);
        }
      }

      // Also ensure task_assignees table exists
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS "${schema}".task_assignees (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            task_id UUID REFERENCES "${schema}".tasks(id) ON DELETE CASCADE,
            employee_id UUID REFERENCES "${schema}".employees(id) ON DELETE CASCADE,
            role VARCHAR(50) DEFAULT 'CONTRIBUTOR',
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(task_id, employee_id)
          )
        `);
        // console.log(`  Ensured task_assignees table exists`);
      } catch (e) {
        console.error(`  Failed to create task_assignees:`, e.message);
      }

      // Also ensure task_activity table exists (TaskController uses it)
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS "${schema}".task_activity (
             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
             task_id UUID REFERENCES "${schema}".tasks(id) ON DELETE CASCADE,
             action VARCHAR(50) NOT NULL,
             old_value TEXT,
             new_value TEXT,
             performed_by UUID REFERENCES "${schema}".employees(id),
             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        // console.log(`  Ensured task_activity table exists`);
      } catch (e) {
        console.error(`  Failed to create task_activity:`, e.message);
      }

      // Also ensure task_comments table exists (TaskController uses it)
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS "${schema}".task_comments (
             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
             task_id UUID REFERENCES "${schema}".tasks(id) ON DELETE CASCADE,
             employee_id UUID REFERENCES "${schema}".employees(id) ON DELETE CASCADE,
             comment TEXT NOT NULL,
             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
             is_deleted BOOLEAN DEFAULT FALSE
          )
        `);
        // console.log(`  Ensured task_comments table exists`);
      } catch (e) {
        console.error(`  Failed to create task_comments:`, e.message);
      }

      console.log(`Completed schema: ${schema}`);
    }

    console.log("All schemas updated successfully.");
  } catch (err) {
    console.error("Critical error:", err);
  } finally {
    process.exit();
  }
}

fixSchemas();
