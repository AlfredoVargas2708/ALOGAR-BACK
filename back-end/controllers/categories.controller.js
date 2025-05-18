const pool = require('../PostgreSQL/db');

class CategoriesController {
    async getCategories(req, res) {
        try {
            const categories = await pool.query('SELECT * FROM categories ORDER BY category ASC');
            res.status(200).send(categories.rows);
        } catch (error) {
            console.error('Error en getCategories:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }
}

module.exports = CategoriesController