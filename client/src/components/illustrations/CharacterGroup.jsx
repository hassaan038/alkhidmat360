export default function CharacterGroup({ size = 'default', className = '' }) {
  const sizes = {
    small: 'h-32 w-32',
    default: 'h-48 w-48',
    large: 'h-64 w-64'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        {/* Left person */}
        <circle cx="60" cy="70" r="20" fill="#fbbf24" opacity="0.9"/>
        <ellipse cx="60" cy="120" rx="20" ry="35" fill="#3b82f6" opacity="0.9"/>

        {/* Center person (taller) */}
        <circle cx="100" cy="60" r="22" fill="#fbbf24" opacity="0.9"/>
        <ellipse cx="100" cy="115" rx="22" ry="40" fill="#2563eb" opacity="0.9"/>

        {/* Right person */}
        <circle cx="140" cy="75" r="18" fill="#fbbf24" opacity="0.9"/>
        <ellipse cx="140" cy="120" rx="18" ry="32" fill="#3b82f6" opacity="0.9"/>

        {/* Faces */}
        <circle cx="55" cy="68" r="2" fill="#1e293b"/>
        <circle cx="65" cy="68" r="2" fill="#1e293b"/>
        <circle cx="95" cy="58" r="2" fill="#1e293b"/>
        <circle cx="105" cy="58" r="2" fill="#1e293b"/>
        <circle cx="136" cy="73" r="2" fill="#1e293b"/>
        <circle cx="144" cy="73" r="2" fill="#1e293b"/>
      </svg>
    </div>
  );
}
