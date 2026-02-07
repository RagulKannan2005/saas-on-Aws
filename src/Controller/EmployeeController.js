const client = require("../config/databasepg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const logToFile = (message) => {
  const logPath = path.join(__dirname, "../../debug_login.txt");
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `${timestamp}: ${message}\n`);
};

//@route /api/employees/company/:id
//@desc Get company employees
//@access Private

const getCompanyEmployees = async (req, res) => {
  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;
  try {
    const employees = await client.query(
      `SELECT * FROM "${schemaName}".employees WHERE is_deleted = FALSE`,
    );
    if (employees.rows.length === 0) {
      return res.status(404).json({ message: "Employees not found" });
    }
    res.json(employees.rows);
  } catch (error) {
    console.error(error);
    if (error.code === "42P01") {
      return res.status(400).json({ message: "Invalid Tenant ID" });
    }
    res.status(500).json({ message: "Error getting employees" });
  }
};

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

  // Security Check: usage of hierarchy
  if (req.user.role === "MANAGER") {
    if (role !== "EMPLOYEE") {
      return res.status(403).json({
        message: "Forbidden: Managers can only create 'EMPLOYEE' accounts.",
      });
    }
  }

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;

  try {
    const employeeAvailable = await client.query(
      `SELECT * FROM "${schemaName}".employees WHERE email=$1 AND is_deleted = FALSE`,
      [email],
    );

    if (employeeAvailable.rows.length > 0) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
            INSERT INTO "${schemaName}".employees 
            (name, email, password, role) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *
        `;

    const employee = await client.query(query, [
      name,
      email,
      hashedPassword,
      role || "EMPLOYEE",
    ]);

    // OPTIONAL: If project_id was provided, we could assign them here.
    // For V2 MVP, we will separate creation and assignment.
    if (project_id) {
      // We would INSERT INTO project_members here.
      // For now, let's keep it simple and just create the user.
      // The user can be assigned to the project later via the ProjectMember routes.
    }

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
  logToFile(
    `Login attempt matched /employees/login. Email: ${email}, Tenant: ${tenantId}`,
  );

  if (!email || !password || !tenantId) {
    logToFile("Missing credentials in request body");
    return res
      .status(400)
      .json({ message: "Email, password, and tenantId are required" });
  }

  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;
  logToFile(`Derived Schema: ${schemaName}`);

  try {
    const employee = await client.query(
      `SELECT * FROM "${schemaName}".employees WHERE email=$1 AND is_deleted = FALSE`,
      [email],
    );
    if (employee.rows.length === 0) {
      logToFile(`User NOT FOUND in schema ${schemaName}. Email: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      employee.rows[0].password,
    );
    if (!isPasswordValid) {
      logToFile(`INVALID PASSWORD for ${email}`);
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
      },
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
      },
    );
    res.json({
      user: {
        id: employee.rows[0].id,
        name: employee.rows[0].name,
        email: employee.rows[0].email,
        role: employee.rows[0].role,
        tenantId: tenantId,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    if (error.code === "42P01") {
      return res.status(400).json({ message: "Invalid Tenant ID" });
    }
    res.status(500).json({ message: "Error logging in employee" });
  }
};

//@route PUT /api/employees/:id
//@desc Update employee
//@access Private

const updateEmployee = async (req, res) => {
  const { id } = req.params;

  // Authorization: Allow ONLY if "COMPANY" or updating SELF
  if (req.user.role !== "COMPANY" && req.user.id !== id) {
    return res
      .status(403)
      .json({ message: "Forbidden: You can only update your own profile" });
  }

  const { name, email, password, role } = req.body;

  // Security Check: usage of hierarchy
  if (req.user.role === "MANAGER") {
    if (role && role !== "EMPLOYEE") {
      return res.status(403).json({
        message: "Forbidden: Managers cannot promote users beyond 'EMPLOYEE'.",
      });
    }
  }
  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;
  try {
    const employee = await client.query(
      `SELECT * FROM "${schemaName}".employees WHERE id=$1 AND is_deleted = FALSE`,
      [id],
    );
    if (employee.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prevent employees from promoting themselves
    const newRole = req.user.role === "COMPANY" ? role : employee.rows[0].role;

    const query = `UPDATE "${schemaName}".employees SET name=$1,email=$2,password=$3,role=$4 WHERE id=$5 AND is_deleted = FALSE RETURNING *`;
    const updatedEmployee = await client.query(query, [
      name,
      email,
      hashedPassword,
      newRole,
      id,
    ]);
    res.json(updatedEmployee.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === "42P01") {
      return res.status(400).json({ message: "Invalid Tenant ID" });
    }
    res.status(500).json({ message: "Error updating employee" });
  }
};
//@route DELETE /api/employees/:id
//@desc Delete employee
//@access Private
const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;
  try {
    // Soft Delete
    const query = `UPDATE "${schemaName}".employees SET is_deleted = TRUE, deleted_at = NOW() WHERE id=$1 RETURNING *`;
    const deletedEmployee = await client.query(query, [id]);

    if (deletedEmployee.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(deletedEmployee.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === "42P01") {
      return res.status(400).json({ message: "Invalid Tenant ID" });
    }
    res.status(500).json({ message: "Error deleting employee" });
  }
};
const getCurrentEmployee = async (req, res) => {
  res.json(req.user);
};

module.exports = {
  createEmployee,
  loginEmployee,
  getCurrentEmployee,
  updateEmployee,
  deleteEmployee,
  getCompanyEmployees,
};
