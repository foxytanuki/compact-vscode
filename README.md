# Compact Language Support for VS Code

Language support for the [Compact](https://docs.midnight.network/develop/reference/compact/lang-ref) smart contract language (Midnight network).

> **Note:** This extension is currently under active development. Pull requests and issues are welcome!

## Features

- Full LSP support via [compact-lsp](https://github.com/1NickPappas/compact-lsp)
  - Syntax highlighting, diagnostics, code completion
  - Go to definition, find references, hover documentation
  - Code formatting and folding
- Editor integration for `.compact` files

## Installation

### From GitHub Releases (Recommended)

1. Go to [Releases](https://github.com/foxytanuki/compact-vscode/releases)
2. Download the VSIX file for your platform:
   - `compact-vscode-linux.vsix` - Linux (x86_64)
   - `compact-vscode-darwin.vsix` - macOS (Intel)
   - `compact-vscode-darwin-arm64.vsix` - macOS (Apple Silicon)
   - `compact-vscode-win32.vsix` - Windows (x86_64)
3. Install the extension:

**VS Code:**
```bash
code --install-extension compact-vscode-<platform>.vsix
```

**Cursor:**
```bash
cursor --install-extension compact-vscode-<platform>.vsix
```

Or via UI:
- Open Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
- Click `...` menu → "Install from VSIX..."
- Select the downloaded VSIX file

### From VS Code Marketplace

Coming soon - the extension will be available on the VS Code Marketplace.

The extension includes pre-built LSP server binaries for all platforms. No manual installation required.

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
# Clone with submodules (recommended)
git clone --recursive https://github.com/foxytanuki/compact-vscode.git
cd compact-vscode

# Or if already cloned, initialize submodules
git submodule update --init --recursive

# Install dependencies and setup
bun install
bun run dev:setup  # Initializes submodules, downloads compact-lsp, and compiles extension
```

Press `F5` in VS Code to start debugging.

### Building

```bash
bun run compile
bun run build:server  # Build LSP server binaries
vsce package --no-dependencies
```

**Note:** The `--no-dependencies` flag is required when using Bun, as `vsce` expects npm's dependency structure.

## Related Projects

- [compact-lsp](https://github.com/1NickPappas/compact-lsp) - Language Server Protocol implementation
- [compact-tree-sitter](https://github.com/midnightntwrk/compact-tree-sitter) - Tree-sitter grammar for Compact
- [compact.vim](https://github.com/1NickPappas/compact.vim) - Vim/Neovim support

## License

MIT
