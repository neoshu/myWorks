const div = document.querySelector("#contents");
const input_form = document.querySelector("#delayTime");
const button_form = document.querySelector("button");

async function delay_show() {
    const delay = input_form.value * 1000;
    if (delay < 0 || delay === undefined || delay === null) {return Promise.reject(`delay time must be positive`)}
    return new Promise(resolve => {
        setTimeout(() => resolve(`Well done! ${delay}ms`), delay);
    });
}

button_form.addEventListener("click", (event) => {
    event.preventDefault();
    delay_show()
        .then(data => {
            div.textContent = data;
        })
        .catch(err => console.log(err));
});

// write a countdown func
function sleep(ms) {
    return new Promise(resolve => setTimeout(()=>resolve(), ms));
}

async function countdown(seconds) {
    while (seconds > 0) {
        div.textContent = `Countdown from ${seconds}`;
        await sleep(1000);
        seconds -= 1;
    }
    div.textContent = "";
}

countdown(10);