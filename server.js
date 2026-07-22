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
// 2012-4-19 -> 2012-04-19
// 2026-11-7 -> 2026-11-07
// 2025-06-26 -> unchanged
function zeroPadding(arg) {
    // arg should be string
    if (typeof arg !== "string") {return false;}
    // use regex to match
    const pattern = /^20\d{2}-\d{1,2}-\d{1,2}$/gm; // rough check
    if (!pattern.test(arg)) {return false;}
    let tmp = arg.split("-");
    tmp.forEach((element, index) => {
        if (element.length === 1) {
            tmp[index] = "0" + element;
        }
    })
    return tmp.join("-");

}

app.post("/import", upload.single("file"), (req, res) => {
    // req.file      → the uploaded Excel file
    // req.body      → { applNum: "A1234CCC5678-1234567" }
    // 1. req.body, insert into table correlation
    // 2. read rows from req.file, insert into table material
    db.prepare(`INSERT INTO correlation (appl) VALUES (?)`).run(`${req.body.applNum}`);

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const header = Object.keys(rows[0]); // column header
    for (let row of rows) {
        db.prepare(`INSERT INTO material (${header.join(", ")}) 
            VALUES (${header.map(c => "?").join(", ")})`).run(Object.values(row));
    }

    res.json({ok: true});
});




app.listen(3000, () => console.log('http://localhost:3000'));
