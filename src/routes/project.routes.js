const express = require("express");
const router = express.Router();
const {
  createProject,
  getAllProjects,
  UpdateProject,
  deleteProject,
  getProjectByID,
} = require("../Controller/ProjectController");
const { ValidateToken } = require("../../middleware/ValidateToken");

router.use(ValidateToken);
router.post("/projects", createProject);
router.get("/projects", getAllProjects);
router.put("/projects/:id", UpdateProject);
router.delete("/projects/:id", deleteProject);
router.get("/projects/:id", getProjectByID);
module.exports = router;
