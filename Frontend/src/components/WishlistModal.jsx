import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Heart, ShoppingBag, Trash2, Star, Sparkles } from 'lucide-react';
import { SafeImage } from './SafeImage';

export const WishlistModal = () => {
  const { 
    wishlist, 
    products, 
    toggleWishlist, 
    addToCart, 
    activeModal, 
    setActiveModal,
    setSelectedProduct 
  } = useShop();

  if (activeModal !== 'wishlist') return null;

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setActiveModal('productDetail');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 relative my-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-5 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
              My Wishlist ({wishlistedProducts.length} Items)
            </h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="p-4 sm:p-6">
          {wishlistedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {wishlistedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group relative"
                >
                  {/* Image */}
                  <div
                    onClick={() => handleProductClick(product)}
                    className="relative aspect-[4/5] bg-slate-50 overflow-hidden cursor-pointer"
                  >
                    <SafeImage
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-rose-500 hover:bg-white transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4
                        onClick={() => handleProductClick(product)}
                        className="text-xs font-semibold text-slate-900 line-clamp-1 cursor-pointer hover:text-indigo-600"
                      >
                        {product.title}
                      </h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-black text-slate-900 font-['Outfit']">
                          ₹{product.price}
                        </span>
                        <span className="text-[11px] text-slate-400 line-through">
                          ₹{product.originalPrice}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600">
                          {product.discount}% off
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Move to Cart
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Your Wishlist is Empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Tap the heart icon on any product to save it to your wishlist for later.
              </p>
              <button
                onClick={() => setActiveModal(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                Explore Products
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
