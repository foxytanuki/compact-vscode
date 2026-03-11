# Compact Syntax Highlighting for VS Code

This project extends the Midnight Network with additional developer tooling.

Syntax highlighting for the [Compact](https://docs.midnight.network/develop/reference/compact/lang-ref) smart contract language (Midnight network).

> **Note:** This extension is currently under active development. Pull requests and issues are welcome!

This extension does not connect directly to a Midnight network. It focuses on Compact syntax highlighting and tracks the language/toolchain used for Midnight Preprod-era development.

## Features

- **Syntax highlighting** for Compact language files
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

The extension includes a bundled TextMate grammar for syntax highlighting. No additional installation required.

## Configuration

No configuration required. The extension works out of the box for `.compact` files.

## Development

### Prerequisites

- [mise](https://mise.jdx.dev/) (recommended) - Run `mise install` to set up Node.js
- [Bun](https://bun.sh/) - JavaScript runtime and package manager

### Setup

```bash
# Clone repository
git clone https://github.com/foxytanuki/compact-vscode.git
cd compact-vscode

# Install dependencies and setup
bun install
bun run dev:setup  # Compiles extension
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

- [compact.vim](https://github.com/1NickPappas/compact.vim) - Vim/Neovim support

## License

MIT
