const express = require('express');
const router = express.Router();

const {
    createUser
}=require("../Controller/AuthController");

router.route("/auth/register").post(createUser);
module.exports=router;
