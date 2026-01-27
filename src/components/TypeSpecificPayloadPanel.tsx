import { useCallback } from 'react';
import type { WorkflowType, Scenario, CategorizedWorkflows } from '@/types/package';
import { TransformInputPanel, ValidateInputPanel, GenerateInputPanel } from './panels';
import type { ValidationResult } from './panels';
import { generateMessage, validateMessage } from '@/engines';

interface TypeSpecificPayloadPanelProps {
  workflowType: WorkflowType;
  payloadText: string;
  onPayloadChange: (text: string) => void;
  isDark: boolean;
  scenarios: Scenario[];
  scenarioContents: Record<string, string>;
  categorizedWorkflows: CategorizedWorkflows;
}

export function TypeSpecificPayloadPanel({
  workflowType,
  payloadText,
  onPayloadChange,
  isDark,
  scenarios,
  scenarioContents,
  categorizedWorkflows,
}: TypeSpecificPayloadPanelProps) {
  // Generate handler that processes scenario through the generate workflows
  const handleGenerate = useCallback(async (scenario: Scenario): Promise<string> => {
    if (!categorizedWorkflows) {
      throw new Error('No workflows loaded');
    }

    const content = scenarioContents[scenario.file];
    if (!content) {
      throw new Error(`Scenario file not found: ${scenario.file}`);
    }

    // Use the Reframe engine to generate the actual message
    return generateMessage(categorizedWorkflows, content);
  }, [scenarioContents, categorizedWorkflows]);

  // Validate handler that processes message through the validate workflows
  const handleValidate = useCallback(async (payload: string): Promise<ValidationResult> => {
    if (!categorizedWorkflows) {
      throw new Error('No workflows loaded');
    }

    return validateMessage(categorizedWorkflows, payload);
  }, [categorizedWorkflows]);

  switch (workflowType) {
    case 'transform':
      return (
        <TransformInputPanel
          payloadText={payloadText}
          onPayloadChange={onPayloadChange}
          isDark={isDark}
        />
      );

    case 'validate':
      return (
        <ValidateInputPanel
          payloadText={payloadText}
          onPayloadChange={onPayloadChange}
          isDark={isDark}
          onValidate={handleValidate}
        />
      );

    case 'generate':
      return (
        <GenerateInputPanel
          scenarios={scenarios}
          isDark={isDark}
          onGenerate={handleGenerate}
        />
      );

    default:
      return null;
  }
}
