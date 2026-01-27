import type { PackageMetadata, PackageData, FileEntry } from '@/types/package';
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

  return (
    path.startsWith('transform/') ||
    path.startsWith('validate/') ||
    path.startsWith('generate/')
  );
}

/**
 * Collect all workflows from file entries
 */
export function collectWorkflows(files: FileEntry[]): Workflow[] {
  const workflows: Workflow[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (isWorkflowFile(file.path)) {
      try {
        const workflow = parseWorkflowFile(file.path, file.content);
        workflows.push(workflow);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
  }

  if (errors.length > 0 && workflows.length === 0) {
    throw new Error(`Failed to parse workflows:\n${errors.join('\n')}`);
  }

  // Sort workflows by priority (lower = higher priority)
  workflows.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));

  return workflows;
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
  const workflows = collectWorkflows(files);

  if (workflows.length === 0) {
    throw new Error('No valid workflow files found in package');
  }

  return {
    metadata,
    workflows,
    folderName,
  };
}
