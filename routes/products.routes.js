const express = require('express');
const router = express.Router();
const { ProductsController } = require('../controllers');
const productsCtrl = new ProductsController();

router.get('/', productsCtrl.getProducts);
router.post('/', productsCtrl.addProduct);
router.put('/', productsCtrl.editProduct);
router.delete('/:product_id', productsCtrl.deleteProduct);
router.get('/code/:code', productsCtrl.getProductByCode);
router.get('/name/:name', productsCtrl.getProductByName);
router.get('/order/:order', productsCtrl.getProductsOrderBy);

module.exports = router;