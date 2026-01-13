const client = require("../src/config/databasepg");

async function migrateRoles() {
  try {
    console.log("Starting role migration...");

    // Update users table in public schema
    const res = await client.query(
      "UPDATE users SET role = 'COMPANY' WHERE role = 'OWNER'"
    );
    console.log(`Updated ${res.rowCount} users from 'OWNER' to 'COMPANY'.`);

    // Note: We should also theoretically update tenants' employee tables if they have 'OWNER' role there,
    // but typically employees are created as 'EMPLOYEE'.
    // If you had 'OWNER' employees in tenant schemas, we would need to iterate through schemas.
    // For now, this fixes the main login/owner issue.

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit();
  }
}

migrateRoles();
