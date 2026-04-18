import { cn } from "../../lib/utils";

export default function Label({ className, children, htmlFor, required, ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium leading-none text-gray-700 dark:text-gray-300",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-error ml-1">*</span>}
    </label>
  );
}
