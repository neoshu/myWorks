const inputAppl = document.querySelector("#appl");
const inputFile = document.querySelector("#file");
const inputForm = document.querySelector("#inputForm");
const searchForm = document.querySelector("#searchForm");
const applNumSearch = document.querySelector("#applSearch");

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
searchForm.addEventListener("submit", async (event) => {
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
            throw new Error(data.error || `Search failed (${res.status}).`);
        }

        const applResult = await res.json(); // the result of application search
        

        searchForm.reset();
    } catch (error) {
        alert(error.message || "Unable to search the application.");
    }

})