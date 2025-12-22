# Changelog

All notable changes to this extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-22

### Added

- Language Server Protocol (LSP) integration with [compact-lsp](https://github.com/1NickPappas/compact-lsp)
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
- File type detection for `.compact` files
- Language configuration
  - Comment support (`//` and `/* */`)
  - Bracket matching and auto-closing pairs
  - Smart indentation rules
  - Code folding markers (`// #region` / `// #endregion`)
- Bundled LSP server binaries for Linux, macOS, and Windows
- Configuration options
  - `compact.lsp.path` - Custom LSP server path
  - `compact.lsp.trace` - LSP communication tracing
- Command: `compact.restartLanguageServer` - Restart the language server

### Technical

- Built with TypeScript
- Uses Biome for linting and formatting
- Uses Bun for package management
- LSP server built from [compact-lsp](https://github.com/1NickPappas/compact-lsp) submodule

