import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[96vw]',
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  footer,
  closeOnBackdrop = true,
  hideCloseButton = false,
  className,
}) {
  const panelRef = useRef(null);
  const lastFocused = useRef(null);

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKey);

    queueMicrotask(() => panelRef.current?.focus());

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = original;
      if (lastFocused.current && typeof lastFocused.current.focus === 'function') {
        lastFocused.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close dialog"
        onClick={() => closeOnBackdrop && onClose?.()}
        className="absolute inset-0 bg-gray-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in cursor-default"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative w-full max-h-[92vh] flex flex-col shadow-large rounded-t-2xl sm:rounded-2xl border outline-none animate-scale-in',
          'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800',
          sizes[size] || sizes.md,
          className
        )}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="min-w-0">
              {title && (
                <h2 id="modal-title" className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-50 leading-snug">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex-shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer -mr-2"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
