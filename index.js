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

app.get('/api/sponsorships', async (req, res) => {
    try {
        const result = await pool.query('SELECT \n' +
            '    sp.sponsorship_id,\n' +
            '    s.name AS sponsor_name,\n' +
            '    p.name AS program_name,\n' +
            '    sp.amount,\n' +
            '    sp.notes\n' +
            'FROM \n' +
            '    sponsorship.sponsorships sp\n' +
            'JOIN \n' +
            '    sponsorship.sponsors s ON sp.sponsor_id = s.sponsor_id\n' +
            'JOIN \n' +
            '    sponsorship.programs p ON sp.program_id = p.program_id;\n');
        res.json(result.rows);
    } catch (error) {
        console.error('Error retrieving sponsorships:', error);
        res.status(500).json({ error: 'An error occurred while retrieving sponsorships' });
    }
});


app.put('/api/sponsorships/:id', async (req, res) => {
    const sponsorshipId = req.params.id;
    const { sponsor_name, program_name, amount, notes } = req.body;

    try {
        // Retrieve the sponsor_id from the sponsors table
        const sponsorResult = await pool.query(
            'SELECT sponsor_id FROM sponsorship.sponsors WHERE name = $1',
            [sponsor_name]
        );

        if (sponsorResult.rowCount === 0) {
            return res.status(404).json({ error: 'Sponsor not found' });
        }

        const sponsor_id = sponsorResult.rows[0].sponsor_id;

        // Retrieve the program_id from the programs table
        const programResult = await pool.query(
            'SELECT program_id FROM sponsorship.programs WHERE name = $1',
            [program_name]
        );

        if (programResult.rowCount === 0) {
            return res.status(404).json({ error: 'Program not found' });
        }

        const program_id = programResult.rows[0].program_id;

        // Update the sponsorships table with the retrieved IDs
        const updateResult = await pool.query(
            'UPDATE sponsorship.sponsorships SET sponsor_id = $1, program_id = $2, amount = $3, notes = $4 WHERE sponsorship_id = $5 RETURNING *',
            [sponsor_id, program_id, amount, notes, sponsorshipId]
        );

        if (updateResult.rowCount === 0) {
            return res.status(404).json({ error: 'Sponsorship not found' });
        }

        res.json({ message: 'Sponsorship updated successfully', sponsorship: updateResult.rows[0] });
    } catch (error) {
        console.error('Error updating sponsorship:', error);
        res.status(500).json({ error: 'An error occurred while updating the sponsorship' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
