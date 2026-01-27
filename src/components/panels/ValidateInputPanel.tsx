import { useState, useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import { registerSwiftMTLanguage, detectFormat, getEditorConfig, getFormatDisplayName } from '@/utils';
import { DEFAULT_EDITOR_OPTIONS } from '@/constants';

interface ValidateInputPanelProps {
  payloadText: string;
  onPayloadChange: (text: string) => void;
  isDark: boolean;
  onValidate?: (payload: string) => Promise<ValidationResult>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  code: string;
  message: string;
  path?: string;
}

interface ValidationWarning {
  code: string;
  message: string;
  path?: string;
}

export function ValidateInputPanel({ payloadText, onPayloadChange, isDark, onValidate }: ValidateInputPanelProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const inputFormat = useMemo(() => detectFormat(payloadText), [payloadText]);

  const handleEditorWillMount = useCallback((monaco: Monaco) => {
    registerSwiftMTLanguage(monaco);
  }, []);

  const editorConfig = useMemo(
    () => getEditorConfig(inputFormat, isDark),
    [inputFormat, isDark]
  );

  const handleValidate = useCallback(async () => {
    if (!onValidate) {
      // Placeholder validation when no handler provided
      setValidationResult({
        valid: true,
        errors: [],
        warnings: [],
      });
      return;
    }

    setIsValidating(true);
    try {
      const result = await onValidate(payloadText);
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [{
          code: 'VALIDATION_ERROR',
          message: error instanceof Error ? error.message : 'Validation failed',
        }],
        warnings: [],
      });
    } finally {
      setIsValidating(false);
    }
  }, [onValidate, payloadText]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Message to Validate</h2>
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

      {/* Validate Button */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <button
          onClick={handleValidate}
          disabled={isValidating || !payloadText.trim()}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isValidating ? 'Validating...' : 'Validate'}
        </button>
      </div>

      {/* Validation Results */}
      {validationResult && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 max-h-48 overflow-y-auto">
          {/* Status Badge */}
          <div className="px-3 py-2 flex items-center gap-2">
            {validationResult.valid ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Valid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Invalid
              </span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {validationResult.errors.length} error{validationResult.errors.length !== 1 ? 's' : ''},
              {' '}{validationResult.warnings.length} warning{validationResult.warnings.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <div className="px-3 pb-2 space-y-1">
              {validationResult.errors.map((error, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="font-medium text-red-600 dark:text-red-400">{error.code}</span>
                    <span className="text-gray-600 dark:text-gray-400">: {error.message}</span>
                    {error.path && (
                      <span className="text-gray-400 dark:text-gray-500"> at {error.path}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div className="px-3 pb-2 space-y-1">
              {validationResult.warnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <svg className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <span className="font-medium text-yellow-600 dark:text-yellow-400">{warning.code}</span>
                    <span className="text-gray-600 dark:text-gray-400">: {warning.message}</span>
                    {warning.path && (
                      <span className="text-gray-400 dark:text-gray-500"> at {warning.path}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
