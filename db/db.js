// src/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',
  password: 'pass123',
  host: 'localhost',
  port: 5432,
  database: 'csv_converter',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // optionally add ssl: { rejectUnauthorized: false } for hosted DBs
});

async function insertUser({ name, age, address, additional_info }) {
  const text = `INSERT INTO users (name, age, address, additional_info) VALUES ($1, $2, $3, $4) RETURNING id`;
  const values = [
    name,
    age,
    address ? JSON.stringify(address) : null,
    additional_info ? JSON.stringify(additional_info) : null,
  ];
  try {
    const res = await pool.query(text, values);
    return res.rows[0].id;
  } catch (error) {
    console.error('Database insert error:', error);
    throw error;
  }
}

async function fetchAllAges() {
  const res = await pool.query('SELECT age FROM users');
  return res.rows.map(r => r.age);
}

async function clearUsers() {
  await pool.query('DELETE FROM users');
}

async function getTotalUsers() {
  const res = await pool.query('SELECT COUNT(*) as count FROM users');
  return parseInt(res.rows[0].count);
}

module.exports = { pool, insertUser, fetchAllAges, clearUsers, getTotalUsers };
