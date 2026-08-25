import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Percent,
  Sparkles
} from 'lucide-react';
import { couponsData } from '../data/coupons';
import { SafeImage } from './SafeImage';

export const CartDrawer = () => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    cartSummary, 
    appliedCoupon, 
    applyCouponCode, 
    removeCoupon, 
    activeModal, 
    setActiveModal, 
    user 
  } = useShop();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  if (activeModal !== 'cart') return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    if (!couponInput.trim()) return;
    const res = applyCouponCode(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput("");
    }
  };

  const handleApplyQuickCoupon = (code) => {
    setCouponError("");
    const res = applyCouponCode(code);
    if (!res.success) {
      setCouponError(res.message);
    }
  };

  const handleProceedToCheckout = () => {
    if (!user.isLoggedIn) {
      setActiveModal('auth');
    } else {
      setActiveModal('checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* 1. Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
                Shopping Cart ({cartSummary.totalItems} {cartSummary.totalItems === 1 ? 'Item' : 'Items'})
              </h2>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            
            {cart.length > 0 ? (
              <>
                {/* Cart Items List */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="flex gap-3 p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition-all"
                    >
                      <div className="w-20 h-24 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                        <SafeImage
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-semibold text-slate-900 truncate">
                            {item.product.title}
                          </h4>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Size: <span className="font-semibold text-slate-800">{item.size}</span> • Color: <span className="font-semibold text-slate-800">{item.color}</span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-sm font-black text-slate-900 font-['Outfit']">
                            ₹{item.product.price * item.quantity}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ₹{item.product.originalPrice * item.quantity}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-600">
                            {item.product.discount}% OFF
                          </span>
                        </div>

                        {/* Quantity controls & Remove */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center border border-slate-300 rounded-lg">
                            <button
                              onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                              className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-xs font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                              className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupons Section */}
                <div className="bg-indigo-50/50 border border-indigo-200/70 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5" />
                    Coupons & Offers
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-white border border-indigo-200 p-2.5 rounded-xl text-xs shadow-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="font-bold text-slate-900">{appliedCoupon.code}</span>
                          <p className="text-[11px] text-emerald-600 font-semibold">{appliedCoupon.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs font-bold text-rose-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Coupon (e.g. FIRST50)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2 uppercase focus:outline-none focus:border-indigo-600"
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors active:scale-95"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  {couponError && (
                    <p className="text-xs text-rose-500 font-medium">{couponError}</p>
                  )}

                  {/* Quick Coupon Suggestions */}
                  {!appliedCoupon && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] text-slate-500 font-medium">Available Coupons:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {couponsData.map(c => (
                          <button
                            key={c.code}
                            onClick={() => handleApplyQuickCoupon(c.code)}
                            className="text-[11px] font-bold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors shadow-sm"
                          >
                            {c.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Price Details
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex justify-between">
                      <span>Total Product Price (MRP)</span>
                      <span>₹{cartSummary.totalMRP}</span>
                    </div>

                    <div className="flex justify-between text-emerald-600">
                      <span>Total Discount</span>
                      <span>- ₹{cartSummary.productDiscount}</span>
                    </div>

                    {cartSummary.couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Coupon Discount</span>
                        <span>- ₹{cartSummary.couponDiscount}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-emerald-600">
                      <span>Delivery Charges</span>
                      <span className="font-bold uppercase">FREE</span>
                    </div>

                    <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900 font-['Outfit']">
                      <span>Order Total</span>
                      <span>₹{cartSummary.finalAmount}</span>
                    </div>
                  </div>

                  {/* Savings Banner */}
                  <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-2.5 rounded-xl text-center border border-emerald-200/60">
                    Yay! You will save ₹{cartSummary.totalSavings} on this order
                  </div>
                </div>

                {/* Trust Seal */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Safe & Secure 256-bit Encrypted Checkout</span>
                </div>
              </>
            ) : (
              /* Empty Cart State */
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Your Cart is Empty</h3>
                  <p className="text-xs text-slate-500 mt-1">Explore our lowest priced catalog and fill your cart!</p>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                >
                  Start Shopping
                </button>
              </div>
            )}

          </div>

          {/* 3. Sticky Footer Checkout Button */}
          {cart.length > 0 && (
            <div className="p-4 bg-white border-t border-slate-200 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Total Payable</span>
                  <div className="text-xl font-black text-slate-900 font-['Outfit']">
                    ₹{cartSummary.finalAmount}
                  </div>
                </div>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  Free Delivery
                </span>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-95"
              >
                <span>Continue to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
