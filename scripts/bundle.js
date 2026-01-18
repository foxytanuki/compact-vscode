const esbuild = require("esbuild");

async function bundle() {
    try {
        await esbuild.build({
            entryPoints: ["src/extension.ts"],
            bundle: true,
            outfile: "out/extension.js",
            external: ["vscode"],
            format: "cjs",
            platform: "node",
            target: "node20",
            sourcemap: true,
            minify: false,
            keepNames: true,
        });
        console.log("✓ Extension bundled successfully");
    } catch (error) {
        console.error("✗ Bundling failed:", error);
        process.exit(1);
    }
}

bundle();
