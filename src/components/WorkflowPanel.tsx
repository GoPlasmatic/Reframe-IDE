import { useMemo } from 'react';
import { WorkflowVisualizer } from '@goplasmatic/dataflow-ui';
import type { DebugConfig } from '@goplasmatic/dataflow-ui';
import '@goplasmatic/dataflow-ui/styles.css';
import type { Workflow, WorkflowType } from '@/types/package';
import { reframeEngineFactory } from '@/engines';

interface WorkflowPanelProps {
  workflows: Workflow[];
  theme: 'light' | 'dark';
  payloadText: string;
  workflowType?: WorkflowType;
}

export function WorkflowPanel({ workflows, theme, payloadText, workflowType = 'transform' }: WorkflowPanelProps) {
  // Build debug payload from text input
  const debugPayload = useMemo(() => {
    // Normalize line endings (CRLF/CR -> LF) for consistent parsing
    const normalizedPayload = payloadText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    return {
      payload: normalizedPayload,
      context: {
        data: {},
        metadata: {},
        temp_data: {},
      },
    };
  }, [payloadText]);

  // Debug configuration for integrated debug mode
  // Only enable auto-execute for transform workflows
  const debugConfig: DebugConfig = useMemo(() => ({
    enabled: true,
    engineFactory: reframeEngineFactory,
    autoExecute: workflowType === 'transform',
    showControls: true,
  }), [workflowType]);

  return (
    <div className="h-full overflow-hidden">
      <WorkflowVisualizer
        workflows={workflows}
        theme={theme}
        debugConfig={debugConfig}
        debugPayload={debugPayload}
      />
    </div>
  );
}
