const express = require("express");
const XLSX = require('xlsx');
const Database = require("better-sqlite3");
const multer = require("multer");


const app = express();
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

const db = new Database("motor.db");
const upload = multer({ storage: multer.memoryStorage() });

// helper function
// 2012-4-19 -> 2012-04-19   2026-11-7 -> 2026-11-07   2025-06-26 -> unchanged
function zeroPadding(arg) {
    // arg should be string
    if (typeof arg !== "string") {return false;}
    // use regex to match
    const pattern = /^\d{4}-(?:0?[1-9]|1[0-2])-(?:0?[1-9]|[12][0-9]|3[01])$/gm; // rough check
    if (!pattern.test(arg)) {return false;}
    let tmp = arg.split("-");
    tmp.forEach((element, index) => {
        if (element.length === 1) {
            tmp[index] = "0" + element;
        }
    })
    return tmp.join("-");
}

//* app.post import from input.js
app.post("/import", upload.single("file"), (req, res) => {
    // req.file      → the uploaded Excel file
    // req.body      → { applNum: "A1234CCC5678-1234567", certfNum: ... }
    // 1. req.body, insert into table correlation
    // 2. read rows from req.file, insert into table material
    if (!req.file) {
        return res.status(400).json({
            ok: false,
            error: "Please upload an Excel file."
        });
    }

    if (!req.body.applNum) {
        return res.status(400).json({
            ok: false,
            error: "Missing applicaiton number."
        });
    }
    db.prepare(`INSERT INTO correlation (appl, certi) VALUES (?, ?)`)
        .run(req.body.applNum, req.body.certfNum || null);

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null }); // array

    if (rows.length === 0) {
        return res.status(400).json({
            ok: false,
            error: "The first worksheet has no material rows."
        });
    }

    //! const header = Object.keys(rows[0]); // column header
    // for (let row of rows) {
    //     db.prepare(`INSERT INTO material (${header.join(", ")}) 
    //         VALUES (${header.map(c => "?").join(", ")})`).run(Object.values(row));
    // }

    // material table header
    const header = db.prepare(`PRAGMA table_info(material)`).all().map(c => c.name).slice(1);

    const insertRow = db.prepare(
        `INSERT INTO material (${header.join(", ")}) 
            VALUES (${header.map(c => "?").join(", ")})`
    );

    const insertMany = db.transaction((items) => {
        for (let item of items) {
            // the last element(issue) of item should be something like 2026-02-07
            // instead of 2026-2-7
            let theArray = Object.values(item);
            let issueDate = zeroPadding(theArray.pop());
            theArray.push(issueDate);
            theArray.unshift(req.body.applNum);
            insertRow.run(theArray);
        }
    });

    insertMany(rows);

    // retrieve applicaiton numbers from db
    const db_appls = db.prepare(`SELECT DISTINCT (appl)
                                FROM (material)`).all();

    res.json({ ok: true, appls: db_appls });
});

app.post("/search", upload.none(), (req, res) => {
    const searchCon = req.body.applSearch;
    let searchResult = db.prepare(`SELECT * FROM material WHERE appl = ?`).all(searchCon);
    if (searchResult.length === 0) {
        return res.status(400).json({
            ok: false,
            error: `No ${searchCon} matched.`
        });
    } else {
        res.json(searchResult);
    }

})

app.get("/result", (req, res) => {
    const applNum = req.query.application;

    const rows = db.prepare(`SELECT * FROM material WHERE appl = ?`).all(applNum);

    if (rows.length === 0) {
        return res.status(404).send(`<h2>No rows found for ${applNum}</h2>`);
    }

    const headers = Object.keys(rows[0]);
    const headHtml = headers.map(h => `<th>${h}</th>`).join("");
    const bodyHtml = rows
        .map(row => `<tr>${headers.map(h => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`)
        .join("");

    res.send(`<!DOCTYPE html>
                <html lang="en">
                <head><meta charset="UTF-8"><title>Result ${applNum}</title></head>
                <body>
                <h2>Application ${applNum}</h2>
                <table>
                    <thead><tr>${headHtml}</tr></thead>
                    <tbody>${bodyHtml}</tbody>
                </table>
                </body>
            </html>`);
});


app.listen(3000, () => console.log('http://localhost:3000'));
