const pool = require('../PostgreSQL/db');

class ProductsController {
    async getProducts(req, res) {
        try {
            const products = await pool.query('SELECT product_id, product, price, product_url, product_image, id_category, category_id, category FROM products INNER JOIN categories ON products.id_category = categories.category_id ORDER BY product_id ASC;');
            res.status(200).send(products.rows);
        } catch (error) {
            console.error('Error en getProducts:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }

    async getProductsByCategory(req, res) {
        try {
            const { category_id } = req.params;
            const { page, pageSize } = req.query;
            const pageSizeInt = parseInt(pageSize, 10);
            const pageInt = parseInt(page, 10);
            if (isNaN(pageSizeInt) || isNaN(pageInt) || pageSizeInt <= 0 || pageInt <= 0) {
                return res.status(400).json({ message: 'Invalid page or pageSize' });
            }
            const offset = (pageInt - 1) * pageSizeInt;

            const query = 'SELECT product_id, product, price, product_url, product_image, product_code, id_category, category_id, category FROM products INNER JOIN categories ON products.id_category = categories.category_id WHERE categories.category_id = $1 ORDER BY product_id ASC LIMIT $2 OFFSET $3';
            const values = [category_id, pageSizeInt, offset];
            const products = await pool.query(query, values);

            const countQuery = 'SELECT COUNT(*) FROM products INNER JOIN categories ON products.id_category = categories.category_id WHERE categories.category_id = $1';
            const total = parseInt((await pool.query(countQuery, [category_id])).rows[0].count, 10);

            if (products.rowCount > 0) {
                res.status(200).send({
                    products: products.rows,
                    totalProducts: total,
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
            const { product_id, product, price, product_url, product_image, id_category } = req.body;

            const query = 'UPDATE products SET product = $1, price = $2, product_url = $3, product_image = $4, id_category = $5 WHERE product_id = $6';
            const values = [product, price, product_url, product_image, id_category, product_id];

            const result = await pool.query(query, values);

            if (result.rowCount > 0) {
                res.status(200).json({ message: 'Producto actualizado correctamente' });
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

            const query = 'DELETE FROM products WHERE product_id = $1';
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
            const query = 'SELECT * FROM products WHERE product_code = $1';
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
}

module.exports = ProductsController;