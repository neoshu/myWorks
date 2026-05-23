const fs = require("node:fs");
const path = require("node:path");

// Return true only when the path exists and points to a folder.
function folder_exists(folderPath) {
    return fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory();
}

function deep_iterate(folderPath) {
    // Missing paths or file paths do not have files to iterate.
    if (!folder_exists(folderPath)) {
        return [];
    }

    let files = [];
    let items = fs.readdirSync(folderPath, { withFileTypes: true });

    for (let item of items) {
        let itemPath = path.join(folderPath, item.name);

        if (item.isFile()) {
            files.push(itemPath);
        }

        if (item.isDirectory()) {
            // Collect files from nested folders and merge them into this result.
            files.push(...deep_iterate(itemPath));
        }
    }

    return files;
}

let location = "./path_1";
console.log(deep_iterate(location));
