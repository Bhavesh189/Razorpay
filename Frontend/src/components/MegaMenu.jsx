import React, { useState } from 'react';
import { categoriesData } from '../data/categories';
import { useShop } from '../context/ShopContext';
import { ChevronRight, Sparkles, X } from 'lucide-react';

export const MegaMenu = ({ isMobileDrawerOpen, onCloseMobileDrawer }) => {
  const { 
    selectedCategory, 
    setSelectedCategory, 
    setSelectedSubCategory,
    setSearchQuery
  } = useShop();

  const [hoveredCategory, setHoveredCategory] = useState(null);

  const handleSelectCategory = (catSlug) => {
    setSelectedCategory(catSlug);
    setSelectedSubCategory("all");
    setSearchQuery("");
    setHoveredCategory(null);
    if (onCloseMobileDrawer) onCloseMobileDrawer();
    const el = document.getElementById('products-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectSubCategory = (catSlug, subItem) => {
    setSelectedCategory(catSlug);
    const cleanSub = subItem.replace(/^All\s+/i, '');
    setSelectedSubCategory(cleanSub);
    setSearchQuery("");
    setHoveredCategory(null);
    if (onCloseMobileDrawer) onCloseMobileDrawer();
    const el = document.getElementById('products-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* 1. Desktop Horizontal Category Nav List */}
      <nav className="relative bg-white border-b border-slate-200 z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          
          <div 
            className="flex items-center justify-between overflow-x-auto no-scrollbar py-0 text-sm font-medium text-slate-700"
            onMouseLeave={() => setHoveredCategory(null)}
          >
            {categoriesData.map((category) => {
              const isSelected = selectedCategory === category.slug;
              const isHovered = hoveredCategory?.id === category.id;

              return (
                <div
                  key={category.id}
                  onMouseEnter={() => setHoveredCategory(category)}
                  className="relative flex-shrink-0"
                >
                  <button
                    onClick={() => handleSelectCategory(category.slug)}
                    className={`py-3.5 px-3 lg:px-4 text-xs md:text-sm font-semibold transition-all flex items-center gap-1 border-b-2 whitespace-nowrap ${
                      isSelected || isHovered
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-700 hover:text-indigo-600'
                    }`}
                  >
                    {category.name}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mega Dropdown Panel */}
        {hoveredCategory && (
          <div 
            onMouseEnter={() => setHoveredCategory(hoveredCategory)}
            onMouseLeave={() => setHoveredCategory(null)}
            className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 mega-menu-shadow z-50 animate-in fade-in duration-150"
          >
            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
              
              {/* Header info in mega menu */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900">{hoveredCategory.name}</span>
                  <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-0.5 rounded-full font-bold">
                    50,000+ Deals
                  </span>
                </div>
                <button
                  onClick={() => handleSelectCategory(hoveredCategory.slug)}
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Explore All {hoveredCategory.name} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Grid of Columns */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {hoveredCategory.columns.map((col, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 pb-1 border-b border-indigo-100">
                      {col.title}
                    </h4>
                    <ul className="space-y-1.5 pt-1">
                      {col.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <button
                            onClick={() => handleSelectSubCategory(hoveredCategory.slug, item)}
                            className="text-xs text-slate-600 hover:text-indigo-600 hover:font-bold transition-colors text-left block w-full py-0.5 truncate"
                          >
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}
      </nav>

      {/* 2. Mobile Full Categories Drawer */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-4/5 max-w-sm bg-white h-full overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-base text-slate-900 font-['Outfit']">All Departments</span>
              <button onClick={onCloseMobileDrawer} className="p-1 rounded-full text-slate-500 hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {categoriesData.map(cat => (
                <div key={cat.id} className="border-b border-slate-100 pb-3">
                  <button
                    onClick={() => handleSelectCategory(cat.slug)}
                    className="w-full flex items-center justify-between text-sm font-bold text-slate-800 hover:text-indigo-600 py-1"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  if (onCloseMobileDrawer) onCloseMobileDrawer();
                }}
                className="w-full bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl shadow"
              >
                View All Products
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
