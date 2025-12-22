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
    { name: "darwin-arm64", target: "aarch64-apple-darwin" },
    { name: "win32", target: "x86_64-pc-windows-msvc", ext: ".exe" },
];

const serverDir = path.join(__dirname, "..", "server");
const lspDir = path.join(__dirname, "..", "submodules", "compact-lsp");

// Check and initialize submodules if needed
if (!fs.existsSync(lspDir) || !fs.existsSync(path.join(lspDir, "Cargo.toml"))) {
    console.log("Initializing git submodules...");
    try {
        execSync("git submodule update --init --recursive", {
            cwd: path.join(__dirname, ".."),
            stdio: "inherit",
        });
    } catch (error) {
        console.error("Failed to initialize submodules:", error.message);
        console.error("Please run manually: git submodule update --init --recursive");
        process.exit(1);
    }
    // Verify submodule was initialized
    if (!fs.existsSync(path.join(lspDir, "Cargo.toml"))) {
        console.error("compact-lsp submodule initialization failed. Cargo.toml not found.");
        console.error("Please run manually: git submodule update --init --recursive");
        process.exit(1);
    }
}

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

// Check if rustup is available
let rustupAvailable = false;
try {
    execSync("rustup --version", { stdio: "ignore" });
    rustupAvailable = true;
} catch {
    console.warn("Warning: rustup not found. Cannot install cross-compilation targets.");
}

// Helper function to check if a target is installed
function isTargetInstalled(target) {
    try {
        const output = execSync("rustup target list --installed", { encoding: "utf-8" });
        return output.split("\n").includes(target);
    } catch {
        return false;
    }
}

// Helper function to install a target
function installTarget(target) {
    if (!rustupAvailable) {
        return false;
    }
    try {
        console.log(`Installing target ${target}...`);
        execSync(`rustup target add ${target}`, { stdio: "inherit" });
        return true;
    } catch (error) {
        console.warn(`Failed to install target ${target}:`, error.message);
        return false;
    }
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
            // Check if target is installed, install if not
            if (!isTargetInstalled(platform.target)) {
                console.log(`Target ${platform.target} is not installed. Attempting to install...`);
                if (!installTarget(platform.target)) {
                    console.warn(`⚠ Skipping ${platform.name}: Could not install target ${platform.target}`);
                    console.warn(`  You can manually install it with: rustup target add ${platform.target}`);
                    return;
                }
            }

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
