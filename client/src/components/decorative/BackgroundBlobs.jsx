export default function BackgroundBlobs({ variant = 'default' }) {
  const variants = {
    default: {
      primary: 'bg-blue-400/20',
      secondary: 'bg-cyan-300/15',
      tertiary: 'bg-indigo-400/10'
    },
    vibrant: {
      primary: 'bg-indigo-400/25',
      secondary: 'bg-blue-400/20',
      tertiary: 'bg-cyan-400/15'
    }
  };

  const colors = variants[variant] || variants.default;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top-left blob */}
      <div
        className={`absolute -top-24 -left-24 w-96 h-96 ${colors.primary} rounded-full blur-3xl animate-pulse-slow`}
      />

      {/* Bottom-right blob */}
      <div
        className={`absolute -bottom-24 -right-24 w-80 h-80 ${colors.secondary} rounded-full blur-3xl animate-pulse-slow`}
        style={{ animationDelay: '1s' }}
      />

      {/* Center blob */}
      <div
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${colors.tertiary} rounded-full blur-3xl animate-pulse-slow`}
        style={{ animationDelay: '2s' }}
      />
    </div>
  );
}
