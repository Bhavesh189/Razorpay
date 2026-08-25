import React from 'react';
import { Home, Grid, Sparkles, Heart, User, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const MobileBottomNav = ({ onOpenCategories }) => {
  const { 
    cart, 
    wishlist, 
    user, 
    setActiveModal, 
    resetFilters, 
    setSelectedCategory,
    selectedCategory 
  } = useShop();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleHomeClick = () => {
    resetFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMallClick = () => {
    resetFilters();
    setSelectedCategory('women-ethnic');
    const el = document.getElementById('products-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around">
        
        {/* 1. Home */}
        <button
          onClick={handleHomeClick}
          className="flex flex-col items-center justify-center p-1 text-slate-700 active:scale-95 transition-all group"
        >
          <Home className={`w-5 h-5 ${selectedCategory === "all" ? "text-indigo-600" : "text-slate-500"}`} />
          <span className={`text-[10px] font-medium mt-0.5 ${selectedCategory === "all" ? "text-indigo-600 font-bold" : "text-slate-600"}`}>
            Home
          </span>
        </button>

        {/* 2. Categories Drawer */}
        <button
          onClick={onOpenCategories}
          className="flex flex-col items-center justify-center p-1 text-slate-700 active:scale-95 transition-all"
        >
          <Grid className="w-5 h-5 text-slate-500" />
          <span className="text-[10px] font-medium mt-0.5 text-slate-600">
            Categories
          </span>
        </button>

        {/* 3. Infinity Mall */}
        <button
          onClick={handleMallClick}
          className="flex flex-col items-center justify-center p-1 text-slate-700 active:scale-95 transition-all"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 bg-gradient-to-r from-amber-500 to-indigo-600 bg-clip-text text-transparent">
            Mall
          </span>
        </button>

        {/* 4. Wishlist */}
        <button
          onClick={() => setActiveModal('wishlist')}
          className="flex flex-col items-center justify-center p-1 text-slate-700 active:scale-95 transition-all relative"
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${wishlist.length > 0 ? "text-rose-500 fill-rose-500" : "text-slate-500"}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium mt-0.5 text-slate-600">
            Wishlist
          </span>
        </button>

        {/* 5. Account / Profile */}
        <button
          onClick={() => {
            if (user.isLoggedIn) {
              setActiveModal('orderTracking');
            } else {
              setActiveModal('auth');
            }
          }}
          className="flex flex-col items-center justify-center p-1 text-slate-700 active:scale-95 transition-all relative"
        >
          <User className="w-5 h-5 text-slate-500" />
          <span className="text-[10px] font-medium mt-0.5 text-slate-600">
            {user.isLoggedIn ? "Account" : "Sign In"}
          </span>
        </button>

      </div>
    </div>
  );
};
