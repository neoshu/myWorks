const express = require("express");

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post('/tmp', (req, res) => {
    const { user, mail } = req.body;
    // if (!name) return res.status(400).json({ error: 'name required' });

    //   const info = db.prepare('INSERT INTO users (name) VALUES (?)').run(name);
    //   res.json({ id: info.lastInsertRowid, name });
    console.log(user, mail);
    res.json({ ok: true });
});

app.listen(3000, () => console.log('http://localhost:3000'));
