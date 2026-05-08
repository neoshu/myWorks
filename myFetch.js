let sel = document.querySelector("#verse-choose");
let pre = document.querySelector("pre");

function rmBlank(str) {
    // for example str: verse 1
    try {
        let noBlank = "";
        str.split(" ").forEach(x => noBlank += x);
        return noBlank;
    } catch (error) {
        console.log(`There is an error: ${error.message}`);
    }
}


sel.addEventListener("change", (event) => {
    console.log(event.target.value);
})

console.log(rmBlank(10));