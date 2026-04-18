import { cn } from '../../lib/utils';

const tones = {
  primary: 'bg-primary-50 text-primary-600',
  qurbani: 'bg-qurbani-50 text-qurbani-600',
  zakat: 'bg-zakat-50 text-zakat-600',
  sadqa: 'bg-sadqa-50 text-sadqa-600',
  disaster: 'bg-disaster-50 text-disaster-600',
  ration: 'bg-ration-50 text-ration-600',
  orphan: 'bg-orphan-50 text-orphan-600',
  loan: 'bg-loan-50 text-loan-600',
  volunteer: 'bg-volunteer-50 text-volunteer-600',
  success: 'bg-success-light text-success-dark',
  warning: 'bg-warning-light text-warning-dark',
  error: 'bg-error-light text-error-dark',
  info: 'bg-info-light text-info-dark',
  neutral: 'bg-gray-100 text-gray-700',
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
