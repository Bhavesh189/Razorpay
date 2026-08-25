import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';

export const SafeImage = ({ 
  src, 
  alt = "Product Image", 
  className = "w-full h-full object-cover", 
  fallbackSrc,
  fallbackCategory = "Fashion"
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Reliable backup placeholder
  const defaultFallback = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 flex items-center justify-center">
      {/* Loading Skeleton Shimmer */}
      {!loaded && !error && (
        <div className="absolute inset-0 skeleton-shimmer z-0" />
      )}

      {/* Render Image or Fallback */}
      {!error ? (
        <img
          src={src || fallbackSrc || defaultFallback}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      ) : (
        /* Graceful Styled Infinity SVG Fallback */
        <div className="w-full h-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-3 text-center">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-1 shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 line-clamp-1">{alt}</span>
          <span className="text-[9px] text-indigo-600 font-semibold uppercase tracking-wider mt-0.5">Infinity Store</span>
        </div>
      )}
    </div>
  );
};
