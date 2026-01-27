import { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/EmptyState';
import { WorkflowPanel } from '@/components/WorkflowPanel';
import { WorkflowTypeSelector } from '@/components/WorkflowTypeSelector';
import { TypeSpecificPayloadPanel } from '@/components/TypeSpecificPayloadPanel';
import { usePackageLoader } from '@/hooks/usePackageLoader';
import { useTheme } from '@/hooks/useTheme';
import { initializeWasm, resetSharedEngine } from '@/engines';
import { DEFAULT_PAYLOAD } from '@/constants';
import type { WorkflowType } from '@/types/package';

// Extend HTMLInputElement to include webkitdirectory attribute
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

function App() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [payloadText, setPayloadText] = useState(DEFAULT_PAYLOAD);
  const [selectedWorkflowType, setSelectedWorkflowType] = useState<WorkflowType>('transform');

  // Pre-initialize WASM module early to reduce latency when first used
  useEffect(() => {
    initializeWasm().catch(console.error);
  }, []);

  const {
    packageData,
    isLoading,
    error: loadError,
    openPackage,
    openPackageViaInput,
    closePackage,
    inputRef,
  } = usePackageLoader();

  // Auto-select first workflow type that has workflows when package loads
  // Also reset the shared engine when a new package is loaded
  useEffect(() => {
    if (packageData?.categorizedWorkflows) {
      // Reset the shared engine for the new package
      resetSharedEngine();

      const { transform, validate, generate } = packageData.categorizedWorkflows;
      if (transform.length > 0) {
        setSelectedWorkflowType('transform');
      } else if (validate.length > 0) {
        setSelectedWorkflowType('validate');
      } else if (generate.length > 0) {
        setSelectedWorkflowType('generate');
      }
    }
  }, [packageData]);

  // Get workflows for the selected type
  const currentWorkflows = useMemo(() => {
    if (!packageData?.categorizedWorkflows) return [];
    return packageData.categorizedWorkflows[selectedWorkflowType] ?? [];
  }, [packageData, selectedWorkflowType]);

  // Provide a safe default for categorizedWorkflows
  const safeCategorizedWorkflows = useMemo(() => {
    return packageData?.categorizedWorkflows ?? {
      transform: [],
      validate: [],
      generate: [],
    };
  }, [packageData]);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        openPackageViaInput(files);
      }
      // Reset input so the same folder can be selected again
      e.target.value = '';
    },
    [openPackageViaInput]
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Hidden file input for fallback folder selection */}
      <input
        ref={inputRef}
        type="file"
        webkitdirectory="true"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      <Header
        packageName={packageData?.folderName ?? null}
        onOpenPackage={openPackage}
        onClosePackage={closePackage}
        isLoading={isLoading}
        isDark={resolvedTheme === 'dark'}
        onToggleTheme={toggleTheme}
      />

      {packageData ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Workflow Type Selector Tabs */}
          <WorkflowTypeSelector
            selectedType={selectedWorkflowType}
            onTypeChange={setSelectedWorkflowType}
            categorizedWorkflows={safeCategorizedWorkflows}
          />

          {/* Main Content */}
          <div className="flex-1 flex min-h-0">
            {/* Left panel - 80% */}
            <div className="w-4/5 h-full min-h-0">
              <WorkflowPanel
                workflows={currentWorkflows}
                theme={resolvedTheme}
                payloadText={payloadText}
                workflowType={selectedWorkflowType}
              />
            </div>

            {/* Right panel - 20% */}
            <div className="w-1/5 h-full min-w-[280px] min-h-0 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
              <TypeSpecificPayloadPanel
                workflowType={selectedWorkflowType}
                payloadText={payloadText}
                onPayloadChange={setPayloadText}
                isDark={resolvedTheme === 'dark'}
                scenarios={packageData.scenarios ?? []}
                scenarioContents={packageData.scenarioContents ?? {}}
                categorizedWorkflows={safeCategorizedWorkflows}
              />
            </div>
          </div>
        </div>
      ) : (
        <EmptyState onOpenPackage={openPackage} error={loadError} />
      )}
    </div>
  );
}

export default App;
