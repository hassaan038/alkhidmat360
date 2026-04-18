import { useEffect, useId } from 'react';
import { Camera, X as XIcon, ImagePlus } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * PaymentScreenshotPicker — optional file picker used inside payment
 * modals (qurbani booking, fitrana, mark-paid).
 *
 * Controlled component: parent owns the File + preview URL state. We just
 * render the trigger / preview and call the setters. Parent is responsible
 * for revoking the object URL on unmount.
 *
 * Props:
 *  - file: File | null
 *  - previewUrl: string | null
 *  - onChange: (file: File | null) => void
 *  - onClear: () => void
 *  - disabled?: boolean
 *  - label?: string   (default: 'Payment screenshot')
 */
export default function PaymentScreenshotPicker({
  file,
  previewUrl,
  onChange,
  onClear,
  disabled = false,
  label = 'Payment screenshot',
}) {
  const inputId = useId();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (e) => {
    const f = e.target.files?.[0] || null;
    onChange?.(f);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label} <span className="text-xs font-normal text-gray-400">(optional)</span>
        </label>
        {previewUrl && !disabled && (
          <label
            htmlFor={inputId}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 cursor-pointer"
          >
            <ImagePlus className="w-3 h-3" /> Replace
          </label>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-2">
        Attach a screenshot of your bank transfer to help admins verify faster.
      </p>

      {previewUrl ? (
        <div className="relative rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-2 shadow-inner-subtle">
          <img
            src={previewUrl}
            alt="Payment screenshot"
            className="w-full max-h-60 object-contain rounded-lg"
          />
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Remove screenshot"
          >
            <XIcon className="w-4 h-4" />
          </button>
          {file?.name && (
            <p className="text-[11px] text-gray-500 mt-2 px-1 truncate">{file.name}</p>
          )}
          <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={disabled}
            className="hidden"
          />
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={cn(
            'group flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed transition-colors cursor-pointer',
            'border-gray-300 bg-gradient-to-br from-gray-50 to-white hover:border-primary-400 hover:from-primary-50/60 hover:to-primary-50/30',
            disabled && 'opacity-50 pointer-events-none'
          )}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 ring-4 ring-primary-50/60 mb-2 transition-transform group-hover:-translate-y-0.5">
            <Camera className="w-5 h-5" />
          </span>
          <span className="text-sm font-medium text-gray-700">Tap to attach a screenshot</span>
          <span className="text-xs text-gray-400 mt-0.5">JPG / PNG, up to 5 MB</span>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={disabled}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
