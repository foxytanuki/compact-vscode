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

## Testing Locally

### Quick Start (Recommended)

```bash
# Download compact-lsp and compile extension
bun run dev:setup

# Then press F5 in VS Code to start debugging
```

This will:
1. Compile the TypeScript extension
2. Try to download the latest `compact-lsp` binary from GitHub Releases
3. If no release exists, build from the submodule source (requires Rust)
4. Place the binary in `bin/` for testing

### Method 1: Debug Mode

1. Run `bun run dev:setup` to download compact-lsp (first time only)
2. Open this project in VS Code
3. Press `F5` or go to Run > Start Debugging
4. A new VS Code window will open (Extension Development Host)
5. In the new window, open a `.compact` file to test the extension

**Note:** The downloaded `compact-lsp` will be automatically detected. If you want to use a specific path, set `compact.lsp.path` in VS Code settings.

### Method 2: Install from VSIX

```bash
# Download compact-lsp for testing
bun run dev:setup

# Build and package
bun run compile
bun run build:server  # Optional: if you want to test with bundled LSP
vsce package

# Install the generated VSIX
code --install-extension compact-vscode-0.1.0.vsix
```

### Download compact-lsp Manually

If you prefer to download compact-lsp manually:

```bash
# Download latest release for your platform
node scripts/download-lsp.js

# The binary will be placed in bin/compact-lsp (or bin/compact-lsp.exe on Windows)
# The extension will automatically detect it, or you can set compact.lsp.path in VS Code settings
```

### Development Workflow

1. **First time setup:**
   ```bash
   bun install
   bun run dev:setup  # Downloads compact-lsp and compiles extension
   ```

2. **Start debugging:**
   - Press `F5` in VS Code
   - Or run: `bun run dev:test` (opens Extension Development Host)

3. **Test the extension:**
   - In the Extension Development Host window, open a `.compact` file
   - LSP features should work automatically (the downloaded binary in `bin/` will be used)

4. **Update compact-lsp:**
   ```bash
   # Delete old binary and re-download
   rm -rf bin/
   bun run dev:setup
   ```

### Method 3: Symlink Installation

```bash
# On Linux/macOS
ln -s $(pwd) ~/.vscode/extensions/compact-vscode

# On Windows (PowerShell)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.vscode\extensions\compact-vscode" -Target (Get-Location)
```

Then reload VS Code.

## Development

### Prerequisites

- [Bun](https://bun.sh/) - Package manager and runtime
- [Rust](https://rustup.rs/) - For building the LSP server
- [Node.js](https://nodejs.org/) - For vsce (VS Code Extension manager)

### Building

```bash
# Install dependencies
bun install

# Compile TypeScript
bun run compile

# Build LSP server binaries (requires Rust)
bun run build:server

# Package extension (requires vsce: npm install -g @vscode/vsce)
vsce package
```

### Before Publishing

Update `package.json` with your publisher information:

```json
{
  "publisher": "your-publisher-name",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/compact-vscode.git"
  }
}
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

