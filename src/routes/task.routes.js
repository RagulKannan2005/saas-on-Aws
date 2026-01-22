const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  addComment,
  getComments,
  getTaskActivity,
} = require("../Controller/TaskController");
const { ValidateToken } = require("../../middleware/ValidateToken");
const { verifyRole } = require("../../middleware/verifyRole");

router.use(ValidateToken);

// Task Management
router.post("/tasks", verifyRole(["COMPANY", "MANAGER"]), createTask);
router.get("/projects/:projectId/tasks", getTasks);
router.put("/tasks/:id", verifyRole(["COMPANY", "MANAGER"]), updateTask);
router.delete("/tasks/:id", verifyRole(["COMPANY", "MANAGER"]), deleteTask);

// Comments & Activity
router.post("/tasks/:taskId/comments", addComment);
router.get("/tasks/:taskId/comments", getComments);
router.get("/tasks/:taskId/activity", getTaskActivity);

module.exports = router;
