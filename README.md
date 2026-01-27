# Reframe IDE

> Lightweight web-based viewer and debugger for Reframe Transformation packages

## Overview

Reframe IDE is a browser-based tool for visualizing and debugging transformation packages built for the [Reframe Engine](https://github.com/GoPlasmatic/Reframe). It provides an interactive interface to explore workflows, inspect transformations, and test payloads in real-time.

## Features

- **Package Loading**: Open Reframe transformation package folders directly from your file system using the File System Access API (with fallback for unsupported browsers)
- **Workflow Visualization**: Interactive tree view of all workflows and tasks using the DataFlow UI component
- **Multi-Format Payload Testing**: Input payloads in JSON, XML, or SWIFT MT format with auto-detection
- **SWIFT MT Syntax Highlighting**: Custom Monaco editor language support for SWIFT MT messages with full syntax highlighting
- **Step-by-Step Debugging**: Walk through execution steps with integrated debugger controls and execution trace visualization
- **Theme Support**: Light, dark, and system-preference themes with real-time switching
- **Auto-Execute**: Transformations run automatically on payload changes

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS
- **Visualization**: [@goplasmatic/dataflow-ui](https://www.npmjs.com/package/@goplasmatic/dataflow-ui)
- **Editor**: Monaco Editor (via @monaco-editor/react)
- **Engine**: [@goplasmatic/reframe-wasm](https://www.npmjs.com/package/@goplasmatic/reframe-wasm)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

## Usage

1. Click "Open Package" to select a Reframe transformation package folder
2. The workflow tree appears in the left panel (80% width)
3. Enter test payload in the right panel (20% width) - supports JSON, XML, or SWIFT MT formats
4. Transformations execute automatically as you type
5. Use debug controls to step through execution and inspect intermediate states

## Project Structure

```
src/
├── main.tsx                       # Application entry point
├── App.tsx                        # Main layout (80/20 split)
├── components/
│   ├── Header.tsx                 # Toolbar with Open/Close Package, theme toggle
│   ├── EmptyState.tsx             # Welcome screen when no package loaded
│   ├── PayloadPanel.tsx           # Right panel: Monaco editor with format detection
│   └── WorkflowPanel.tsx          # Left panel: WorkflowVisualizer wrapper
├── hooks/
│   ├── usePackageLoader.ts        # File System Access API integration
│   └── useTheme.ts                # Theme management (light/dark/system)
├── engines/
│   ├── index.ts                   # Engine exports
│   └── ReframeEngineAdapter.ts    # WASM engine wrapper for DataFlow UI
├── services/
│   └── packageParser.ts           # Package folder parsing and validation
└── types/
    └── package.ts                 # TypeScript interfaces
```

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and design
- [CLAUDE.md](./CLAUDE.md) - AI assistant guidelines

## Related Projects

- [Reframe Engine](https://github.com/GoPlasmatic/Reframe) - The Rust transformation engine
- [dataflow-rs](https://github.com/GoPlasmatic/dataflow-rs) - DataFlow engine and UI components

## License

Apache 2.0
