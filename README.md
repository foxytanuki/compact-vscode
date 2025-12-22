# Compact Language Support for VS Code

Language support for the [Compact](https://docs.midnight.network/develop/reference/compact/lang-ref) smart contract language (Midnight network).

## Features

- Full LSP support via [compact-lsp](https://github.com/1NickPappas/compact-lsp)
  - Syntax highlighting, diagnostics, code completion
  - Go to definition, find references, hover documentation
  - Code formatting and folding
- Editor integration for `.compact` files

## Installation

Install from VS Code Marketplace or VSIX:

```bash
code --install-extension compact-vscode-0.1.0.vsix
```

The extension includes pre-built LSP server binaries. No manual installation required.

## Configuration

Optional: Set custom LSP server path:

```json
{
  "compact.lsp.path": "/path/to/compact-lsp"
}
```

## Development

### Prerequisites

- [mise](https://mise.jdx.dev/) (recommended) - Run `mise install` to set up Node.js and Rust
- [Bun](https://bun.sh/)
- [Rust](https://rustup.rs/)

### Setup

```bash
bun install
bun run dev:setup  # Downloads compact-lsp and compiles extension
```

Press `F5` in VS Code to start debugging.

### Building

```bash
bun run compile
bun run build:server  # Build LSP server binaries
vsce package
```

## Related Projects

- [compact-lsp](https://github.com/1NickPappas/compact-lsp) - Language Server Protocol implementation
- [compact-tree-sitter](https://github.com/midnightntwrk/compact-tree-sitter) - Tree-sitter grammar for Compact
- [compact.vim](https://github.com/1NickPappas/compact.vim) - Vim/Neovim support

## License

MIT
