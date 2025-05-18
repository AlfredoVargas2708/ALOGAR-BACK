const client = require('../PostgreSQL/db');

class UsersController {
    async getAllUsers(req, res) {
        try {
            await client.connect();
            const result = await client.query('SELECT * FROM users');
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'No users found' });
            }else {
                res.status(200).json(result.rows);
            }
            await client.end();
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async loginUser(req, res) {
        try {
            const { username, password } = req.body;
            await client.connect();
            const result = await client.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
            if (result.rows.length > 0) {
                res.status(200).json(result.rows[0]);
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
            await client.end();
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async registerUser(req, res) {
        try {
            const { username, password } = req.body;
            await client.connect();
            const result = await client.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', [username, password]);
            res.status(201).json(result.rows[0]);
            await client.end();
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}


module.exports = UsersController;