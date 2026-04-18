import { cn } from '../../lib/utils';

export default function FormSection({
  title,
  description,
  icon: Icon,
  step,
  children,
  className,
  bodyClassName,
  actions,
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border bg-white shadow-card overflow-hidden',
        'border-gray-200 dark:bg-gray-900 dark:border-gray-800',
        className
      )}
    >
      {(title || description) && (
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3 min-w-0">
            {(Icon || step) && (
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 font-semibold text-sm dark:bg-primary-900/30 dark:text-primary-300">
                {Icon ? <Icon className="h-5 w-5" /> : step}
              </div>
            )}
            <div className="min-w-0">
              {title && <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">{title}</h2>}
              {description && (
                <p className="mt-0.5 text-sm text-gray-500 leading-relaxed dark:text-gray-400">{description}</p>
              )}
            </div>
          </div>
          {actions}
        </header>
      )}
      <div className={cn('p-5 sm:p-6', bodyClassName)}>{children}</div>
    </section>
  );
}

export function FormGrid({ children, cols = 2, className }) {
  const colMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };
  return <div className={cn('grid gap-4 sm:gap-5', colMap[cols], className)}>{children}</div>;
}

export function FormField({ label, htmlFor, required, error, hint, children, className, wide }) {
  return (
    <div className={cn('flex flex-col gap-1.5', wide && 'sm:col-span-2', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-error-dark dark:text-error-light">{error}</p>}
    </div>
  );
}
