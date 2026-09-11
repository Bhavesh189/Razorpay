import React from 'react';
import { InfinityLogo } from './InfinityLogo';
import { useShop } from '../context/ShopContext';
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones, 
  Smartphone
} from 'lucide-react';

export const Footer = () => {
  const { setActiveModal, setSelectedCategory, resetFilters } = useShop();

  const handleCategoryLink = (catSlug) => {
    resetFilters();
    setSelectedCategory(catSlug);
    const el = document.getElementById('products-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0a0a0f] border-t border-[#2a2a3a] mt-12 text-slate-300">
      
      {/* 1. Main Footer Grid */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Column 1: Infinity Store Info & App */}
          <div className="lg:col-span-2 space-y-4">
            <InfinityLogo onClick={resetFilters} />
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Infinity Store is India's favourite online shopping destination, offering over 50 Lakh+ products across Fashion, Electronics, Home & Kitchen at the lowest wholesale prices with <strong>Free Delivery</strong>, <strong>100% Secure Online Payments</strong> and <strong>Easy 7-Day Returns</strong>.
            </p>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Shop Non-Stop On Infinity Store App
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveModal('downloadApp')}
                  className="bg-[#1e1e2e] text-white px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-indigo-500/30 transition-colors flex items-center gap-1.5 border border-[#2a2a3a]"
                >
                  <Smartphone className="w-3.5 h-3.5" /> Google Play
                </button>
                <button
                  onClick={() => setActiveModal('downloadApp')}
                  className="bg-[#1e1e2e] text-white px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-indigo-500/30 transition-colors flex items-center gap-1.5 border border-[#2a2a3a]"
                >
                  <Smartphone className="w-3.5 h-3.5" /> App Store
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Popular Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => handleCategoryLink('women-ethnic')} className="hover:text-amber-400">
                  Women Ethnic Wear
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryLink('women-western')} className="hover:text-amber-400">
                  Women Western Tops
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryLink('men')} className="hover:text-amber-400">
                  Men's Fashion & Shirts
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryLink('kids')} className="hover:text-amber-400">
                  Kids & Baby Clothing
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryLink('home-kitchen')} className="hover:text-amber-400">
                  Home Furnishing & Kitchen
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryLink('beauty-health')} className="hover:text-amber-400">
                  Beauty, Makeup & Health
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryLink('electronics')} className="hover:text-amber-400">
                  Electronics & Smartwatches
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Seller & Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Partner With Us
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveModal('supplier')} className="hover:text-amber-300 font-medium text-amber-400">
                  Become a Supplier (0% Commission)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('help')} className="hover:text-amber-400">
                  Supplier Onboarding Guide
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('help')} className="hover:text-amber-400">
                  Careers at Infinity Store
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('help')} className="hover:text-amber-400">
                  Newsroom & Media
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('help')} className="hover:text-amber-400">
                  Infinity Tech Blog
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Help & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveModal('help')} className="hover:text-amber-400">
                  Help Centre & FAQ
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('orderTracking')} className="hover:text-amber-400">
                  Track Orders & Returns
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('help')} className="hover:text-amber-400">
                  Returns & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('help')} className="hover:text-amber-400">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('help')} className="hover:text-amber-400">
                  Privacy Policy & Security
                </button>
              </li>
            </ul>

            {/* Social Icons SVGs */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-white block mb-2">Follow Us</span>
              <div className="flex items-center gap-3 text-slate-400">
                {/* Instagram */}
                <a href="#" className="hover:text-amber-400 transition-colors" title="Instagram">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a href="#" className="hover:text-amber-400 transition-colors" title="Facebook">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.59 0 9 1.583 9 4.615V8z"/>
                  </svg>
                </a>
                {/* Twitter / X */}
                <a href="#" className="hover:text-amber-400 transition-colors" title="Twitter">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                {/* YouTube */}
                <a href="#" className="hover:text-amber-400 transition-colors" title="YouTube">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="#" className="hover:text-amber-400 transition-colors" title="LinkedIn">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* 2. SEO Keywords Strip */}
        <div className="border-t border-[#2a2a3a] mt-10 pt-6 space-y-2 text-[11px] text-slate-500">
          <div className="font-bold text-slate-300">More About Online Shopping on Infinity Store:</div>
          <p className="leading-relaxed">
            Shop online at Infinity Store for Banarasi Silk Sarees, Embroidered Kurtis, Lehengas, Designer Kurtas, Men Casual Cotton Shirts, Slim Fit Joggers, Cargo Pants, Kids Wear, Cotton Bedsheets, Wall Clocks, Kitchen Storage Jars, Matte Liquid Lipsticks, Vitamin C Serum, Temple Gold Jewellery, Rose Gold Watches, Sneakers, Handbags, Bluetooth Neckbands, and Smartwatches. Enjoy 0% hassle shopping with Instant Safe Online Payments and Pan-India Free Delivery.
          </p>
        </div>

        {/* 3. Bottom Copyright & Trust badges */}
        <div className="border-t border-[#2a2a3a] mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 Infinity Store Marketplace Inc. All rights reserved.
          </div>
          
          <div className="flex items-center gap-3 text-[11px] text-slate-300 font-semibold">
            <span className="bg-[#1e1e2e] border border-[#2a2a3a] px-2 py-1 rounded-md">100% Safe Payments</span>
            <span className="bg-[#1e1e2e] border border-[#2a2a3a] px-2 py-1 rounded-md">Verified Sellers</span>
            <span className="bg-[#1e1e2e] border border-[#2a2a3a] px-2 py-1 rounded-md">Fast PAN-India Shipping</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
