const sample = [
    {name: "Alice", age: 24},
    {name: "Tom", age: 33},
    {name: "Jack", age: 19},
    {name: "Fiona", age: 48}
];

export function createTable (data, location) {
    // assume data is an array of plain objects
    // assume location is element string, like "body"
    // create a table under element location
    // location is a tag node

    // table header row
    const rowHeader = Object.keys(data[0]); 
    const table = document.createElement("table");
    const thead = table.createTHead();
    const trHeader = thead.insertRow();
    for (let key of rowHeader) {
        let th = document.createElement("th");
        th.textContent = key;
        trHeader.append(th);
    }

    // table content rows
    const tbody = document.createElement("tbody");
    for (let item of data) {
        // item is object
        let tr = tbody.insertRow();
        let contents = Object.values(item);
        for (let content of contents) {
            let td = document.createElement("td");
            td.textContent = content;
            tr.append(td);
        }
        // tbody.append(tr);
    }

    table.append(tbody);
    // document.querySelector(location).textContent = ""; // very important
    // document.querySelector(location).append(table);
    location.append(table);

}
