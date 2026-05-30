// const show = document.querySelector("#show");
// const button = document.querySelector("button");
/*
function alarm(person, delay) {
    if (delay < 0) {
        throw new Error("Positive delay only");
    } else {
        button.addEventListener("click", () => {
            show.textContent = "";
            let content = `Wake up ${person}`;
            setTimeout(() => {
                show.textContent = content;
            }, delay);
        });
    }
}
*/

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function alarm(person, ms) {
    if (ms < 0) {return Promise.reject(`negative time`)}
    return delay(ms).then(()=>`${person} wake up`);
}

alarm(`Jack`, 2000)
    .then(data => console.log(data))
    .catch((error) => console.log(error));

