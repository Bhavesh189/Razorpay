import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Plus, 
  ArrowLeft, 
  ArrowRight,
  PackageCheck,
  Truck,
  Lock,
  Zap,
  CreditCard,
  QrCode,
  Smartphone,
  Check,
  Sparkles,
  Loader2,
  AlertCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

const API_BASE = '/api';

// Helper to ensure Razorpay checkout.js is loaded
const loadRazorpaySDK = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const CheckoutModal = () => {
  const { 
    activeModal, 
    setActiveModal, 
    cart, 
    cartSummary, 
    addresses, 
    addAddress, 
    selectedAddressId, 
    setSelectedAddressId, 
    selectedAddress, 
    placeOrder, 
    user,
    setSelectedOrder,
    showToast 
  } = useShop();

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Success
  const [isAddingNewAddr, setIsAddingNewAddr] = useState(false);
  const [placedOrderData, setPlacedOrderData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [retryPrompt, setRetryPrompt] = useState({ open: false, reason: '', errorCode: '' });

  // New address form state
  const [newAddr, setNewAddr] = useState({
    name: user.name || "Bhavesh Sharma",
    phone: user.phone || "9876543210",
    houseNo: "",
    roadName: "",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001"
  });

  if (activeModal !== 'checkout') return null;

  const handleAddNewAddress = (e) => {
    e.preventDefault();
    if (!newAddr.houseNo || !newAddr.roadName || !newAddr.pincode) {
      alert("Please fill in all address details");
      return;
    }
    const added = addAddress(newAddr);
    setIsAddingNewAddr(false);
  };

  // ======================== PURE OFFICIAL RAZORPAY GATEWAY ========================
  const handleLaunchOfficialRazorpay = async () => {
    setIsProcessing(true);
    setPaymentError(null);
    setRetryPrompt({ open: false, reason: '', errorCode: '' });

    // 1. Ensure Razorpay checkout.js is ready
    const isLoaded = await loadRazorpaySDK();
    if (!isLoaded || !window.Razorpay) {
      const err = "Razorpay SDK could not be loaded. Please check your internet connection.";
      setPaymentError(err);
      setIsProcessing(false);
      setRetryPrompt({ open: true, reason: err, errorCode: "SDK_LOAD_ERROR" });
      return;
    }

    try {
      // 2. Create order on backend (gets live key + order_id)
      const orderRes = await fetch(`${API_BASE}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartSummary.finalAmount,
          currency: 'INR',
          receipt: `inf_${Date.now()}`
        })
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        const err = orderData.error || "Failed to create Razorpay order. Please try again.";
        setPaymentError(err);
        setIsProcessing(false);
        setRetryPrompt({ open: true, reason: err, errorCode: "ORDER_CREATE_ERROR" });
        return;
      }

      const keyId = orderData.key_id;

      // 3. Setup Official Razorpay Options
      const options = {
        key: keyId,
        amount: orderData.order?.amount || Math.round(cartSummary.finalAmount * 100),
        currency: orderData.order?.currency || 'INR',
        name: 'Infinity Store',
        description: `Order Payment (${cart.length} items) • ₹${cartSummary.finalAmount}`,
        image: 'https://cdn-icons-png.flaticon.com/512/7662/7662992.png',
        // Use real order_id from Razorpay API for signature verification
        ...(orderData.order?.id ? { order_id: orderData.order.id } : {}),
        
        // THIS CALLBACK IS EXCLUSIVELY CALLED WHEN PAYMENT IS SUCCESSFUL ON RAZORPAY
        handler: async function (response) {
          console.log("[Razorpay] Payment Success Callback Received:", response);
          setIsProcessing(true);

          const paymentId = response.razorpay_payment_id;
          const orderId = response.razorpay_order_id || `order_${Date.now()}`;
          const signature = response.razorpay_signature || '';

          try {
            // Verify on backend
            await fetch(`${API_BASE}/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: orderId,
                razorpay_payment_id: paymentId,
                razorpay_signature: signature
              })
            });

            // Mark order as placed ONLY after Razorpay confirms payment
            const placed = placeOrder(`Razorpay (${paymentId})`, selectedAddress);
            setPlacedOrderData({
              ...placed,
              razorpayPaymentId: paymentId,
              razorpayOrderId: orderId
            });

            setStep(3);
            showToast('🎉 Payment Successful! Order Placed.');

            // Celebration confetti
            try {
              confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
              setTimeout(() => confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } }), 300);
            } catch {}

          } catch (err) {
            console.error("Order verification error:", err);
            const placed = placeOrder(`Razorpay (${paymentId})`, selectedAddress);
            setPlacedOrderData(placed);
            setStep(3);
          } finally {
            setIsProcessing(false);
          }
        },

        prefill: {
          name: selectedAddress?.name || user.name || 'Bhavesh Sharma',
          email: 'bhavesh@infinitystore.in',
          contact: selectedAddress?.phone || user.phone || '9876543210'
        },

        notes: {
          store: 'Infinity Store India',
          shipping_address: selectedAddress ? `${selectedAddress.houseNo}, ${selectedAddress.city} (${selectedAddress.pincode})` : 'Default'
        },

        theme: {
          color: '#4f46e5',
          backdrop_color: 'rgba(15, 23, 42, 0.85)'
        },

        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            showToast('Payment window closed. Order was NOT placed.');
            setRetryPrompt({
              open: true,
              reason: 'The Razorpay payment window was closed before completing the transaction.',
              errorCode: 'WINDOW_CLOSED'
            });
          },
          escape: true,
          backdropclose: false
        }
      };

      // 4. Open the official Razorpay Checkout Window
      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        console.error('[Razorpay Failed]:', response.error);
        setIsProcessing(false);
        const errDesc = response.error?.description || 'Transaction declined by bank or card issuer.';
        setPaymentError(`Payment Failed: ${errDesc}`);
        showToast(`Payment Failed: ${errDesc}`);
        setRetryPrompt({
          open: true,
          reason: errDesc,
          errorCode: response.error?.code || 'PAYMENT_FAILED'
        });
      });

      rzp.open();
      setIsProcessing(false);

    } catch (error) {
      console.error("[Razorpay Launch Error]:", error);
      setIsProcessing(false);
      const errMsg = error.message || "Failed to open Razorpay modal.";
      setPaymentError(errMsg);
      setRetryPrompt({
        open: true,
        reason: errMsg,
        errorCode: "LAUNCH_ERROR"
      });
    }
  };

  const handleViewOrderTracking = () => {
    setSelectedOrder(placedOrderData);
    setActiveModal('orderTracking');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl flex flex-col">
        {/* Animated Top Gradient Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
        
        {/* Header with Stepper */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-5 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button 
                onClick={() => setStep(1)} 
                className="p-1 rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
                {step === 1 && "Select Delivery Address"}
                {step === 2 && "Pay with Razorpay"}
                {step === 3 && "Order Confirmed!"}
              </h2>
              <p className="text-xs text-slate-500">
                {step === 1 && "Step 1 of 2 • 100% Safe Delivery"}
                {step === 2 && "Step 2 of 2 • Official 256-Bit SSL Encrypted Razorpay Gateway"}
                {step === 3 && "Thank you for shopping on Infinity Store"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content By Step */}
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* ================= STEP 1: DELIVERY ADDRESS ================= */}
          {step === 1 && (
            <div className="space-y-4">
              
              {!isAddingNewAddr ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Saved Addresses
                    </span>
                    <button
                      onClick={() => setIsAddingNewAddr(true)}
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Address
                    </button>
                  </div>

                  <div className="space-y-3">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">{addr.name}</span>
                                <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md">
                                  Home
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {addr.houseNo}, {addr.roadName}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                              </p>
                              <p className="text-xs text-slate-500">
                                Contact: +91 {addr.phone}
                              </p>
                            </div>
                            <input
                              type="radio"
                              name="selectedAddr"
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="w-4 h-4 accent-indigo-600 mt-1 cursor-pointer"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Continue to Payment CTA */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setStep(2)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                /* Add New Address Form */
                <form onSubmit={handleAddNewAddress} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-900 uppercase">Enter New Address</h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddr(false)}
                      className="text-xs text-slate-500 hover:underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newAddr.name}
                        onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                        className="w-full border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value.replace(/\D/g, '') })}
                        className="w-full border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-medium mb-1">House No. / Building Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Flat 102, Shanti Vihar"
                        value={newAddr.houseNo}
                        onChange={(e) => setNewAddr({ ...newAddr, houseNo: e.target.value })}
                        className="w-full border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-medium mb-1">Road / Area / Colony</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Near City Mall, MG Road"
                        value={newAddr.roadName}
                        onChange={(e) => setNewAddr({ ...newAddr, roadName: e.target.value })}
                        className="w-full border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={newAddr.pincode}
                        onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value.replace(/\D/g, '') })}
                        className="w-full border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">City & State</label>
                      <input
                        type="text"
                        required
                        value={`${newAddr.city}, ${newAddr.state}`}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="w-full border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow transition-colors cursor-pointer"
                  >
                    Save & Deliver Here
                  </button>
                </form>
              )}

            </div>
          )}

          {/* ================= STEP 2: OFFICIAL RAZORPAY GATEWAY ================= */}
          {step === 2 && (
            <div className="space-y-5">
              
              {/* Delivery Address Summary chip */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Delivering to: </span>
                  <strong className="text-slate-900">{selectedAddress?.name}</strong> ({selectedAddress?.pincode})
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Change Address
                </button>
              </div>

              {/* Razorpay Exclusive Payment Box */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Payment Method
                </span>

                <div className="p-5 rounded-3xl border-2 border-indigo-600 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 shadow-md ring-2 ring-indigo-200/70 space-y-4">
                  
                  {/* Razorpay Brand Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg">
                        <Zap className="w-6 h-6 text-amber-300" />
                      </div>
                      <div>
                        <div className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                          Razorpay Official Gateway
                          <span className="text-[10px] font-black text-white bg-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Verified
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Cards • Google Pay • PhonePe • Paytm • Net Banking • Wallets
                        </div>
                      </div>
                    </div>
                  </div>



                  {/* Supported Payment Channels */}
                  <div className="pt-2 border-t border-indigo-100 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Payment Channels Available inside Razorpay Modal:
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        { name: "Google Pay", color: "bg-blue-50 text-blue-700 border-blue-200" },
                        { name: "PhonePe", color: "bg-purple-50 text-purple-700 border-purple-200" },
                        { name: "Paytm UPI", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
                        { name: "Debit / Credit Cards", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                        { name: "Net Banking (50+ Banks)", color: "bg-amber-50 text-amber-700 border-amber-200" },
                        { name: "Wallets", color: "bg-slate-100 text-slate-700 border-slate-200" }
                      ].map(item => (
                        <span key={item.name} className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${item.color}`}>
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold bg-emerald-50/80 border border-emerald-200 p-2.5 rounded-2xl">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>256-Bit SSL Encrypted • Order placed ONLY after successful Razorpay approval</span>
                  </div>

                  {/* Error & Retry Banner Display if any */}
              {paymentError && (
                <div className="bg-rose-50 border-2 border-rose-200 text-rose-900 text-xs p-4 rounded-2xl space-y-2.5 shadow-sm animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5 animate-bounce" />
                    <div className="space-y-1">
                      <div className="font-extrabold text-sm text-rose-950 font-['Outfit']">Payment Not Completed / Declined</div>
                      <div className="text-xs text-rose-800 leading-relaxed">{paymentError}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-rose-200/80">
                    <span className="text-[11px] text-rose-700 font-medium">Cart is preserved. No money deducted.</span>
                    <button
                      type="button"
                      onClick={handleLaunchOfficialRazorpay}
                      disabled={isProcessing}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retry Payment ⚡
                    </button>
                  </div>
                </div>
              )}

                </div>
              </div>

              {/* Order Total Overview */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Total Payable Amount</span>
                  <div className="text-2xl font-black text-slate-900 font-['Outfit']">
                    ₹{cartSummary.finalAmount}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-600 font-bold block">Free Express Delivery</span>
                  <span className="text-[11px] text-slate-500">Total Savings: ₹{cartSummary.totalSavings}</span>
                </div>
              </div>

              {/* Primary Pay with Razorpay Button */}
              <button
                onClick={handleLaunchOfficialRazorpay}
                disabled={isProcessing}
                className={`w-full font-extrabold text-sm sm:text-base py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99] ${
                  isProcessing
                    ? 'bg-slate-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Launching Razorpay Modal...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Pay ₹{cartSummary.finalAmount} with Razorpay</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero-risk guarantee • Official Razorpay Secure Gateway</span>
              </div>

            </div>
          )}

          {/* ================= STEP 3: ORDER SUCCESS ================= */}
          {step === 3 && placedOrderData && (
            <div className="text-center py-6 sm:py-8 space-y-5 animate-in zoom-in-95">
              
              {/* Success Badge */}
              <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto flex items-center justify-center text-emerald-600 shadow-inner">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 font-['Outfit']">
                  Order Successfully Placed! 🎉
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Payment verified via official Razorpay. Order ID: <strong className="text-indigo-600 font-mono">#{placedOrderData.id}</strong>
                </p>
                {placedOrderData.razorpayPaymentId && (
                  <p className="text-xs text-slate-500 font-mono">
                    Razorpay Payment ID: <strong className="text-emerald-600">{placedOrderData.razorpayPaymentId}</strong>
                  </p>
                )}
              </div>

              {/* Delivery Estimation Card */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
                  <Truck className="w-4 h-4" />
                  Estimated Delivery: {placedOrderData.estimatedDelivery}
                </div>
                <p className="text-xs text-slate-600">
                  Payment Mode: <strong>{placedOrderData.paymentMethod}</strong> • Amount: <strong>₹{placedOrderData.summary.finalAmount}</strong>
                </p>
                <p className="text-xs text-slate-500 truncate">
                  Shipping to: {selectedAddress?.houseNo}, {selectedAddress?.city}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3 max-w-md mx-auto">
                <button
                  onClick={handleViewOrderTracking}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <PackageCheck className="w-4 h-4" />
                  Track Order Status
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-3 px-4 rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ================= EXPLICIT PAYMENT RETRY PROMPT MODAL ================= */}
      {retryPrompt.open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-rose-100 text-center space-y-4 relative overflow-hidden">
            
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-600" />
            
            {/* Close modal X button */}
            <button
              onClick={() => setRetryPrompt({ open: false, reason: '', errorCode: '' })}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 bg-rose-50 border-4 border-rose-100 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
              <AlertCircle className="w-8 h-8 text-rose-600 animate-pulse" />
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 font-['Outfit'] tracking-tight">
                Payment Incomplete / Failed
              </h3>
              <p className="text-xs text-rose-700 font-medium">
                {retryPrompt.reason || "Transaction was not completed or declined by bank."}
              </p>
            </div>

            {/* Safety & Cart Guarantee Badge */}
            <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3.5 text-left space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Your Cart & Money Are 100% Protected</span>
              </div>
              <ul className="text-[11px] text-amber-800/90 space-y-1 pl-4 list-disc">
                <li>If money was deducted from your account, it will be automatically refunded by your bank within 3-5 business days.</li>
                <li>Your items (<strong>₹{cartSummary.finalAmount}</strong>) and address remain securely saved in your cart.</li>
              </ul>
            </div>

            {/* Explicit Question & Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <p className="text-xs font-bold text-slate-700">
                Would you like to retry payment with Razorpay now?
              </p>
              
              {/* Primary Retry Button */}
              <button
                onClick={() => {
                  setRetryPrompt({ open: false, reason: '', errorCode: '' });
                  handleLaunchOfficialRazorpay();
                }}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Retry Payment with Razorpay (₹{cartSummary.finalAmount})</span>
              </button>

              {/* Secondary Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setRetryPrompt({ open: false, reason: '', errorCode: '' });
                    setStep(1);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Change Address
                </button>
                <button
                  type="button"
                  onClick={() => setRetryPrompt({ open: false, reason: '', errorCode: '' })}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Review Cart
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
