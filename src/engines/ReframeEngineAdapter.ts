import init, { ReframeEngine } from '@goplasmatic/reframe-wasm';
import type { DataflowEngine, EngineFactory, ExecutionTrace, Workflow } from '@goplasmatic/dataflow-ui';
import type { CategorizedWorkflows } from '@/types/package';

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

// Shared engine instance for generate/validate operations
let sharedEngine: ReframeEngine | null = null;
let sharedEnginePromise: Promise<ReframeEngine> | null = null;

/**
 * Initialize or get the shared engine with categorized workflows.
 */
export async function getSharedEngine(categorizedWorkflows: CategorizedWorkflows): Promise<ReframeEngine> {
  if (!categorizedWorkflows) {
    throw new Error('No workflows loaded');
  }

  if (sharedEngine) {
    return sharedEngine;
  }

  if (sharedEnginePromise) {
    return sharedEnginePromise;
  }

  sharedEnginePromise = (async () => {
    await ensureWasmInitialized();
    const workflowsJson = JSON.stringify({
      transform: categorizedWorkflows.transform ?? [],
      generate: categorizedWorkflows.generate ?? [],
      validate: categorizedWorkflows.validate ?? [],
    });
    sharedEngine = new ReframeEngine(workflowsJson);
    return sharedEngine;
  })();

  return sharedEnginePromise;
}

/**
 * Reset the shared engine (call when loading a new package).
 */
export function resetSharedEngine(): void {
  if (sharedEngine) {
    sharedEngine.free();
  }
  sharedEngine = null;
  sharedEnginePromise = null;
}

/**
 * Generate a sample message using the generate workflows.
 */
export async function generateMessage(
  categorizedWorkflows: CategorizedWorkflows,
  scenarioContent: string
): Promise<string> {
  const engine = await getSharedEngine(categorizedWorkflows);

  // The generate engine expects the scenario schema as the payload
  const resultJson = await engine.generate(scenarioContent);
  const result = JSON.parse(resultJson);

  // Extract the generated result from the message data
  if (result.data?.result) {
    return result.data.result;
  }

  // Check if result is in context.data (alternative location)
  if (result.context?.data?.result) {
    return result.context.data.result;
  }

  // If no result field, return the full response for debugging
  return JSON.stringify(result, null, 2);
}

/**
 * Validate a message using the validate workflows.
 */
export async function validateMessage(
  categorizedWorkflows: CategorizedWorkflows,
  payload: string
): Promise<{ valid: boolean; errors: Array<{ code: string; message: string }>; warnings: Array<{ code: string; message: string }> }> {
  const engine = await getSharedEngine(categorizedWorkflows);

  const resultJson = await engine.validate(payload);
  const result = JSON.parse(resultJson);

  // The validate workflow stores result in context.data.output (based on workflow target config)
  const contextData = result.context?.data ?? result.data ?? {};
  const validationResult = contextData.output ?? contextData.validation_result ?? contextData.result;

  if (validationResult) {
    // Handle errors - they might be strings or objects
    const errors = (validationResult.errors ?? []).map((err: string | { code?: string; message?: string }) => {
      if (typeof err === 'string') {
        return { code: 'VALIDATION_ERROR', message: err };
      }
      return { code: err.code ?? 'VALIDATION_ERROR', message: err.message ?? String(err) };
    });

    // Handle warnings - they might be strings or objects
    const warnings = (validationResult.warnings ?? []).map((warn: string | { code?: string; message?: string }) => {
      if (typeof warn === 'string') {
        return { code: 'WARNING', message: warn };
      }
      return { code: warn.code ?? 'WARNING', message: warn.message ?? String(warn) };
    });

    return {
      valid: validationResult.valid ?? (errors.length === 0),
      errors,
      warnings,
    };
  }

  // If no validation result found, return a message indicating no validation was performed
  return {
    valid: false,
    errors: [{ code: 'NO_VALIDATION', message: 'No validation workflow matched the input format' }],
    warnings: []
  };
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

    // Detect workflow type from the path prefix (e.g., "validate/...", "generate/...")
    const workflowType = this.getWorkflowType();
    let traceJson: string;
    switch (workflowType) {
      case 'validate':
        traceJson = await this.engine.validate_with_trace(rawPayload);
        break;
      case 'generate':
        traceJson = await this.engine.generate_with_trace(rawPayload);
        break;
      default:
        traceJson = await this.engine.process_with_trace(rawPayload);
        break;
    }
    return JSON.parse(traceJson) as ExecutionTrace;
  }

  private getWorkflowType(): 'transform' | 'validate' | 'generate' {
    const path = this.workflows[0]?.path ?? '';
    if (path.startsWith('validate/') || path.startsWith('validate\\')) return 'validate';
    if (path.startsWith('generate/') || path.startsWith('generate\\')) return 'generate';
    return 'transform';
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
