# Compact Language Support for VS Code

Language support for the [Compact](https://docs.midnight.network/develop/reference/compact/lang-ref) smart contract language (Midnight network).

## Features

- **Language Server Protocol (LSP)** - Full IDE features via [compact-lsp](https://github.com/1NickPappas/compact-lsp)
  - Diagnostics (syntax errors, compiler errors)
  - Semantic tokens (syntax highlighting)
  - Code completion
  - Go to definition
  - Find references
  - Hover documentation
  - Signature help
  - Document symbols (outline view)
  - Code formatting
  - Folding ranges
- **Editor Integration**
  - File type detection for `.compact` files
  - Comment support (`//` and `/* */`)
  - Bracket matching
  - Smart indentation
  - Code folding markers

## Requirements

- VS Code 1.75.0 or higher
- (Optional) [compact-lsp](https://github.com/1NickPappas/compact-lsp) - Automatically bundled with the extension

## Installation

1. Install from VS Code Marketplace (coming soon)
2. Or install from VSIX:
   ```bash
   code --install-extension compact-vscode-0.1.0.vsix
   ```

The extension includes pre-built LSP server binaries for Linux, macOS, and Windows. No manual installation required!

## Configuration

### LSP Server Path

If you have a custom `compact-lsp` installation, you can specify its path:

```json
{
  "compact.lsp.path": "/path/to/compact-lsp"
}
```

If not specified, the extension will:
1. Use the bundled server (included with the extension)
2. Check common installation locations (`~/compactc/compact-lsp`, `~/.cargo/bin/compact-lsp`)
3. Try PATH

### LSP Trace

Enable LSP communication tracing for debugging:

```json
{
  "compact.lsp.trace": "verbose"
}
```

Options: `"off"`, `"messages"`, `"verbose"`

## Commands

- `compact.restartLanguageServer` - Restart the Compact Language Server

## Development

### Building

```bash
# Install dependencies
bun install

# Compile TypeScript
bun run compile

# Build LSP server binaries (requires Rust)
bun run build:server

# Package extension
vsce package
```

### Building LSP Server

The LSP server is built from the [compact-lsp](https://github.com/1NickPappas/compact-lsp) submodule.

**Requirements:**
- Rust toolchain (install from [rustup.rs](https://rustup.rs/))

**Build for current platform:**
```bash
cd submodules/compact-lsp
cargo build --release
```

**Build for all platforms (requires cross-compilation setup):**
```bash
bun run build:server
```

The binaries will be placed in:
- `server/linux/compact-lsp`
- `server/darwin/compact-lsp`
- `server/win32/compact-lsp.exe`

## Related Projects

- [compact-lsp](https://github.com/1NickPappas/compact-lsp) - Language Server Protocol implementation
- [compact-tree-sitter](https://github.com/midnightntwrk/compact-tree-sitter) - Tree-sitter grammar for Compact
- [compact.vim](https://github.com/1NickPappas/compact.vim) - Vim/Neovim support

## License

MIT

