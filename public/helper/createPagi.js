
function myPagi (totalRecords, pageSize, pageItems, current = 1) {
    let totalPagiItems = Math.ceil(totalRecords / pageSize);
    let pointer = {start: 1, end: Math.min(pageItems, totalPagiItems) };
    
    let previous = document.createElement("a");
    previous.textContent = "<";
    //? TODO previous.href
    previous.href = `/api/records?page=${current < 1 ? 1 : (current - 1)}`;

    let next = document.createElement("a");
    next.textContent = ">";
    //? TODO next.href
    next.href = `/api/records?page=${current > totalPagiItems ? totalPagiItems : (current + 1)}`;

    let span = document.createElement("span");
    
    for (let i = pointer.start; i <= pointer.end; i++) {
        let tag_a = document.createElement("a");

    }



}