# Changelog

All notable changes to this extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2025-12-22

### Fixed

- Fixed linting issues in `compact.tmLanguage.json` 

## [0.1.0] - 2025-12-22

### Added

- Language Server Protocol (LSP) integration with [compact-lsp](https://github.com/1NickPappas/compact-lsp)
  - Diagnostics, semantic tokens, code completion, go to definition, find references, hover documentation, signature help, document symbols, code formatting, and folding ranges
- TextMate grammar for syntax highlighting (keywords, types, literals, comments, operators, punctuation)
- File type detection and language configuration for `.compact` files
  - Comment support, bracket matching, smart indentation, code folding markers
- Bundled LSP server binaries for Linux, macOS (Intel and Apple Silicon), and Windows
- Automatic LSP server detection (bundled, development, common paths, PATH)
- Configuration options: `compact.lsp.path` and `compact.lsp.trace`
- Command: `compact.restartLanguageServer`

