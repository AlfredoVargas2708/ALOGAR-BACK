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
}

module.exports = SalesController;