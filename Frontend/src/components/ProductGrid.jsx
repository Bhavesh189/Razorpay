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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 capitalize font-['Outfit'] flex items-center gap-2">
            <span>{getHeading()}</span>
            {filters.onlyInfinityMall && (
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-indigo-200">
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
              className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-indigo-600 cursor-pointer"
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
                className="bg-white hover:bg-indigo-50 border-2 border-indigo-600 text-indigo-700 hover:text-indigo-800 text-xs sm:text-sm font-black px-8 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
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
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <PackageOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No matching products found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
