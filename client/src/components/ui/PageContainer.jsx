import { cn } from '../../lib/utils';

export default function PageContainer({ className, children, ...props }) {
  return (
    <div
      className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8', className)}
      {...props}
    >
      {children}
    </div>
  );
}
