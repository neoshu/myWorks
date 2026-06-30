// keyframes
const aliceTumbling = [
  { transform: 'rotate(0) scale(1)' },
  { transform: 'rotate(360deg) scale(0)' }
];

// options
const aliceTiming = {
  duration: 2000,
  iterations: 1,
  fill: 'forwards'
}

const alice1 = document.querySelector("#alice1");
const alice2 = document.querySelector("#alice2");
const alice3 = document.querySelector("#alice3");

// alice1.animate(aliceTumbling, aliceTiming);
// console.log(alice1.animate(aliceTumbling, aliceTiming).finished); // Promise

/*
  1. write a delay funtion of aliceTiming.duration ms
  2. async funtion with while loop of 3 alice img elements
*/

function delay(ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

async function aliceAnimate(ms) {
  const element = "#alice"
  let index = 1;
  while (index <= 3) {
    let img = element + String(index);
    let alice = document.querySelector(img);
    alice.animate(aliceTumbling, aliceTiming);
    await delay(ms);
    index += 1;
  }
}

aliceAnimate(aliceTiming.duration);