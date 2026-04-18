import { cn } from '../../lib/utils';

const accents = {
  primary: 'from-primary-500 to-primary-700 text-primary-600 bg-primary-50',
  qurbani: 'from-qurbani-500 to-qurbani-700 text-qurbani-600 bg-qurbani-50',
  zakat: 'from-zakat-500 to-zakat-700 text-zakat-600 bg-zakat-50',
  sadqa: 'from-sadqa-500 to-sadqa-700 text-sadqa-600 bg-sadqa-50',
  disaster: 'from-disaster-500 to-disaster-700 text-disaster-600 bg-disaster-50',
  ration: 'from-ration-500 to-ration-700 text-ration-600 bg-ration-50',
  orphan: 'from-orphan-500 to-orphan-700 text-orphan-600 bg-orphan-50',
  loan: 'from-loan-500 to-loan-700 text-loan-600 bg-loan-50',
  volunteer: 'from-volunteer-500 to-volunteer-700 text-volunteer-600 bg-volunteer-50',
  neutral: 'from-gray-600 to-gray-800 text-gray-700 bg-gray-100',
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
  const accentClasses = accents[accent] || accents.primary;
  const [gradFrom, gradTo, iconText, iconBg] = accentClasses.split(' ');

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card',
        className
      )}
    >
      <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', gradFrom, gradTo)} />
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gradient-to-br opacity-10 blur-2xl"
        style={{ backgroundImage: 'var(--tw-gradient-stops)' }}
      />
      <div className="relative flex flex-col gap-4 p-5 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          {Icon && (
            <div
              className={cn(
                'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl shadow-sm',
                iconBg,
                iconText
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">{description}</p>
            )}
            {meta && <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
