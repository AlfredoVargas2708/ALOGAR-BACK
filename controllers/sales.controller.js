const pool = require('../PostgreSQL/db');

class SalesController {
    async getSales(req, res) {
        try {
            const sales = await pool.query('SELECT * FROM ventas ORDER BY fecha_venta DESC');
            res.status(200).send(sales.rows);
        } catch (error) {
            console.error('Error en getSales:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }

    async getProductsSales(req, res) {
        try {
            const { rows } = await pool.query(`
                SELECT v.venta_id, v.fecha_venta, v.total_venta, pv.id_product, pv.cantidad, p.product, p.price
                FROM productos_unicos p
                JOIN products_ventas pv ON p.product_id = pv.id_product
                JOIN ventas v ON pv.id_venta = v.venta_id
                ORDER BY v.fecha_venta DESC
            `);
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error en getProductsSales:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }

    async getCantSales(req, res) {
        try {
            const { rows } = await pool.query(`
            SELECT 
                DATE(fecha_venta) AS fecha,
                COUNT(*) AS cantidad_ventas
            FROM ventas
            GROUP BY DATE(fecha_venta)
            ORDER BY fecha
        `);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'No se encontraron ventas' });
            }
            res.status(200).json({ total_sales: parseInt(rows[0].cantidad_ventas, 10), sales_by_date: rows });
        } catch (error) {
            console.error('Error en getCantSales:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }

    async createSale(req, res) {
        try {
            const { id, date, total, products } = req.body;
            if (!id || !date || !total || !products || !Array.isArray(products)) {
                return res.status(400).json({ message: 'Datos incompletos o inválidos' });
            }

            const saleQuery = 'INSERT INTO ventas (venta_id, fecha_venta, total_venta) VALUES ($1, $2, $3) RETURNING *';
            const saleValues = [id, date, total];
            const saleResult = await pool.query(saleQuery, saleValues);
            const saleId = saleResult.rows[0].venta_id;

            const productQueries = products.map(product => {
                const productQuery = 'INSERT INTO products_ventas (id_venta, id_product, cantidad) VALUES ($1, $2, $3)';
                return pool.query(productQuery, [saleId, product.id, product.quantity]);
            });
            await Promise.all(productQueries);
            res.status(201).json({ message: 'Venta creada exitosamente', saleId: saleId });
        } catch (error) {
            console.error('Error en createSale:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }
}

module.exports = SalesController;