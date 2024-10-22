const express = require("express");
const router = express.Router();
const orderBookController = require("./controller");

router.post("/addOrderBook", orderBookController.addOrder);
router.delete("/", orderBookController.deleteOrder);
router.get("/", orderBookController.getOrders);

module.exports = router;
