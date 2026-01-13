const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../Controller/TaskController");
const { ValidateToken } = require("../../middleware/ValidateToken");
const { verifyRole } = require("../../middleware/verifyRole");

router.use(ValidateToken);
router.post("/tasks", verifyRole(["COMPANY", "MANAGER"]), createTask);
router.get("/projects/:projectId/tasks", getTasks);
router.put("/tasks/:id", verifyRole(["COMPANY", "MANAGER"]), updateTask);
router.delete("/tasks/:id", verifyRole(["COMPANY", "MANAGER"]), deleteTask);

module.exports = router;
