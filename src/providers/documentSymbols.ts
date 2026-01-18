import * as vscode from "vscode";
import type * as TreeSitter from "web-tree-sitter";
import { getOrParseDocument } from "../parser";

// Map node types to VSCode symbol kinds
const nodeTypeToSymbolKind: Record<string, vscode.SymbolKind> = {
	mdefn: vscode.SymbolKind.Module,
	cdefn: vscode.SymbolKind.Function,
	edecl: vscode.SymbolKind.Function,
	wdecl: vscode.SymbolKind.Function,
	struct: vscode.SymbolKind.Struct,
	enumdef: vscode.SymbolKind.Enum,
	ldecl: vscode.SymbolKind.Variable,
	lconstructor: vscode.SymbolKind.Constructor,
	ecdecl: vscode.SymbolKind.Interface,
	ecdecl_circuit: vscode.SymbolKind.Method,
};

function getSymbolName(node: TreeSitter.Node): string | null {
	// For constructor, return "constructor"
	if (node.type === "lconstructor") {
		return "constructor";
	}

	// Try common name field patterns based on node type
	// cdefn uses field("id", $.function_name)
	// ldecl uses field("name", $.id)
	// struct uses field("name", $.struct_name)
	// enumdef uses field("name", $.enum_name)
	const nameFields = [
		"name",  // ldecl, struct, enumdef, mdefn
		"id",    // cdefn, edecl, wdecl
	];

	for (const fieldName of nameFields) {
		const nameNode = node.childForFieldName(fieldName);
		if (nameNode) {
			return nameNode.text;
		}
	}

	return null;
}

function createDocumentSymbol(
	node: TreeSitter.Node,
	document: vscode.TextDocument,
	children: vscode.DocumentSymbol[] = []
): vscode.DocumentSymbol | null {
	const symbolKind = nodeTypeToSymbolKind[node.type];
	if (symbolKind === undefined) {
		return null;
	}

	const name = getSymbolName(node);
	if (!name) {
		return null;
	}

	const range = new vscode.Range(
		node.startPosition.row,
		node.startPosition.column,
		node.endPosition.row,
		node.endPosition.column
	);

	// Selection range is the name portion
	let selectionRange = range;
	const nameNode =
		node.childForFieldName("name") ||
		node.childForFieldName("id");

	if (nameNode) {
		selectionRange = new vscode.Range(
			nameNode.startPosition.row,
			nameNode.startPosition.column,
			nameNode.endPosition.row,
			nameNode.endPosition.column
		);
	}

	const symbol = new vscode.DocumentSymbol(
		name,
		"",
		symbolKind,
		range,
		selectionRange
	);
	symbol.children = children;

	return symbol;
}

function collectSymbols(
	node: TreeSitter.Node,
	document: vscode.TextDocument
): vscode.DocumentSymbol[] {
	const symbols: vscode.DocumentSymbol[] = [];

	// Check if current node is a symbol-producing node
	if (nodeTypeToSymbolKind[node.type] !== undefined) {
		const children: vscode.DocumentSymbol[] = [];

		// For modules and contracts, collect nested symbols
		if (node.type === "mdefn" || node.type === "ecdecl") {
			for (const child of node.children) {
				const childSymbols = collectSymbols(child, document);
				children.push(...childSymbols);
			}
		}

		const symbol = createDocumentSymbol(node, document, children);
		if (symbol) {
			symbols.push(symbol);
		}
	} else {
		// Recurse into children
		for (const child of node.children) {
			const childSymbols = collectSymbols(child, document);
			symbols.push(...childSymbols);
		}
	}

	return symbols;
}

export class CompactDocumentSymbolProvider
	implements vscode.DocumentSymbolProvider
{
	provideDocumentSymbols(
		document: vscode.TextDocument,
		_token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.DocumentSymbol[]> {
		const tree = getOrParseDocument(document);
		if (!tree) {
			console.log("[CompactDocumentSymbolProvider] No tree available");
			return [];
		}

		// Debug: log top-level node types
		console.log("[CompactDocumentSymbolProvider] Root node type:", tree.rootNode.type);
		console.log("[CompactDocumentSymbolProvider] Children types:",
			tree.rootNode.children.map(c => c.type).join(", "));

		const symbols = collectSymbols(tree.rootNode, document);
		console.log("[CompactDocumentSymbolProvider] Found symbols:", symbols.length);
		return symbols;
	}
}
