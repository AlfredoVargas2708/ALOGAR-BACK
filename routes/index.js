const express = require('express');

const router = express.Router();

// Importar rutas
const webRoutes = require('./web.routes');
const categoriesRoutes = require('./categories.routes');
const productsRoutes = require('./products.routes');
const usersRoutes = require('./users.routes');
const salesRoutes = require('./sales.routes');

// Configurar rutas
router.use('/web', webRoutes);
router.use('/categories', categoriesRoutes);
router.use('/products', productsRoutes);
router.use('/users', usersRoutes);
router.use('/sales', salesRoutes);

module.exports = router;