import { cn } from "../../lib/utils";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

const alertVariants = {
  default: {
    container: "bg-gray-50 border-gray-200 text-gray-900",
    icon: Info,
  },
  error: {
    container: "bg-error-light border-error text-error-dark",
    icon: XCircle,
  },
  success: {
    container: "bg-success-light border-success text-success-dark",
    icon: CheckCircle,
  },
  warning: {
    container: "bg-warning-light border-warning text-warning-dark",
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
