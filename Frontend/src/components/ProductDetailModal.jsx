import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, 
  Star, 
  Heart, 
  ShoppingBag, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  Ruler, 
  CheckCircle2, 
  Store,
  ChevronRight,
  Share2
} from 'lucide-react';
import { SizeChartModal } from './SizeChartModal';
import { SafeImage } from './SafeImage';

export const ProductDetailModal = () => {
  const { 
    selectedProduct, 
    activeModal, 
    setActiveModal, 
    addToCart, 
    isInWishlist, 
    toggleWishlist,
    showToast 
  } = useShop();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  if (activeModal !== 'productDetail' || !selectedProduct) return null;

  const isWishlisted = isInWishlist(selectedProduct.id);
  const currentSize = selectedSize || (selectedProduct.sizes && selectedProduct.sizes[0]) || "Free Size";
  const currentColor = selectedColor || (selectedProduct.colors && selectedProduct.colors[0]) || "Standard";

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincodeChecked(true);
    } else {
      showToast("Please enter a valid 6-digit Pincode");
    }
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, currentSize, currentColor);
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, currentSize, currentColor);
    setActiveModal('cart');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Product link copied to clipboard! 🔗");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 relative my-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-slate-100 text-slate-500 hover:text-slate-900 shadow-md transition-all active:scale-95"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 sm:p-6 lg:p-8">
          
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-5 space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/5] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 group shadow-sm">
              <SafeImage
                src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                alt={selectedProduct.title}
                className="w-full h-full object-cover object-top"
              />

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(selectedProduct.id)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-500 hover:text-rose-600 transition-all active:scale-95"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'text-rose-500 fill-rose-500' : ''}`} />
              </button>

              {/* Infinity Mall Tag */}
              {selectedProduct.infinityMall && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Mall
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {selectedProduct.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {selectedProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-indigo-600 shadow-md scale-105 ring-2 ring-indigo-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <SafeImage src={img} alt="" className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}

            {/* Share & Assured badges */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                100% Genuine Guaranteed
              </div>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 hover:text-indigo-600 font-medium transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="md:col-span-7 space-y-5">
            
            {/* Title & Category */}
            <div>
              <div className="text-xs text-indigo-600 font-bold capitalize mb-1 tracking-wide">
                {selectedProduct.category?.replace('-', ' ')} {selectedProduct.subCategory && `• ${selectedProduct.subCategory}`}
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {selectedProduct.title}
              </h1>
            </div>

            {/* Price Area */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
                  ₹{selectedProduct.price}
                </span>
                <span className="text-sm text-slate-400 line-through">
                  ₹{selectedProduct.originalPrice}
                </span>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {selectedProduct.discount}% OFF
                </span>
              </div>

              {selectedProduct.firstOrderDiscount && (
                <div className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg inline-block">
                  🎉 Special Deal: Extra ₹{selectedProduct.firstOrderDiscount} off on 1st order
                </div>
              )}

              {/* Rating Badge */}
              <div className="flex items-center gap-2 pt-2">
                <div className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <span>{selectedProduct.rating}</span>
                  <Star className="w-3 h-3 fill-white text-white" />
                </div>
                <span className="text-xs text-slate-500">
                  {selectedProduct.reviewsCount.toLocaleString()} Ratings, {Math.round(selectedProduct.reviewsCount * 0.4).toLocaleString()} Reviews
                </span>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded ml-auto">
                  Free Delivery
                </span>
              </div>
            </div>

            {/* Select Size */}
            {selectedProduct.sizes && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Select Size
                  </span>
                  <button
                    onClick={() => setIsSizeChartOpen(true)}
                    className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Ruler className="w-3 h-3" /> Size Chart
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                        currentSize === s
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200'
                          : 'border-slate-300 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Select Color */}
            {selectedProduct.colors && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Color: <strong className="text-slate-900">{currentColor}</strong>
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                        currentColor === c
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300'
                          : 'border-slate-300 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Pincode Checker */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                Check Delivery Date & Service Availability
              </div>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6 digit Pincode (e.g. 110001)"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors active:scale-95"
                >
                  Check
                </button>
              </form>

              {pincodeChecked && (
                <div className="pt-2 text-xs text-emerald-600 space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Delivery by Friday, 28 Aug • FREE
                  </div>
                  <div className="text-slate-600">
                    100% Safe Online Payment | 7-day Easy Return
                  </div>
                </div>
              )}
            </div>

            {/* Product Specifications */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Product Details
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedProduct.description}
              </p>

              {selectedProduct.specs && (
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {Object.entries(selectedProduct.specs).map(([key, val]) => (
                    <div key={key}>
                      <span className="text-slate-500">{key}:</span>{' '}
                      <span className="font-semibold text-slate-800">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seller Information */}
            {selectedProduct.seller && (
              <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">{selectedProduct.seller.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                      {selectedProduct.seller.rating} ★
                    </span>
                    <span>{selectedProduct.seller.followers} Followers</span>
                    <span>• {selectedProduct.seller.productsCount} Products</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-600 cursor-pointer hover:underline">
                  View Shop
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white pt-3 pb-2 border-t border-slate-200 flex gap-3 z-10">
              <button
                onClick={handleAddToCart}
                className="flex-1 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold text-xs sm:text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                Buy Now
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        category={selectedProduct.category}
      />
    </div>
  );
};
