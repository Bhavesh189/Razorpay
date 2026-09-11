import React, { useState } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/Header';
import { MegaMenu } from './components/MegaMenu';
import { HeroBanner } from './components/HeroBanner';
import { CategoryStories } from './components/CategoryStories';
import { BudgetZone } from './components/BudgetZone';
import { FilterSidebar } from './components/FilterSidebar';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AuthModal } from './components/AuthModal';
import { SupplierModal } from './components/SupplierModal';
import { DownloadAppModal } from './components/DownloadAppModal';
import { HelpModal } from './components/HelpModal';
import { WishlistModal } from './components/WishlistModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { AIAssistantButton } from './components/AIAssistantButton';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { SlidersHorizontal, Sparkles, X } from 'lucide-react';

const MainLayout = () => {
  const { toastMessage, resetFilters, searchQuery } = useShop();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileCategoryDrawerOpen, setIsMobileCategoryDrawerOpen] = useState(false);

  const isSearchActive = searchQuery && searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] pb-14 md:pb-0">
      
      {/* Top Promotional Announcement Ticker */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-cyan-500/10 border-b border-amber-500/20 text-amber-100 text-[11px] sm:text-xs py-2 px-4 text-center font-semibold tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
        <span>
          Mega Savings Festival: Flat <strong className="text-amber-400">₹50 OFF</strong> on 1st Order • Use Code: <strong className="underline text-amber-400">FIRST50</strong> • 100% Free Delivery PAN India
        </span>
      </div>

      {/* Main Header */}
      <Header />

      {/* 9-Category Hover Mega Menu (with Mobile Categories Drawer support) */}
      <MegaMenu 
        isMobileDrawerOpen={isMobileCategoryDrawerOpen}
        onCloseMobileDrawer={() => setIsMobileCategoryDrawerOpen(false)}
      />

      {/* Page Body */}
      <main className="flex-1 space-y-4 sm:space-y-6">
        
        {/* Home Page Sections - Only visible when NOT searching */}
        {!isSearchActive && (
          <>
            {/* Promotional Hero Carousel & Trust Pillars */}
            <HeroBanner />

            {/* Circular Category Avatars */}
            <CategoryStories />

            {/* Budget Deals Store & Supplier Highlight */}
            <BudgetZone />
          </>
        )}

        {/* Main Catalog & Filter Grid Section */}
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-2 sm:pt-4">
          
          {/* Mobile Filter Toggle Button */}
          <div className="md:hidden mb-3">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="w-full bg-white border border-slate-300 text-slate-800 text-xs font-bold py-3 px-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 active:scale-98"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Filter & Sort Products</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Desktop Left Filter Sidebar */}
            <div className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-24">
              <FilterSidebar />
            </div>

            {/* Mobile Filter Drawer */}
            {isMobileFilterOpen && (
              <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-4/5 max-w-sm bg-white h-full p-4 overflow-y-auto shadow-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                      <span className="font-bold text-sm text-slate-900 font-['Outfit']">Filters & Sorting</span>
                      <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <FilterSidebar />
                  </div>
                  <div className="pt-4 border-t border-slate-200 mt-4">
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="w-full bg-indigo-600 text-white text-xs font-bold py-3 rounded-xl shadow-lg"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Right Product Grid */}
            <div className="md:col-span-8 lg:col-span-9">
              <ProductGrid />
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Sticky Bottom Navigation App Bar */}
      <MobileBottomNav 
        onOpenCategories={() => setIsMobileCategoryDrawerOpen(true)}
      />

      {/* Floating AI Assistant Launcher Button */}
      <AIAssistantButton />

      {/* All Application Modals */}
      <AIAssistantModal />
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackingModal />
      <AuthModal />
      <SupplierModal />
      <DownloadAppModal />
      <HelpModal />
      <WishlistModal />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-6 right-4 sm:right-6 z-50 bg-slate-900/95 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border border-white/10 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <MainLayout />
    </ShopProvider>
  );
}
