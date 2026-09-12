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
    orders,
    currentRoute,
    setCurrentRoute,
    setCurrentAccountTab
  } = useShop();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState({ suggestions: [], instantProducts: [], didYouMean: null, timeMs: 0 });
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const profileRef = useRef(null);

  // Keyboard Shortcut: 'Escape' closes search and profile dropdowns
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setIsProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Trending search suggestions
  const trendingSearches = [
    "Gaming Laptop", "Smartphones", "ANC Earbuds", "Banarasi Saree", "Anarkali Kurti", 
    "Oxford Shirt", "Cargo Pants", "Gym Dumbbells", "French Perfume", "Air Fryer"
  ];

  // Fetch instant DSA suggestions as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveSuggestions({ suggestions: [], instantProducts: [], didYouMean: null, timeMs: 0 });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/search/suggest?q=${encodeURIComponent(searchQuery)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setLiveSuggestions(data);
          }
        }
      } catch (e) {
        // Fallback silently
      }
    }, 80); // ultra-fast 80ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fallback live matching products if API not loaded
  const fallbackResults = searchQuery.trim()
    ? products.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subCategory?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const displayProducts = liveSuggestions.instantProducts?.length > 0
    ? liveSuggestions.instantProducts
    : fallbackResults;

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

  const handleHomeClick = () => {
    setCurrentRoute('home');
    resetFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    <header className="sticky top-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20 transition-all w-full">
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex flex-wrap items-center justify-between min-h-[72px] py-2 gap-3 md:gap-6">
          
          {/* 1. Left Logo */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <InfinityLogo onClick={handleHomeClick} />
          </div>

          {/* 2. Center Search Bar with Autocomplete Dropdown & Ask AI Button */}
          <div className="flex items-center gap-2 flex-1 max-w-2xl">
            <div ref={searchContainerRef} className="relative flex-1">
              <div className={`flex items-center bg-[#13131a] border transition-all rounded-2xl px-3.5 py-2.5 ${
                isSearchFocused 
                  ? 'border-amber-500/50 bg-[#1a1a2e] ring-2 ring-amber-500/10 shadow-sm shadow-amber-500/5' 
                  : 'border-[#1e1e2e] hover:border-amber-500/30'
              }`}>
                <Search className="w-5 h-5 text-amber-500/60 mr-2.5 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search 1,25,000+ Laptops, Smartphones, Sarees, Perfumes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      setIsSearchFocused(false);
                      searchInputRef.current?.blur();
                    }
                  }}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none font-medium"
                />

                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-slate-500 hover:text-amber-400 rounded-full cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Autocomplete Popup */}
              {isSearchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#13131a] border border-[#1e1e2e] rounded-2xl shadow-2xl shadow-black/40 p-4 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  
                  {/* Typo Correction 'Did you mean?' */}
                  {liveSuggestions.didYouMean && (
                    <div 
                      onClick={() => setSearchQuery(liveSuggestions.didYouMean)}
                      className="mb-3 p-2.5 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="text-xs text-amber-200 font-medium">
                        Did you mean: <strong className="text-amber-400 underline font-bold">{liveSuggestions.didYouMean}</strong>?
                      </span>
                      <span className="text-[11px] font-bold text-amber-400 hover:text-amber-300">Search instead →</span>
                    </div>
                  )}

                  {/* Keyword Suggestions */}
                  {liveSuggestions.suggestions?.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Popular Suggestions</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {liveSuggestions.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSearchQuery(sug);
                              setIsSearchFocused(false);
                            }}
                            className="text-xs font-semibold bg-[#1e1e2e] hover:bg-amber-500/10 hover:text-amber-400 text-slate-400 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 border border-[#2a2a3a]"
                          >
                            <Search className="w-3 h-3 text-slate-500" />
                            <span>{sug}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live matching products */}
                  {searchQuery.trim() && displayProducts.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-1">
                        <span>Matching Products</span>
                      </div>
                      <div className="space-y-1.5">
                        {displayProducts.slice(0, 5).map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleProductSelect(item)}
                            className="flex items-center gap-3 p-2 hover:bg-amber-500/5 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-amber-500/20"
                          >
                            <img 
                              src={item.images[0]} 
                              alt={item.title} 
                              className="w-11 h-11 object-cover rounded-lg border border-[#2a2a3a] shadow-xs"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-slate-200 truncate">{item.title}</div>
                              <div className="text-[11px] text-slate-500 font-medium">In {item.subCategory || item.category} • <span className="text-amber-400 font-bold">₹{item.price?.toLocaleString()}</span></div>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              {item.discount}% OFF
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Popular & Trending Searches */}
                  <div className={searchQuery.trim() && displayProducts.length > 0 ? "mt-3 pt-3 border-t border-[#1e1e2e]" : ""}>
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5 px-1">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                      Trending Searches
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {trendingSearches.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleSelectTrending(tag)}
                          className="text-xs font-medium bg-[#1e1e2e] hover:bg-amber-500/10 hover:text-amber-400 text-slate-400 px-3 py-1.5 rounded-xl transition-colors border border-[#2a2a3a]"
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
              className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black px-3.5 py-2.5 rounded-2xl shadow-sm hover:shadow-md hover:shadow-amber-500/20 text-xs font-bold transition-all flex-shrink-0 cursor-pointer active:scale-95"
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
              className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 py-1 transition-colors group"
            >
              <Smartphone className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
              <span>Download App</span>
            </button>

            <span className="hidden lg:inline-block w-px h-5 bg-[#1e1e2e]"></span>

            {/* Become a Supplier */}
            <button
              onClick={() => setActiveModal('supplier')}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 py-1 transition-colors group"
            >
              <Store className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
              <span>Become a Supplier</span>
            </button>

            <span className="hidden md:inline-block w-px h-5 bg-[#1e1e2e]"></span>

            {/* Infinity Mall */}
            <button
              onClick={() => {
                resetFilters();
                setSelectedCategory('women-ethnic');
              }}
              className="hidden xl:flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 py-1 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Infinity Mall</span>
            </button>

            <span className="hidden xl:inline-block w-px h-5 bg-[#1e1e2e]"></span>

            {/* Profile Dropdown */}
            <div ref={profileRef} className="hidden md:block relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex flex-col items-center justify-center text-slate-400 hover:text-amber-400 transition-colors py-1 group px-1 cursor-pointer"
              >
                <div className="relative">
                  <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {user.isLoggedIn && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-[#0a0a0f]"></span>
                  )}
                </div>
                <span className="text-[11px] font-semibold mt-0.5 flex items-center gap-0.5">
                  {user.isLoggedIn ? (user.name?.split(' ')[0] || "Profile") : "Profile"}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#13131a] border border-[#1e1e2e] rounded-2xl shadow-2xl shadow-black/40 py-3 z-50 animate-in fade-in duration-150">
                  <div className="px-4 pb-3 border-b border-[#1e1e2e]">
                    <div className="text-sm font-bold text-slate-200">
                      {user.isLoggedIn ? `Hello, ${user.name || 'Shopper'}` : 'Guest Shopper Profile'}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {user.isLoggedIn ? `+91 ${user.phone}` : 'Instant 1-Click Checkout Ready'}
                    </div>
                    {!user.isLoggedIn && (
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setActiveModal('auth');
                        }}
                        className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        Set Delivery Details
                      </button>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setCurrentRoute('account');
                        setCurrentAccountTab('orders');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-amber-500/5 hover:text-amber-400 transition-colors text-left"
                    >
                      <PackageCheck className="w-4 h-4 text-slate-400" />
                      <span>My Orders</span>
                      {orders.length > 0 && (
                        <span className="ml-auto text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/20">
                          {orders.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setCurrentRoute('account');
                        setCurrentAccountTab('wishlist');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-amber-500/5 hover:text-amber-400 transition-colors text-left"
                    >
                      <Heart className="w-4 h-4 text-slate-400" />
                      <span>My Wishlist</span>
                      {wishlist.length > 0 && (
                        <span className="ml-auto text-xs bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full font-bold border border-rose-500/20">
                          {wishlist.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setActiveModal('aiAssistant');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 transition-colors text-left"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>AI Shopping Assistant</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setCurrentRoute('account');
                        setCurrentAccountTab('help');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-amber-500/5 hover:text-amber-400 transition-colors text-left"
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
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors text-left border-t border-[#1e1e2e] mt-1"
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
              onClick={() => {
                setCurrentRoute('account');
                setCurrentAccountTab('wishlist');
              }}
              className="hidden md:flex relative flex-col items-center justify-center text-slate-400 hover:text-amber-400 transition-colors py-1 group px-1 cursor-pointer"
            >
              <div className="relative">
                <Heart className={`w-5 h-5 group-hover:scale-110 transition-transform ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold mt-0.5 hidden sm:inline">Wishlist</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setActiveModal('cart')}
              className="relative flex flex-col items-center justify-center text-slate-400 hover:text-amber-400 transition-colors py-1 group px-1 cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center pulse-badge shadow">
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
