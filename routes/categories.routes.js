const express = require('express');
const router = express.Router();
const { CategoriesController } = require('../controllers/index.js');
let categoriesCtrl = new CategoriesController();

router.get('/', categoriesCtrl.getCategories)


module.exports = router;