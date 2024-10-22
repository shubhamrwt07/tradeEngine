const express = require("express");
const router = express.Router();
const historyController = require("./historyController");

router.post("/getAllHistory", historyController.getHistory);

module.exports = router;
