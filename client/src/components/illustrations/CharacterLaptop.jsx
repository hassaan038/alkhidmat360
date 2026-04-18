export default function CharacterLaptop({ size = 'default', className = '' }) {
  const sizes = {
    small: 'h-32 w-32',
    default: 'h-48 w-48',
    large: 'h-64 w-64'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        {/* Laptop */}
        <rect x="60" y="130" width="80" height="50" rx="2" fill="#64748b" opacity="0.9"/>
        <rect x="65" y="135" width="70" height="35" fill="#e0f2fe"/>
        {/* Body (sitting) */}
        <ellipse cx="100" cy="110" rx="25" ry="35" fill="#3b82f6" opacity="0.9"/>
        {/* Head */}
        <circle cx="100" cy="65" r="25" fill="#fbbf24" opacity="0.9"/>
        {/* Arms on laptop */}
        <path d="M 75 90 L 70 130" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" opacity="0.9"/>
        <path d="M 125 90 L 130 130" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" opacity="0.9"/>
        {/* Face */}
        <circle cx="92" cy="63" r="2.5" fill="#1e293b"/>
        <circle cx="108" cy="63" r="2.5" fill="#1e293b"/>
        <path d="M 90 73 Q 100 78 110 73" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}
