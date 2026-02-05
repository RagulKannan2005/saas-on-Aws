const client = require("../src/config/databasepg");

async function migrateAllTenants() {
  try {
    console.log("Starting migration for all tenants...");

    // Fetch all tenants
    const tenants = await client.query("SELECT id FROM tenants");
    console.log(`Found ${tenants.rows.length} tenants.`);

    for (const tenant of tenants.rows) {
      const schemaName = `tenant_${tenant.id.replace(/-/g, "_")}`;
      console.log(`Migrating schema: ${schemaName}`);

      try {
        await client.query("BEGIN");

        // 1. Add Soft Delete to PROJECTS
        await client.query(`
          ALTER TABLE "${schemaName}".projects 
          ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
        `);

        // 2. Add Soft Delete to TASKS
        await client.query(`
          ALTER TABLE "${schemaName}".tasks 
          ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
        `);

        // 3. Add Soft Delete to EMPLOYEES
        await client.query(`
          ALTER TABLE "${schemaName}".employees 
          ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
        `);

        await client.query("COMMIT");
        console.log(`Successfully migrated ${schemaName}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`Failed to migrate ${schemaName}:`, err.message);
      }
    }

    console.log("Migration completed.");
    process.exit(0);
  } catch (err) {
    console.error("Migration script error:", err);
    process.exit(1);
  }
}

migrateAllTenants();
