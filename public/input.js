const inputAppl = document.querySelector("#appl");// input applicaiton number
const inputFile = document.querySelector("#file");// input excel file
const inputForm = document.querySelector("#inputForm");
const applicationForm = document.querySelector("#applicationForm");
const applNumSearch = document.querySelector("#applSearch");
const preArea = document.querySelector("pre");
const certificateForm = document.querySelector("#certificateForm");
const certfSearch = document.querySelector("#certfSearch");
// import {createTable} from "./table.js";

// file and text input(POST) eventlistener
inputForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const applNum = inputAppl.value.trim();

    // RegExp to check the pattern of a CCC application.
    const pattern = /^[AV]\d{4}CCC\d{4}-\d{7}$/;
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
    } catch (error) {
        alert(error.message || "Unable to upload the Excel file.");
    }
});

// application number search(GET) eventlistener
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