/*
async function alarm(person, ms) {
    if (ms < 0) {return Promise.reject(`ms should be positive`)}
    return Promise.resolve(setTimeout(()=>console.log(`Wake up ${person}`), 2000));
}   
*/

async function another_alarm(person, ms) {
    if (ms < 0) { return Promise.reject(`ms should be positive`) }
    return new Promise((resolve) => resolve(setTimeout(() => console.log(`${person}`), ms)));
}

another_alarm("FIFA", 3000)
    .then((data)=>data)
    .catch(error => console.log(error));

async function alarm(person, ms) {
    if (ms < 0) { return Promise.reject(`ms should be positive`) }

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`Wake up, ${person}!`);
        }, ms);
    });
}

alarm("FIFA", 2000)
    .then(msg => console.log(msg)); 