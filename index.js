const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection settings
const pool = new Pool({
    user: 'shlomitbitton',
    host: 'localhost',
    database: 'yrcs',
    password: '',
    port: 5432,
});

// Endpoint to get sponsors data
app.get('/api/sponsors', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sponsorship.sponsors');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
