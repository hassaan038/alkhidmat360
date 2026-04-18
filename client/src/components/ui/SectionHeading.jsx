import { cn } from '../../lib/utils';

export default function SectionHeading({
  title,
  description,
  icon: Icon,
  action,
  className,
  size = 'md',
}) {
  const sizes = {
    sm: { title: 'text-sm font-semibold', desc: 'text-xs' },
    md: { title: 'text-base font-semibold', desc: 'text-sm' },
    lg: { title: 'text-lg font-semibold', desc: 'text-sm' },
  };
  const s = sizes[size] || sizes.md;
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className={cn(s.title, 'text-gray-900')}>{title}</h2>
          {description && <p className={cn(s.desc, 'text-gray-500 mt-0.5')}>{description}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
