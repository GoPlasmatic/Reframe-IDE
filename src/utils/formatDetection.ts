import type { EditorFormat } from '@/constants/editor';

/**
 * Detect the format of a message based on its content.
 * Supports XML, JSON, and SWIFT MT formats.
 *
 * @param text - The message content to analyze
 * @returns The detected format: 'xml', 'json', or 'swift-mt'
 */
export function detectFormat(text: string): EditorFormat {
  const trimmed = text.trim();

  // Check for XML (starts with < or <?xml declaration)
  if (trimmed.startsWith('<') || trimmed.startsWith('<?xml')) {
    return 'xml';
  }

  // Check for SWIFT MT format (starts with block markers like {1:, {2:, etc.)
  if (trimmed.startsWith('{1:') || /^\{[1-5]:/.test(trimmed)) {
    return 'swift-mt';
  }

  // Check for JSON (starts with { or [)
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }

  // Default to SWIFT MT for unrecognized formats
  return 'swift-mt';
}
