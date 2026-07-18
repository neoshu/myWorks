const inputAppl = document.querySelector("#appl");
const inputFile = document.querySelector("#file");
const form = document.querySelector("form");

form.addEventListener("submit", async (event) => {
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

        form.reset();
    } catch (error) {
        alert(error.message || "Unable to upload the Excel file.");
    }
});
