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

    async getCantSales(req, res) {
        try {
            const { rows } = await pool.query('SELECT COUNT(*) FROM ventas');
            res.status(200).json({ count: parseInt(rows[0].count, 10) });
        } catch (error) {
            console.error('Error en getCantSales:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }

    async createSale(req, res) {
        const client = await pool.connect(); // Obtenemos un cliente del pool

        try {
            const { id, total, products } = req.body;

            // Validación básica
            if (!id || total === undefined || !Array.isArray(products)) {
                return res.status(400).json({ message: 'Datos incompletos o inválidos' });
            }

            await client.query('BEGIN'); // Iniciamos transacción

            // 1. Insertar la venta principal
            const { rows: saleRows } = await client.query(
                'INSERT INTO ventas (venta_id, total_venta) VALUES ($1, $2) RETURNING *',
                [id, total]
            );

            // 2. Insertar los productos de la venta
            for (const product of products) {
                if (!product.id || product.quantity === undefined) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ message: 'Datos de producto incompletos' });
                }

                await client.query(
                    'INSERT INTO products_ventas (id_venta, id_product, cantidad) VALUES ($1, $2, $3)',
                    [id, product.id, product.quantity]
                );
            }

            await client.query('COMMIT'); // Confirmamos la transacción

            // 3. Obtener la venta completa con sus productos para la respuesta
            const { rows: completeSale } = await client.query(
                `SELECT v.*, json_agg(pv) as productos 
             FROM ventas v
             JOIN products_ventas pv ON v.venta_id = pv.id_venta
             WHERE v.venta_id = $1
             GROUP BY v.venta_id`,
                [id]
            );

            res.status(201).json(completeSale[0]);
        } catch (error) {
            await client.query('ROLLBACK'); // Revertimos en caso de error
            console.error('Error en createSale:', error);

            // Mensaje más específico según el error
            const message = error.code === '23505' ? 'ID de venta ya existe' : 'Error en el servidor';
            res.status(500).json({ message });
        } finally {
            client.release(); // Liberamos el cliente
        }
    }
}

module.exports = SalesController;