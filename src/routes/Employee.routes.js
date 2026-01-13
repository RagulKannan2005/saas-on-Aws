const express = require("express");
const router = express.Router();
const {
  createEmployee,
  loginEmployee,
  getCurrentEmployee,
  updateEmployee,
  deleteEmployee,
  getCompanyEmployees,
} = require("../Controller/EmployeeController");
const { verifyRole } = require("../../middleware/verifyRole");
const { ValidateToken } = require("../../middleware/ValidateToken");
router.post("/loginEmployee", loginEmployee); // Public route

router.use(ValidateToken); // Protect all routes below

// Restricted routes (RBAC)
router.post("/createEmployee", verifyRole(["COMPANY", "MANAGER"]), createEmployee);
router.put("/updateEmployee/:id", verifyRole(["COMPANY", "MANAGER"]), updateEmployee);
router.delete("/deleteEmployee/:id", verifyRole(["COMPANY", "MANAGER"]), deleteEmployee);
router.get("/employees/company", verifyRole(["COMPANY"]), getCompanyEmployees); // Open to all employees
// Authenticated but common routes
router.get("/currentEmployee", getCurrentEmployee);
module.exports = router;
