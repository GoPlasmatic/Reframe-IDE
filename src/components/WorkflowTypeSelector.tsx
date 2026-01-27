import type { WorkflowType, CategorizedWorkflows } from '@/types/package';

interface WorkflowTypeSelectorProps {
  selectedType: WorkflowType;
  onTypeChange: (type: WorkflowType) => void;
  categorizedWorkflows: CategorizedWorkflows;
}

interface TabConfig {
  type: WorkflowType;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabConfig[] = [
  {
    type: 'transform',
    label: 'Transform',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    type: 'validate',
    label: 'Validate',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    type: 'generate',
    label: 'Generate',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
];

export function WorkflowTypeSelector({
  selectedType,
  onTypeChange,
  categorizedWorkflows,
}: WorkflowTypeSelectorProps) {
  const getCount = (type: WorkflowType): number => {
    return categorizedWorkflows[type].length;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <nav className="flex px-4" aria-label="Workflow type tabs">
        {tabs.map((tab) => {
          const count = getCount(tab.type);
          const isSelected = selectedType === tab.type;
          const isDisabled = count === 0;

          return (
            <button
              key={tab.type}
              onClick={() => !isDisabled && onTypeChange(tab.type)}
              disabled={isDisabled}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${isSelected
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }
                ${isDisabled
                  ? 'opacity-50 cursor-not-allowed hover:border-transparent hover:text-gray-500 dark:hover:text-gray-400'
                  : 'cursor-pointer'
                }
              `}
              aria-current={isSelected ? 'page' : undefined}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`
                  inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full
                  ${isSelected
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }
                `}
              >
                {count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
