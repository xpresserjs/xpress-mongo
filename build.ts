/**
 * This file moves required package files to dist
 * e.g package.json
 */
import fs = require("fs");

async function main() {
    const PackageDotJson = require("./package.json");

    // Modify Package.json
    PackageDotJson.main = "index.js";
    PackageDotJson.types = "index.d.ts";

    // Copy Package.json
    fs.writeFileSync(`${__dirname}/dist/package.json`, JSON.stringify(PackageDotJson, null, 2));
    // Copy readme.md
    fs.copyFileSync(`${__dirname}/readme.md`, `${__dirname}/dist/readme.md`);

    console.log("npm publish ./dist");
}

main().then(() => process.exit());
