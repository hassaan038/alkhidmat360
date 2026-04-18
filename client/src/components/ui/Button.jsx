import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = {
  default:
    "bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow",
  destructive:
    "bg-error text-white hover:bg-error-dark shadow-sm hover:shadow",
  outline:
    "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 " +
    "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:border-gray-600",
  primaryOutline:
    "border border-primary-300 bg-primary-50/60 text-primary-700 hover:bg-primary-100 hover:border-primary-400 " +
    "dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-200 dark:hover:bg-primary-900/50",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 " +
    "dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
  ghost:
    "text-gray-700 hover:bg-gray-100 " +
    "dark:text-gray-300 dark:hover:bg-gray-800",
  link:
    "text-primary-600 underline-offset-4 hover:underline dark:text-primary-400",
  success:
    "bg-success text-white hover:bg-success-dark shadow-sm hover:shadow",
  soft:
    "bg-primary-50 text-primary-700 hover:bg-primary-100 ring-1 ring-inset ring-primary-100 " +
    "dark:bg-primary-900/30 dark:text-primary-200 dark:hover:bg-primary-900/50 dark:ring-primary-800",
};

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 text-xs",
  lg: "h-11 px-8 text-base",
  xl: "h-12 px-10 text-base",
  icon: "h-10 w-10",
  iconSm: "h-9 w-9",
};

export default function Button({
  className,
  variant = "default",
  size = "default",
  children,
  disabled,
  loading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  type = "button",
  ...props
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        "dark:focus-visible:ring-offset-gray-950",
        "disabled:pointer-events-none disabled:opacity-50",
        !isDisabled && "cursor-pointer",
        buttonVariants[variant] || buttonVariants.default,
        buttonSizes[size] || buttonSizes.default,
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        LeftIcon && <LeftIcon className="h-4 w-4" />
      )}
      {children}
      {!loading && RightIcon && <RightIcon className="h-4 w-4" />}
    </button>
  );
}
