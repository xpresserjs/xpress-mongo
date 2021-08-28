require("ts-node").register();

const { configure } = require("japa");

configure({
    files: [
        "tests/*.spec.ts"
        // "!tests/index.spec.ts",
        // "!tests/strict.spec.ts"
    ]
});
