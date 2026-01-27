import type { EditorFormat } from '@/constants/editor';
import {
  SWIFT_MT_LANGUAGE_ID,
  SWIFT_MT_THEME_LIGHT,
  SWIFT_MT_THEME_DARK,
} from '@/constants/editor';

/**
 * Editor configuration for Monaco editor
 */
export interface EditorConfig {
  language: string;
  theme: string;
}

/**
 * Get the Monaco editor configuration (language and theme) for a given format.
 *
 * @param format - The detected format of the content
 * @param isDark - Whether dark theme is enabled
 * @returns Editor configuration with language and theme
 */
export function getEditorConfig(format: EditorFormat, isDark: boolean): EditorConfig {
  if (format === 'swift-mt') {
    return {
      language: SWIFT_MT_LANGUAGE_ID,
      theme: isDark ? SWIFT_MT_THEME_DARK : SWIFT_MT_THEME_LIGHT,
    };
  }

  return {
    language: format,
    theme: isDark ? 'vs-dark' : 'vs',
  };
}

/**
 * Get the display name for a format
 *
 * @param format - The format to get the display name for
 * @returns Human-readable format name
 */
export function getFormatDisplayName(format: EditorFormat): string {
  return format === 'swift-mt' ? 'SWIFT MT' : format.toUpperCase();
}
