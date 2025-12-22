#!/usr/bin/env node
/**
 * Build script for compact-lsp server binaries
 * This script builds the LSP server for all platforms
 */

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const platforms = [
    { name: "linux", target: "x86_64-unknown-linux-gnu" },
    { name: "darwin", target: "x86_64-apple-darwin" },
    { name: "win32", target: "x86_64-pc-windows-msvc", ext: ".exe" },
];

const serverDir = path.join(__dirname, "..", "server");
const lspDir = path.join(__dirname, "..", "submodules", "compact-lsp");

// Create server directory structure
platforms.forEach((platform) => {
    const platformDir = path.join(serverDir, platform.name);
    if (!fs.existsSync(platformDir)) {
        fs.mkdirSync(platformDir, { recursive: true });
    }
});

// Check if Rust is installed
try {
    execSync("cargo --version", { stdio: "ignore" });
} catch {
    console.warn("Warning: Rust/Cargo not found. Skipping server build.");
    console.warn("To build the server, install Rust from https://rustup.rs/");
    process.exit(0);
}

// Build for each platform
console.log("Building compact-lsp server...");
platforms.forEach((platform) => {
    console.log(`Building for ${platform.name}...`);
    try {
        const binaryName = `compact-lsp${platform.ext || ""}`;
        const outputPath = path.join(serverDir, platform.name, binaryName);

        // Build using cross-compilation if needed
        if (platform.target) {
            execSync(`cargo build --release --target ${platform.target}`, {
                cwd: lspDir,
                stdio: "inherit",
            });
            const sourcePath = path.join(lspDir, "target", platform.target, "release", binaryName);
            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, outputPath);
                // Make executable on Unix
                if (platform.name !== "win32") {
                    fs.chmodSync(outputPath, 0o755);
                }
                console.log(`✓ Built ${platform.name}`);
            } else {
                console.warn(`⚠ Binary not found at ${sourcePath} for ${platform.name}`);
            }
        }
    } catch (error) {
        console.error(`✗ Failed to build for ${platform.name}:`, error.message);
    }
});

console.log("Server build complete!");
