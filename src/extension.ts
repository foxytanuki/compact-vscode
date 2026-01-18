import * as vscode from "vscode";
import { clearCache, initializeParser, invalidateCache } from "./parser";
import { CompactDocumentSymbolProvider } from "./providers/documentSymbols";
import { CompactFoldingRangeProvider } from "./providers/foldingRanges";

const COMPACT_LANGUAGE_ID = "compact";

export async function activate(
	context: vscode.ExtensionContext
): Promise<void> {
	try {
		// Initialize tree-sitter parser
		await initializeParser(context);

		const documentSelector: vscode.DocumentSelector = {
			language: COMPACT_LANGUAGE_ID,
			scheme: "file",
		};

		// Register document symbol provider
		context.subscriptions.push(
			vscode.languages.registerDocumentSymbolProvider(
				documentSelector,
				new CompactDocumentSymbolProvider()
			)
		);

		// Register folding range provider
		context.subscriptions.push(
			vscode.languages.registerFoldingRangeProvider(
				documentSelector,
				new CompactFoldingRangeProvider()
			)
		);

		// Invalidate cache when documents change
		context.subscriptions.push(
			vscode.workspace.onDidChangeTextDocument((event) => {
				if (event.document.languageId === COMPACT_LANGUAGE_ID) {
					invalidateCache(event.document.uri.toString());
				}
			})
		);

		// Clear cache when documents close
		context.subscriptions.push(
			vscode.workspace.onDidCloseTextDocument((document) => {
				if (document.languageId === COMPACT_LANGUAGE_ID) {
					invalidateCache(document.uri.toString());
				}
			})
		);

	} catch (error) {
		console.error("[Compact] Activation failed:", error);
		vscode.window.showErrorMessage(
			`Failed to initialize Compact Language Support: ${error}`
		);
	}
}

export function deactivate(): void {
	clearCache();
}
