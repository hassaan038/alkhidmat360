import { cn } from '../../lib/utils';

const tones = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-900/30', text: 'text-primary-600 dark:text-primary-300', ring: 'ring-primary-100 dark:ring-primary-900/40' },
  qurbani: { bg: 'bg-qurbani-50 dark:bg-qurbani-500/15', text: 'text-qurbani-600 dark:text-qurbani-300', ring: 'ring-qurbani-100 dark:ring-qurbani-700/30' },
  zakat: { bg: 'bg-zakat-50 dark:bg-zakat-500/15', text: 'text-zakat-600 dark:text-zakat-300', ring: 'ring-zakat-100 dark:ring-zakat-700/30' },
  sadqa: { bg: 'bg-sadqa-50 dark:bg-sadqa-500/15', text: 'text-sadqa-600 dark:text-sadqa-300', ring: 'ring-sadqa-100 dark:ring-sadqa-700/30' },
  disaster: { bg: 'bg-disaster-50 dark:bg-disaster-500/15', text: 'text-disaster-600 dark:text-disaster-300', ring: 'ring-disaster-100 dark:ring-disaster-700/30' },
  ration: { bg: 'bg-ration-50 dark:bg-ration-500/15', text: 'text-ration-600 dark:text-ration-300', ring: 'ring-ration-100 dark:ring-ration-700/30' },
  orphan: { bg: 'bg-orphan-50 dark:bg-orphan-500/15', text: 'text-orphan-600 dark:text-orphan-300', ring: 'ring-orphan-100 dark:ring-orphan-700/30' },
  loan: { bg: 'bg-loan-50 dark:bg-loan-500/15', text: 'text-loan-600 dark:text-loan-300', ring: 'ring-loan-100 dark:ring-loan-700/30' },
  volunteer: { bg: 'bg-volunteer-50 dark:bg-volunteer-500/15', text: 'text-volunteer-600 dark:text-volunteer-300', ring: 'ring-volunteer-100 dark:ring-volunteer-700/30' },
  success: { bg: 'bg-success-light dark:bg-success/20', text: 'text-success-dark dark:text-success-light', ring: 'ring-success-light dark:ring-success/30' },
  warning: { bg: 'bg-warning-light dark:bg-warning/20', text: 'text-warning-dark dark:text-warning-light', ring: 'ring-warning-light dark:ring-warning/30' },
  error: { bg: 'bg-error-light dark:bg-error/20', text: 'text-error-dark dark:text-error-light', ring: 'ring-error-light dark:ring-error/30' },
  info: { bg: 'bg-info-light dark:bg-info/20', text: 'text-info-dark dark:text-info-light', ring: 'ring-info-light dark:ring-info/30' },
  neutral: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', ring: 'ring-gray-100 dark:ring-gray-800' },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'primary',
  hint,
  trend,
  loading = false,
  className,
  ...props
}) {
  const t = tones[tone] || tones.primary;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
        'border-gray-200 dark:bg-gray-900 dark:border-gray-800',
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 tabular-nums dark:text-gray-50">
            {loading ? (
              <span className="inline-block h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            ) : (
              value
            )}
          </p>
          {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
          {trend && (
            <div
              className={cn(
                'mt-2 inline-flex items-center gap-1 text-xs font-medium',
                trend.direction === 'up' ? 'text-success-dark dark:text-success-light' : 'text-error-dark dark:text-error-light'
              )}
            >
              <span>{trend.direction === 'up' ? '▲' : '▼'}</span>
              <span>{trend.value}</span>
              {trend.label && <span className="text-gray-500 dark:text-gray-400">{trend.label}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ring-8',
              t.bg,
              t.text,
              t.ring
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
