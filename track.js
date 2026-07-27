const Database = require("better-sqlite3");
const db = new Database("motor.db");

let target = "A2023CCC0717-7793901";
let certi = "2023010717587788";

// track by application number
function trackAppl (target) {
    // return db.prepare(`SELECT * FROM correlation WHERE appl = ?`).get(target); // when nothing, return undefined
    // check target existed in appl first
    if (
        typeof target !== "string" || ! db.prepare(`SELECT appl FROM correlation WHERE appl = ?`).get(target)
    ) {
        console.error("Unknown application:", target);
        return;
    }

    let result = [];

    // looking forwards
    let forwTarget = target;
    while (forwTarget !== null) {
        result.unshift(forwTarget);
        let forwardSearch = db.prepare(`SELECT * FROM correlation WHERE appl = ?`).get(forwTarget);
        forwTarget = forwardSearch.former;
    }

    // looking afterwards
    let afwTarget = target;
    let select = db.prepare(`SELECT * FROM correlation WHERE former = ?`);
    while (select.get(afwTarget)) {
        result.push(select.get(afwTarget).appl);
        afwTarget = select.get(afwTarget).appl;
    }

    // update certi: Fill in the missing certificate number for the original application
    if (result.length > 1) {
        let certificate = db.prepare(`SELECT certi FROM correlation 
            WHERE appl = ?`).get(result[1]).certi;
        
        db.prepare(`UPDATE correlation 
            SET certi = ? 
            WHERE appl = ?`).run(certificate, result[0]);
    }

    return result; // all related applications array
}

// let applications = trackAppl(target);

// if (applications) {
//     let placeholders = applications.map(() => "?").join(", ");
//     let show = db.prepare(`SELECT c.appl, a.report FROM correlation c
//                 INNER JOIN appl_certi a ON c.appl = a.appl
//                 WHERE c.appl IN (${placeholders})`);

//     console.log(show.all(applications));
// }

// track by certificate
function trackCert(cert) {
    if (
        typeof cert !== "string" || ! db.prepare(`SELECT certi FROM correlation WHERE certi = ?`).get(cert)
    ) {
        console.error("Unknown certificate:", cert);
        return;
    }

    // from now on, count(cert) >= 1
    let applNum = db.prepare(`SELECT appl FROM correlation WHERE certi = ?`).get(cert).appl;
    trackAppl(applNum); // Just leverage filling in the missing certificate number for the original application
    return db.prepare(`SELECT appl FROM correlation WHERE certi =? ORDER BY appl DESC`).all(cert);

}

console.log(trackCert(certi));