import React from 'react';
import { useShop } from '../context/ShopContext';
import { Sparkles, Bot } from 'lucide-react';

export const AIAssistantButton = () => {
  const { setActiveModal } = useShop();

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 sm:right-8 z-40 animate-in slide-in-from-bottom-5">
      <button
        onClick={() => setActiveModal('aiAssistant')}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-amber-600 via-orange-600 to-orange-700 hover:from-amber-500 hover:via-orange-500 hover:to-orange-600 text-white p-2.5 sm:px-5 sm:py-3 rounded-full shadow-[0_10px_30px_rgba(245,158,11,0.4)] hover:shadow-[0_12px_36px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/80 ring-2 ring-amber-300/40 cursor-pointer"
        aria-label="Open AI Shopping Assistant"
      >
        {/* Glow Ping Ring */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 opacity-40 blur-md group-hover:opacity-80 transition-opacity animate-pulse"></span>

        <div className="relative flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-orange-600 animate-spin" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold font-['Outfit'] tracking-wide">
            Ask AI
          </span>
          <span className="hidden sm:inline-block text-[10px] bg-white text-orange-700 font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
            Agent
          </span>
        </div>
      </button>
    </div>
  );
};
