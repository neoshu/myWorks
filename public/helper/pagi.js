/*  compose a function to generate pagination with the following arguments
    argument 1, totalRecords: Integer, count(*) from db table
    argument 2, pageSize: Integer, how many records one page can hold
    argument 3, pageLimit: Integer, how many pages from pagination shown in the webpage
    pageLimit: like there are only 4 pages pagination shown on one webpage, and the totalPagiItems is 6

    Pre 1 2 3 4 Next, when user click Next:
    Pre 2 3 4 5 Next, when user click Next:
    Pre 3 4 5 6 Next
*/

// helper function: create a tag and set its attributes instantly
function createEl(tag, attrs={}) {
    // tag should be a string
    if (typeof tag !== "string") {throw new Error(`Only accept string of ${tag}`)}
    const el = document.createElement(tag);
    Object.entries(attrs).forEach( ([key, val]) =>  el.setAttribute(key, val));
    return el;
}

// helper function: generate a line of buttons inside tag
function render (start=1, end, tag) {
    // start: the first pagination item, for example 1
    // end: pageLimit, for example 4
    // validate: end >= start
    if (end < start) {throw new Error(`Not decided yet what to say`)}
    let btnLine = [];
    for (let i = start; i <= end; i++) {
        btnLine.push(`<button class="btn">${i}</button>`);
    }
    if (tag.innerHTML.length !== 0) {tag.innerHTML = "";}
    tag.innerHTML = btnLine.join("");
}

// helper function: set up button attribute "disabled" by criteria
function btnDisable (btn, criteria, attr="disabled") {
    if (btn.localName !== "button") {throw new Error(`For button element only`)}
    if (typeof criteria === "boolean") {
        if (criteria) {
            btn.setAttribute(attr, "true");
        } else {btn.removeAttribute(attr);}
    } else {throw new Error(`criteria is not boolean`)}
}

// helper function: set up botton click eventListener
function btnClick(btn, pointer, tag, totalPagiItems) {
    let criteria;
    if (btn.classList.contains("pagination_next")) {
        for (let [key, val] of Object.entries(pointer)) {
            pointer[key] = val + 1;
        }
        criteria = pointer.end === totalPagiItems; 
    }
    if (btn.classList.contains("pagination_pre")) {
        for (let [key, val] of Object.entries(pointer)) {
            pointer[key] = val - 1;
        }
        criteria = pointer.start === 1;
    }
    render(pointer.start, pointer.end, tag);
    btnDisable(btn, criteria);

}


export function pagination(mountEl, totalRecords, pageSize, pageLimit) {
    // validate Integer of the arguments
    if (!Number.isInteger(totalRecords) || totalRecords < 0) {throw new Error(`totalRecords is not Integer or negative`)}
    if (!Number.isInteger(pageSize) || pageSize <= 0) {throw new Error(`pageSize is not Integer or negative`)}
    if (!Number.isInteger(pageLimit) || pageLimit <= 0) {throw new Error(`pageLimit is not Integer or negative`)}

    // create <div class="pagination">
    //              <button class="pagination_pre">Pre</button>
    //              <span class="pagination_pages"></span>
    //              <button class="pagination_next">Next</button>
    //        </div>
    let container = createEl("div", {class: "pagination"});

    let preBtn = createEl("button", {class: "pagination_pre", type: "button"});
    preBtn.innerHTML = "Pre";

    let nextBtn = createEl("button", {class: "pagination_next", type: "button"});
    nextBtn.innerHTML = "Next";

    let span = createEl("span", {class: "pagination_pages"});

    container.append(preBtn, span, nextBtn);
    mountEl.append(container);

    // pageLimit can not be 0
    if (pageLimit === 0) {throw new Error(`pageLimit can not be 0`)}

    // totalPagiItems: the total paginatin numbers
    if (pageSize === 0) {throw new Error(`pageSize can not be 0`)}
    let totalPagiItems = Math.ceil(totalRecords / pageSize); // like total 6 pages
    
    // an object having properties start and end
    let pointer = Object.create(null);
    pointer.start = 1;
    pointer.end = Math.min(pageLimit, totalPagiItems) ; 

    // initial pagination
    render(pointer.start, pointer.end, span);
    btnDisable(preBtn, pointer.start === 1);
    btnDisable(nextBtn, pointer.end === totalPagiItems);

    // set up eventListener of preBtn and nextBtn
    nextBtn.addEventListener("click", (event) => {
        btnClick(event.currentTarget, pointer, span, totalPagiItems);
        preBtn.removeAttribute("disabled");
    });

    preBtn.addEventListener("click", (event) => {
        btnClick(event.currentTarget, pointer, span, totalPagiItems);
        nextBtn.removeAttribute("disabled");
    });



}

// pagination(document.querySelector("body"), 53, 10, 4);