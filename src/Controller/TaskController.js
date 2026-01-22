const client = require("../config/databasepg");

//route POST /api/tasks
//desc Create a new task
//access Private
//route POST /api/tasks
//desc Create a new task
//access Private
const createTask = async (req, res) => {
  const {
    title,
    status,
    projectId,
    priority,
    assignees,
    parentTaskId,
    dueDate,
    type,
  } = req.body;

  if (!title || !projectId) {
    return res
      .status(400)
      .json({ message: "Title and projectId are required" });
  }

  const tenantId = req.user.tenantId;
  const employeeId = req.user.id; // User creating the task
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;

  try {
    await client.query("BEGIN");

    // VALIDATION: Cross-Project Subtask Check
    if (parentTaskId) {
      const parentTask = await client.query(
        `SELECT project_id FROM "${schemaName}".tasks WHERE id = $1`,
        [parentTaskId]
      );
      if (parentTask.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Parent task not found" });
      }
      if (parentTask.rows[0].project_id !== projectId) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({
            message:
              "Subtask must belong to the same project as the parent task",
          });
      }
    }

    // 1. Create Task
    const taskResult = await client.query(
      `INSERT INTO "${schemaName}".tasks (title, status, project_id, priority, parent_task_id, due_date, type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        title,
        status || "TODO",
        projectId,
        priority || "MEDIUM",
        parentTaskId || null,
        dueDate || null,
        type || "TASK",
      ]
    );
    const newTask = taskResult.rows[0];

    // 2. Handle Assignees
    if (assignees && Array.isArray(assignees) && assignees.length > 0) {
      const assigneeValues = assignees
        .map((empId) => `('${newTask.id}', '${empId}', 'CONTRIBUTOR')`) // Default role
        .join(",");
      await client.query(
        `INSERT INTO "${schemaName}".task_assignees (task_id, employee_id, role) VALUES ${assigneeValues} ON CONFLICT DO NOTHING`
      );
    }

    // 3. Log Activity
    await client.query(
      `INSERT INTO "${schemaName}".task_activity (task_id, action, new_value, performed_by) VALUES ($1, $2, $3, $4)`,
      [newTask.id, "TASK_CREATED", newTask.title, employeeId]
    );

    await client.query("COMMIT");

    newTask.assignees = assignees || [];
    res.status(201).json(newTask);
  } catch (err) {
    await client.query("ROLLBACK");
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
      `
      SELECT 
        t.*,
        t.parent_task_id,
        COALESCE(
          json_agg(json_build_object('id', e.id, 'name', e.name, 'email', e.email, 'role', ta.role)) 
          FILTER (WHERE e.id IS NOT NULL), 
          '[]'
        ) as assignees,
        (SELECT COUNT(*) FROM "${schemaName}".task_comments tc WHERE tc.task_id = t.id) as comment_count
      FROM "${schemaName}".tasks t
      LEFT JOIN "${schemaName}".task_assignees ta ON t.id = ta.task_id
      LEFT JOIN "${schemaName}".employees e ON ta.employee_id = e.id
      WHERE t.project_id = $1 AND t.is_deleted = FALSE
      GROUP BY t.id
      ORDER BY t.created_at DESC
      `,
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
  const { title, status, priority, assignees, dueDate, type } = req.body;
  const tenantId = req.user.tenantId;
  const employeeId = req.user.id;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;

  try {
    await client.query("BEGIN");

    // 1. Fetch current state
    const currentTaskResult = await client.query(
      `SELECT * FROM "${schemaName}".tasks WHERE id = $1`,
      [req.params.id]
    );
    if (currentTaskResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Task not found" });
    }
    const currentTask = currentTaskResult.rows[0];

    // 2. Update Task fields
    let updateFields = [];
    let values = [];
    let idx = 1;

    if (title) {
      updateFields.push(`title = $${idx++}`);
      values.push(title);
    }
    if (status) {
      updateFields.push(`status = $${idx++}`);
      values.push(status);
    }
    if (priority) {
      updateFields.push(`priority = $${idx++}`);
      values.push(priority);
    }
    if (dueDate) {
      updateFields.push(`due_date = $${idx++}`);
      values.push(dueDate);
    }
    if (type) {
      updateFields.push(`type = $${idx++}`);
      values.push(type);
    }

    if (updateFields.length > 0) {
      values.push(req.params.id);
      await client.query(
        `UPDATE "${schemaName}".tasks SET ${updateFields.join(
          ", "
        )} WHERE id = $${idx} AND is_deleted = FALSE`,
        values
      );

      // Log Activities
      if (status && status !== currentTask.status) {
        await client.query(
          `INSERT INTO "${schemaName}".task_activity (task_id, action, old_value, new_value, performed_by) VALUES ($1, $2, $3, $4, $5)`,
          [
            req.params.id,
            "STATUS_CHANGED",
            currentTask.status,
            status,
            employeeId,
          ]
        );
      }
      if (priority && priority !== currentTask.priority) {
        await client.query(
          `INSERT INTO "${schemaName}".task_activity (task_id, action, old_value, new_value, performed_by) VALUES ($1, $2, $3, $4, $5)`,
          [
            req.params.id,
            "PRIORITY_CHANGED",
            currentTask.priority,
            priority,
            employeeId,
          ]
        );
      }
    }

    // 3. Update Assignees (if provided)
    if (assignees && Array.isArray(assignees)) {
      await client.query(
        `DELETE FROM "${schemaName}".task_assignees WHERE task_id = $1`,
        [req.params.id]
      );

      if (assignees.length > 0) {
        const assigneeValues = assignees
          .map((empId) => `('${req.params.id}', '${empId}', 'CONTRIBUTOR')`) // Default role
          .join(",");
        await client.query(
          `INSERT INTO "${schemaName}".task_assignees (task_id, employee_id, role) VALUES ${assigneeValues} ON CONFLICT DO NOTHING`
        );
      }

      // Log Assignment Change
      await client.query(
        `INSERT INTO "${schemaName}".task_activity (task_id, action, new_value, performed_by) VALUES ($1, $2, $3, $4)`,
        [
          req.params.id,
          "ASSIGNEE_UPDATED",
          `Count: ${assignees.length}`,
          employeeId,
        ]
      );
    }

    await client.query("COMMIT");

    const updatedTask = await client.query(
      `SELECT * FROM "${schemaName}".tasks WHERE id = $1`,
      [req.params.id]
    );

    res.json(updatedTask.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
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
    const result = await client.query(
      `UPDATE "${schemaName}".tasks SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting task" });
  }
};

// COMMENTS & ACTIVITY

const addComment = async (req, res) => {
  const { text } = req.body;
  const { taskId } = req.params;
  const tenantId = req.user.tenantId;
  const employeeId = req.user.id;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;

  if (!text)
    return res.status(400).json({ message: "Comment text is required" });

  try {
    const comment = await client.query(
      `INSERT INTO "${schemaName}".task_comments (task_id, employee_id, comment) VALUES ($1, $2, $3) RETURNING *`,
      [taskId, employeeId, text]
    );
    res.status(201).json(comment.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding comment" });
  }
};

const getComments = async (req, res) => {
  const { taskId } = req.params;
  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;

  try {
    const comments = await client.query(
      `SELECT tc.*, e.name as employee_name, e.email as employee_email 
             FROM "${schemaName}".task_comments tc
             LEFT JOIN "${schemaName}".employees e ON tc.employee_id = e.id
             WHERE tc.task_id = $1
             ORDER BY tc.created_at ASC`,
      [taskId]
    );
    res.json(comments.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching comments" });
  }
};

const getTaskActivity = async (req, res) => {
  const { taskId } = req.params;
  const tenantId = req.user.tenantId;
  const schemaName = `tenant_${tenantId.replace(/-/g, "_")}`;

  try {
    const activity = await client.query(
      `SELECT ta.*, e.name as performed_by_name 
             FROM "${schemaName}".task_activity ta
             LEFT JOIN "${schemaName}".employees e ON ta.performed_by = e.id
             WHERE ta.task_id = $1
             ORDER BY ta.created_at DESC`,
      [taskId]
    );
    res.json(activity.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching activity" });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  addComment,
  getComments,
  getTaskActivity,
};
