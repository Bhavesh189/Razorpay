import React from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { ArrowUpDown, PackageOpen, Sparkles, SlidersHorizontal, RefreshCw, ChevronDown } from 'lucide-react';

export const ProductGrid = () => {
  const { 
    filteredProducts, 
    selectedCategory, 
    selectedSubCategory, 
    searchQuery, 
    setSearchQuery,
    searchDidYouMean,
    filters, 
    setFilters, 
    resetFilters,
    isProductsLoading,
    currentPage,
    totalPages,
    totalCatalogCount,
    loadMoreProducts 
  } = useShop();

  const getHeading = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (selectedSubCategory !== "all") return `${selectedSubCategory}`;
    if (selectedCategory !== "all") return `${selectedCategory.replace('-', ' ').toUpperCase()}`;
    return "100,000+ Products For You";
  };

  return (
    <section id="products-section" className="space-y-4">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#13131a] border border-[#1e1e2e] rounded-2xl p-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-200 capitalize font-['Outfit'] flex items-center gap-2">
            <span>{getHeading()}</span>
            {filters.onlyInfinityMall && (
              <span className="text-xs bg-amber-500/10 text-amber-400 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/20">
                <Sparkles className="w-3 h-3 text-amber-500" /> Infinity Mall
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {filteredProducts.length} of {totalCatalogCount.toLocaleString()} items with Free Delivery & Lowest Prices
          </p>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Sort by:</span>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="text-xs font-semibold text-slate-300 bg-[#1e1e2e] border border-[#2a2a3a] rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Did You Mean Suggestion Banner */}
      {searchDidYouMean && searchQuery && searchDidYouMean.toLowerCase() !== searchQuery.toLowerCase().trim() && (
        <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-2xl p-3 px-4 flex items-center justify-between text-xs text-amber-200 animate-fade-in">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-amber-300">Did you mean:</span>
            <button
              onClick={() => setSearchQuery(searchDidYouMean)}
              className="font-bold underline text-amber-400 hover:text-amber-300 cursor-pointer bg-[#1e1e2e] px-2 py-0.5 rounded-lg border border-amber-500/20 shadow-xs hover:shadow-sm transition-all"
            >
              "{searchDidYouMean}"
            </button>
            <span className="text-amber-700/90 hidden sm:inline">Showing closest matching products from our catalog.</span>
          </div>
        </div>
      )}

      {/* 2. Products Grid (Responsive 2 cols on mobile, 3 on md, 4 on xl) */}
      {filteredProducts.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load More Button for 100,000+ Catalog */}
          {currentPage < totalPages && (
            <div className="pt-4 text-center">
              <button
                onClick={loadMoreProducts}
                disabled={isProductsLoading}
                className="bg-[#13131a] hover:bg-[#1e1e2e] border-2 border-amber-500/60 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-black px-8 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {isProductsLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Loading more deals...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Products (Page {currentPage} of {totalPages})</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#13131a] border border-[#2a2a3a] rounded-3xl p-12 text-center space-y-4 shadow-xl shadow-black/20">
          <div className="w-16 h-16 bg-indigo-500/10 text-indigo-300 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <PackageOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200">No matching products found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              We couldn't find any products matching your current filters in our 100,000+ catalog. Try resetting the filters or searching for something else.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </section>
  );
};
