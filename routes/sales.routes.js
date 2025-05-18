const express = require('express');
const router = express.Router();
const { SalesController } = require('../controllers/index.js');
const salesCtrl = new SalesController();

router.get('/', salesCtrl.getSales);
router.get('/count', salesCtrl.getCantSales);

module.exports = router;