const client = require("../src/config/databasepg");

async function migrateV2() {
  try {
    console.log(
      "Starting Version 2 Migration (Decoupling Employees from Projects)..."
    );

    // 1. Get all tenant schemas
    const tenants = await client.query("SELECT id FROM tenants");

    for (const tenant of tenants.rows) {
      const tenantId = tenant.id;
      const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;
      console.log(`Processing schema: ${schemaName}`);

      try {
        // A. Create project_members table
        await client.query(`
                CREATE TABLE IF NOT EXISTS "${schemaName}".project_members (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID REFERENCES "${schemaName}".projects(id) ON DELETE CASCADE,
                    employee_id UUID REFERENCES "${schemaName}".employees(id) ON DELETE CASCADE,
                    role VARCHAR(50) DEFAULT 'MEMBER',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(project_id, employee_id)
                )
            `);
        console.log(`  - Created table project_members`);

        // B. Migrate existing data
        // We need to check if project_id column exists before trying to read it
        // (In case script is run twice)
        const checkCol = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = '${schemaName}' 
                AND table_name = 'employees' 
                AND column_name = 'project_id'
            `);

        if (checkCol.rows.length > 0) {
          const res = await client.query(`
                    INSERT INTO "${schemaName}".project_members (project_id, employee_id)
                    SELECT project_id, id FROM "${schemaName}".employees
                    WHERE project_id IS NOT NULL
                    ON CONFLICT DO NOTHING
                `);
          console.log(
            `  - Migrated ${res.rowCount} employee-project relationships`
          );

          // C. Drop project_id column from employees
          await client.query(`
                    ALTER TABLE "${schemaName}".employees DROP COLUMN project_id
                `);
          console.log(`  - Dropped project_id from employees`);
        } else {
          console.log(
            `  - Column project_id does not exist (already migrated?)`
          );
        }
      } catch (schemaErr) {
        console.error(`  - Error in schema ${schemaName}:`, schemaErr.message);
      }
    }

    console.log("Migration V2 completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit();
  }
}

migrateV2();
