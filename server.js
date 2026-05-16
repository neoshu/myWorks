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

    const info = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(user, mail);
    //   res.json({ id: info.lastInsertRowid, name });
    console.log(user, mail);
    res.json({ ok: true });
});

app.listen(3000, () => console.log('http://localhost:3000'));
