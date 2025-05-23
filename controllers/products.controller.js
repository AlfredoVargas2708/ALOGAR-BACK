const pool = require('../PostgreSQL/db');

class ProductsController {
    async getProducts(req, res) {
        try {
            const products = await pool.query('SELECT product_id, product, price, product_url, product_image, id_category, category_id, category FROM productos_unicos INNER JOIN categories ON productos_unicos.id_category = categories.category_id ORDER BY product_id ASC;');
            res.status(200).send(products.rows);
        } catch (error) {
            console.error('Error en getProducts:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }

    async getProductsByCategory(req, res) {
        try {
            const { category_id } = req.params;
            const page = parseInt(req.query.page) || 1;       // página actual
            const limit = parseInt(req.query.limit) || 10;    // items por página
            const offset = (page - 1) * limit;

            const query = 'SELECT * FROM productos_unicos WHERE $1 = ANY(productos_unicos.categorias) ORDER BY product_id ASC LIMIT $2 OFFSET $3';
            const values = [category_id, limit, offset];
            const products = await pool.query(query, values);

            const countQuery = 'SELECT COUNT(*) FROM productos_unicos WHERE $1 = ANY(productos_unicos.categorias)';
            const total = parseInt((await pool.query(countQuery, [category_id])).rows[0].count, 10);

            if (products.rowCount > 0) {
                res.status(200).send({
                    products: products.rows,
                    totalProducts: total,
                    totalPages: Math.ceil(total / limit),
                    currentPage: page,
                });
            } else {
                res.status(404).json({ message: 'No se encontraron productos para esta categoría' });
            }
        } catch (error) {
            console.error('Error en getProductsByCategory:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }

    async addProduct(req, res) {
        try {
            const { product, price, product_url, product_image, id_category } = req.body;

            const query = 'INSERT INTO products (product, price, product_url, product_image, id_category) VALUES ($1, $2, $3, $4, $5) RETURNING *';
            const values = [product, price, product_url, product_image, id_category];

            const result = await pool.query(query, values);

            if (result.rowCount > 0) {
                res.status(201).json({ message: 'Producto agregado correctamente', product: result.rows[0] });
            } else {
                res.status(400).json({ message: 'Error al agregar el producto' });
            }
        } catch (error) {
            console.error('Error en addProduct:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }

    async editProduct(req, res) {
        try {
            const { codigo, id, name, price } = req.body;

            const query = 'UPDATE productos_unicos SET product = $1, price = $2, product_code = $3 WHERE product_id = $4';
            const values = [name, price, codigo, id];

            const result = await pool.query(query, values);

            if (result.rowCount > 0) {
                res.status(200).json({ message: 'Producto actualizado correctamente', product: result.rows[0] });
            } else {
                res.status(404).json({ message: 'Producto no encontrado' });
            }
        } catch (error) {
            console.error('Error en editProduct:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }

    async deleteProduct(req, res) {
        try {
            const { product_id } = req.params;

            const query = 'DELETE FROM productos_unicos WHERE product_id = $1';
            const values = [product_id];

            const result = await pool.query(query, values);

            if (result.rowCount > 0) {
                res.status(200).json({ message: 'Producto eliminado correctamente' });
            } else {
                res.status(404).json({ message: 'Producto no encontrado' });
            }
        } catch (error) {
            console.error('Error en deleteProduct:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }

    async getProductByCode(req, res) {
        try {
            const { code } = req.params;
            const query = 'SELECT * FROM productos_unicos WHERE product_code = $1';
            const values = [code];

            const result = await pool.query(query, values);

            if (result.rowCount > 0) {
                res.status(200).json(result.rows[0]);
            } else {
                res.status(404).json({ message: 'Producto no encontrado' });
            }
        } catch (error) {
            console.error('Error en getProductByCode:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }

    async getProductsOrderBy(req, res) {
        try {
            const { order } = req.params;
            const page = parseInt(req.query.page) || 1;       // página actual
            const limit = parseInt(req.query.limit) || 10;    // items por página
            const offset = (page - 1) * limit;

            const query = `SELECT * FROM productos_unicos INNER JOIN categories ON productos_unicos.id_category = categories.category_id ORDER BY ${order} LIMIT $1 OFFSET $2`;
            const values = [limit, offset];

            const result = await pool.query(query, values);

            if (result.rowCount > 0) {
                res.status(200).json({
                    products: result.rows,
                    totalProducts: result.rowCount,
                    totalPages: Math.ceil(result.rowCount / limit),
                    currentPage: page,
                });
            } else {
                res.status(404).json({ message: 'No se encontraron productos' });
            }
        } catch (error) {
            console.error('Error en getProductsOrderBy:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }
}

module.exports = ProductsController;