const Database = require("better-sqlite3");
const db = new Database("motor.db");

let target = "A2023CCC0717-7793901";

function track (target) {
    // return db.prepare(`SELECT * FROM correlation WHERE appl = ?`).get(target); // when nothing, return undefined
    //! to be added: check target existed in appl first
    if (
        typeof target !== "string" || ! db.prepare(`SELECT appl FROM correlation WHERE appl = ?`).get(target)
    ) {
        alert("Wrong!!");
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


    return result;
}

console.log(track(target));