import React, { useState, useRef, useEffect } from 'react';
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
  Share2,
  ZoomIn,
  Maximize2
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

  // Interactive Zoom Lens States
  const [zoomState, setZoomState] = useState({
    isActive: false,
    xPercent: 50,
    yPercent: 50,
    lensX: 0,
    lensY: 0,
    lensWidth: 120,
    lensHeight: 140
  });
  const [zoomLevel, setZoomLevel] = useState(2.8);
  const [isFullScreenZoom, setIsFullScreenZoom] = useState(false);
  const mainImageRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullScreenZoom) {
          setIsFullScreenZoom(false);
        } else if (activeModal === 'productDetail') {
          setActiveModal(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreenZoom, activeModal, setActiveModal]);

  if (activeModal !== 'productDetail' || !selectedProduct) return null;

  const isWishlisted = isInWishlist(selectedProduct.id);
  const currentSize = selectedSize || (selectedProduct.sizes && selectedProduct.sizes[0]) || "Free Size";
  const currentColor = selectedColor || (selectedProduct.colors && selectedProduct.colors[0]) || "Standard";

  const currentRawImg = (selectedProduct.images && selectedProduct.images[activeImageIndex]) || (selectedProduct.images && selectedProduct.images[0]) || "";
  const highResImg = currentRawImg.includes('unsplash.com')
    ? currentRawImg.replace(/w=\d+/, 'w=1800').replace(/q=\d+/, 'q=95')
    : currentRawImg;

  const handleMouseMove = (e) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const lensWidth = Math.round(rect.width * 0.38);
    const lensHeight = Math.round(rect.height * 0.38);

    const lensX = Math.max(0, Math.min(rect.width - lensWidth, x - lensWidth / 2));
    const lensY = Math.max(0, Math.min(rect.height - lensHeight, y - lensHeight / 2));

    setZoomState({
      isActive: true,
      xPercent,
      yPercent,
      lensX,
      lensY,
      lensWidth,
      lensHeight
    });
  };

  const handleMouseLeave = () => {
    setZoomState((prev) => ({ ...prev, isActive: false }));
  };

  const handleTouchMove = (e) => {
    if (!mainImageRef.current || !e.touches[0]) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(rect.width, touch.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, touch.clientY - rect.top));

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const lensWidth = Math.round(rect.width * 0.42);
    const lensHeight = Math.round(rect.height * 0.42);

    const lensX = Math.max(0, Math.min(rect.width - lensWidth, x - lensWidth / 2));
    const lensY = Math.max(0, Math.min(rect.height - lensHeight, y - lensHeight / 2));

    setZoomState({
      isActive: true,
      xPercent,
      yPercent,
      lensX,
      lensY,
      lensWidth,
      lensHeight
    });
  };

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
            
            {/* Main Image with Zoom Lens */}
            <div 
              ref={mainImageRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseLeave}
              className="relative aspect-[4/5] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 group shadow-sm cursor-crosshair select-none"
            >
              <SafeImage
                src={highResImg}
                alt={selectedProduct.title}
                className="w-full h-full object-cover object-top transition-transform duration-200"
              />

              {/* Interactive Zoom Lens Box (Amazon / Myntra Style) */}
              {zoomState.isActive && (
                <div
                  className="absolute pointer-events-none border-2 border-indigo-600 bg-indigo-500/20 backdrop-blur-[0.5px] rounded-xl shadow-lg z-20 transition-transform duration-75"
                  style={{
                    width: `${zoomState.lensWidth}px`,
                    height: `${zoomState.lensHeight}px`,
                    left: `${zoomState.lensX}px`,
                    top: `${zoomState.lensY}px`,
                  }}
                >
                  {/* Camera view-finder style corner marks */}
                  <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white"></div>
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white"></div>
                  <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white"></div>
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-black text-white bg-indigo-950/80 px-1.5 py-0.5 rounded shadow-sm">
                      {zoomLevel}x
                    </span>
                  </div>
                </div>
              )}

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(selectedProduct.id)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-500 hover:text-rose-600 transition-all active:scale-95 z-20"
                aria-label="Toggle Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'text-rose-500 fill-rose-500' : ''}`} />
              </button>

              {/* Fullscreen Expand Button */}
              <button
                type="button"
                onClick={() => setIsFullScreenZoom(true)}
                className="absolute top-3 right-14 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all active:scale-95 z-20"
                title="Fullscreen HD View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Infinity Mall Tag */}
              {selectedProduct.infinityMall && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1 z-20">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Mall
                </div>
              )}

              {/* Bottom Lens Status Pill & Zoom Controls */}
              <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
                <div className="bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{zoomState.isActive ? `Zooming: ${zoomLevel}x HD` : 'Hover to Zoom'}</span>
                </div>

                {/* Zoom Level Switcher */}
                <div className="pointer-events-auto flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200 text-[10px] font-bold">
                  {[2, 2.8, 3.8].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomLevel(lvl);
                      }}
                      className={`px-1.5 py-0.5 rounded-lg transition-colors cursor-pointer ${
                        zoomLevel === lvl ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}x
                    </button>
                  ))}
                </div>
              </div>
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

          {/* Right Column: Product Info & Actions with HD Zoom Overlay */}
          <div className="md:col-span-7 space-y-5 relative min-h-[480px]">
            
            {/* Interactive High-Definition Zoom Window (Amazon / Myntra Style) */}
            {zoomState.isActive && (
              <div className="hidden md:flex absolute inset-0 z-30 bg-white rounded-3xl shadow-2xl border-2 border-indigo-400 overflow-hidden flex-col animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                {/* Zoom Header Bar */}
                <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold shadow-sm flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="font-bold text-white tracking-wide">🔍 High-Definition Texture & Fabric Zoom ({zoomLevel}x)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-300">
                    <span>Move mouse over image to inspect stitch & details</span>
                    <span className="bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-md">Ultra HD</span>
                  </div>
                </div>

                {/* Magnified Canvas */}
                <div
                  className="flex-1 w-full h-full bg-slate-50 relative"
                  style={{
                    backgroundImage: `url('${highResImg}')`,
                    backgroundPosition: `${zoomState.xPercent}% ${zoomState.yPercent}%`,
                    backgroundSize: `${zoomLevel * 100}%`,
                    backgroundRepeat: 'no-repeat',
                    imageRendering: 'auto'
                  }}
                >
                  {/* Target Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-16 h-16 border border-dashed border-indigo-600 rounded-full flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                    </div>
                  </div>

                  {/* Floating Coordinates & Status */}
                  <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1 rounded-xl shadow-lg flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">● 1800px HD Ultra Detail</span>
                    <span>Focus: {Math.round(zoomState.xPercent)}%, {Math.round(zoomState.yPercent)}%</span>
                  </div>
                </div>
              </div>
            )}
            
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

      {/* Fullscreen HD Lightbox View */}
      {isFullScreenZoom && (
        <div 
          onClick={() => setIsFullScreenZoom(false)}
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-5xl max-h-[88vh] overflow-hidden rounded-3xl shadow-2xl bg-slate-900 border border-white/20 p-2"
          >
            <img
              src={highResImg}
              alt={selectedProduct.title}
              className="w-full h-full object-contain max-h-[82vh] rounded-2xl select-none"
            />
            <button
              type="button"
              onClick={() => setIsFullScreenZoom(false)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white p-2.5 rounded-full backdrop-blur-md transition-all active:scale-95 shadow-lg border border-white/20 cursor-pointer"
              aria-label="Close fullscreen"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/10">
              {selectedProduct.title} • Ultra-HD Resolution
            </div>
          </div>
          <div className="text-white/70 text-xs mt-3 flex items-center gap-2">
            <span>Press Escape or click anywhere to close full-screen HD view</span>
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        category={selectedProduct.category}
      />
    </div>
  );
};
