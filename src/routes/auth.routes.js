const express = require("express");
const router = express.Router();

const {
  createUser,
  loginUser,
  getCurrentUser,
} = require("../Controller/AuthController");
const { ValidateToken } = require("../../middleware/ValidateToken");

router.route("/auth/register").post(createUser);
router.route("/auth/login").post(loginUser);
router.route("/auth/current-user").get(ValidateToken, getCurrentUser);
module.exports = router;    
