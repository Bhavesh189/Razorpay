import React from 'react';

export const InfinityLogo = ({ className = "h-9", onClick }) => {
  return (
    <div 
      onClick={onClick} 
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
    >
      {/* Modern Gradient Infinity Icon */}
      <svg 
        viewBox="0 0 100 100" 
        className="h-full w-auto aspect-square drop-shadow-md transition-all group-hover:scale-105 group-hover:drop-shadow-lg"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="infinityBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="loopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0a0a0f" />
            <stop offset="100%" stopColor="#1a1a2e" />
          </linearGradient>
        </defs>
        
        {/* Dark Background with Gold Border */}
        <rect width="100" height="100" rx="26" fill="url(#loopGrad)" />
        
        {/* Subtle gold inner border */}
        <rect x="3" y="3" width="94" height="94" rx="23" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.35" fill="none" />
        
        {/* Stylized Sleek Infinity Loop Path — Gold */}
        <path 
          d="M32 50 C20 32, 10 68, 32 68 C44 68, 56 32, 68 32 C90 32, 80 68, 68 68 C56 68, 44 32, 32 32 C10 32, 20 68, 32 50 Z" 
          stroke="url(#infinityBrandGrad)" 
          strokeWidth="9" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Sparkle Accent Dot */}
        <circle cx="50" cy="50" r="4.5" fill="#06b6d4" />
      </svg>

      {/* Infinity Store Typography */}
      <div className="flex flex-col justify-center leading-none">
        <span className="font-['Outfit'] font-black text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-amber-400 via-amber-500 to-cyan-400 bg-clip-text text-transparent">
          Infinity
        </span>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 -mt-0.5 flex items-center gap-1">
          Store <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
        </span>
      </div>
    </div>
  );
};

export default InfinityLogo;

