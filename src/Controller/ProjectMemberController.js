const client = require("../config/databasepg");

// @route POST /api/projects/:id/members
// @desc Add an employee to a project
// @access Private (Company/Manager)
const addMember = async (req, res) => {
  const { id } = req.params; // project_id
  const { employeeId, role } = req.body;
  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;

  if (!employeeId) {
    return res.status(400).json({ message: "Employee ID is required" });
  }

  try {
    // 1. Check if Project exists
    const project = await client.query(
      `SELECT * FROM "${schemaName}".projects WHERE id = $1`,
      [id],
    );
    if (project.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 2. Check if Employee exists
    const employee = await client.query(
      `SELECT * FROM "${schemaName}".employees WHERE id = $1`,
      [employeeId],
    );
    if (employee.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 3. Add to project_members with role
    const result = await client.query(
      `
            INSERT INTO "${schemaName}".project_members (project_id, employee_id, role)
            VALUES ($1, $2, $3)
            RETURNING *
        `,
      [id, employeeId, role || "MEMBER"],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      // Unique constraint violation
      return res
        .status(400)
        .json({ message: "Employee is already a member of this project" });
    }
    res.status(500).json({ message: "Error adding member to project" });
  }
};

// @route DELETE /api/projects/:id/members/:employeeId
// @desc Remove an employee from a project
// @access Private (Company/Manager)
const removeMember = async (req, res) => {
  const { id, employeeId } = req.params;
  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;

  try {
    const result = await client.query(
      `
            DELETE FROM "${schemaName}".project_members
            WHERE project_id = $1 AND employee_id = $2
            RETURNING *
        `,
      [id, employeeId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Member not found in this project" });
    }

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error removing member" });
  }
};

// @route GET /api/projects/:id/members
// @desc Get all members of a project
// @access Private (Company/Manager/Employee)
const getProjectMembers = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;

  try {
    const members = await client.query(
      `
            SELECT e.id, e.name, e.email, e.role, pm.role as project_role, pm.created_at as joined_at
            FROM "${schemaName}".employees e
            JOIN "${schemaName}".project_members pm ON e.id = pm.employee_id
            WHERE pm.project_id = $1
        `,
      [id],
    );

    res.json(members.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching project members" });
  }
};

module.exports = {
  addMember,
  removeMember,
  getProjectMembers,
};
