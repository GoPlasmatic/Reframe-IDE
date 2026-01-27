import type { Workflow } from '@goplasmatic/dataflow-ui';

export type { Workflow };

/**
 * Workflow type enumeration
 */
export type WorkflowType = 'transform' | 'validate' | 'generate';

/**
 * Categorized workflows by type
 */
export interface CategorizedWorkflows {
  transform: Workflow[];
  validate: Workflow[];
  generate: Workflow[];
}

/**
 * Scenario definition for generate workflows
 */
export interface Scenario {
  id: string;
  file: string;
  source: string;
  target: string;
  description: string;
  direction: 'outgoing' | 'incoming';
}

/**
 * Package metadata from reframe-package.json
 */
export interface PackageMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  engine_version?: string;
  required_plugins?: string[];
  workflows?: {
    transform?: { path: string; description?: string };
    validate?: { path: string; description?: string };
    generate?: { path: string; description?: string };
  };
}

/**
 * Loaded package data
 */
export interface PackageData {
  metadata: PackageMetadata;
  workflows: Workflow[];
  categorizedWorkflows: CategorizedWorkflows;
  scenarios: Scenario[];
  scenarioContents: Record<string, string>;
  folderName: string;
}

/**
 * File entry from directory reading
 */
export interface FileEntry {
  path: string;
  content: string;
}
