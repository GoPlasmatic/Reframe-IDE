import { useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import { registerSwiftMTLanguage, detectFormat, getEditorConfig, getFormatDisplayName } from '@/utils';
import { DEFAULT_EDITOR_OPTIONS } from '@/constants';

interface TransformInputPanelProps {
  payloadText: string;
  onPayloadChange: (text: string) => void;
  isDark: boolean;
}

export function TransformInputPanel({ payloadText, onPayloadChange, isDark }: TransformInputPanelProps) {
  const inputFormat = useMemo(() => detectFormat(payloadText), [payloadText]);

  const handleEditorWillMount = useCallback((monaco: Monaco) => {
    registerSwiftMTLanguage(monaco);
  }, []);

  const editorConfig = useMemo(
    () => getEditorConfig(inputFormat, isDark),
    [inputFormat, isDark]
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Input Message</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {getFormatDisplayName(inputFormat)}
        </span>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={editorConfig.language}
          theme={editorConfig.theme}
          value={payloadText}
          onChange={(value) => onPayloadChange(value ?? '')}
          beforeMount={handleEditorWillMount}
          options={DEFAULT_EDITOR_OPTIONS}
        />
      </div>
    </div>
  );
}
