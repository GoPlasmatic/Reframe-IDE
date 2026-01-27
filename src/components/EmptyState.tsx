interface EmptyStateProps {
  onOpenPackage: () => void;
  error: string | null;
}

export function EmptyState({ onOpenPackage, error }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md px-4">
        <div className="text-6xl mb-6">
          <svg
            className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Welcome to Reframe IDE
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Open a Reframe transformation package folder to visualize workflows and test transformations.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded text-sm text-left">
            {error}
          </div>
        )}

        <button
          onClick={onOpenPackage}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
        >
          Open Package Folder
        </button>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p className="font-medium mb-2">Expected package structure:</p>
          <pre className="text-left bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs text-gray-700 dark:text-gray-300">
{`package-folder/
├── reframe-package.json
├── transform/
│   └── *.json (workflows)
├── validate/
└── generate/`}
          </pre>
        </div>
      </div>
    </div>
  );
}
