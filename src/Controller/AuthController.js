const client = require("../config/databasepg");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");


//@route POST /api/auth/register
//@desc Register a new user
//@access Public
const createUser = async (req, res) => {
  const { companyName, email, password } = req.body;

  if (!companyName || !email || !password) {
    return res.status(400).json({
      message: "companyName, email and password are required"
    });
  }

  try {
    // Create tenant
    const tenantId = uuidv4();
    await client.query(
      "INSERT INTO tenants (id, name) VALUES ($1, $2)",
      [tenantId, companyName]
    );

    // Create OWNER user
    const userId = uuidv4();
    const result = await client.query(
      `INSERT INTO users (id, tenant_id, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, tenantId, email, password, "OWNER"]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

module.exports = { createUser };
