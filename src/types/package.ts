import type { Workflow } from '@goplasmatic/dataflow-ui';

export type { Workflow };

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
  folderName: string;
}

/**
 * File entry from directory reading
 */
export interface FileEntry {
  path: string;
  content: string;
}
