const client = require("../src/config/databasepg");

async function syncUsersToEmployees() {
  try {
    console.log("Starting User -> Employee Sync...");

    // 1. Fetch all users from public.users
    const usersRes = await client.query("SELECT * FROM users");
    const users = usersRes.rows;
    console.log(`Found ${users.length} users in public table.`);

    for (const user of users) {
      if (!user.tenant_id) {
        console.warn(`User ${user.email} has no tenant_id. Skipping.`);
        continue;
      }

      const schemaName = `tenant_${user.tenant_id.replace(/-/g, "_")}`;

      try {
        // Check if schema exists first (to avoid errors for stale users)
        const schemaExists = await client.query(
          "SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1",
          [schemaName],
        );

        if (schemaExists.rows.length === 0) {
          console.warn(
            `Schema ${schemaName} does not exist for user ${user.email}. Skipping.`,
          );
          continue;
        }

        // Check if employee already exists with this ID
        const empCheck = await client.query(
          `SELECT id FROM "${schemaName}".employees WHERE id = $1`,
          [user.id],
        );

        if (empCheck.rows.length === 0) {
          console.log(
            `Syncing user ${user.email} to ${schemaName}.employees...`,
          );

          await client.query(
            `INSERT INTO "${schemaName}".employees (id, name, email, password, role, created_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              user.id,
              user.name || "Admin", // Fallback name
              user.email,
              user.password, // Keep same hash
              user.role === "COMPANY" ? "MANAGER" : "EMPLOYEE", // Map roles
              user.created_at,
            ],
          );
          console.log(`  -> Success`);
        } else {
          // console.log(`  -> User ${user.email} already exists in employees.`);
        }
      } catch (err) {
        console.error(`  -> Failed to sync user ${user.email}:`, err.message);
      }
    }

    console.log("Sync completed.");
  } catch (err) {
    console.error("Critical error:", err);
  } finally {
    process.exit();
  }
}

syncUsersToEmployees();
