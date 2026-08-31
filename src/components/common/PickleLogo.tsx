import React from 'react';

interface PickleLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGlow?: boolean;
}

export const PickleLogo: React.FC<PickleLogoProps> = ({
  size = 'md',
  className = '',
  showGlow = true,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const dim = sizeMap[size] || 'w-10 h-10';

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${dim} ${className}`}>
      {/* Background Neon Glow */}
      {showGlow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-pickle-lime via-emerald-400 to-cyan-400 opacity-40 blur-md -z-10 animate-pulse-slow"></div>
      )}

      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="50%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#070B14" />
          </linearGradient>

          <linearGradient id="limeNeon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7FEE7" />
            <stop offset="30%" stopColor="#D4FF00" />
            <stop offset="100%" stopColor="#84CC16" />
          </linearGradient>

          <linearGradient id="coralGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8A00" />
            <stop offset="100%" stopColor="#FF5E36" />
          </linearGradient>

          <linearGradient id="paddleLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          <linearGradient id="paddleRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4FF00" />
            <stop offset="100%" stopColor="#A3E635" />
          </linearGradient>

          <filter id="neonFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D4FF00" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer Rounded Hex/Shield Base */}
        <rect
          x="6"
          y="6"
          width="108"
          height="108"
          rx="28"
          fill="url(#shieldGrad)"
          stroke="url(#limeNeon)"
          strokeWidth="3.5"
        />

        {/* Subtle inner grid lines */}
        <path
          d="M20 60 H100 M60 20 V100"
          stroke="#334155"
          strokeWidth="1"
          strokeDasharray="3 3"
          strokeOpacity="0.5"
        />

        {/* Crossed Paddle 1 (Left - Cyan/Navy) */}
        <g transform="rotate(-30 60 60)">
          {/* Paddle Face */}
          <rect
            x="48"
            y="22"
            width="24"
            height="34"
            rx="8"
            fill="#0F172A"
            stroke="url(#paddleLeft)"
            strokeWidth="3"
          />
          {/* Paddle Grip / Handle */}
          <path d="M58 56 V88" stroke="#E2E8F0" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M56 64 H64 M56 72 H64 M56 80 H64" stroke="#64748B" strokeWidth="1.5" />
        </g>

        {/* Crossed Paddle 2 (Right - Neon Lime/Navy) */}
        <g transform="rotate(30 60 60)">
          {/* Paddle Face */}
          <rect
            x="48"
            y="22"
            width="24"
            height="34"
            rx="8"
            fill="#0F172A"
            stroke="url(#paddleRight)"
            strokeWidth="3"
          />
          {/* Paddle Grip / Handle */}
          <path d="M58 56 V88" stroke="#E2E8F0" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M56 64 H64 M56 72 H64 M56 80 H64" stroke="#64748B" strokeWidth="1.5" />
        </g>

        {/* Center Glowing Pickleball */}
        <g filter="url(#neonFilter)">
          <circle cx="60" cy="58" r="22" fill="url(#limeNeon)" stroke="#4D7C0F" strokeWidth="1.5" />
          {/* 3D Ball Shadow / highlight */}
          <circle cx="53" cy="51" r="5" fill="#FFFFFF" fillOpacity="0.6" />
          {/* Signature Pickleball Holes */}
          <circle cx="60" cy="46" r="2.8" fill="#1E293B" />
          <circle cx="60" cy="70" r="2.8" fill="#1E293B" />
          <circle cx="48" cy="58" r="2.8" fill="#1E293B" />
          <circle cx="72" cy="58" r="2.8" fill="#1E293B" />
          <circle cx="51" cy="49" r="2.4" fill="#1E293B" />
          <circle cx="69" cy="49" r="2.4" fill="#1E293B" />
          <circle cx="51" cy="67" r="2.4" fill="#1E293B" />
          <circle cx="69" cy="67" r="2.4" fill="#1E293B" />
          <circle cx="60" cy="58" r="3.2" fill="#0F172A" />
        </g>

        {/* Dynamic Stylized Star / Sparkle in corner */}
        <path
          d="M96 22 L98 27 L103 29 L98 31 L96 36 L94 31 L89 29 L94 27 Z"
          fill="url(#coralGlow)"
        />
        <circle cx="96" cy="29" r="1.5" fill="#FFF" />
      </svg>
    </div>
  );
};
