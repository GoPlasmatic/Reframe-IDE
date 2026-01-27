interface HeaderProps {
  packageName: string | null;
  onOpenPackage: () => void;
  onClosePackage: () => void;
  isLoading: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
}

function SunIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

export function Header({
  packageName,
  onOpenPackage,
  onClosePackage,
  isLoading,
  isDark,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="h-12 bg-gray-800 dark:bg-gray-950 text-white flex items-center justify-between px-4 shrink-0 border-b border-gray-700 dark:border-gray-800">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Reframe IDE</h1>
        {packageName && (
          <span className="text-sm text-gray-300 bg-gray-700 dark:bg-gray-800 px-2 py-1 rounded">
            {packageName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-800 rounded transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        {packageName && (
          <button
            onClick={onClosePackage}
            className="px-3 py-1.5 text-sm bg-gray-700 dark:bg-gray-800 hover:bg-gray-600 dark:hover:bg-gray-700 rounded transition-colors"
          >
            Close
          </button>
        )}
        <button
          onClick={onOpenPackage}
          disabled={isLoading}
          className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
        >
          {isLoading ? 'Loading...' : 'Open Package'}
        </button>
      </div>
    </header>
  );
}
