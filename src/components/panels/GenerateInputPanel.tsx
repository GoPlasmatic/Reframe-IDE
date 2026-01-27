import { useState, useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import type { Scenario } from '@/types/package';
import { registerSwiftMTLanguage, detectFormat, getEditorConfig } from '@/utils';
import { READONLY_EDITOR_OPTIONS } from '@/constants';

interface GenerateInputPanelProps {
  scenarios: Scenario[];
  isDark: boolean;
  onGenerate?: (scenario: Scenario) => Promise<string>;
}

export function GenerateInputPanel({ scenarios, isDark, onGenerate }: GenerateInputPanelProps) {
  const [selectedDirection, setSelectedDirection] = useState<'outgoing' | 'incoming'>('outgoing');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter scenarios by direction
  const filteredScenarios = useMemo(() => {
    return scenarios.filter(s => s.direction === selectedDirection);
  }, [scenarios, selectedDirection]);

  // Get selected scenario
  const selectedScenario = useMemo(() => {
    return filteredScenarios.find(s => s.id === selectedScenarioId);
  }, [filteredScenarios, selectedScenarioId]);

  // Detect output format
  const outputFormat = useMemo(() => detectFormat(generatedOutput), [generatedOutput]);

  const handleEditorWillMount = useCallback((monaco: Monaco) => {
    registerSwiftMTLanguage(monaco);
  }, []);

  const editorConfig = useMemo(
    () => getEditorConfig(outputFormat, isDark),
    [outputFormat, isDark]
  );

  const handleGenerate = useCallback(async () => {
    if (!selectedScenario) return;

    setError(null);
    setIsGenerating(true);

    try {
      if (onGenerate) {
        const result = await onGenerate(selectedScenario);
        setGeneratedOutput(result);
      } else {
        // Placeholder output when no handler provided
        setGeneratedOutput(`// Generated sample for: ${selectedScenario.description}\n// Source: ${selectedScenario.source}\n// Target: ${selectedScenario.target}\n\n[Sample message would be generated here]`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedScenario, onGenerate]);

  const handleCopyOutput = useCallback(() => {
    if (generatedOutput) {
      navigator.clipboard.writeText(generatedOutput);
    }
  }, [generatedOutput]);

  // Count scenarios by direction
  const outgoingCount = scenarios.filter(s => s.direction === 'outgoing').length;
  const incomingCount = scenarios.filter(s => s.direction === 'incoming').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Generate Sample Message</h2>
      </div>

      {/* Controls */}
      <div className="p-3 space-y-3 border-b border-gray-200 dark:border-gray-700">
        {/* Direction Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Direction</label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedDirection('outgoing');
                setSelectedScenarioId('');
              }}
              disabled={outgoingCount === 0}
              className={`
                flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${selectedDirection === 'outgoing'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
                ${outgoingCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              Outgoing ({outgoingCount})
            </button>
            <button
              onClick={() => {
                setSelectedDirection('incoming');
                setSelectedScenarioId('');
              }}
              disabled={incomingCount === 0}
              className={`
                flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${selectedDirection === 'incoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
                ${incomingCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              Incoming ({incomingCount})
            </button>
          </div>
        </div>

        {/* Scenario Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Scenario</label>
          <select
            value={selectedScenarioId}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200"
          >
            <option value="">Select a scenario...</option>
            {filteredScenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.description || `${scenario.source} → ${scenario.target}`}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Scenario Details */}
        {selectedScenario && (
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md p-2">
            <div><span className="font-medium">Source:</span> {selectedScenario.source}</div>
            <div><span className="font-medium">Target:</span> {selectedScenario.target}</div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedScenario}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-3 py-2 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Output Editor */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Generated Output</span>
          {generatedOutput && (
            <button
              onClick={handleCopyOutput}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Copy
            </button>
          )}
        </div>
        <div className="flex-1 min-h-0">
          {generatedOutput ? (
            <Editor
              height="100%"
              language={editorConfig.language}
              theme={editorConfig.theme}
              value={generatedOutput}
              beforeMount={handleEditorWillMount}
              options={READONLY_EDITOR_OPTIONS}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
              Select a scenario and click Generate
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
