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
const { verifyRole } = require("../../middleware/verifyRole");
router.use("/projects", ValidateToken);
router.post("/projects", verifyRole(["COMPANY", "MANAGER"]), createProject);
router.get("/projects", getAllProjects);
router.put("/projects/:id", verifyRole(["COMPANY", "MANAGER"]), UpdateProject);
router.delete(
  "/projects/:id",
  verifyRole(["COMPANY", "MANAGER"]),
  deleteProject,
);
router.get("/projects/:id", verifyRole(["COMPANY"]), getProjectByID);
module.exports = router;
