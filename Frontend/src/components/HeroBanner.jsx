import React, { useState, useEffect } from 'react';
import { heroBanners, trustPillars } from '../data/banners';
import { useShop } from '../context/ShopContext';
import { SafeImage } from './SafeImage';
import { 
  Truck, 
  Banknote, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const HeroBanner = () => {
  const { setSelectedCategory, setActiveModal } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);

  const banner = heroBanners[currentSlide];

  const renderIcon = (name) => {
    switch (name) {
      case 'Truck': return <Truck className="w-6 h-6 text-indigo-600" />;
      case 'Banknote': return <Banknote className="w-6 h-6 text-indigo-600" />;
      case 'RotateCcw': return <RotateCcw className="w-6 h-6 text-indigo-600" />;
      default: return <ShieldCheck className="w-6 h-6 text-indigo-600" />;
    }
  };

  return (
    <section className="py-3 sm:py-6">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 space-y-4 sm:space-y-6">
        
        {/* Main Hero Banner Slider */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4338ca] via-[#4f46e5] to-[#7c3aed] text-white shadow-xl min-h-[320px] md:min-h-[380px] flex items-center">
          
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:20px_20px] pointer-events-none"></div>

          <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-12 items-center p-6 sm:p-10 lg:p-12 gap-6">
            
            {/* Left Content */}
            <div className="md:col-span-7 space-y-3 sm:space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs md:text-sm font-bold tracking-wide text-amber-300 shadow-sm">
                <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
                {banner.badge}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black font-['Outfit'] tracking-tight leading-tight drop-shadow-sm">
                {banner.title}
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-indigo-100 max-w-xl font-normal leading-relaxed">
                {banner.subtitle}
              </p>

              {/* Perks bullets */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                {banner.perks.map((perk, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-black/25 border border-white/20 px-3 py-1 rounded-lg text-white backdrop-blur-sm">
                    <Zap className="w-3 h-3 text-yellow-300" />
                    {perk}
                  </span>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
                <button
                  onClick={() => {
                    if (banner.categoryTarget) {
                      setSelectedCategory(banner.categoryTarget);
                    }
                    const el = document.getElementById('products-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white text-indigo-700 hover:bg-yellow-300 hover:text-slate-900 font-extrabold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-2xl transition-all text-xs sm:text-sm flex items-center gap-2 group cursor-pointer active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {banner.ctaText}
                </button>

                <button
                  onClick={() => setActiveModal('downloadApp')}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold border border-white/30 px-5 py-3.5 rounded-xl transition-all text-xs sm:text-sm cursor-pointer backdrop-blur-md active:scale-95"
                >
                  Download App
                </button>
              </div>
            </div>

            {/* Right Banner Image Showcase */}
            <div className="md:col-span-5 flex justify-center relative">
              <div className="relative w-48 sm:w-60 md:w-72 aspect-square">
                <div className="absolute inset-0 bg-white/20 rounded-3xl transform rotate-3 filter blur-md"></div>
                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border-2 border-white/40 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                  <SafeImage
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-2 -left-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-black text-xs px-3 py-1 rounded-lg shadow-lg uppercase tracking-wider">
                  Special Offer
                </span>
              </div>
            </div>

          </div>

          {/* Slider Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2.5 rounded-full backdrop-blur-md transition-all active:scale-90"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2.5 rounded-full backdrop-blur-md transition-all active:scale-90"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slider Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {heroBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === idx ? 'w-7 bg-white' : 'w-2 bg-white/50'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>

        {/* Infinity 3-Pillar Trust Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          {trustPillars.map((item) => (
            <div 
              key={item.id}
              className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-indigo-50/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 shadow-inner">
                {renderIcon(item.icon)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
