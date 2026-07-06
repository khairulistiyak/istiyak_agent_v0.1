# Changelog - @istiyak/agent-sdk

## [1.0.0] - 2026-07-04

### Added
- ✅ Complete WebSocket client implementation for bidirectional communication with daemon
- ✅ `Client` class with full API surface (12 methods)
- ✅ `Connection` class handling WebSocket + HTTP fallback
- ✅ TypeScript type definitions for all SDK interfaces
- ✅ Permission request handling with async callbacks
- ✅ Session management (connect/disconnect lifecycle)
- ✅ Chat streaming with chunk-by-chunk delivery
- ✅ Git operations (status, log, diff)
- ✅ Command execution support
- ✅ Health checks and telemetry
- ✅ Agent control (abort, status)
- ✅ RAG reindexing support
- ✅ Comprehensive README with examples and API documentation
- ✅ Working test script (`test-ws.ts`)

### Technical Details
- WebSocket endpoint: `ws://localhost:3001/ws`
- HTTP fallback for non-streaming requests
- Full TypeScript strict mode compliance
- Isomorphic WebSocket support (works in Node.js and browsers)
- Message types: `chat`, `chunk`, `permission_request`, `permission_response`, `done`, `error`

### Files
- `src/Client.ts` (197 lines) - Main SDK client
- `src/Connection.ts` (175 lines) - Connection layer
- `src/types.ts` (75 lines) - Type definitions
- `src/index.ts` - Public API exports
- `src/test-ws.ts` - Example usage
- `README.md` - Documentation
- `CHANGELOG.md` - This file

### Dependencies
- `isomorphic-ws: ^5.0.0` - Universal WebSocket client
- `ws: ^8.21.0` - WebSocket implementation

### Breaking Changes
None (initial release)

### Migration Notes
This is the first complete release. Previous skeleton version was non-functional.

## [0.1.0] - 2026-07-03 (Pre-release)

### Added
- Initial skeleton structure (incomplete)
