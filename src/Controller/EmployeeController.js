const client = require("../config/databasepg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// URL: /api/employees (or your configured route)
// Headers: Authorization: Bearer <token>
// Body:
// {
//   "name": "John Doe",
//   "email": "john@example.com",
//   "password": "password123",
//   "role": "EMPLOYEE"
// }

const createEmployee = async (req, res) => {
  const { name, email, password, project_id, role } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;

  try {
    const employeeAvailable = await client.query(
      `SELECT * FROM "${schemaName}".employees WHERE email=$1`,
      [email]
    );

    if (employeeAvailable.rows.length > 0) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
            INSERT INTO "${schemaName}".employees 
            (name, email, password, project_id, role) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `;

    const employee = await client.query(query, [
      name,
      email,
      hashedPassword,
      project_id || null,
      role || "EMPLOYEE",
    ]);

    res.status(201).json(employee.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating employee" });
  }
};


//URL: /api/employees/login
//Headers: Authorization: Bearer <token>
//Body:
//{
//  "email": "john@example.com",
//  "password": "password123",
//  "tenantId": "<tenantId>"
//}

const loginEmployee = async (req, res) => {
  const { email, password, tenantId } = req.body;

  if (!email || !password || !tenantId) {
    return res
      .status(400)
      .json({ message: "Email, password, and tenantId are required" });
  }

  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;

  try {
    const employee = await client.query(
      `SELECT * FROM "${schemaName}".employees WHERE email=$1`,
      [email]
    );
    if (employee.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      employee.rows[0].password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Since we queried the tenant-specific table, we may not have tenant_id column in the result
    // depending on table definition, but we do have the tenantId from request.
    // However, the employees table definition in AuthController.js (Step 11) is:
    // CREATE TABLE "${schemaName}".employees ( ..., project_id UUID ... )
    // It does NOT explicitly have tenant_id column because the schema itself implies the tenant.
    // So we should use the passed tenantId for the token.

    const accessToken = jwt.sign(
      {
        id: employee.rows[0].id,
        tenantId: tenantId,
        role: employee.rows[0].role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1h",
      }
    );
    const refreshToken = jwt.sign(
      {
        id: employee.rows[0].id,
        tenantId: tenantId,
        role: employee.rows[0].role,
      },
      process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    if (error.code === "42P01") {
      return res.status(400).json({ message: "Invalid Tenant ID" });
    }
    res.status(500).json({ message: "Error logging in employee" });
  }
};

const getCurrentEmployee = async (req, res) => {
  res.json(req.user);
};

module.exports = { createEmployee, loginEmployee, getCurrentEmployee };
