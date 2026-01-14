const express = require("express");
const router = express.Router();
const {
  addMember,
  removeMember,
  getProjectMembers,
} = require("../Controller/ProjectMemberController");

const { ValidateToken } = require("../../middleware/ValidateToken");
const { verifyRole } = require("../../middleware/verifyRole");

router.use(ValidateToken);

// Add Member (Company/Manager)
router.post(
  "/projects/:id/members",
  verifyRole(["COMPANY", "MANAGER"]),
  addMember
);

// Remove Member (Company/Manager)
router.delete(
  "/projects/:id/members/:employeeId",
  verifyRole(["COMPANY", "MANAGER"]),
  removeMember
);

// Get Members (Available to all authenticated employees)
router.get("/projects/:id/members", getProjectMembers);

module.exports = router;
