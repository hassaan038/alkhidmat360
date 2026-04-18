export default function CharacterProfessional({ size = 'default', className = '' }) {
  const sizes = {
    small: 'h-32 w-32',
    default: 'h-48 w-48',
    large: 'h-64 w-64'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        {/* Body (professional attire) */}
        <ellipse cx="100" cy="135" rx="28" ry="42" fill="#1e40af" opacity="0.9"/>
        {/* Tie */}
        <path d="M 100 95 L 95 125 L 100 135 L 105 125 Z" fill="#dc2626" opacity="0.9"/>
        {/* Head */}
        <circle cx="100" cy="70" r="28" fill="#fbbf24" opacity="0.9"/>
        {/* Arms (confident pose) */}
        <path d="M 72 110 L 55 130" stroke="#1e40af" strokeWidth="7" strokeLinecap="round" opacity="0.9"/>
        <path d="M 128 110 L 145 130" stroke="#1e40af" strokeWidth="7" strokeLinecap="round" opacity="0.9"/>
        {/* Legs */}
        <path d="M 88 175 L 88 195" stroke="#1e40af" strokeWidth="7" strokeLinecap="round" opacity="0.9"/>
        <path d="M 112 175 L 112 195" stroke="#1e40af" strokeWidth="7" strokeLinecap="round" opacity="0.9"/>
        {/* Face */}
        <circle cx="92" cy="68" r="3" fill="#1e293b"/>
        <circle cx="108" cy="68" r="3" fill="#1e293b"/>
        <path d="M 90 80 Q 100 82 110 80" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}
