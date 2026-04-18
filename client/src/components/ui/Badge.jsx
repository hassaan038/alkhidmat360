import { cn } from '../../lib/utils';
import { Check, Clock, X, AlertCircle, Loader2 } from 'lucide-react';

const variants = {
  neutral: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700',
  primary: 'bg-primary-50 text-primary-700 ring-primary-200 dark:bg-primary-900/30 dark:text-primary-200 dark:ring-primary-800',
  success: 'bg-success-light text-success-dark ring-success/40 dark:bg-success/20 dark:text-success-light dark:ring-success/40',
  warning: 'bg-warning-light text-warning-dark ring-warning/40 dark:bg-warning/20 dark:text-warning-light dark:ring-warning/40',
  error: 'bg-error-light text-error-dark ring-error/40 dark:bg-error/20 dark:text-error-light dark:ring-error/40',
  info: 'bg-info-light text-info-dark ring-info/40 dark:bg-info/20 dark:text-info-light dark:ring-info/40',
  qurbani: 'bg-qurbani-50 text-qurbani-700 ring-qurbani-100 dark:bg-qurbani-500/15 dark:text-qurbani-100 dark:ring-qurbani-700/40',
  zakat: 'bg-zakat-50 text-zakat-700 ring-zakat-100 dark:bg-zakat-500/15 dark:text-zakat-100 dark:ring-zakat-700/40',
  sadqa: 'bg-sadqa-50 text-sadqa-700 ring-sadqa-100 dark:bg-sadqa-500/15 dark:text-sadqa-100 dark:ring-sadqa-700/40',
  disaster: 'bg-disaster-50 text-disaster-700 ring-disaster-100 dark:bg-disaster-500/15 dark:text-disaster-100 dark:ring-disaster-700/40',
  ration: 'bg-ration-50 text-ration-700 ring-ration-100 dark:bg-ration-500/15 dark:text-ration-100 dark:ring-ration-700/40',
  orphan: 'bg-orphan-50 text-orphan-700 ring-orphan-100 dark:bg-orphan-500/15 dark:text-orphan-100 dark:ring-orphan-700/40',
  loan: 'bg-loan-50 text-loan-700 ring-loan-100 dark:bg-loan-500/15 dark:text-loan-100 dark:ring-loan-700/40',
  volunteer: 'bg-volunteer-50 text-volunteer-700 ring-volunteer-100 dark:bg-volunteer-500/15 dark:text-volunteer-100 dark:ring-volunteer-700/40',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export default function Badge({
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  children,
  dot = false,
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium ring-1 ring-inset',
        variants[variant] || variants.neutral,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-success',
            variant === 'warning' && 'bg-warning',
            variant === 'error' && 'bg-error',
            variant === 'info' && 'bg-info',
            variant === 'primary' && 'bg-primary-500',
            variant === 'neutral' && 'bg-gray-400'
          )}
        />
      )}
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}

const statusMap = {
  pending: { variant: 'warning', label: 'Pending', icon: Clock },
  approved: { variant: 'success', label: 'Approved', icon: Check },
  confirmed: { variant: 'info', label: 'Confirmed', icon: Check },
  completed: { variant: 'success', label: 'Completed', icon: Check },
  rejected: { variant: 'error', label: 'Rejected', icon: X },
  under_review: { variant: 'warning', label: 'Under Review', icon: Loader2 },
  scheduled: { variant: 'info', label: 'Scheduled', icon: Clock },
  collected: { variant: 'success', label: 'Collected', icon: Check },
  cancelled: { variant: 'neutral', label: 'Cancelled', icon: X },
  DRAFT: { variant: 'neutral', label: 'Draft', icon: AlertCircle },
  ACTIVE: { variant: 'success', label: 'Active', icon: Check },
  FULL: { variant: 'warning', label: 'Full', icon: AlertCircle },
  CLOSED: { variant: 'neutral', label: 'Closed', icon: X },
};

export function StatusBadge({ status, size = 'md', className }) {
  const cfg = statusMap[status] || { variant: 'neutral', label: status || 'Unknown', icon: AlertCircle };
  return (
    <Badge variant={cfg.variant} size={size} icon={cfg.icon} className={className}>
      {cfg.label}
    </Badge>
  );
}
