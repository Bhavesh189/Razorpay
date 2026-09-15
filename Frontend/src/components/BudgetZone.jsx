import React from 'react';
import { budgetDeals } from '../data/banners';
import { useShop } from '../context/ShopContext';
import { Sparkles, ArrowRight, Tag, Store } from 'lucide-react';

export const BudgetZone = () => {
  const { filters, setFilters, setActiveModal } = useShop();

  const handlePriceClick = (maxPrice) => {
    let range = "all";
    if (maxPrice === 99) range = "0-199";
    else if (maxPrice === 199) range = "0-199";
    else if (maxPrice === 299) range = "200-499";
    else if (maxPrice === 499) range = "200-499";

    setFilters(prev => ({ ...prev, priceRange: range }));
    const el = document.getElementById('products-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-2 sm:py-4">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 space-y-4">
        
        {/* 1. Budget Store Strip */}
        <div className="bg-[#13131a] border border-[#1e1e2e] rounded-3xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                Budget Deals
              </div>
              <h3 className="text-base sm:text-xl font-extrabold text-slate-200 font-['Outfit']">
                Explore Deals By Price Point
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Lowest prices with Free Delivery</span>
          </div>

          {/* 4 Price Deal Boxes (2-col on mobile, 4-col on tablet/desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            {budgetDeals.map((deal, idx) => (
                <div
                key={idx}
                onClick={() => handlePriceClick(deal.maxPrice)}
                className="bg-[#0d0d14] border border-[#1e1e2e] hover:border-amber-500/30 rounded-2xl p-3.5 sm:p-4 cursor-pointer hover:shadow-md hover:shadow-amber-500/5 transition-all group relative overflow-hidden active:scale-98"
              >
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md inline-block mb-1.5 border border-amber-500/20">
                  {deal.tag}
                </div>
                <div className="text-base sm:text-xl font-black text-white group-hover:text-amber-400 transition-colors font-['Outfit']">
                  {deal.label}
                </div>
                <div className="mt-2 mb-1 text-[10px] text-slate-500 font-medium">
                  Curated products in this price range
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-amber-400 font-semibold">
                  <span>Shop now</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Infinity Store Supplier Banner */}
        <div className="bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white rounded-3xl p-5 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left border border-white/5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Store className="w-4 h-4" />
              Grow Your Business
            </div>
            <h3 className="text-lg sm:text-2xl font-black font-['Outfit']">
              Sell Your Products Online at 0% Commission
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Join 11 Lakh+ successful Indian sellers reaching 14 Crore+ active customers across India on Infinity Store.
            </p>
          </div>

          <button
            onClick={() => setActiveModal('supplier')}
            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-amber-500/20 transition-all flex-shrink-0 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            Start Selling Free
          </button>
        </div>

      </div>
    </section>
  );
};
