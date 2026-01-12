const express = require("express");
const router = express.Router();
const {
  createEmployee,
  loginEmployee,
  getCurrentEmployee,
} = require("../Controller/EmployeeController");
const { ValidateToken } = require("../../middleware/ValidateToken"); // Import middleware
router.post("/createEmployee", createEmployee);
router.post("/loginEmployee", loginEmployee);
router.get("/currentEmployee", ValidateToken, getCurrentEmployee); // Apply middleware
module.exports = router;
