import * as path from "node:path";
import * as vscode from "vscode";
import {
    LanguageClient,
    type LanguageClientOptions,
    type ServerOptions,
    TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    // Get configuration
    const config = vscode.workspace.getConfiguration("compact");
    const lspPath = config.get<string>("lsp.path", "");
    const traceOutput = config.get<string>("lsp.trace", "off");

    // Determine LSP server path
    let serverModule: string;
    if (lspPath && lspPath.trim() !== "") {
        // Use configured path
        serverModule = lspPath;
    } else {
        // Try to find compact-lsp automatically
        // Check common locations
        const homeDir = process.env.HOME || process.env.USERPROFILE || "";
        const possiblePaths = [
            path.join(homeDir, "compactc", "compact-lsp"),
            path.join(homeDir, ".cargo", "bin", "compact-lsp"),
            "compact-lsp", // Try PATH
        ];

        // Find first existing path or use the last one (will try PATH)
        serverModule =
            possiblePaths.find((p) => {
                if (p === "compact-lsp") {
                    return true; // Always try PATH
                }
                try {
                    const fs = require("node:fs");
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

    // Create the language client and start the client
    client = new LanguageClient(
        "compactLanguageServer",
        "Compact Language Server",
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    client.start();

    // Register command to restart the language server
    const restartCommand = vscode.commands.registerCommand(
        "compact.restartLanguageServer",
        async () => {
            await client.stop();
            client.start();
            vscode.window.showInformationMessage("Compact Language Server restarted");
        }
    );

    context.subscriptions.push(restartCommand);
}

export function deactivate(): vscode.ProviderResult<void> {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
