const client = require("../config/databasepg");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//@route POST /api/auth/register
//@desc Register a new user
//@access Public
const createUser = async (req, res) => {
  const { companyName, email, password } = req.body;

  if (!companyName || !email || !password) {
    return res.status(400).json({
      message: "companyName, email and password are required",
    });
  }
  const userAvailable = await client.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (userAvailable.rows.length > 0) {
    return res.status(400).json({
      message: "User already exists",
    });
  }
  const hasedPassword = await bcrypt.hash(password, 10);

  try {
    await client.query("BEGIN");

    // -------------------------------------------------------------------------
    // STEP 1: Create Global Tenant Record (Public Schema)
    // -------------------------------------------------------------------------
    // This stores the high-level company info in the shared 'public' catalog.
    const tenantId = uuidv4();
    await client.query("INSERT INTO tenants (id, name) VALUES ($1, $2)", [
      tenantId,
      companyName,
    ]);

    // -------------------------------------------------------------------------
    // STEP 2: Create Owner User (Public Schema)
    // -------------------------------------------------------------------------
    // The user needs to exist in the global scope to log in.
    const userId = uuidv4();
    const result = await client.query(
      `INSERT INTO users (id, tenant_id, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, tenantId, email, hasedPassword, "COMPANY"]
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // We explicitly create the 'tasks' table (and others) inside the new schema.
    await client.query(`
      CREATE TABLE "${schemaName}".tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES "${schemaName}".projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `);
    // We explicitly create the 'employees' table (and others) inside the new schema.
    await client.query(`
      CREATE TABLE "${schemaName}".employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES "${schemaName}".projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'EMPLOYEE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const tenantAvailable = await client.query(
      "SELECT * FROM tenants WHERE id=$1",
      [user.rows[0].tenant_id]
    );
    if (tenantAvailable.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
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
      }
    );
    const refreshToken = jwt.sign(
      { id: user.rows[0].id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1d", //token expires in 1 day
      }
    );
    console.log("Access secret loaded:", !!process.env.ACCESS_TOKEN_SECRET);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.rows[0];

    res.status(200).json({ user: userWithoutPassword, accessToken });
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
  res.json(req.user);
};

module.exports = { createUser, loginUser, getCurrentUser };
