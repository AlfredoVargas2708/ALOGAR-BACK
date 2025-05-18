const express = require('express');
const router = express.Router();
const { ProductsController } = require('../controllers');
const productsCtrl = new ProductsController();

router.get('/', productsCtrl.getProducts);
router.get('/category/:category_id', productsCtrl.getProductsByCategory);
router.post('/', productsCtrl.addProduct);
router.put('/', productsCtrl.editProduct);
router.delete('/:product_id', productsCtrl.deleteProduct);

module.exports = router