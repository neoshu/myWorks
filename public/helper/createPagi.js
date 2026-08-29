
// export function createPagi (tag, totalRecords, pageSize, pageItems, current = 1) {
//     // like totalRecords: 53, pageSize: 6, pageItems: 4
//     let totalPagiItems = Math.ceil(totalRecords / pageSize); // like 9
//     let pointer = {start: current, end: Math.min(pageItems, totalPagiItems) + (current - 1) };
    
//     let previous = document.createElement("a");
//     previous.textContent = "<";
//     previous.setAttribute("id", "pre");
//     //* previous.href
//     // previous.href = `/api/records?page=${current <= 1 ? 1 : (current - 1)}`;

//     let next = document.createElement("a");
//     next.textContent = ">";
//     next.setAttribute("id", "next");
//     //* next.href
//     // next.href = `/api/records?page=${current >= totalPagiItems ? totalPagiItems : (current + 1)}`;

//     let span = document.createElement("span");
//     for (let i = pointer.start; i <= pointer.end; i++) {
//         let anchor = document.createElement("a");
//         anchor.textContent = `${i}`;
//         anchor.setAttribute("class", "pagiBtn");
//         // anchor.href = `/api/records?page=${i}`;
//         span.appendChild(anchor);
//     }

//     tag.append(previous, span, next);

// }

export function createSpan(totalRecords, pageSize, pageItems, current = 1) {
    // like totalRecords: 53, pageSize: 6, pageItems: 4
    let totalPagiItems = Math.ceil(totalRecords / pageSize); // like 9
    let pointer = { start: current, end: Math.min(pageItems, totalPagiItems) + (current - 1) };
    let span = document.createElement("span");
    for (let i = pointer.start; i <= pointer.end; i++) {
        let anchor = document.createElement("a");
        anchor.textContent = `${i}`;
        anchor.setAttribute("class", "pagiBtn");
        anchor.href = `/api/records?page=${i}`;
        anchor.addEventListener("click", (event) => {
            event.preventDefault();
            // alert(`You click me!`);
            let params = new URLSearchParams(window.location.search);
            let page = params.get("page");
            
        });
        span.appendChild(anchor);
    }
    

    return span;
}

export function btnClick(action = "click", attr = ".pagiBtn") {
    let btns = document.querySelectorAll(attr);
    btns.forEach(btn => {
        btn.addEventListener(action, (event) => {
            event.preventDefault();
            alert(`You click me!`);
        });
    });
}