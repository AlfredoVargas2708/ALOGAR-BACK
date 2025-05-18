const express = require('express');
const router = express.Router();
const { WebController } = require('../controllers/index.js');
let webCtrl = new WebController();

// Ruta de inicio
router.get('/categories', webCtrl.scrappingCategories);
router.get('/categories-products', webCtrl.scrappingCategoriesProducts);

module.exports = router;