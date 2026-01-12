const client = require("../config/databasepg");

//route POST /api/tasks
//desc Create a new task
//access Private
const createTask = async (req, res) => {
  const { title, status, projectId } = req.body;
  if (!title || !status || !projectId) {
    return res
      .status(400)
      .json({ message: "Title, status and projectId are required" });
  }
  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;
  try {
    const task = await client.query(
      `INSERT INTO "${schemaName}".tasks (title, status, project_id) VALUES ($1, $2, $3) RETURNING *`,
      [title, status, projectId]
    );
    res.status(201).json(task.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating task" });
  }
};

//route GET /api/projects/:projectId/tasks
//desc Get all tasks for a project
//access Private
const getTasks = async (req, res) => {
  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;
  try {
    const tasks = await client.query(
      `SELECT * FROM "${schemaName}".tasks WHERE project_id = $1`,
      [req.params.projectId]
    );
    res.json(tasks.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

//route PUT /api/tasks/:id
//desc Update a task
//access Private
const updateTask = async (req, res) => {
  const { title, status } = req.body;
  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;
  try {
    const task = await client.query(
      `UPDATE "${schemaName}".tasks SET title = $1, status = $2 WHERE id = $3 RETURNING *`,
      [title, status, req.params.id]
    );
    res.json(task.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating task" });
  }
};

//route DELETE /api/tasks/:id
//desc Delete a task
//access Private
const deleteTask = async (req, res) => {
  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;
  try {
    await client.query(`DELETE FROM "${schemaName}".tasks WHERE id = $1`, [
      req.params.id,
    ]);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting task" });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };
