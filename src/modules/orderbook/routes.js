const express = require('express');
const router = express.Router();
const orderBookController = require('./controller');

router.post('/', orderBookController.addOrder);
router.delete('/', orderBookController.deleteOrder);


module.exports = router;
