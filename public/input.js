const inputForm = document.querySelector("#inputForm");
const inputFile = document.querySelector("#file");// input excel file
const inputAppl = document.querySelector("#inpt_appl");// input applicaiton number
const inputCertf = document.querySelector("#input_certf"); // input certificate
const inputReport = document.querySelector("#input_repot"); // input report number

const applicationForm = document.querySelector("#applSearchForm");
const applNumSearch = document.querySelector("#applSearch");

const certificateForm = document.querySelector("#certfSearchForm");
const certfSearch = document.querySelector("#certfSearch");

const preArea = document.querySelector("pre");
const records = document.querySelector("#records");

const container = document.querySelector("#container");


import {createTable} from "./table.js";
// import { pagination } from "./helper/pagi.js";
// import {createPagi} from "./helper/createPagi.js";
import {createSpan} from "./helper/createPagi.js";

// inital to GET the count(*) from db
let initiaCount = await fetch("/dbCount");
let count = Number(await initiaCount.json());
console.log(count);


// let tag_1 = document.createElement("a");
// tag_1.textContent = "the second 3 records";
// tag_1.href = `/?page=2`;
// container.appendChild(tag_1);
// const params = new URLSearchParams(window.location.search);
// const page = Number(params.get("page")) ; // Number(null) --> 0
// if (page) {
//     let mytest = await fetch(`/api/post?page=${page}`);
//     let rows = await mytest.json();
//     createTable(rows, records);

// }
let current = 1;
let click = 1;
let pageSize = 6; //! doubt if it is unnecessary
let pageItems = 4; //! doubt if it is unnecessary

let previous = document.createElement("a");
previous.textContent = "<";
previous.setAttribute("id", "pre");

let next = document.createElement("a");
next.textContent = ">";
next.setAttribute("id", "next");

// the initial web records from db
let params = new URLSearchParams(window.location.search);
let initialPage = params.get("page") ?? 1;
let initial = await fetch(`/api/records?page=${initialPage}`);
let rows = await initial.json();
createTable(rows, records);


// onward, 53 is just an example for totalRecords
let oldPagiSpan = createSpan(count, 6, 4, current);
container.append(previous, oldPagiSpan, next);

next.addEventListener("click", (event) => {
    event.preventDefault();
    let allowedClick = 1 + Math.ceil(count / 6) - 4;
    if (click >= allowedClick) {return;} // 6 = 1 + Math.ceil(totalRecords / pageSize) - 4
    current += 1;
    let newPagiSpan = createSpan(count, 6, 4, current);
    container.replaceChild(newPagiSpan, oldPagiSpan);
    oldPagiSpan = newPagiSpan;
    click += 1;
});

previous.addEventListener("click", (event) => {
    event.preventDefault();
    if (click <= 1) {return;}
    current -= 1;
    let newPagiSpan = createSpan(count, 6, 4, current);
    container.replaceChild(newPagiSpan, oldPagiSpan);
    oldPagiSpan = newPagiSpan;
    click -= 1;
});


// file and text input(POST) eventlistener
inputForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const applNum = inputAppl.value.trim();
    const certfNum = inputCertf.value.trim();// === "" ? null : certfRef.value.trim();
    const reportNum = inputReport.value.trim();

    // RegExp to check the pattern of a CCC application.
    const pattern = /^[AV]\d{4}CCC\d{4}-\d{7}$/; //! this will be modified by CQM form
    if (!pattern.test(applNum)) {
        alert("CCC application number is invalid.");
        return;
    }

    const file = inputFile.files[0];
    if (!file) {
        alert("Please choose an Excel file.");
        return;
    }

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("applNum", applNum);
    uploadData.append("reportNum", reportNum);
    if (certfNum) {uploadData.append("certfNum", certfNum);}
    
    
    try {
        const res = await fetch("/import", {
            method: "POST",
            body: uploadData
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Upload failed (${res.status}).`);
        }


        inputForm.reset();
        window.location.reload();
    } catch (error) {
        alert(error.message || "Unable to upload the Excel file.");
    }
});

//TODO add asyn function here
// async function loadData() {
//     // when the web is loaded, db data shows in table
//     const data_res = await fetch("/api/load");
//     const data = await data_res.json()
//     if (records.hasChildNodes()) {records.replaceChildren();}
//     createTable(data.applReport, records);
// }
// loadData();

// application number search eventlistener
applicationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const search_num = applNumSearch.value.trim();
    if (!search_num) {
        alert(`Blank application number`);
        return;
    }

    const searchData = new FormData();
    searchData.append("applSearch", search_num);

    try {
        const res = await fetch("/search", {
            method: "POST",
            body: searchData
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            preArea.replaceChildren();
            
            throw new Error(data.error || `Search failed (${res.status}).`);

        }

        // const applResult = await res.json(); // the result of application search
        // createTable(applResult, "pre");

        if (preArea.hasChildNodes()) {
            preArea.replaceChildren();
        }

        let tag_a = document.createElement("a");
        
        tag_a.href= `/result?application=${search_num}`;
        tag_a.target = "_blank";
        tag_a.textContent = `Open link for ${search_num}`;
        preArea.appendChild(tag_a);
        
        applicationForm.reset();
    } catch (error) {
        alert(error.message || "Unable to search the application.");
    }

})

// pagination(document.querySelector("body"), 53, 10, 4);