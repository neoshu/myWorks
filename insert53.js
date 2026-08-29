const Database = require("better-sqlite3");
const db = new Database("motor.db");

let initialAppl = "A2023CCC0401-4281100";
let initialRep = "C-01501-23345";

const total = 53; // totalRecords

const applPattern = /(?<=-)\d+/;
const repPattern = /(?<=01501-)\d+/;

for (let i = 0; i < total; i++) {
    db.prepare(`INSERT INTO appl_report (appl, report) 
        VALUES (?, ?)`).run(initialAppl, initialRep);

    let appl = Number(initialAppl.match(applPattern)[0]) + 1;
    let rep = Number(initialRep.match(repPattern)[0]) + 1;

    initialAppl = initialAppl.replace(applPattern, String(appl));
    initialRep = initialRep.replace(repPattern, String(rep));
    
}
