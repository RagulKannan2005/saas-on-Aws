const client = require("../config/databasepg");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//@route POST /api/auth/register
//@desc Register a new user
//@access Public
const createUser = async (req, res) => {
  const { company, admin } = req.body;

  if (!company || !company.name || !admin || !admin.email || !admin.password) {
    return res.status(400).json({
      message: "Company Name, Email and Password are required",
    });
  }
  const userAvailable = await client.query(
    "SELECT * FROM users WHERE email = $1",
    [admin.email],
  );

  if (userAvailable.rows.length > 0) {
    return res.status(400).json({
      message: "User already exists",
    });
  }
  const hasedPassword = await bcrypt.hash(admin.password, 10);

  try {
    await client.query("BEGIN");

    // -------------------------------------------------------------------------
    // STEP 1: Create Global Tenant Record (Public Schema)
    // -------------------------------------------------------------------------
    // This stores the high-level company info in the shared 'public' catalog.
    const tenantId = uuidv4();
    await client.query(
      "INSERT INTO tenants (id, name, industry, size, domain, country, timezone) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        tenantId,
        company.name,
        company.industry,
        company.size,
        company.domain,
        company.country,
        company.timezone,
      ],
    );

    // -------------------------------------------------------------------------
    // STEP 2: Create Owner User (Public Schema)
    // -------------------------------------------------------------------------
    // The user needs to exist in the global scope to log in.
    const userId = uuidv4();
    const result = await client.query(
      `INSERT INTO users (id, tenant_id, email, password, role, name, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        tenantId,
        admin.email,
        hasedPassword,
        "COMPANY",
        admin.fullName,
        admin.phone,
      ],
    );

    // -------------------------------------------------------------------------
    // STEP 3: Provision Tenant-Specific Schema
    // -------------------------------------------------------------------------
    // We create a dedicated schema "tenant_<uuid>" for this customer.
    // This ensures their data (like projects) is completely isolated.
    const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`; // Sanitize UUID for SQL identifier
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

    // -------------------------------------------------------------------------
    // STEP 4: Create Tables inside the Tenant Schema
    // -------------------------------------------------------------------------
    // We explicitly create the 'projects' table (and others) inside the new schema.
    await client.query(`
      CREATE TABLE "${schemaName}".projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP
      )
    `);
    // We explicitly create the 'tasks' table (and others) inside the new schema.
    await client.query(`
      CREATE TABLE "${schemaName}".tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES "${schemaName}".projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP
      )
    `);
    // We explicitly create the 'employees' table (and others) inside the new schema.
    // V2: Create 'employees' table WITHOUT project_id
    await client.query(`
      CREATE TABLE "${schemaName}".employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'EMPLOYEE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP
      )
    `);

    // V2: Create 'project_members' table for Many-to-Many
    await client.query(`
      CREATE TABLE "${schemaName}".project_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES "${schemaName}".projects(id) ON DELETE CASCADE,
        employee_id UUID REFERENCES "${schemaName}".employees(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'MEMBER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, employee_id)
      )
    `);

    await client.query("COMMIT");
    console.log(`Successfully provisioned schema: ${schemaName}`);

    res.status(201).json({
      user: result.rows[0],
      message: "Registration successful and tenant workspace created.",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({
      message: "Registration failed",
      error: err.message,
      stack: err.stack,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await client.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const tenantAvailable = await client.query(
      "SELECT * FROM tenants WHERE id=$1",
      [user.rows[0].tenant_id],
    );
    if (tenantAvailable.rows.length === 0) {
      return res.status(401).json({ message: "Tenant not linked to user" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.rows[0].password,
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    const accessToken = jwt.sign(
      {
        id: user.rows[0].id,
        tenantId: user.rows[0].tenant_id,
        role: user.rows[0].role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1h", //token expires in 1 hour
      },
    );
    const refreshToken = jwt.sign(
      { id: user.rows[0].id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1d", //token expires in 1 day
      },
    );
    console.log("Access secret loaded:", !!process.env.ACCESS_TOKEN_SECRET);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.rows[0];
    const company = tenantAvailable.rows[0];

    res.status(200).json({ user: userWithoutPassword, company, accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

//Current User
//@ Get /api/auth/current-user
//@desc Get current user
//@access Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await client.query("SELECT * FROM users WHERE id=$1", [
      req.user.id,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const tenantAvailable = await client.query(
      "SELECT * FROM tenants WHERE id=$1",
      [user.rows[0].tenant_id],
    );

    const { password: _, ...userWithoutPassword } = user.rows[0];
    const company = tenantAvailable.rows[0];

    res.json({ user: userWithoutPassword, company });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createUser, loginUser, getCurrentUser };
