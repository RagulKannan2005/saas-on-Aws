const express = require("express");
const router = express.Router();

const { createUser, loginUser } = require("../Controller/AuthController");

router.route("/auth/register").post(createUser);
router.route("/auth/login").post(loginUser);
module.exports = router;
