import { cn } from '../../lib/utils';

const tones = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-600', ring: 'ring-primary-100' },
  qurbani: { bg: 'bg-qurbani-50', text: 'text-qurbani-600', ring: 'ring-qurbani-100' },
  zakat: { bg: 'bg-zakat-50', text: 'text-zakat-600', ring: 'ring-zakat-100' },
  sadqa: { bg: 'bg-sadqa-50', text: 'text-sadqa-600', ring: 'ring-sadqa-100' },
  disaster: { bg: 'bg-disaster-50', text: 'text-disaster-600', ring: 'ring-disaster-100' },
  ration: { bg: 'bg-ration-50', text: 'text-ration-600', ring: 'ring-ration-100' },
  orphan: { bg: 'bg-orphan-50', text: 'text-orphan-600', ring: 'ring-orphan-100' },
  loan: { bg: 'bg-loan-50', text: 'text-loan-600', ring: 'ring-loan-100' },
  volunteer: { bg: 'bg-volunteer-50', text: 'text-volunteer-600', ring: 'ring-volunteer-100' },
  success: { bg: 'bg-success-light', text: 'text-success-dark', ring: 'ring-success-light' },
  warning: { bg: 'bg-warning-light', text: 'text-warning-dark', ring: 'ring-warning-light' },
  error: { bg: 'bg-error-light', text: 'text-error-dark', ring: 'ring-error-light' },
  info: { bg: 'bg-info-light', text: 'text-info-dark', ring: 'ring-info-light' },
  neutral: { bg: 'bg-gray-100', text: 'text-gray-700', ring: 'ring-gray-100' },
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
  const toneClasses = tones[tone] || tones.primary;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 tabular-nums">
            {loading ? (
              <span className="inline-block h-8 w-20 animate-pulse rounded bg-gray-200" />
            ) : (
              value
            )}
          </p>
          {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
          {trend && (
            <div
              className={cn(
                'mt-2 inline-flex items-center gap-1 text-xs font-medium',
                trend.direction === 'up' ? 'text-success-dark' : 'text-error-dark'
              )}
            >
              <span>{trend.direction === 'up' ? '▲' : '▼'}</span>
              <span>{trend.value}</span>
              {trend.label && <span className="text-gray-500">{trend.label}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ring-8',
              toneClasses.bg,
              toneClasses.text,
              toneClasses.ring
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
