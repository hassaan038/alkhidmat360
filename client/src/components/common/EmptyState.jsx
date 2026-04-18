import { Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function EmptyState({
  icon,
  title = 'Nothing here yet',
  description = '',
  action = null,
  tone = 'neutral',
  className,
}) {
  const Icon = icon || Inbox;

  const tones = {
    neutral: 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500',
    primary: 'bg-primary-50 text-primary-500 dark:bg-primary-900/30 dark:text-primary-300',
    qurbani: 'bg-qurbani-50 text-qurbani-500 dark:bg-qurbani-500/15 dark:text-qurbani-300',
    zakat: 'bg-zakat-50 text-zakat-500 dark:bg-zakat-500/15 dark:text-zakat-300',
    sadqa: 'bg-sadqa-50 text-sadqa-500 dark:bg-sadqa-500/15 dark:text-sadqa-300',
    disaster: 'bg-disaster-50 text-disaster-500 dark:bg-disaster-500/15 dark:text-disaster-300',
    volunteer: 'bg-volunteer-50 text-volunteer-500 dark:bg-volunteer-500/15 dark:text-volunteer-300',
    loan: 'bg-loan-50 text-loan-500 dark:bg-loan-500/15 dark:text-loan-300',
    success: 'bg-success-light text-success dark:bg-success/20 dark:text-success-light',
    warning: 'bg-warning-light text-warning dark:bg-warning/20 dark:text-warning-light',
  };
  const toneClass = tones[tone] || tones.neutral;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-14 px-6 text-center',
        className
      )}
    >
      <div
        className={cn(
          'relative flex h-20 w-20 items-center justify-center rounded-2xl shadow-inner-subtle',
          toneClass
        )}
      >
        <span className="absolute inset-0 rounded-2xl ring-8 ring-white/40 dark:ring-gray-900/40" aria-hidden />
        <Icon className="relative h-9 w-9" />
      </div>
      <h3 className="mt-5 text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {action && (
        <div className="mt-5">
          {action.href ? (
            <a
              href={action.href}
              className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 cursor-pointer"
            >
              {action.label}
            </a>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 cursor-pointer"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
