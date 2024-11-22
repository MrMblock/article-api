require("dotenv").config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); 

// Connexion à PostgreSQL
const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT
    });
    
// Créer la table articles
pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title TEXT,
        content TEXT,
        author TEXT
    )
`)
    .then(() => console.log('Table articles créée ou déjà existante'))
    .catch(err => console.error('Erreur lors de la création de la table:', err));

// Route GET pour récuperer les articles
app.get('/articles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * from articles')
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

// Route GET BY ID pour récupérer un article
app.get('/articles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article non trouvé' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route POST pour créer les articles
app.post('/articles', async (req, res) => {
    const { title, content, author } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO articles (title, content, author) VALUES ($1, $2, $3) RETURNING *', [title, content, author]
        );
        res.status(201).json(result.rows[0]);
        } catch (err) {
            res.status(500).json({error: err.message})
        }
    });

// Route PATCH pour mettre à jour les articles
app.patch('/articles/:id', async (req, res) => {
    const {id} = req.params;
    const {title, content, author} = req.body;
    try {
        const result = await pool.query(
            'UPDATE articles SET title = $1, content = $2, author = $3 WHERE id = $4 RETURNING *', [title, content, author, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({error: "Aarticle non trouvé"});
        }
        res.json(result.rows[0])
    } catch (err) {
        res.status(418).json({ error: err.message})
    }
});

// Route DELETE pour supprimer un article
app.delete('/articles/:id', async (req, res) => {
    const { id } = req.params; 
    try {
        const result = await pool.query(
            'DELETE FROM articles WHERE id = $1 RETURNING *', 
            [id] 
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article non trouvé' });
        }
        res.json({ message: 'Article bien supprimé', article: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
