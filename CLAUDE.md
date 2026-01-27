# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Reframe IDE** is a lightweight web-based viewer and debugger for Reframe Transformation packages. It loads package folders from the file system and provides visualization using the `@goplasmatic/dataflow-ui` library.

## Key Concept

This is a **viewer/debugger**, not a full IDE. It:
- Loads existing Reframe packages (read-only)
- Visualizes workflows using DataFlow UI
- Allows payload input for testing transformations
- Provides step-by-step debugging

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system design.

### Layout

- **Left Panel (80%)**: DataFlow UI `WorkflowVisualizer` component
- **Right Panel (20%)**: Payload input (Monaco JSON editor) + Run/Debug controls + Result output

### Key Dependencies

- `@goplasmatic/dataflow-ui` - Workflow visualization (tree view, debug mode, details panel)
- `@goplasmatic/reframe-wasm` - WASM engine for transformation execution
- File System Access API - For loading package folders

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Type check
npm run typecheck
```

## Code Organization

```
src/
├── App.tsx                    # Main layout (80/20 split)
├── components/
│   ├── Header.tsx             # Open Package button
│   ├── EmptyState.tsx         # Initial state when no package loaded
│   ├── PayloadPanel.tsx       # Right panel: JSON input + output
│   └── WorkflowPanel.tsx      # Left panel: wraps WorkflowVisualizer
├── hooks/
│   ├── usePackageLoader.ts    # File System Access API
│   └── useTheme.ts            # Theme management
├── engines/
│   └── ReframeEngineAdapter.ts # WASM execution wrapper
├── services/
│   └── packageParser.ts       # Parse package folder to workflows
└── types/
    └── package.ts             # TypeScript interfaces
```

## Coding Conventions

### TypeScript

- Use strict TypeScript (`strict: true`)
- Prefer interfaces over types for objects
- Use explicit return types on exported functions

### React Components

- Functional components only
- Use hooks for state and effects
- Keep components focused and small

### File Naming

- Components: `PascalCase.tsx`
- Hooks: `use*.ts`
- Services: `camelCase.ts`
- Types: `types.ts` or `*.types.ts`

## DataFlow UI Reference

The main visualization component from `@goplasmatic/dataflow-ui`:

```tsx
import {
  WorkflowVisualizer,
  DebuggerProvider,
  DebuggerControls
} from '@goplasmatic/dataflow-ui';
import '@goplasmatic/dataflow-ui/styles.css';

// Basic usage
<WorkflowVisualizer
  workflows={workflows}
  theme="system"
  debugMode={false}
  executionResult={result}
/>

// With debugging
<DebuggerProvider initialPayload={payload}>
  <WorkflowVisualizer workflows={workflows} debugMode={true} />
  <DebuggerControls />
</DebuggerProvider>
```

## Related Projects

- [dataflow-rs/ui](../dataflow-rs/ui) - The DataFlow UI component library
- [Reframe Engine](https://github.com/GoPlasmatic/Reframe) - The Rust transformation engine
- [reframe-package-swift-cbpr](../reframe-package-swift-cbpr/) - Reference package
