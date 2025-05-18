const express = require('express');

const router = express.Router();

// Importar rutas
const webRoutes = require('./web.routes');
const categoriesRoutes = require('./categories.routes');
const productsRoutes = require('./products.routes');
const usersRoutes = require('./users.routes');

// Configurar rutas
router.use('/web', webRoutes);
router.use('/categories', categoriesRoutes);
router.use('/products', productsRoutes);
router.use('/users', usersRoutes);

module.exports = router;