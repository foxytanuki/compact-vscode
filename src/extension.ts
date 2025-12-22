import * as path from "node:path";
import * as vscode from "vscode";
import {
    LanguageClient,
    type LanguageClientOptions,
    type ServerOptions,
    TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

export async function activate(context: vscode.ExtensionContext) {
    // Get configuration
    const config = vscode.workspace.getConfiguration("compact");
    const lspPath = config.get<string>("lsp.path", "");
    const traceOutput = config.get<string>("lsp.trace", "off");

    // Determine LSP server path
    let serverModule: string;
    if (lspPath && lspPath.trim() !== "") {
        // Use configured path (highest priority)
        serverModule = lspPath;
    } else {
        const fs = require("node:fs");
        // Priority order:
        // 1. Bundled server (in extension directory)
        // 2. Common installation locations
        // 3. PATH

        // Get platform-specific binary name and architecture
        const platform = process.platform;
        const binaryName = platform === "win32" ? "compact-lsp.exe" : "compact-lsp";

        // Determine architecture-specific path for macOS
        let serverDir: string = platform;
        if (platform === "darwin") {
            // Check CPU architecture (arm64 for Apple Silicon, x64 for Intel)
            const arch = process.arch;
            serverDir = arch === "arm64" ? "darwin-arm64" : "darwin";
        }

        // Try bundled server first
        const bundledPath = context.asAbsolutePath(path.join("server", serverDir, binaryName));

        const homeDir = process.env.HOME || process.env.USERPROFILE || "";
        // Development binary (downloaded by dev:setup script)
        const devBinaryPath = context.asAbsolutePath(path.join("bin", binaryName));
        const possiblePaths = [
            bundledPath, // Bundled server (highest priority after config)
            devBinaryPath, // Development binary (downloaded by dev:setup)
            path.join(homeDir, "compactc", "compact-lsp"),
            path.join(homeDir, ".cargo", "bin", "compact-lsp"),
            "compact-lsp", // Try PATH
        ];

        // Find first existing path
        serverModule =
            possiblePaths.find((p) => {
                if (p === "compact-lsp") {
                    return true; // Always try PATH
                }
                try {
                    return fs.existsSync(p);
                } catch {
                    return false;
                }
            }) || "compact-lsp";
    }

    // Server options
    const serverOptions: ServerOptions = {
        run: {
            command: serverModule,
            transport: TransportKind.stdio,
            args: [],
        },
        debug: {
            command: serverModule,
            transport: TransportKind.stdio,
            args: [],
        },
    };

    // Client options
    const clientOptions: LanguageClientOptions = {
        // Register the server for Compact documents
        documentSelector: [{ scheme: "file", language: "compact" }],
        synchronize: {
            // Notify the server about file changes to .compact files contained in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher("**/*.compact"),
        },
        traceOutputChannel:
            traceOutput !== "off"
                ? vscode.window.createOutputChannel("Compact LSP Trace")
                : undefined,
        outputChannel: vscode.window.createOutputChannel("Compact Language Server"),
    };

    // Create the language client
    client = new LanguageClient(
        "compactLanguageServer",
        "Compact Language Server",
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    try {
        await client.start();
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to start Compact Language Server: ${error}`);
        return;
    }

    // Register command to restart the language server
    const restartCommand = vscode.commands.registerCommand(
        "compact.restartLanguageServer",
        async () => {
            await client.stop();
            try {
                await client.start();
                vscode.window.showInformationMessage("Compact Language Server restarted");
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to restart Compact Language Server: ${error}`
                );
            }
        }
    );

    // Register client for automatic disposal
    context.subscriptions.push(client);
    context.subscriptions.push(restartCommand);
}

export async function deactivate(): Promise<void> {
    if (!client) {
        return;
    }
    await client.stop();
}
