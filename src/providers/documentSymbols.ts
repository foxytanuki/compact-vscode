import * as vscode from "vscode";
import type { SyntaxNode } from "web-tree-sitter";
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

function getSymbolName(node: SyntaxNode): string | null {
	// Try common name field patterns
	const nameFields = [
		"name",
		"function_name",
		"struct_name",
		"enum_name",
		"contract_name",
		"module_name",
		"id",
	];

	for (const fieldName of nameFields) {
		const nameNode = node.childForFieldName(fieldName);
		if (nameNode) {
			return nameNode.text;
		}
	}

	// For constructor, return "constructor"
	if (node.type === "lconstructor") {
		return "constructor";
	}

	return null;
}

function createDocumentSymbol(
	node: SyntaxNode,
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
		node.childForFieldName("function_name") ||
		node.childForFieldName("struct_name") ||
		node.childForFieldName("enum_name") ||
		node.childForFieldName("contract_name") ||
		node.childForFieldName("module_name");

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
	node: SyntaxNode,
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
			return [];
		}

		return collectSymbols(tree.rootNode, document);
	}
}
