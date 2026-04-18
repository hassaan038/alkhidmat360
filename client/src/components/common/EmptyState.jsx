import { Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function EmptyState({
  icon,
  title = 'Nothing here yet',
  description = '',
  action = null, // { label, onClick } or { label, href }
  tone = 'neutral',
  className,
}) {
  const Icon = icon || Inbox;
  const tones = {
    neutral: 'bg-gray-100 text-gray-400',
    primary: 'bg-primary-50 text-primary-500',
    qurbani: 'bg-qurbani-50 text-qurbani-500',
    zakat: 'bg-zakat-50 text-zakat-500',
    sadqa: 'bg-sadqa-50 text-sadqa-500',
    disaster: 'bg-disaster-50 text-disaster-500',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
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
        <span className="absolute inset-0 rounded-2xl ring-8 ring-white/40" aria-hidden />
        <Icon className="relative h-9 w-9" />
      </div>
      <h3 className="mt-5 text-base font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-gray-500">{description}</p>
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
