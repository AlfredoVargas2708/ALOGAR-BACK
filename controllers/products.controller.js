const pool = require('../PostgreSQL/db');

class ProductsController {
    async getProducts(req, res) {
        const page = parseInt(req.query.page) || 1;       // página actual
        const limit = parseInt(req.query.limit) || 10;    // items por página
        const offset = (page - 1) * limit;                // desplazamiento
        try {
            const products = await pool.query(`
                SELECT 
                pu.product_id, 
                pu.product, 
                pu.price, 
                pu.product_url, 
                pu.product_image,
                pu.product_code,
                JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
                    'id', c.category_id,
                    'nombre', c.category
                )) AS categorias
                FROM 
                productos_unicos pu
                JOIN 
                UNNEST(pu.categorias) AS cat_id ON TRUE
                JOIN 
                categories c ON c.category_id = cat_id
                GROUP BY 
                pu.product_id, pu.product, pu.price, pu.product_url, pu.product_image
                ORDER BY 
                pu.product
                LIMIT $1 OFFSET $2;`, [limit, offset]);

            const totalProducts = await pool.query('SELECT COUNT(*) FROM productos_unicos');
            const totalCount = parseInt(totalProducts.rows[0].count);
            const totalPages = Math.ceil(totalCount / limit);

            res.status(200).send({
                products: products.rows,
                totalProducts: totalCount,
                totalPages: totalPages,
                currentPage: page,
            });
        } catch (error) {
            console.error('Error en getProducts:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }

    async addProduct(req, res) {
        try {
            const { codigo, name, price, category, url, image, weighable } = req.body;


            const query = 'INSERT INTO productos_unicos (product_code, product, price, categorias, product_url, product_image, product_weighable) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
            const values = [codigo, name, price, category, url, image, weighable];

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

    async getProductByName(req, res) {
        try {
            const { name } = req.params;
            const page = parseInt(req.query.page) || 1;       // página actual
            const limit = parseInt(req.query.limit) || 10;    // items por página
            const offset = (page - 1) * limit;                // desplazamiento
            const query = `SELECT 
                        pu.product_id, 
                        pu.product, 
                        pu.price, 
                        pu.product_url, 
                        pu.product_image,
                        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
                            'id', c.category_id,
                            'nombre', c.category
                        )) AS categorias
                        FROM 
                        productos_unicos pu
                        JOIN 
                        UNNEST(pu.categorias) AS cat_id ON TRUE
                        JOIN 
                        categories c ON c.category_id = cat_id
                        WHERE 
                        pu.product ILIKE $1
                        GROUP BY 
                        pu.product_id, pu.product, pu.price, pu.product_url, pu.product_image
                        ORDER BY 
                        pu.product_id
                        LIMIT $2 OFFSET $3;`;
            const values = [`%${name}%`, limit, offset];

            const totalQuery = 'SELECT COUNT(*) FROM productos_unicos WHERE product ILIKE $1';
            const totalValues = [`%${name}%`];
            const totalProducts = await pool.query(totalQuery, totalValues);

            const totalCount = parseInt(totalProducts.rows[0].count);
            const totalPages = Math.ceil(totalCount / limit);

            const result = await pool.query(query, values);

            if (result.rowCount > 0) {
                res.status(200).json({
                    products: result.rows,
                    totalProducts: totalCount,
                    totalPages: totalPages,
                    currentPage: page,
                });
            } else {
                res.status(404).json({ message: 'Producto no encontrado' });
            }
        } catch (error) {
            console.error('Error en getProductByName:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }

    async getProductsOrderBy(req, res) {
        try {
            const { order } = req.params;
            const page = parseInt(req.query.page) || 1;       // página actual
            const limit = parseInt(req.query.limit) || 10;    // items por página
            const offset = (page - 1) * limit;
            const orderBy = req.query.orderBy || 'ASC'; // orden por defecto

            if (order === 'category') {
                const query = `SELECT 
                    pu.product_id, 
                    pu.product, 
                    pu.price, 
                    pu.product_url, 
                    pu.product_image,
                    JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
                        'id', c.category_id,
                        'nombre', c.category
                    )) AS categorias,
                    MIN(c.category) AS categoria_orden
                    FROM 
                    productos_unicos pu
                    JOIN 
                    UNNEST(pu.categorias) AS cat_id ON TRUE
                    JOIN 
                    categories c ON c.category_id = cat_id
                    GROUP BY 
                    pu.product_id, pu.product, pu.price, pu.product_url, pu.product_image
                    ORDER BY 
                    categoria_orden ${orderBy} LIMIT $1 OFFSET $2`;
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
            } else {
                const query = `SELECT 
                    pu.product_id, 
                    pu.product, 
                    pu.price, 
                    pu.product_url, 
                    pu.product_image,
                    JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
                        'id', c.category_id,
                        'nombre', c.category
                    )) AS categorias
                    FROM 
                    productos_unicos pu
                    JOIN 
                    UNNEST(pu.categorias) AS cat_id ON TRUE
                    JOIN 
                    categories c ON c.category_id = cat_id
                    GROUP BY 
                    pu.product_id, pu.product, pu.price, pu.product_url, pu.product_image
                    ORDER BY ${order} ${orderBy} LIMIT $1 OFFSET $2`;
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
            }
        } catch (error) {
            console.error('Error en getProductsOrderBy:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }
}

module.exports = ProductsController;