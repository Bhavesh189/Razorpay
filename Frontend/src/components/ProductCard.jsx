import React from 'react';
import { Heart, Star, Sparkles, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { SafeImage } from './SafeImage';

export const ProductCard = ({ product }) => {
  const { 
    isInWishlist, 
    toggleWishlist, 
    setSelectedProduct, 
    setActiveModal,
    addToCart 
  } = useShop();

  const isWishlisted = isInWishlist(product.id);

  const handleCardClick = () => {
    setSelectedProduct(product);
    setActiveModal('productDetail');
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-infinity-hover hover:border-indigo-300 transition-all duration-300 flex flex-col group cursor-pointer relative"
    >
      {/* 1. Image Container with Badges & Wishlist */}
      <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden">
        <SafeImage
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />

        {/* Infinity Mall Badge */}
        {product.infinityMall && (
          <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 backdrop-blur-sm">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            Mall
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all z-10 hover:scale-110 active:scale-95"
          aria-label="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 transition-transform ${
            isWishlisted ? 'text-rose-500 fill-rose-500' : ''
          }`} />
        </button>

        {/* Quick Add Button on desktop hover */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-2.5 inset-x-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5 backdrop-blur-md hidden md:flex active:scale-95"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Quick Add
        </button>
      </div>

      {/* 2. Product Details */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
        
        {/* Title */}
        <h3 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors" title={product.title}>
          {product.title}
        </h3>

        {/* Price Row */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-black text-slate-900 font-['Outfit']">
              ₹{product.price}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400 line-through">
              ₹{product.originalPrice}
            </span>
            <span className="text-xs font-bold text-emerald-600">
              {product.discount}% off
            </span>
          </div>

          {/* First Order Discount Tag */}
          {product.firstOrderDiscount && (
            <div className="text-[10px] sm:text-[11px] font-bold text-indigo-600 flex items-center gap-1">
              <span>₹{product.firstOrderDiscount} off on 1st order</span>
            </div>
          )}
        </div>

        {/* Free Delivery Badge */}
        {product.freeDelivery && (
          <div className="inline-block">
            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              Free Delivery
            </span>
          </div>
        )}

        {/* Rating & Reviews Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 pt-1.5 border-t border-slate-100">
          <div className="bg-emerald-600 text-white text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <span>{product.rating}</span>
            <Star className="w-2.5 h-2.5 fill-white text-white" />
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 truncate">
            {product.reviewsCount > 1000 ? `${(product.reviewsCount / 1000).toFixed(1)}k` : product.reviewsCount} Reviews
          </span>
        </div>

      </div>
    </div>
  );
};
