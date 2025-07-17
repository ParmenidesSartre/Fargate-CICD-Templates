const express = require('express');
const { Client } = require('pg');

const app = express();
const port = 80;

app.get('/', async (req, res) => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    const result = await client.query('SELECT NOW()');
    await client.end();
    res.send(`✅ Connected to DB. Current time: ${result.rows[0].now}`);
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    res.status(500).send('❌ Failed to connect to the database.');
  }
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
