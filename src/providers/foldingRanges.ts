import * as vscode from "vscode";
import type * as TreeSitter from "web-tree-sitter";
import { getOrParseDocument } from "../parser";

// Node types that should be foldable
const foldableNodeTypes = new Set([
    "mdefn", // module { ... }
    "cdefn", // circuit { ... }
    "struct", // struct { ... }
    "enumdef", // enum { ... }
    "ecdecl", // contract { ... }
    "block", // { ... }
    "if_statement", // if { ... }
    "for_statement", // for { ... }
    "lconstructor", // constructor { ... }
]);

function collectFoldingRanges(
    node: TreeSitter.Node,
    ranges: vscode.FoldingRange[],
    token: vscode.CancellationToken
): void {
    if (token.isCancellationRequested) {
        return;
    }

    // Check if this node type is foldable
    if (foldableNodeTypes.has(node.type)) {
        const startLine = node.startPosition.row;
        const endLine = node.endPosition.row;

        // Only create a folding range if it spans multiple lines
        if (endLine > startLine) {
            ranges.push(new vscode.FoldingRange(startLine, endLine));
        }
    }

    // Recurse into children
    for (const child of node.children) {
        collectFoldingRanges(child, ranges, token);
    }
}

export class CompactFoldingRangeProvider implements vscode.FoldingRangeProvider {
    provideFoldingRanges(
        document: vscode.TextDocument,
        _context: vscode.FoldingContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.FoldingRange[]> {
        const tree = getOrParseDocument(document);
        if (!tree) {
            return [];
        }

        const ranges: vscode.FoldingRange[] = [];
        collectFoldingRanges(tree.rootNode, ranges, token);

        return ranges;
    }
}
