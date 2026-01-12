const client = require("../config/databasepg");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//@route GET /api/projects
//@desc Get all projects
//@access Private
const getAllProjects = async (req, res) => {
  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;
  try {
    const projects = await client.query(
      `SELECT * FROM "${schemaName}".projects`
    );
    res.json(projects.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching projects" });
  }
};
//@route Get /api/projects/:id
//@desc Get a project
//@access Private
const getProjectByID = async (req, res) => {
  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;
  try {
    const project = await client.query(
      `
        SELECT 
                p.*,
                COALESCE(
                    json_agg(t.*) FILTER (WHERE t.id IS NOT NULL),
                    '[]'
                ) AS tasks
            FROM "${schemaName}".projects p
            LEFT JOIN "${schemaName}".tasks t
                ON t.project_id = p.id
            WHERE p.id = $1
            GROUP BY p.id
            `,
      [req.params.id]
    );
    res.json(project.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching project" });
  }
};

//@route POST /api/projects
//@desc Create a new project
//@access Private

const createProject = async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return res
      .status(400)
      .json({ message: "Name and description are required" });
  }
  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;

  // Removed check that prevents project creation
  /*
  const AvailableProjects = await client.query(
    `SELECT * FROM "${schemaName}".projects`
  );
  if (AvailableProjects.rows.length > 0) {
    return res.status(400).json({ message: "Project already exists" });
  } 
  */
  try {
    const project = await client.query(
      `INSERT INTO "${schemaName}".projects (name, description) VALUES ($1, $2) RETURNING *`,
      [name, description]
    );
    res.status(201).json(project.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating project" });
  }
};

//@route PUT /api/projects/:id
//@desc Update a project
//@access Private

const UpdateProject = async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return res
      .status(400)
      .json({ message: "Name and description are required" });
  }
  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;

  try {
    const project = await client.query(
      `UPDATE "${schemaName}".projects SET name = $1, description = $2 WHERE id = $3 RETURNING *`,
      [name, description, req.params.id]
    );
    res.status(201).json({ message: "Project updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating project" });
  }
};

const deleteProject = async (req, res) => {
  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;

  try {
    const project = await client.query(
      `DELETE FROM "${schemaName}".projects WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.status(201).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting project" });
  }
};

module.exports = {
  getAllProjects,
  createProject,
  UpdateProject,
  deleteProject,
  getProjectByID,
};
