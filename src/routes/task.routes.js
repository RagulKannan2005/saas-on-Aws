const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getAllTasks,
  updateTask,
  deleteTask,
  addComment,
  getComments,
  getTaskActivity,
  deleteComment,
} = require("../Controller/TaskController");
const { ValidateToken } = require("../../middleware/ValidateToken");
const { verifyRole } = require("../../middleware/verifyRole");

router.use(ValidateToken);

// Task Management
router.post("/tasks", verifyRole(["COMPANY", "MANAGER"]), createTask);
router.get("/tasks", getAllTasks); // New route for all tasks
router.get("/projects/:projectId/tasks", getTasks);
router.put("/tasks/:id", verifyRole(["COMPANY", "MANAGER"]), updateTask);
router.delete("/tasks/:id", verifyRole(["COMPANY", "MANAGER"]), deleteTask);

// Comments & Activity
router.post("/tasks/:taskId/comments", addComment);
router.get("/tasks/:taskId/comments", getComments);
router.delete("/comments/:commentId", deleteComment);
router.get("/tasks/:taskId/activity", getTaskActivity);

module.exports = router;
