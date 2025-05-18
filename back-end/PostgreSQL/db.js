const { Pool } = require('pg');

const pool = new Pool({
  user: 'neondb_owner',
  host: 'ep-weathered-morning-a5bxgwfw.us-east-2.aws.neon.tech',
  database: 'neondb',
  password: 'npg_PvdUxuA86mEi',
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;