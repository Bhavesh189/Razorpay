import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Smartphone, 
  ShoppingBag, 
  User, 
  Heart, 
  ChevronDown, 
  X, 
  TrendingUp, 
  Store, 
  PackageCheck, 
  LogOut,
  Sparkles,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { InfinityLogo } from './InfinityLogo';
import { useShop } from '../context/ShopContext';

export const Header = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    cart, 
    wishlist, 
    user, 
    setUser, 
    setActiveModal, 
    setSelectedProduct,
    products, 
    resetFilters,
    setSelectedCategory,
    orders
  } = useShop();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const profileRef = useRef(null);

  // Trending search suggestions
  const trendingSearches = [
    "Silk Saree", "Anarkali Kurti", "Oxford Shirt", "Cargo Pants", 
    "Cotton Bedsheet", "Lipstick Set", "Bluetooth Neckband", "Smartwatch", "Denim Jeans"
  ];

  // Live matching products for autocomplete
  const searchResults = searchQuery.trim()
    ? products.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subCategory?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSelectTrending = (tag) => {
    setSearchQuery(tag);
    setIsSearchFocused(false);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setActiveModal('productDetail');
    setIsSearchFocused(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-[72px] gap-3 md:gap-6">
          
          {/* 1. Left Logo */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <InfinityLogo onClick={resetFilters} />
          </div>

          {/* 2. Center Search Bar with Autocomplete Dropdown & Ask AI Button */}
          <div className="flex items-center gap-2 flex-1 max-w-2xl">
            <div ref={searchContainerRef} className="relative flex-1">
              <div className={`flex items-center bg-slate-50 border transition-all rounded-2xl px-3.5 py-2.5 ${
                isSearchFocused 
                  ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/10 shadow-sm' 
                  : 'border-slate-300 hover:border-slate-400'
              }`}>
                <Search className="w-5 h-5 text-slate-400 mr-2.5 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search Sarees, Kurtis, Shirts, Watches or ask AI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Autocomplete Popup */}
              {isSearchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-dropdown p-4 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* Live matches */}
                  {searchQuery.trim() && searchResults.length > 0 ? (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
                        Matching Products
                      </div>
                      <div className="space-y-1">
                        {searchResults.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleProductSelect(item)}
                            className="flex items-center gap-3 p-2 hover:bg-indigo-50/60 rounded-xl cursor-pointer transition-colors"
                          >
                            <img 
                              src={item.images[0]} 
                              alt={item.title} 
                              className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-slate-800 truncate">{item.title}</div>
                              <div className="text-[11px] text-slate-500">In {item.category} • ₹{item.price}</div>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                              {item.discount}% OFF
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Popular & Trending Searches */}
                  <div className={searchQuery.trim() && searchResults.length > 0 ? "mt-3 pt-3 border-t border-slate-100" : ""}>
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 px-1">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                      Popular Searches
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {trendingSearches.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleSelectTrending(tag)}
                          className="text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-3 py-1.5 rounded-xl transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Header Ask AI Button */}
            <button
              onClick={() => setActiveModal('aiAssistant')}
              className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3.5 py-2.5 rounded-2xl shadow-sm hover:shadow-md text-xs font-bold transition-all flex-shrink-0 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask AI</span>
            </button>
          </div>

          {/* 3. Right Utility Actions */}
          <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
            
            {/* Download App */}
            <button
              onClick={() => setActiveModal('downloadApp')}
              className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 py-1 transition-colors group"
            >
              <Smartphone className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
              <span>Download App</span>
            </button>

            <span className="hidden lg:inline-block w-px h-5 bg-slate-200"></span>

            {/* Become a Supplier */}
            <button
              onClick={() => setActiveModal('supplier')}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 py-1 transition-colors group"
            >
              <Store className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
              <span>Become a Supplier</span>
            </button>

            <span className="hidden md:inline-block w-px h-5 bg-slate-200"></span>

            {/* Infinity Mall */}
            <button
              onClick={() => {
                resetFilters();
                setSelectedCategory('women-ethnic');
              }}
              className="hidden xl:flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-indigo-600 py-1 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Infinity Mall</span>
            </button>

            <span className="hidden xl:inline-block w-px h-5 bg-slate-200"></span>

            {/* Profile Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex flex-col items-center justify-center text-slate-700 hover:text-indigo-600 transition-colors py-1 group px-1 cursor-pointer"
              >
                <div className="relative">
                  <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {user.isLoggedIn && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                  )}
                </div>
                <span className="text-[11px] font-semibold mt-0.5 flex items-center gap-0.5">
                  {user.isLoggedIn ? (user.name?.split(' ')[0] || "Profile") : "Profile"}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-dropdown py-3 z-50 animate-in fade-in duration-150">
                  <div className="px-4 pb-3 border-b border-slate-100">
                    <div className="text-sm font-bold text-slate-900">
                      {user.isLoggedIn ? `Hello, ${user.name || 'Shopper'}` : 'Welcome'}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {user.isLoggedIn ? `+91 ${user.phone}` : 'To access your Infinity Store account'}
                    </div>
                    {!user.isLoggedIn && (
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setActiveModal('auth');
                        }}
                        className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition-all"
                      >
                        Sign Up / Login
                      </button>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setActiveModal('orderTracking');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-left"
                    >
                      <PackageCheck className="w-4 h-4 text-slate-400" />
                      <span>My Orders</span>
                      {orders.length > 0 && (
                        <span className="ml-auto text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                          {orders.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setActiveModal('wishlist');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-left"
                    >
                      <Heart className="w-4 h-4 text-slate-400" />
                      <span>My Wishlist</span>
                      {wishlist.length > 0 && (
                        <span className="ml-auto text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                          {wishlist.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setActiveModal('aiAssistant');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 transition-colors text-left"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>AI Shopping Assistant</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setActiveModal('help');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-left"
                    >
                      <ShieldCheck className="w-4 h-4 text-slate-400" />
                      <span>Help Centre & FAQ</span>
                    </button>

                    {user.isLoggedIn && (
                      <button
                        onClick={() => {
                          setUser({ isLoggedIn: false, phone: "", name: "" });
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Logout</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => setActiveModal('wishlist')}
              className="relative flex flex-col items-center justify-center text-slate-700 hover:text-indigo-600 transition-colors py-1 group px-1 cursor-pointer"
            >
              <div className="relative">
                <Heart className={`w-5 h-5 group-hover:scale-110 transition-transform ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold mt-0.5 hidden sm:inline">Wishlist</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setActiveModal('cart')}
              className="relative flex flex-col items-center justify-center text-slate-700 hover:text-indigo-600 transition-colors py-1 group px-1 cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center pulse-badge shadow">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold mt-0.5">Cart</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
