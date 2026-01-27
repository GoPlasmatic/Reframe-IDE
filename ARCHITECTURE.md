# Reframe IDE - Architecture

> Lightweight viewer and debugger for Reframe Transformation packages

**Status**: Design Phase
**Last Updated**: 2025-01-26

---

## Overview

Reframe IDE is a browser-based tool that loads Reframe transformation package folders and provides visualization and debugging capabilities. It wraps the `@goplasmatic/dataflow-ui` library with package loading and payload input functionality.

### Core Capabilities

1. **Load Package**: Open a Reframe transformation package folder via File System Access API
2. **Visualize Workflows**: Display all workflows in an interactive tree using DataFlow UI
3. **Test Payloads**: Input JSON payloads and execute transformations
4. **Debug Execution**: Step through transformation execution with visual feedback

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Reframe IDE                                            [Open Package]      │
├─────────────────────────────────────────────────┬───────────────────────────┤
│                                                 │                           │
│                                                 │   Payload Input           │
│                                                 │   ┌───────────────────┐   │
│          DataFlow UI Component                  │   │ {                 │   │
│          (WorkflowVisualizer)                   │   │   "data": {       │   │
│                                                 │   │     "amount": 100 │   │
│  ┌─────────────────┐  ┌──────────────────────┐  │   │   }               │   │
│  │ Workflows       │  │ Details Panel        │  │   │ }                 │   │
│  │ ├── workflow-1  │  │                      │  │   └───────────────────┘   │
│  │ │   ├── task-1  │  │ [Selected item       │  │                           │
│  │ │   └── task-2  │  │  details/JSONLogic]  │  │   [Run] [Debug]           │
│  │ └── workflow-2  │  │                      │  │                           │
│  │     └── task-1  │  │                      │  │   ┌───────────────────┐   │
│  └─────────────────┘  └──────────────────────┘  │   │ Result Output     │   │
│                                                 │   │ (read-only)       │   │
│  [Debug Controls: ⏮ ⏯ ⏭ Step 3/10]             │   └───────────────────┘   │
│                                                 │                           │
├─────────────────────────────────────────────────┴───────────────────────────┤
│            80% Width                            │        20% Width          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Layout Breakdown

| Section | Width | Component | Description |
|---------|-------|-----------|-------------|
| Left Panel | 80% | `WorkflowVisualizer` | DataFlow UI showing workflow tree and details |
| Right Panel | 20% | Payload Panel | JSON editor for input + result display |

---

## Component Architecture

```
src/
├── App.tsx                    # Main application layout
├── components/
│   ├── Header.tsx             # App header with Open Package button
│   ├── PayloadPanel.tsx       # Right panel: input + output + controls
│   └── WorkflowPanel.tsx      # Left panel: wraps WorkflowVisualizer
├── hooks/
│   ├── usePackageLoader.ts    # File System Access API for loading packages
│   └── useTheme.ts            # Theme management hook
├── engines/
│   └── ReframeEngineAdapter.ts # WASM engine wrapper for execution
├── services/
│   └── packageParser.ts       # Parse package folder structure
├── types/
│   └── package.ts             # Package-related TypeScript types
└── main.tsx                   # Entry point
```

---

## Key Components

### 1. Package Loader

Uses the File System Access API to read package folders:

```typescript
interface PackageData {
  metadata: PackageMetadata;      // From reframe-package.json
  workflows: Workflow[];          // All workflow definitions
  folderName: string;             // Name of the loaded folder
}

async function loadPackage(dirHandle: FileSystemDirectoryHandle): Promise<PackageData>
```

**Package Structure Expected:**
```
package-folder/
├── reframe-package.json          # Package metadata
├── transform/
│   ├── index.json                # Workflow registry
│   └── [workflow files...]       # Workflow JSON files
├── validate/                     # Optional
└── generate/                     # Optional
```

### 2. Workflow Panel

Wraps `@goplasmatic/dataflow-ui` WorkflowVisualizer:

```tsx
<WorkflowVisualizer
  workflows={packageData.workflows}
  theme="system"
  debugMode={isDebugging}
  executionResult={result}
/>
```

### 3. Payload Panel

Right-side panel with:
- **Input Editor**: Monaco JSON editor for payload input
- **Action Buttons**: Run / Debug controls
- **Result Display**: Read-only JSON viewer for output

```tsx
interface PayloadPanelProps {
  payloadText: string;
  onPayloadChange: (text: string) => void;
  isDark: boolean;
}
```

### 4. Transform Engine

Wraps `@goplasmatic/reframe-wasm` for execution:

```typescript
interface TransformEngine {
  execute(workflows: Workflow[], payload: object): Promise<Message>;
  executeWithTrace(workflows: Workflow[], payload: object): Promise<ExecutionTrace>;
}
```

---

## Data Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Package Folder  │────▶│  Package Parser  │────▶│  PackageData     │
│  (File System)   │     │                  │     │  (workflows[])   │
└──────────────────┘     └──────────────────┘     └────────┬─────────┘
                                                           │
                                                           ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  User Payload    │────▶│  Transform       │────▶│  Result Message  │
│  (JSON input)    │     │  Engine (WASM)   │     │  + Trace         │
└──────────────────┘     └──────────────────┘     └────────┬─────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │  WorkflowViz     │
                                                  │  (debug mode)    │
                                                  └──────────────────┘
```

---

## Dependencies

### Runtime

| Package | Version | Purpose |
|---------|---------|---------|
| `@goplasmatic/dataflow-ui` | ^2.0.11 | Workflow visualization component |
| `@goplasmatic/reframe-wasm` | ^3.1.8 | WASM engine for execution |
| `react` | ^18.0.0 | UI framework |
| `react-dom` | ^18.0.0 | React DOM rendering |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.x | Type checking |
| `vite` | ^5.x | Build tool |
| `tailwindcss` | ^3.x | Styling |

---

## State Management

Simple React state - no external state library needed due to minimal scope:

```typescript
// App.tsx state
const [packageData, setPackageData] = useState<PackageData | null>(null);
const [payload, setPayload] = useState<object>({});
const [result, setResult] = useState<Message | null>(null);
const [isDebugging, setIsDebugging] = useState(false);
const [executionTrace, setExecutionTrace] = useState<ExecutionTrace | null>(null);
```

---

## File System Access API

The app uses the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) to read package folders:

```typescript
// Request directory access
const dirHandle = await window.showDirectoryPicker();

// Read files recursively
async function readDirectory(handle: FileSystemDirectoryHandle): Promise<Map<string, string>> {
  const files = new Map<string, string>();
  for await (const [name, entry] of handle.entries()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      const content = await file.text();
      files.set(name, content);
    } else if (entry.kind === 'directory') {
      // Recurse into subdirectories
    }
  }
  return files;
}
```

**Browser Support**: Chrome, Edge (Chromium). Firefox and Safari require fallback (file input with webkitdirectory).

---

## Theming

Inherits theme support from `@goplasmatic/dataflow-ui`:

- Light mode
- Dark mode
- System preference detection

```tsx
<WorkflowVisualizer theme="system" ... />
```

---

## Error Handling

| Error Type | Handling |
|------------|----------|
| Invalid package folder | Show error message, suggest correct structure |
| Invalid JSON in workflow | Show parse error with file path |
| WASM execution error | Display error in result panel |
| Browser doesn't support File System API | Show fallback file input |

---

## Future Considerations

These features are out of scope for initial version but may be added later:

- **Package Editing**: Edit workflow files and save back to disk
- **Multiple Packages**: Load and compare multiple packages
- **Export Results**: Save transformation results to file
- **Scenario Loading**: Load and run predefined test scenarios
