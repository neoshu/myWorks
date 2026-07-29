const rows = [{name: "Alice", age: 24}, {name: "Jack", age: 46}];

const headers = Object.keys(rows[0]); // ["name", "age"]
const headHtml = headers.map(h => `<th>${h}</th>`).join("");

const bodyHtml = rows
        .map(row => `<tr>${headers.map(h => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`)
        .join("");

//* <tr><td>Alice</td><td>24</td></tr><tr><td>Jack</td><td>46</td></tr>

function compose_bodyHTML (rows) {
    let headers = Object.keys(rows[0]); // ["name", "age"]
    let body = "";
    for (let row of rows) {
        let tmp = "";
        for (let key of headers) {
            tmp = tmp + `<td>${row[key]}</td>`;
        }
        body = body + `<tr>` + tmp + `</tr>`;
    }
    return body;
}

// console.log(compose_bodyHTML(rows));

const tmp_middle = rows.map(h => Object.values(h));
const final = tmp_middle.map(list => `<tr>${list.map(item => `<td>${item}</td>`).join("")}</tr>`)
                        .join("");

console.log(final);