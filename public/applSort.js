// sort applicaiton number by date
// order: latest first

export function applSort (applArray) {
    // check applArray is an array
    if (! Array.isArray(applArray)) {
        alert(`Array Error`);
        return;
    }

    // check each applicaiton number format
    // A2025CCC0717-4897575
    const pattern = /^[AV]\d{4}C[CQ]C\d{4}-\d{7}$/;
    if (!applArray.every(element => pattern.test(element)
    )) {
        alert(`Application number wrong`);
        return;
    }

    // sort
    let result = applArray.slice();
    result.sort((a, b) => {
        let format = /(?<=-)\d{7}/g;
        let numbers_a = a.slice(1,5) + a.match(format)[0];
        let numbers_b = b.slice(1,5) + b.match(format)[0];
        return numbers_b - numbers_a;
    });
    return result;

}

let example = ['A2023CCC0717-4281100', 'A2023CCC0717-7793901', 
    'A2025CCC0717-4897575'];

// console.log(applSort(example));