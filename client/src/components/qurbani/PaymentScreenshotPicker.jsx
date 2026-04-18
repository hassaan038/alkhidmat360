import { useEffect } from 'react';
import { Camera, X as XIcon } from 'lucide-react';

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
 */
export default function PaymentScreenshotPicker({
  file,
  previewUrl,
  onChange,
  onClear,
  disabled = false,
}) {
  // Free up the object URL when the preview changes / unmounts.
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
      <p className="text-sm font-medium text-gray-700 mb-1">
        Payment Screenshot{' '}
        <span className="text-xs font-normal text-gray-500">(optional)</span>
      </p>
      <p className="text-xs text-gray-500 mb-2">
        Attach a screenshot of your bank transfer to help admins verify faster.
      </p>

      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Payment screenshot"
            className="w-full max-h-56 object-contain rounded-lg border border-gray-200 bg-gray-50"
          />
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md rounded-full p-1.5 text-gray-700 disabled:opacity-50"
            aria-label="Remove screenshot"
          >
            <XIcon className="w-4 h-4" />
          </button>
          {file?.name && (
            <p className="text-[11px] text-gray-500 mt-1 truncate">{file.name}</p>
          )}
        </div>
      ) : (
        <label
          htmlFor="payment-screenshot"
          className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition ${
            disabled ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <Camera className="w-5 h-5 text-gray-400 mb-1" />
          <span className="text-sm text-gray-600">Tap to attach a screenshot</span>
          <span className="text-xs text-gray-400 mt-0.5">JPG / PNG, up to 5 MB</span>
          <input
            id="payment-screenshot"
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
