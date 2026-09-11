import React from 'react';
import { storyCategories } from '../data/categories';
import { useShop } from '../context/ShopContext';
import { SafeImage } from './SafeImage';

export const CategoryStories = () => {
  const { selectedCategory, setSelectedCategory, setSelectedSubCategory, setSearchQuery } = useShop();

  const handleCategoryClick = (catSlug) => {
    setSelectedCategory(catSlug);
    setSelectedSubCategory("all");
    setSearchQuery("");
    const el = document.getElementById('products-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-2">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h2 className="text-sm sm:text-lg font-bold text-slate-200 font-['Outfit']">
            Top Categories to Explore
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Scroll to see more →
          </span>
        </div>

        {/* Stories Horizontal Row */}
        <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar py-2 px-1">
          {/* 'All' circle */}
          <div
            onClick={() => handleCategoryClick("all")}
            className="flex flex-col items-center gap-1.5 sm:gap-2 flex-shrink-0 cursor-pointer group"
          >
            <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full p-0.5 sm:p-1 transition-all ${
              selectedCategory === "all"
                ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#0a0a0f] scale-105 shadow-md shadow-amber-500/20'
                : 'border border-[#2a2a3a] group-hover:border-amber-500/50 group-hover:scale-105'
            }`}>
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-cyan-500 flex items-center justify-center text-black font-extrabold text-xs sm:text-sm shadow-inner">
                All
              </div>
            </div>
            <span className={`text-[11px] sm:text-xs text-center font-semibold ${
              selectedCategory === "all" ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}>
              All Items
            </span>
          </div>

          {/* Individual Category Avatars */}
          {storyCategories.map((item) => {
            const isSelected = selectedCategory === item.category;

            return (
              <div
                key={item.id}
                onClick={() => handleCategoryClick(item.category)}
                className="flex flex-col items-center gap-1.5 sm:gap-2 flex-shrink-0 cursor-pointer group"
              >
                <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full p-0.5 transition-all overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#0a0a0f] scale-105 shadow-md shadow-amber-500/20'
                    : 'border border-[#2a2a3a] group-hover:border-amber-500/50 group-hover:scale-105'
                }`}>
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <SafeImage
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
                <span className={`text-[11px] sm:text-xs text-center font-medium max-w-[70px] sm:max-w-[80px] truncate ${
                  isSelected ? 'text-amber-400 font-bold' : 'text-slate-400 group-hover:text-amber-400'
                }`}>
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
