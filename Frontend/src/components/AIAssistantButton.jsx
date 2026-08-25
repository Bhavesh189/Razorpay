import React from 'react';
import { useShop } from '../context/ShopContext';
import { Sparkles, Bot } from 'lucide-react';

export const AIAssistantButton = () => {
  const { setActiveModal } = useShop();

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 sm:right-8 z-40 animate-in slide-in-from-bottom-5">
      <button
        onClick={() => setActiveModal('aiAssistant')}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#06b6d4] hover:from-[#4338ca] hover:to-[#0891b2] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/40 cursor-pointer"
        aria-label="Open AI Shopping Assistant"
      >
        {/* Glow Ping Ring */}
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-60 blur group-hover:opacity-100 transition-opacity animate-pulse"></span>

        <div className="relative flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
          </div>
          <span className="text-xs sm:text-sm font-black font-['Outfit'] tracking-wide hidden xs:inline-block">
            Ask AI Agent
          </span>
          <span className="hidden sm:inline-block text-[10px] bg-yellow-300 text-slate-950 font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
            AI 2.0
          </span>
        </div>
      </button>
    </div>
  );
};
