export function SbcLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6600" />
          <stop offset="100%" stopColor="#00CC66" />
        </linearGradient>
        <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8833" />
          <stop offset="100%" stopColor="#33DD88" />
        </linearGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="50" cy="50" r="48" stroke="url(#coinGrad)" strokeWidth="3" fill="none" />
      {/* Inner circle */}
      <circle cx="50" cy="50" r="40" fill="#1A1A1A" stroke="url(#innerGrad)" strokeWidth="1.5" />
      {/* Blockchain node dots */}
      <circle cx="50" cy="15" r="2.5" fill="url(#coinGrad)" opacity="0.6" />
      <circle cx="80" cy="30" r="2" fill="url(#coinGrad)" opacity="0.4" />
      <circle cx="85" cy="55" r="2" fill="url(#coinGrad)" opacity="0.5" />
      <circle cx="20" cy="30" r="2" fill="url(#coinGrad)" opacity="0.4" />
      <circle cx="15" cy="55" r="2" fill="url(#coinGrad)" opacity="0.5" />
      <circle cx="50" cy="85" r="2.5" fill="url(#coinGrad)" opacity="0.6" />
      {/* Node connection lines */}
      <line x1="50" y1="15" x2="80" y2="30" stroke="url(#coinGrad)" strokeWidth="0.5" opacity="0.3" />
      <line x1="80" y1="30" x2="85" y2="55" stroke="url(#coinGrad)" strokeWidth="0.5" opacity="0.3" />
      <line x1="50" y1="15" x2="20" y2="30" stroke="url(#coinGrad)" strokeWidth="0.5" opacity="0.3" />
      <line x1="20" y1="30" x2="15" y2="55" stroke="url(#coinGrad)" strokeWidth="0.5" opacity="0.3" />
      {/* sBC text */}
      <text x="50" y="56" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="22" fill="url(#coinGrad)">
        sBC
      </text>
    </svg>
  );
}

export function SbcFavicon() {
  return (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#1A1A1A" stroke="#FF6600" strokeWidth="4" />
      <text x="50" y="58" textAnchor="middle" fontFamily="sans-serif" fontWeight="700" fontSize="28" fill="#FF6600">
        sBC
      </text>
    </svg>
  );
}
