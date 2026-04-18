import { cn } from '../../lib/utils';

const tones = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300',
  qurbani: 'bg-qurbani-50 text-qurbani-600 dark:bg-qurbani-500/15 dark:text-qurbani-300',
  zakat: 'bg-zakat-50 text-zakat-600 dark:bg-zakat-500/15 dark:text-zakat-300',
  sadqa: 'bg-sadqa-50 text-sadqa-600 dark:bg-sadqa-500/15 dark:text-sadqa-300',
  disaster: 'bg-disaster-50 text-disaster-600 dark:bg-disaster-500/15 dark:text-disaster-300',
  ration: 'bg-ration-50 text-ration-600 dark:bg-ration-500/15 dark:text-ration-300',
  orphan: 'bg-orphan-50 text-orphan-600 dark:bg-orphan-500/15 dark:text-orphan-300',
  loan: 'bg-loan-50 text-loan-600 dark:bg-loan-500/15 dark:text-loan-300',
  volunteer: 'bg-volunteer-50 text-volunteer-600 dark:bg-volunteer-500/15 dark:text-volunteer-300',
  success: 'bg-success-light text-success-dark dark:bg-success/20 dark:text-success-light',
  warning: 'bg-warning-light text-warning-dark dark:bg-warning/20 dark:text-warning-light',
  error: 'bg-error-light text-error-dark dark:bg-error/20 dark:text-error-light',
  info: 'bg-info-light text-info-dark dark:bg-info/20 dark:text-info-light',
  neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const sizes = {
  sm: 'h-8 w-8 rounded-lg [&>svg]:h-4 [&>svg]:w-4',
  md: 'h-10 w-10 rounded-xl [&>svg]:h-5 [&>svg]:w-5',
  lg: 'h-12 w-12 rounded-xl [&>svg]:h-6 [&>svg]:w-6',
  xl: 'h-14 w-14 rounded-2xl [&>svg]:h-7 [&>svg]:w-7',
};

export default function IconTile({ icon: Icon, tone = 'primary', size = 'md', className, children, ...props }) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center flex-shrink-0',
        tones[tone] || tones.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {Icon ? <Icon /> : children}
    </div>
  );
}
