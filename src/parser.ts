import * as path from "node:path";
import type * as vscode from "vscode";
import * as TreeSitter from "web-tree-sitter";

let parserInstance: TreeSitter.Parser | null = null;
let languageInstance: TreeSitter.Language | null = null;

export async function initializeParser(
	context: vscode.ExtensionContext
): Promise<void> {
	const fs = await import("node:fs/promises");

	const wasmPath = context.asAbsolutePath(
		path.join("parsers", "tree-sitter-compact.wasm")
	);

	// Load tree-sitter WASM binary and pass it directly
	const treeSitterWasmPath = context.asAbsolutePath(
		path.join("parsers", "web-tree-sitter.wasm")
	);

	const treeSitterWasm = await fs.readFile(treeSitterWasmPath);
	await TreeSitter.Parser.init({
		getWasmModule: async () => WebAssembly.compile(treeSitterWasm),
	});
	parserInstance = new TreeSitter.Parser();

	// Load language WASM
	const langWasm = await fs.readFile(wasmPath);
	languageInstance = await TreeSitter.Language.load(langWasm);
	parserInstance.setLanguage(languageInstance);
}

export function getParser(): TreeSitter.Parser | null {
	return parserInstance;
}

export function getLanguage(): TreeSitter.Language | null {
	return languageInstance;
}

export function parseDocument(document: vscode.TextDocument): TreeSitter.Tree | null {
	if (!parserInstance) {
		return null;
	}
	const text = document.getText();
	return parserInstance.parse(text);
}

// Cache for parsed trees
const treeCache = new Map<string, { version: number; tree: TreeSitter.Tree }>();

export function getOrParseDocument(document: vscode.TextDocument): TreeSitter.Tree | null {
	const uri = document.uri.toString();
	const cached = treeCache.get(uri);

	if (cached && cached.version === document.version) {
		return cached.tree;
	}

	// Delete old tree to free WASM memory
	if (cached) {
		cached.tree.delete();
	}

	const tree = parseDocument(document);
	if (tree) {
		treeCache.set(uri, { version: document.version, tree });
	}

	return tree;
}

export function invalidateCache(uri: string): void {
	const cached = treeCache.get(uri);
	if (cached) {
		cached.tree.delete();
	}
	treeCache.delete(uri);
}

export function clearCache(): void {
	for (const cached of treeCache.values()) {
		cached.tree.delete();
	}
	treeCache.clear();
}
