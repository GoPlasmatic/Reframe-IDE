import type { Monaco } from '@monaco-editor/react';
import type { languages } from 'monaco-editor';
import {
  SWIFT_MT_LANGUAGE_ID,
  SWIFT_MT_THEME_LIGHT,
  SWIFT_MT_THEME_DARK,
} from '@/constants/editor';

/**
 * Register custom SWIFT MT language and themes for Monaco editor.
 * Safe to call multiple times - will only register once.
 */
export function registerSwiftMTLanguage(monaco: Monaco): void {
  // Check if already registered
  if (monaco.languages.getLanguages().some(
    (lang: languages.ILanguageExtensionPoint) => lang.id === SWIFT_MT_LANGUAGE_ID
  )) {
    return;
  }

  // Register the language
  monaco.languages.register({ id: SWIFT_MT_LANGUAGE_ID });

  // Set up tokenizer for syntax highlighting
  monaco.languages.setMonarchTokensProvider(SWIFT_MT_LANGUAGE_ID, {
    tokenizer: {
      root: [
        [/\{1:/, 'keyword.block', '@block1'],
        [/\{2:/, 'keyword.block', '@block2'],
        [/\{3:/, 'keyword.block', '@block3'],
        [/\{4:/, 'keyword.block', '@block4'],
        [/\{5:/, 'keyword.block', '@block5'],
      ],
      block1: [
        [/F01/, 'constant'],
        [/[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?/, 'string.bic'],
        [/[0-9]+/, 'number'],
        [/\}/, 'keyword.block', '@pop'],
      ],
      block2: [
        [/[IO]/, 'constant.direction'],
        [/[0-9]{3}/, 'number.msgtype'],
        [/[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?/, 'string.bic'],
        [/[NU]/, 'constant.priority'],
        [/\}/, 'keyword.block', '@pop'],
      ],
      block3: [
        [/\{121:/, 'tag.subblock', '@uetr'],
        [/\{119:/, 'tag.subblock', '@subblock'],
        [/\{108:/, 'tag.subblock', '@subblock'],
        [/\{111:/, 'tag.subblock', '@subblock'],
        [/\{[0-9]{3}:/, 'tag.subblock', '@subblock'],
        [/\}/, 'keyword.block', '@pop'],
      ],
      uetr: [
        [/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, 'string.uuid'],
        [/\}/, 'tag.subblock', '@pop'],
      ],
      subblock: [
        [/[A-Z0-9]+/, 'string'],
        [/\}/, 'tag.subblock', '@pop'],
      ],
      block4: [
        [/-\}/, 'keyword.block', '@pop'],
        [/:[0-9]{2}[A-Z]?:/, 'tag.field'],
        [/[0-9]{6}(?=[A-Z]{3}[0-9])/, 'number.date'],
        [/[A-Z]{3}(?=[0-9])/, 'constant.currency'],
        [/[0-9]+,[0-9]+/, 'number.amount'],
        [/[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?(?=\s|$|\n)/, 'string.bic'],
        [/\/[A-Z0-9]+/, 'variable.account'],
        [/\/[1-8]\//, 'tag.subfield'],
        [/\b(CRED|CRTS|SPAY|SPRI|TELB|PHON|INTC|SHA|OUR|BEN|STP)\b/, 'constant.code'],
        [/[0-9]+/, 'number'],
        [/[A-Za-z][A-Za-z0-9 ]*/, 'string'],
      ],
      block5: [
        [/\{MAC:/, 'tag.trailer', '@trailerContent'],
        [/\{CHK:/, 'tag.trailer', '@trailerContent'],
        [/\{SYS:/, 'tag.trailer', '@trailerContent'],
        [/\{[A-Z]{3}:/, 'tag.trailer', '@trailerContent'],
        [/\}/, 'keyword.block', '@pop'],
      ],
      trailerContent: [
        [/[A-F0-9]+/, 'number.hex'],
        [/\}/, 'tag.trailer', '@pop'],
      ],
    },
  });

  // Define light theme
  monaco.editor.defineTheme(SWIFT_MT_THEME_LIGHT, {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword.block', foreground: '0000FF', fontStyle: 'bold' },
      { token: 'tag.field', foreground: 'A31515', fontStyle: 'bold' },
      { token: 'tag.subblock', foreground: '795E26' },
      { token: 'tag.trailer', foreground: '795E26' },
      { token: 'tag.subfield', foreground: 'AF00DB' },
      { token: 'number.date', foreground: '098658' },
      { token: 'number.amount', foreground: '098658', fontStyle: 'bold' },
      { token: 'number.msgtype', foreground: '098658' },
      { token: 'number.hex', foreground: '098658' },
      { token: 'number', foreground: '098658' },
      { token: 'constant.currency', foreground: '0070C1', fontStyle: 'bold' },
      { token: 'constant.direction', foreground: '0070C1' },
      { token: 'constant.priority', foreground: '0070C1' },
      { token: 'constant.code', foreground: '0070C1' },
      { token: 'constant', foreground: '0070C1' },
      { token: 'string.bic', foreground: '811F3F' },
      { token: 'string.uuid', foreground: '811F3F' },
      { token: 'string', foreground: '0451A5' },
      { token: 'variable.account', foreground: '001080' },
    ],
    colors: {},
  });

  // Define dark theme
  monaco.editor.defineTheme(SWIFT_MT_THEME_DARK, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword.block', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'tag.field', foreground: 'CE9178', fontStyle: 'bold' },
      { token: 'tag.subblock', foreground: 'DCDCAA' },
      { token: 'tag.trailer', foreground: 'DCDCAA' },
      { token: 'tag.subfield', foreground: 'C586C0' },
      { token: 'number.date', foreground: 'B5CEA8' },
      { token: 'number.amount', foreground: 'B5CEA8', fontStyle: 'bold' },
      { token: 'number.msgtype', foreground: 'B5CEA8' },
      { token: 'number.hex', foreground: 'B5CEA8' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'constant.currency', foreground: '4EC9B0', fontStyle: 'bold' },
      { token: 'constant.direction', foreground: '4EC9B0' },
      { token: 'constant.priority', foreground: '4EC9B0' },
      { token: 'constant.code', foreground: '4EC9B0' },
      { token: 'constant', foreground: '4EC9B0' },
      { token: 'string.bic', foreground: 'D7BA7D' },
      { token: 'string.uuid', foreground: 'D7BA7D' },
      { token: 'string', foreground: '9CDCFE' },
      { token: 'variable.account', foreground: '9CDCFE' },
    ],
    colors: {},
  });
}
