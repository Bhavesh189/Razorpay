import React from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Filter, 
  RotateCcw, 
  Star, 
  Sparkles, 
  Check, 
  ChevronDown 
} from 'lucide-react';

export const FilterSidebar = () => {
  const { filters, setFilters, resetFilters } = useShop();

  const priceRanges = [
    { label: "All Prices", value: "all" },
    { label: "Under ₹199", value: "0-199" },
    { label: "₹200 - ₹499", value: "200-499" },
    { label: "₹500 - ₹999", value: "500-999" },
    { label: "₹1000 and Above", value: "1000+" }
  ];

  const ratingOptions = [
    { label: "All Ratings", value: 0 },
    { label: "4.0 ★ and above", value: 4.0 },
    { label: "3.5 ★ and above", value: 3.5 },
    { label: "3.0 ★ and above", value: 3.0 }
  ];

  const discountOptions = [
    { label: "All Discounts", value: 0 },
    { label: "50% or more", value: 50 },
    { label: "60% or more", value: 60 },
    { label: "70% or more", value: 70 }
  ];

  const genderOptions = [
    { label: "All Genders", value: "all" },
    { label: "Women", value: "Women" },
    { label: "Men", value: "Men" },
    { label: "Girls", value: "Girls" },
    { label: "Boys", value: "Boys" }
  ];

  const colorOptions = [
    "all", "Black", "White", "Blue", "Pink", "Red", "Green", "Yellow", "Maroon", "Grey"
  ];

  const sizeOptions = [
    "all", "XS", "S", "M", "L", "XL", "XXL", "Free Size"
  ];

  return (
    <aside className="bg-[#13131a] border border-[#2a2a3a] rounded-3xl p-4 sm:p-5 shadow-xl shadow-black/20 space-y-6">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-200 font-['Outfit']">Filters</h3>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* 2. Infinity Mall Toggle */}
      <div className="p-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <div>
            <span className="text-xs font-bold text-indigo-300 block">Infinity Mall</span>
            <span className="text-[10px] text-slate-500">100% Verified Quality</span>
          </div>
        </div>
        <input
          type="checkbox"
          checked={filters.onlyInfinityMall}
          onChange={(e) => setFilters(prev => ({ ...prev, onlyInfinityMall: e.target.checked }))}
          className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
        />
      </div>

      {/* 3. Gender */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Gender
        </h4>
        <div className="space-y-1.5">
          {genderOptions.map((g) => (
            <label
              key={g.value}
              className="flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 cursor-pointer py-0.5"
            >
              <span>{g.label}</span>
              <input
                type="radio"
                name="genderFilter"
                checked={filters.gender === g.value}
                onChange={() => setFilters(prev => ({ ...prev, gender: g.value }))}
                className="accent-indigo-600 w-3.5 h-3.5 cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>

      {/* 4. Price */}
      <div className="space-y-2.5 pt-3 border-t border-[#2a2a3a]">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Price
        </h4>
        <div className="space-y-1.5">
          {priceRanges.map((p) => (
            <label
              key={p.value}
              className="flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 cursor-pointer py-0.5"
            >
              <span>{p.label}</span>
              <input
                type="radio"
                name="priceFilter"
                checked={filters.priceRange === p.value}
                onChange={() => setFilters(prev => ({ ...prev, priceRange: p.value }))}
                className="accent-indigo-600 w-3.5 h-3.5 cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>

      {/* 5. Ratings */}
      <div className="space-y-2.5 pt-3 border-t border-[#2a2a3a]">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Rating
        </h4>
        <div className="space-y-1.5">
          {ratingOptions.map((r) => (
            <label
              key={r.value}
              className="flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 cursor-pointer py-0.5"
            >
              <div className="flex items-center gap-1">
                <span>{r.label}</span>
              </div>
              <input
                type="radio"
                name="ratingFilter"
                checked={filters.minRating === r.value}
                onChange={() => setFilters(prev => ({ ...prev, minRating: r.value }))}
                className="accent-indigo-600 w-3.5 h-3.5 cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>

      {/* 6. Discount */}
      <div className="space-y-2.5 pt-3 border-t border-[#2a2a3a]">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Discount
        </h4>
        <div className="space-y-1.5">
          {discountOptions.map((d) => (
            <label
              key={d.value}
              className="flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 cursor-pointer py-0.5"
            >
              <span>{d.label}</span>
              <input
                type="radio"
                name="discountFilter"
                checked={filters.minDiscount === d.value}
                onChange={() => setFilters(prev => ({ ...prev, minDiscount: d.value }))}
                className="accent-indigo-600 w-3.5 h-3.5 cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>

      {/* 7. Colors */}
      <div className="space-y-2.5 pt-3 border-t border-[#2a2a3a]">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Colors
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {colorOptions.map((c) => (
            <button
              key={c}
              onClick={() => setFilters(prev => ({ ...prev, color: c }))}
              className={`text-xs px-2.5 py-1 rounded-xl border transition-all ${
                filters.color === c
                  ? 'border-amber-500/60 bg-amber-500/10 text-amber-300 font-bold shadow-sm'
                  : 'border-[#2a2a3a] text-slate-400 hover:border-amber-500/40 hover:text-slate-200'
              }`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      </div>

      {/* 8. Sizes */}
      <div className="space-y-2.5 pt-3 border-t border-[#2a2a3a]">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Sizes
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {sizeOptions.map((s) => (
            <button
              key={s}
              onClick={() => setFilters(prev => ({ ...prev, size: s }))}
              className={`text-xs px-2.5 py-1 rounded-xl border transition-all ${
                filters.size === s
                  ? 'border-amber-500/60 bg-amber-500/10 text-amber-300 font-bold shadow-sm'
                  : 'border-[#2a2a3a] text-slate-400 hover:border-amber-500/40 hover:text-slate-200'
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

    </aside>
  );
};
