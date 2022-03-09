require("ts-node").register();

const { configure } = require("japa");

configure({
    files: [
        "tests/*.spec.ts"
        // "tests/model.spec.ts"
        // "!tests/index.sp¬ec.ts",
        // "!tests/strict.spec.ts"
    ]
});
