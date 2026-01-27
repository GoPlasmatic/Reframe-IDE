import type { PackageMetadata, PackageData, FileEntry, CategorizedWorkflows, Scenario, WorkflowType } from '@/types/package';
import type { Workflow } from '@goplasmatic/dataflow-ui';

/**
 * Parse reframe-package.json content
 */
export function parsePackageMetadata(content: string): PackageMetadata {
  try {
    const parsed = JSON.parse(content) as PackageMetadata;

    if (!parsed.id || !parsed.name || !parsed.version) {
      throw new Error('Invalid package metadata: missing required fields (id, name, version)');
    }

    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON in reframe-package.json');
    }
    throw error;
  }
}

/**
 * Extract folder path from file path (without the filename)
 * e.g., "transform/outgoing/MT103/mapping.json" -> "transform/outgoing/MT103"
 */
function getFolderPath(filePath: string): string {
  const lastSlash = filePath.lastIndexOf('/');
  if (lastSlash === -1) {
    return '';
  }
  return filePath.substring(0, lastSlash);
}

/**
 * Parse a workflow JSON file and add folder path for tree rendering
 */
function parseWorkflowFile(filePath: string, content: string): Workflow {
  try {
    const parsed = JSON.parse(content) as Workflow;

    if (!parsed.id || !parsed.name || !Array.isArray(parsed.tasks)) {
      throw new Error(`Invalid workflow at ${filePath}: missing required fields (id, name, tasks)`);
    }

    // Add folder path for tree view rendering (uses 'path' property)
    const folderPath = getFolderPath(filePath);
    return {
      ...parsed,
      path: folderPath,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in workflow file: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Determine workflow type from file path
 */
export function getWorkflowType(filePath: string): WorkflowType | null {
  if (filePath.startsWith('transform/')) {
    return 'transform';
  }
  if (filePath.startsWith('validate/')) {
    return 'validate';
  }
  if (filePath.startsWith('generate/')) {
    return 'generate';
  }
  return null;
}

/**
 * Check if a file path is a workflow JSON file
 */
function isWorkflowFile(path: string): boolean {
  // Skip index.json files
  if (path.endsWith('index.json')) {
    return false;
  }

  // Must be a JSON file in transform/, validate/, or generate/
  if (!path.endsWith('.json')) {
    return false;
  }

  return getWorkflowType(path) !== null;
}

/**
 * Result of collecting workflows
 */
interface CollectWorkflowsResult {
  workflows: Workflow[];
  categorizedWorkflows: CategorizedWorkflows;
}

/**
 * Collect all workflows from file entries
 */
export function collectWorkflows(files: FileEntry[]): CollectWorkflowsResult {
  const workflows: Workflow[] = [];
  const categorizedWorkflows: CategorizedWorkflows = {
    transform: [],
    validate: [],
    generate: [],
  };
  const errors: string[] = [];

  for (const file of files) {
    if (isWorkflowFile(file.path)) {
      try {
        const workflow = parseWorkflowFile(file.path, file.content);
        workflows.push(workflow);

        // Categorize by type
        const workflowType = getWorkflowType(file.path);
        if (workflowType) {
          categorizedWorkflows[workflowType].push(workflow);
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
  }

  if (errors.length > 0 && workflows.length === 0) {
    throw new Error(`Failed to parse workflows:\n${errors.join('\n')}`);
  }

  // Sort workflows by priority (lower = higher priority)
  const sortByPriority = (a: Workflow, b: Workflow) => (a.priority ?? 100) - (b.priority ?? 100);
  workflows.sort(sortByPriority);
  categorizedWorkflows.transform.sort(sortByPriority);
  categorizedWorkflows.validate.sort(sortByPriority);
  categorizedWorkflows.generate.sort(sortByPriority);

  return { workflows, categorizedWorkflows };
}

/**
 * Parse scenarios from scenarios/index.json
 * The index.json can be either:
 * 1. An object with 'outgoing' and 'incoming' arrays
 * 2. A flat array with 'direction' field on each item
 */
export function parseScenarios(files: FileEntry[]): Scenario[] {
  const indexFile = files.find(f => f.path === 'scenarios/index.json');
  if (!indexFile) {
    return [];
  }

  try {
    const parsed = JSON.parse(indexFile.content);
    const scenarios: Scenario[] = [];

    // Handle object format with outgoing/incoming arrays
    if (typeof parsed === 'object' && !Array.isArray(parsed)) {
      const outgoingItems = parsed.outgoing ?? [];
      const incomingItems = parsed.incoming ?? [];

      for (const item of outgoingItems) {
        scenarios.push({
          id: String(item.id ?? `outgoing-${scenarios.length}`),
          file: String(item.file ?? ''),
          source: String(item.source ?? ''),
          target: String(item.target ?? ''),
          description: String(item.description ?? ''),
          direction: 'outgoing',
        });
      }

      for (const item of incomingItems) {
        scenarios.push({
          id: String(item.id ?? `incoming-${scenarios.length}`),
          file: String(item.file ?? ''),
          source: String(item.source ?? ''),
          target: String(item.target ?? ''),
          description: String(item.description ?? ''),
          direction: 'incoming',
        });
      }

      return scenarios;
    }

    // Handle flat array format
    if (Array.isArray(parsed)) {
      return parsed.map((item: Record<string, unknown>, index: number) => ({
        id: String(item.id ?? `scenario-${index}`),
        file: String(item.file ?? ''),
        source: String(item.source ?? ''),
        target: String(item.target ?? ''),
        description: String(item.description ?? ''),
        direction: (item.direction === 'incoming' ? 'incoming' : 'outgoing') as 'outgoing' | 'incoming',
      }));
    }

    console.warn('scenarios/index.json has unexpected format');
    return [];
  } catch (error) {
    console.warn('Failed to parse scenarios/index.json:', error);
    return [];
  }
}

/**
 * Collect scenario file contents
 */
function collectScenarioContents(files: FileEntry[]): Record<string, string> {
  const contents: Record<string, string> = {};

  for (const file of files) {
    if (file.path.startsWith('scenarios/') && file.path !== 'scenarios/index.json') {
      // Store content keyed by relative path from scenarios/
      const relativePath = file.path.replace('scenarios/', '');
      contents[relativePath] = file.content;
    }
  }

  return contents;
}

/**
 * Parse a complete package from file entries
 */
export function parsePackage(files: FileEntry[], folderName: string): PackageData {
  // Find and parse reframe-package.json
  const packageFile = files.find(f => f.path === 'reframe-package.json');

  if (!packageFile) {
    throw new Error('Missing reframe-package.json in package folder');
  }

  const metadata = parsePackageMetadata(packageFile.content);
  const { workflows, categorizedWorkflows } = collectWorkflows(files);
  const scenarios = parseScenarios(files);
  const scenarioContents = collectScenarioContents(files);

  if (workflows.length === 0) {
    throw new Error('No valid workflow files found in package');
  }

  return {
    metadata,
    workflows,
    categorizedWorkflows,
    scenarios,
    scenarioContents,
    folderName,
  };
}
