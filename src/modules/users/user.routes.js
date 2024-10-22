const express = require("express");
const router = express.Router();
const userController = require("./user.controller");

router.post("/addUser", userController.createUser);

module.exports = router;
