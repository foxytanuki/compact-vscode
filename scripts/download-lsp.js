#!/usr/bin/env node
/**
 * Download compact-lsp binary from GitHub Releases for development
 */

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const { createWriteStream } = require("node:fs");

const REPO = "1NickPappas/compact-lsp";
const BIN_DIR = path.join(__dirname, "..", "bin");

// Determine platform and architecture
const platform = process.platform;
const arch = process.arch;

let assetName;
let binaryName;
let extractCommand;

if (platform === "win32") {
    assetName = "compact-lsp-windows-x86_64.zip";
    binaryName = "compact-lsp.exe";
    extractCommand = (file) =>
        `powershell -Command "Expand-Archive -Path ${file} -DestinationPath ${BIN_DIR} -Force"`;
} else if (platform === "darwin") {
    if (arch === "arm64") {
        assetName = "compact-lsp-macos-arm64.tar.gz";
    } else {
        assetName = "compact-lsp-macos-x86_64.tar.gz";
    }
    binaryName = "compact-lsp";
    extractCommand = (file) => `tar -xzf ${file} -C ${BIN_DIR}`;
} else {
    assetName = "compact-lsp-linux-x86_64.tar.gz";
    binaryName = "compact-lsp";
    extractCommand = (file) => `tar -xzf ${file} -C ${BIN_DIR}`;
}

async function getLatestRelease() {
    return new Promise((resolve, reject) => {
        https
            .get(
                `https://api.github.com/repos/${REPO}/releases/latest`,
                {
                    headers: {
                        "User-Agent": "compact-vscode-dev-script",
                    },
                },
                (res) => {
                    let data = "";
                    res.on("data", (chunk) => {
                        data += chunk;
                    });
                    res.on("end", () => {
                        if (res.statusCode === 200) {
                            resolve(JSON.parse(data));
                        } else {
                            reject(new Error(`Failed to fetch release: ${res.statusCode}`));
                        }
                    });
                }
            )
            .on("error", reject);
    });
}

async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = createWriteStream(dest);
        https
            .get(url, (response) => {
                if (response.statusCode === 302 || response.statusCode === 301) {
                    // Follow redirect
                    return downloadFile(response.headers.location, dest)
                        .then(resolve)
                        .catch(reject);
                }
                response.pipe(file);
                file.on("finish", () => {
                    file.close();
                    resolve();
                });
            })
            .on("error", (err) => {
                fs.unlinkSync(dest);
                reject(err);
            });
    });
}

async function main() {
    console.log("Downloading compact-lsp for development...");
    console.log(`Platform: ${platform}, Architecture: ${arch}`);

    // Create bin directory
    if (!fs.existsSync(BIN_DIR)) {
        fs.mkdirSync(BIN_DIR, { recursive: true });
    }

    const binaryPath = path.join(BIN_DIR, binaryName);
    if (fs.existsSync(binaryPath)) {
        console.log(`✓ compact-lsp already exists at ${binaryPath}`);
        console.log("  To re-download, delete it first.");
        return;
    }

    try {
        // Get latest release
        console.log("Fetching latest release...");
        let release;
        try {
            release = await getLatestRelease();
        } catch (error) {
            if (error.message.includes("404")) {
                console.warn("⚠ No releases found on GitHub.");
                console.log("\nBuilding from source instead...");
                console.log("This requires Rust to be installed.");
                console.log("Install from: https://rustup.rs/\n");

                // Try to build from submodule
                const lspDir = path.join(__dirname, "..", "submodules", "compact-lsp");
                if (!fs.existsSync(lspDir) || !fs.existsSync(path.join(lspDir, "Cargo.toml"))) {
                    console.log("Initializing git submodules...");
                    try {
                        execSync("git submodule update --init --recursive", {
                            cwd: path.join(__dirname, ".."),
                            stdio: "inherit",
                        });
                    } catch (error) {
                        throw new Error(
                            `Failed to initialize submodules: ${error.message}\n` +
                                "Please run manually: git submodule update --init --recursive"
                        );
                    }
                    // Verify submodule was initialized
                    if (!fs.existsSync(path.join(lspDir, "Cargo.toml"))) {
                        throw new Error(
                            "compact-lsp submodule initialization failed. Cargo.toml not found.\n" +
                                "Please run manually: git submodule update --init --recursive"
                        );
                    }
                }

                // Check if Rust is installed
                try {
                    execSync("cargo --version", { stdio: "ignore" });
                } catch {
                    throw new Error(
                        "Rust is not installed. Please install from https://rustup.rs/"
                    );
                }

                // Build from source
                console.log("Building compact-lsp from source...");
                execSync("cargo build --release", {
                    cwd: lspDir,
                    stdio: "inherit",
                });

                // Copy binary
                const sourcePath = path.join(lspDir, "target", "release", binaryName);
                if (!fs.existsSync(sourcePath)) {
                    throw new Error(`Binary not found at ${sourcePath}`);
                }

                fs.copyFileSync(sourcePath, binaryPath);
                if (platform !== "win32") {
                    fs.chmodSync(binaryPath, 0o755);
                }

                console.log(`✓ compact-lsp built and installed at ${binaryPath}`);
                return;
            }
            throw error;
        }

        const version = release.tag_name;
        console.log(`Latest version: ${version}`);

        // Find asset
        const asset = release.assets.find((a) => a.name === assetName);
        if (!asset) {
            throw new Error(`Asset ${assetName} not found in release ${version}`);
        }

        // Download
        const downloadPath = path.join(BIN_DIR, asset.name);
        console.log(`Downloading ${asset.name}...`);
        await downloadFile(asset.browser_download_url, downloadPath);
        console.log("✓ Download complete");

        // Extract
        console.log("Extracting...");
        execSync(extractCommand(downloadPath), { stdio: "inherit" });

        // Move binary to bin directory if needed
        const extractedPath = path.join(BIN_DIR, binaryName);
        if (!fs.existsSync(extractedPath)) {
            // Try to find the binary in subdirectories
            const files = fs.readdirSync(BIN_DIR, { withFileTypes: true });
            for (const file of files) {
                if (file.isDirectory()) {
                    const subPath = path.join(BIN_DIR, file.name, binaryName);
                    if (fs.existsSync(subPath)) {
                        fs.renameSync(subPath, extractedPath);
                        fs.rmdirSync(path.join(BIN_DIR, file.name));
                        break;
                    }
                }
            }
        }

        // Make executable on Unix
        if (platform !== "win32") {
            fs.chmodSync(extractedPath, 0o755);
        }

        // Clean up archive
        fs.unlinkSync(downloadPath);

        console.log(`✓ compact-lsp installed at ${extractedPath}`);
        console.log("\nTo use this binary for testing:");
        console.log(`  Set "compact.lsp.path" to: ${extractedPath}`);
        console.log("  Or add it to your PATH");
    } catch (error) {
        console.error("✗ Error:", error.message);
        process.exit(1);
    }
}

main();
