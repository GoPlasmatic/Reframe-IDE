/**
 * Editor-related constants for Monaco editor configuration
 */

/** Language ID for SWIFT MT format */
export const SWIFT_MT_LANGUAGE_ID = 'swift-mt';

/** Theme names for SWIFT MT syntax highlighting */
export const SWIFT_MT_THEME_LIGHT = 'swift-mt-light';
export const SWIFT_MT_THEME_DARK = 'swift-mt-dark';

/** Supported input/output formats */
export type EditorFormat = 'xml' | 'json' | 'swift-mt';

/** Default Monaco editor options shared across all editors */
export const DEFAULT_EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 12,
  lineNumbers: 'on' as const,
  folding: true,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  automaticLayout: true,
  tabSize: 2,
};

/** Read-only Monaco editor options (extends default options) */
export const READONLY_EDITOR_OPTIONS = {
  ...DEFAULT_EDITOR_OPTIONS,
  readOnly: true,
};
