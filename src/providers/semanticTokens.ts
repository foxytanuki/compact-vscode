import * as vscode from "vscode";
import { getHighlightsQuery, getOrParseDocument } from "../parser";

// Define semantic token types supported by VSCode
export const tokenTypes = [
	"comment",
	"keyword",
	"string",
	"number",
	"operator",
	"type",
	"function",
	"variable",
	"parameter",
	"property",
	"namespace",
	"class",
	"enum",
	"enumMember",
	"struct",
	"module",
];

export const tokenModifiers = [
	"declaration",
	"definition",
	"readonly",
	"static",
	"deprecated",
	"modification",
	"documentation",
	"defaultLibrary",
];

export const legend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);

// Map tree-sitter capture names to VSCode semantic token types
const captureToTokenType: Record<string, string> = {
	"comment": "comment",
	"keyword": "keyword",
	"keyword.function": "keyword",
	"keyword.modifier": "keyword",
	"keyword.return": "keyword",
	"keyword.conditional": "keyword",
	"keyword.repeat": "keyword",
	"string": "string",
	"number": "number",
	"boolean": "keyword",
	"constant": "number",
	"operator": "operator",
	"type": "type",
	"type.builtin": "type",
	"type.parameter": "parameter",
	"function": "function",
	"variable": "variable",
	"property": "property",
	"field": "property",
	"namespace": "namespace",
	"module": "module",
	"punctuation.delimiter": "operator",
	"punctuation.bracket": "operator",
};

export class CompactSemanticTokensProvider
	implements vscode.DocumentSemanticTokensProvider
{
	provideDocumentSemanticTokens(
		document: vscode.TextDocument,
		_token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.SemanticTokens> {
		const tree = getOrParseDocument(document);
		const query = getHighlightsQuery();

		if (!tree || !query) {
			return null;
		}

		const builder = new vscode.SemanticTokensBuilder(legend);
		const captures = query.captures(tree.rootNode);

		for (const capture of captures) {
			const node = capture.node;
			const captureName = capture.name;

			const tokenType = captureToTokenType[captureName];
			if (!tokenType) {
				continue;
			}

			const tokenTypeIndex = tokenTypes.indexOf(tokenType);
			if (tokenTypeIndex === -1) {
				continue;
			}

			const startPosition = node.startPosition;
			const endPosition = node.endPosition;

			// Handle single-line tokens
			if (startPosition.row === endPosition.row) {
				builder.push(
					new vscode.Range(
						startPosition.row,
						startPosition.column,
						endPosition.row,
						endPosition.column
					),
					tokenType
				);
			} else {
				// Handle multi-line tokens (e.g., multi-line comments)
				const lines = document.getText(
					new vscode.Range(
						startPosition.row,
						startPosition.column,
						endPosition.row,
						endPosition.column
					)
				).split("\n");

				for (let i = 0; i < lines.length; i++) {
					const line = lines[i];
					const lineNumber = startPosition.row + i;
					const startCol = i === 0 ? startPosition.column : 0;
					const endCol = i === lines.length - 1 ? endPosition.column : line.length;

					if (endCol > startCol) {
						builder.push(
							new vscode.Range(lineNumber, startCol, lineNumber, endCol),
							tokenType
						);
					}
				}
			}
		}

		return builder.build();
	}
}
