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

