const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../Controller/TaskController");
const { ValidateToken } = require("../../middleware/ValidateToken");

router.use(ValidateToken);
router.post("/tasks", createTask);
router.get("/projects/:projectId/tasks", getTasks);
router.put("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);

module.exports = router;
