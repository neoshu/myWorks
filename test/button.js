// const show = document.querySelector("#show");
// const button = document.querySelector("button");

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

const p = new Promise((resolve) => setTimeout(() => resolve(24), 3000));
p.then(value => console.log(value));