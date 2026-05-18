const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const db = new Database("user.db");

// create table
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL)`).run();

app.use(express.json());
app.use(express.static("public"));

app.post('/tmp', (req, res) => {
    const { user, mail } = req.body;
    if (!user || !mail) return res.status(400).json({ error: 'name or mail required' });

    // check email
    const existed = db.prepare(`SELECT email FROM users`).all();
    if (existed.some(item => item.email === mail)) {
        return res.status(409).json({ error: 'The email has already been occupied' });
    }

    const info = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(user, mail);
    console.log(user, mail);
    res.json({ ok: true });
});

app.get('/tmp', (req, res) => {
    let rows = db.prepare(`SELECT * FROM users`).all();
    res.json(rows);
});

app.listen(3000, () => console.log('http://localhost:3000'));
