let sel = document.querySelector("#verse-choose");
let pre = document.querySelector("pre");

function rmBlank(str) {
    // for example str: verse 1
    try {
        let path = "";
        str.split(" ").forEach(x => path += x);
        return path;
    } catch (error) {
        console.log(`There is an error: ${error.message}`);
    }
}


sel.addEventListener("change", async (event) => {
    let path= "./verse/" + rmBlank(event.target.value) + ".txt";
    let res = await fetch(path);
    let content = await res.text();
    pre.textContent = content;
});
