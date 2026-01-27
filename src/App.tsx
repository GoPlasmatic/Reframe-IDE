import { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/EmptyState';
import { WorkflowPanel } from '@/components/WorkflowPanel';
import { PayloadPanel } from '@/components/PayloadPanel';
import { usePackageLoader } from '@/hooks/usePackageLoader';
import { useTheme } from '@/hooks/useTheme';
import { initializeWasm } from '@/engines';

const DEFAULT_PAYLOAD = `{1:F01BANKBEBBAXXX0000000000}{2:I103BANKDEFFXXXXN}{4:
:20:REFERENCE123
:23B:CRED
:32A:230615EUR1000,00
:50K:/12345678
ORDERING CUSTOMER
:59:/87654321
BENEFICIARY CUSTOMER
:71A:SHA
-}`;

function App() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [payloadText, setPayloadText] = useState(DEFAULT_PAYLOAD);

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
        // @ts-ignore webkitdirectory is a non-standard attribute
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
        <div className="flex-1 flex min-h-0">
          {/* Left panel - 80% */}
          <div className="w-4/5 h-full min-h-0">
            <WorkflowPanel
              workflows={packageData.workflows}
              theme={resolvedTheme}
              payloadText={payloadText}
            />
          </div>

          {/* Right panel - 20% */}
          <div className="w-1/5 h-full min-w-[280px] min-h-0">
            <PayloadPanel
              payloadText={payloadText}
              onPayloadChange={setPayloadText}
              isDark={resolvedTheme === 'dark'}
            />
          </div>
        </div>
      ) : (
        <EmptyState onOpenPackage={openPackage} error={loadError} />
      )}
    </div>
  );
}

export default App;
