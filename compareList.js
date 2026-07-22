// assume two arrays, each consists of strings
// export a function to compare them if they are the same
// use new Map()

function compareArray (arr1, arr2) {
    if (Array.isArray(arr1) && Array.isArray(arr2)) {
        // first, compare the length
        if (arr1.length !== arr2.length) {
            return false;
        }
        // use new Map() to summarize the amount of each element
        let summary = new Map();
        for (let element of arr1) {
            summary.set(element, (summary.get(element) ?? 0) + 1)
        }
        
        // if all consumed to 0 for arr2 then arr1 and arr2 are the same
        // instead, they are different
        for (let item of arr2) {
            summary.set(item, (summary.get(item) ?? 0) - 1);
        }
        for (let [key, value] of summary) {
            if (value !== 0 ) {
                return false;
            }
        }
        return true;
    } else {
        alert(`Arrays only`);
        return false;
    }
    
}

console.log(compareArray(["a", "a", "c"], ["c","a","c"]));