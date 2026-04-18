/**
 * AnimatedBull — placeholder illustration for qurbani listings without a photo.
 * Stylised bull silhouette with a gentle bobbing motion + soft grass underneath.
 */
export default function AnimatedBull({ className = '' }) {
  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 ${className}`}
    >
      {/* Soft pasture base */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-emerald-100 to-transparent" />

      {/* Sun */}
      <div className="absolute top-4 right-5 w-10 h-10 rounded-full bg-amber-200/70 blur-md" />
      <div className="absolute top-5 right-6 w-7 h-7 rounded-full bg-amber-300/80" />

      {/* Bull */}
      <div className="absolute inset-0 flex items-end justify-center pb-6">
        <svg
          viewBox="0 0 200 140"
          className="w-2/3 h-2/3 drop-shadow-md animate-float"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Animated bull illustration"
        >
          {/* Body */}
          <ellipse cx="100" cy="80" rx="55" ry="32" fill="#1f2937" />

          {/* Back hump */}
          <ellipse cx="80" cy="55" rx="22" ry="14" fill="#1f2937" />

          {/* Head */}
          <ellipse cx="155" cy="62" rx="22" ry="20" fill="#1f2937" />

          {/* Snout */}
          <ellipse cx="172" cy="72" rx="11" ry="8" fill="#9ca3af" />
          <circle cx="170" cy="70" r="1.5" fill="#1f2937" />
          <circle cx="175" cy="73" r="1.5" fill="#1f2937" />

          {/* Eye */}
          <circle cx="160" cy="55" r="2.2" fill="#fff" />
          <circle cx="160.5" cy="55.5" r="1.2" fill="#1f2937" />

          {/* Horns */}
          <path
            d="M148 47 Q142 36 134 38 Q140 44 148 49 Z"
            fill="#f5f5f4"
            stroke="#a8a29e"
            strokeWidth="0.8"
          />
          <path
            d="M165 47 Q172 36 180 38 Q174 44 166 49 Z"
            fill="#f5f5f4"
            stroke="#a8a29e"
            strokeWidth="0.8"
          />

          {/* Ear */}
          <ellipse cx="142" cy="52" rx="5" ry="3" fill="#374151" transform="rotate(-25 142 52)" />

          {/* Legs */}
          <rect x="58" y="100" width="10" height="28" rx="2" fill="#1f2937" />
          <rect x="78" y="100" width="10" height="28" rx="2" fill="#1f2937" />
          <rect x="115" y="100" width="10" height="28" rx="2" fill="#1f2937" />
          <rect x="135" y="100" width="10" height="28" rx="2" fill="#1f2937" />

          {/* Hooves */}
          <rect x="57" y="125" width="12" height="4" rx="1" fill="#0f172a" />
          <rect x="77" y="125" width="12" height="4" rx="1" fill="#0f172a" />
          <rect x="114" y="125" width="12" height="4" rx="1" fill="#0f172a" />
          <rect x="134" y="125" width="12" height="4" rx="1" fill="#0f172a" />

          {/* Tail with subtle wag */}
          <g style={{ transformOrigin: '48px 70px' }} className="animate-pulse-slow">
            <path
              d="M48 70 Q35 78 32 95 L36 96 Q40 82 50 76 Z"
              fill="#1f2937"
            />
          </g>

          {/* Nose ring */}
          <circle cx="172" cy="78" r="2.5" fill="none" stroke="#fbbf24" strokeWidth="1.2" />
        </svg>
      </div>

    </div>
  );
}
