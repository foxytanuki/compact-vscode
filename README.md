# Compact Language Support for VS Code

Language support for the [Compact](https://docs.midnight.network/develop/reference/compact/lang-ref) smart contract language (Midnight network).

> **Note:** This extension is currently under active development. Pull requests and issues are welcome!
## Features

- **Syntax highlighting** for Compact language files with Tree-sitter grammar
- **Document symbols** - Navigate to modules, circuits, structs, enums, contracts, and functions
- **Code folding** - Fold modules, circuits, structs, enums, contracts, and code blocks
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

The extension includes the Tree-sitter grammar for syntax highlighting. No additional installation required.

## Configuration

No configuration required. The extension works out of the box for `.compact` files.

## Development

### Prerequisites

- [mise](https://mise.jdx.dev/) (recommended) - Run `mise install` to set up Node.js
- [Bun](https://bun.sh/) - JavaScript runtime and package manager

### Setup

```bash
# Clone with submodules (recommended)
git clone --recursive https://github.com/foxytanuki/compact-vscode.git
cd compact-vscode

# Or if already cloned, initialize submodules
git submodule update --init --recursive

# Install dependencies and setup
bun install
bun run dev:setup  # Initializes submodules and compiles extension
```

Press `F5` in VS Code to start debugging.

### Building

```bash
bun run compile  # Compile TypeScript
bun run bundle    # Bundle the extension
vsce package      # Create VSIX package
```

**Note:** Use `vsce package --no-dependencies` when using Bun, as `vsce` expects npm's dependency structure.
## Related Projects

- [compact-lsp](https://github.com/1NickPappas/compact-lsp) - Language Server Protocol implementation
- [compact-tree-sitter](https://github.com/midnightntwrk/compact-tree-sitter) - Tree-sitter grammar for Compact
- [compact.vim](https://github.com/1NickPappas/compact.vim) - Vim/Neovim support

## License

MIT
