import { cn } from '../../lib/utils';

const accents = {
  primary: { grad: 'from-primary-500 to-primary-700', icon: 'text-primary-600 bg-primary-50 dark:text-primary-300 dark:bg-primary-900/30' },
  qurbani: { grad: 'from-qurbani-500 to-qurbani-700', icon: 'text-qurbani-600 bg-qurbani-50 dark:text-qurbani-300 dark:bg-qurbani-500/15' },
  zakat: { grad: 'from-zakat-500 to-zakat-700', icon: 'text-zakat-600 bg-zakat-50 dark:text-zakat-300 dark:bg-zakat-500/15' },
  sadqa: { grad: 'from-sadqa-500 to-sadqa-700', icon: 'text-sadqa-600 bg-sadqa-50 dark:text-sadqa-300 dark:bg-sadqa-500/15' },
  disaster: { grad: 'from-disaster-500 to-disaster-700', icon: 'text-disaster-600 bg-disaster-50 dark:text-disaster-300 dark:bg-disaster-500/15' },
  ration: { grad: 'from-ration-500 to-ration-700', icon: 'text-ration-600 bg-ration-50 dark:text-ration-300 dark:bg-ration-500/15' },
  orphan: { grad: 'from-orphan-500 to-orphan-700', icon: 'text-orphan-600 bg-orphan-50 dark:text-orphan-300 dark:bg-orphan-500/15' },
  loan: { grad: 'from-loan-500 to-loan-700', icon: 'text-loan-600 bg-loan-50 dark:text-loan-300 dark:bg-loan-500/15' },
  volunteer: { grad: 'from-volunteer-500 to-volunteer-700', icon: 'text-volunteer-600 bg-volunteer-50 dark:text-volunteer-300 dark:bg-volunteer-500/15' },
  neutral: { grad: 'from-gray-600 to-gray-800', icon: 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800' },
};

export default function PageHeader({
  icon: Icon,
  title,
  description,
  accent = 'primary',
  actions,
  meta,
  className,
}) {
  const cfg = accents[accent] || accents.primary;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-white shadow-card',
        'border-gray-200 dark:bg-gray-900 dark:border-gray-800',
        className
      )}
    >
      <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', cfg.grad)} />
      <div className="relative flex flex-col gap-4 p-5 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          {Icon && (
            <div
              className={cn(
                'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl shadow-sm',
                cfg.icon
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">{title}</h1>
            {description && (
              <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{description}</p>
            )}
            {meta && <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
