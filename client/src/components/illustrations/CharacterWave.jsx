export default function CharacterWave({ size = 'default', className = '' }) {
  const sizes = {
    small: 'h-32 w-32',
    default: 'h-64 w-64',
    large: 'h-96 w-96'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        {/* Body */}
        <ellipse cx="100" cy="140" rx="30" ry="45" fill="#3b82f6" opacity="0.9"/>
        {/* Head */}
        <circle cx="100" cy="70" r="30" fill="#fbbf24" opacity="0.9"/>
        {/* Waving arm */}
        <path d="M 130 100 Q 150 80 160 70" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" opacity="0.9"/>
        {/* Other arm */}
        <path d="M 70 100 L 60 120" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" opacity="0.9"/>
        {/* Legs */}
        <path d="M 85 180 L 85 200" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" opacity="0.9"/>
        <path d="M 115 180 L 115 200" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" opacity="0.9"/>
        {/* Face */}
        <circle cx="92" cy="68" r="3" fill="#1e293b"/>
        <circle cx="108" cy="68" r="3" fill="#1e293b"/>
        <path d="M 90 80 Q 100 85 110 80" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}
