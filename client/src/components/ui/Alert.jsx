import { cn } from "../../lib/utils";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

const alertVariants = {
  default: {
    container: "bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-800/60 dark:border-gray-700 dark:text-gray-100",
    icon: Info,
  },
  error: {
    container: "bg-error-light border-error text-error-dark dark:bg-error/20 dark:border-error/40 dark:text-error-light",
    icon: XCircle,
  },
  success: {
    container: "bg-success-light border-success text-success-dark dark:bg-success/20 dark:border-success/40 dark:text-success-light",
    icon: CheckCircle,
  },
  warning: {
    container: "bg-warning-light border-warning text-warning-dark dark:bg-warning/20 dark:border-warning/40 dark:text-warning-light",
    icon: AlertCircle,
  },
};

export default function Alert({ className, variant = "default", children, ...props }) {
  const variantConfig = alertVariants[variant];
  const Icon = variantConfig.icon;

  return (
    <div
      className={cn(
        "relative w-full rounded-lg border p-4",
        variantConfig.container,
        className
      )}
      {...props}
    >
      <div className="flex gap-3">
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1 text-sm">{children}</div>
      </div>
    </div>
  );
}
