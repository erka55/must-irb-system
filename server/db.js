const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'must_irb_db',
  password: process.env.DB_PASSWORD || 'Baatar9943#', // pgAdmin-ий нууц үгээ энд бичээрэй
  port: process.env.DB_PORT || 5432,
});

pool.on('connect', () => {
  console.log('PostgreSQL баазтай амжилттай холбогдлоо.');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
