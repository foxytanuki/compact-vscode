import * as path from "node:path";
import * as vscode from "vscode";
import Parser, { type Language, type Query, type Tree } from "web-tree-sitter";

let parserInstance: Parser | null = null;
let languageInstance: Language | null = null;
let highlightsQuery: Query | null = null;

export async function initializeParser(
	context: vscode.ExtensionContext
): Promise<void> {
	await Parser.init();
	parserInstance = new Parser();

	const wasmPath = context.asAbsolutePath(
		path.join("parsers", "tree-sitter-compact.wasm")
	);
	languageInstance = await Parser.Language.load(wasmPath);
	parserInstance.setLanguage(languageInstance);

	// Load highlights query
	const queryPath = context.asAbsolutePath(path.join("queries", "highlights.scm"));
	const queryContent = await vscode.workspace.fs.readFile(vscode.Uri.file(queryPath));
	const queryText = Buffer.from(queryContent).toString("utf-8");
	highlightsQuery = languageInstance.query(queryText);
}

export function getParser(): Parser | null {
	return parserInstance;
}

export function getLanguage(): Language | null {
	return languageInstance;
}

export function getHighlightsQuery(): Query | null {
	return highlightsQuery;
}

export function parseDocument(document: vscode.TextDocument): Tree | null {
	if (!parserInstance) {
		return null;
	}
	const text = document.getText();
	return parserInstance.parse(text);
}

// Cache for parsed trees
const treeCache = new Map<string, { version: number; tree: Tree }>();

export function getOrParseDocument(document: vscode.TextDocument): Tree | null {
	const uri = document.uri.toString();
	const cached = treeCache.get(uri);

	if (cached && cached.version === document.version) {
		return cached.tree;
	}

	const tree = parseDocument(document);
	if (tree) {
		treeCache.set(uri, { version: document.version, tree });
	}

	return tree;
}

export function invalidateCache(uri: string): void {
	treeCache.delete(uri);
}

export function clearCache(): void {
	treeCache.clear();
}
