const fs = require("fs");
const path = require("path");
const client = require("../src/config/databasepg");

const migrationFile = path.join(
  __dirname,
  "../migrations/006_registration_fields.sql",
);

async function runMigration() {
  try {
    const sql = fs.readFileSync(migrationFile, "utf8");
    console.log("Running migration:", migrationFile);
    await client.query(sql);
    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit();
  }
}

runMigration();
