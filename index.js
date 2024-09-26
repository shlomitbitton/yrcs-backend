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


app.get('/api/programs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sponsorship.programs');
        res.json(result.rows);
    } catch (error) {
        console.error('Error retrieving programs:', error);
        res.status(500).json({ error: 'An error occurred while retrieving programs' });
    }
});

app.put('/api/programs/:id', async (req, res) => {
    const programId = req.params.id;
    const { name, host_class, estimated_income, event_date } = req.body;

    try {
        const result = await pool.query(
            'UPDATE sponsorship.programs SET name = $1, host_class = $2 ,  estimated_income= $3, event_date =$4 WHERE program_id = $5 RETURNING *',
            [name,host_class, estimated_income, event_date, programId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Program not found' });
        }

        res.json({ message: 'Program updated successfully', program: result.rows[0] });
    } catch (error) {
        console.error('Error updating program:', error);
        res.status(500).json({ error: 'An error occurred while updating the program' });
    }
});

app.put('/api/sponsors/:id', async (req, res) => {
    const sponsorId = req.params.id;
    const { name, contact_person, email, phone_number, notes} = req.body;

    try {
        const result = await pool.query(
            'UPDATE sponsorship.sponsors SET name = $1, contact_person = $2 ,  email= $3, phone_number =$4 , notes =$5 WHERE sponsor_id = $6 RETURNING *',
            [name, contact_person, email, phone_number, notes, sponsorId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Sponsor not found' });
        }

        res.json({ message: 'Sponsor updated successfully', program: result.rows[0] });
    } catch (error) {
        console.error('Error updating sponsor:', error);
        res.status(500).json({ error: 'An error occurred while updating the sponsor' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
