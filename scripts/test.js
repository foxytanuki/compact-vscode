const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const packageJsonPath = path.join(rootDir, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

function assertFileExists(relativePath) {
    const absolutePath = path.join(rootDir, relativePath);
    assert.ok(fs.existsSync(absolutePath), `Expected file to exist: ${relativePath}`);
    return absolutePath;
}

const language = packageJson.contributes.languages.find((item) => item.id === "compact");
assert.ok(language, 'Expected a contributed language with id "compact"');
assert.equal(language.extensions.length, 1);
assert.equal(language.extensions[0], ".compact");

const grammar = packageJson.contributes.grammars.find((item) => item.language === "compact");
assert.ok(grammar, 'Expected a contributed grammar for language "compact"');
assert.equal(grammar.scopeName, "source.compact");

assertFileExists(language.configuration);
const grammarPath = assertFileExists(grammar.path);
JSON.parse(fs.readFileSync(grammarPath, "utf8"));

const extensionModule = require(path.join(rootDir, "out", "extension.js"));
assert.equal(typeof extensionModule.activate, "function");
assert.equal(typeof extensionModule.deactivate, "function");

console.log("Smoke tests passed");
