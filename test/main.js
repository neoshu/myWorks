/*
const quota = document.querySelector("#quota");
const generate = document.querySelector("#generate");


function primeCheck(number) {
    if (number == 2 || number == 3) {return true;}
    let middleValue = Math.floor(Math.sqrt(number));
    for (let n = 2; n <= middleValue; n++) {
        if (number % n == 0) {return false;}
    }
    return true;
}

generate.addEventListener("click", event => {
    event.preventDefault();
    let primes = []; 
    let inputValue = Math.floor(Number(quota.value));
    if (inputValue <= 0) {return new Error(`Input could not be less than 0`);}
    if (inputValue == 1) {return new Error(`Input could not be 1`);}
    
    while (inputValue >1) {
        if (primeCheck(inputValue)) {
            primes.push(inputValue);
        }
        inputValue -= 1;
    }
    console.log(primes);
    quota.value = "";
});
*/

// Create a new worker, giving it the code in "generate.js"
const worker = new Worker("./generate.js");

// When the user clicks "Generate primes", send a message to the worker.
// The message command is "generate", and the message also contains "quota",
// which is the number of primes to generate.
document.querySelector("#generate").addEventListener("click", () => {
  const quota = document.querySelector("#quota").value;
  worker.postMessage({
    command: "generate",
    quota,
  });
});

// When the worker sends a message back to the main thread,
// update the output box with a message for the user, including the number of
// primes that were generated, taken from the message data.
worker.addEventListener("message", (message) => {
  document.querySelector("#output").textContent =
    `Finished generating ${message.data} primes!`;
});

document.querySelector("#reload").addEventListener("click", () => {
  document.querySelector("#user-input").value =
    'Try typing in here immediately after pressing "Generate primes"';
  document.location.reload();
});