import { cn } from "../../lib/utils";

const baseInput = cn(
  "flex h-10 w-full rounded-lg border text-sm transition-colors duration-150",
  "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400",
  "dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500",
  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
  "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60",
  "dark:disabled:bg-gray-800/50"
);

export default function Input({ className, type = "text", error, leftIcon: LeftIcon, rightIcon: RightIcon, ...props }) {
  if (LeftIcon || RightIcon) {
    return (
      <div className="relative">
        {LeftIcon && (
          <LeftIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        )}
        <input
          type={type}
          className={cn(
            baseInput,
            LeftIcon ? "pl-9" : "pl-3",
            RightIcon ? "pr-9" : "pr-3",
            "py-2",
            error && "border-error focus:ring-error",
            className
          )}
          {...props}
        />
        {RightIcon && (
          <RightIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        )}
      </div>
    );
  }

  return (
    <input
      type={type}
      className={cn(
        baseInput,
        "px-3 py-2",
        error && "border-error focus:ring-error",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, error, ...props }) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-150 resize-y",
        "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400",
        "dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60 dark:disabled:bg-gray-800/50",
        error && "border-error focus:ring-error",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, error, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-10 w-full appearance-none rounded-lg border pl-3 pr-9 py-2 text-sm transition-colors duration-150 cursor-pointer",
          "border-gray-300 bg-white text-gray-900",
          "dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60 dark:disabled:bg-gray-800/50",
          error && "border-error focus:ring-error",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
