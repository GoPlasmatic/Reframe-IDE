import init, { ReframeEngine } from '@goplasmatic/reframe-wasm';
import type { DataflowEngine, EngineFactory, ExecutionTrace, Workflow } from '@goplasmatic/dataflow-ui';

// WASM initialization state
let wasmInitialized = false;
let wasmInitPromise: Promise<void> | null = null;

/**
 * Initialize the WASM module. Safe to call multiple times - will only initialize once.
 */
async function ensureWasmInitialized(): Promise<void> {
  if (wasmInitialized) return;

  if (!wasmInitPromise) {
    wasmInitPromise = init().then(() => {
      wasmInitialized = true;
    });
  }

  await wasmInitPromise;
}

/**
 * Adapter that wraps the Reframe WASM engine to implement the DataflowEngine interface.
 * This enables the DataFlow UI debugger to use Reframe's plugin functions
 * (detect, parse_mt, parse_mx, validate_mt, validate_mx, publish_mt, publish_mx, etc.)
 */
export class ReframeEngineAdapter implements DataflowEngine {
  private engine: ReframeEngine | null = null;
  private workflows: Workflow[];
  private initPromise: Promise<void> | null = null;

  constructor(workflows: Workflow[]) {
    this.workflows = workflows;
    // Start initialization immediately
    this.initPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    await ensureWasmInitialized();
    this.engine = new ReframeEngine(JSON.stringify(this.workflows));
  }

  async processWithTrace(payload: Record<string, unknown>): Promise<ExecutionTrace> {
    // Ensure initialization is complete before processing
    if (this.initPromise) {
      await this.initPromise;
      this.initPromise = null;
    }

    if (!this.engine) {
      throw new Error('ReframeEngine failed to initialize');
    }

    // Reframe WASM expects the raw payload string directly, not a JSON-wrapped object.
    // The payload object from dataflow-ui has structure: { payload: "...", context: {...} }
    // We extract just the payload field and pass it as-is to the WASM engine.
    const rawPayload = typeof payload.payload === 'string'
      ? payload.payload
      : JSON.stringify(payload.payload);

    const traceJson = await this.engine.process_with_trace(rawPayload);
    return JSON.parse(traceJson) as ExecutionTrace;
  }

  dispose(): void {
    if (this.engine) {
      this.engine.free();
      this.engine = null;
    }
  }
}

/**
 * Factory function to create ReframeEngineAdapter instances.
 * Pass this to DebuggerProvider's engineFactory prop.
 */
export const reframeEngineFactory: EngineFactory = (workflows: Workflow[]) =>
  new ReframeEngineAdapter(workflows);

/**
 * Pre-initialize WASM module. Call this early in app lifecycle to reduce
 * latency when the engine is first used.
 */
export const initializeWasm = ensureWasmInitialized;
