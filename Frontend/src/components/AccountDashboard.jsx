import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  PackageCheck, Heart, HelpCircle, FileText, 
  ChevronRight, Truck, CheckCircle2, ShoppingBag, 
  Trash2, X, ChevronDown, ChevronUp, MessageCircle, 
  Phone, Mail, RotateCcw, CreditCard, Send, Bot, Sparkles, User
} from 'lucide-react';
import { SafeImage } from './SafeImage';

export const AccountDashboard = () => {
  const { 
    currentAccountTab, 
    setCurrentAccountTab, 
    user, 
    orders, 
    wishlist, 
    products, 
    toggleWishlist, 
    addToCart,
    selectedOrder, 
    setSelectedOrder,
    setActiveModal,
    setSelectedProduct
  } = useShop();

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: PackageCheck },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'faq', label: 'FAQ', icon: FileText }
  ];

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setActiveModal('productDetail');
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
        
        {/* Sidebar Navigation (Desktop) & Top Tabs (Mobile) */}
        <div className="w-full md:w-64 lg:w-72 flex-shrink-0 flex flex-col gap-4">
          
          {/* User Profile Summary */}
          <div className="bg-[#13131a] border border-[#1e1e2e] rounded-3xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
              <User className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-slate-200 truncate">
                {user?.isLoggedIn ? user.name || user.phone : 'Guest User'}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                {user?.isLoggedIn ? user.email || user.phone : 'Sign in to sync data'}
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="bg-[#13131a] border border-[#1e1e2e] rounded-3xl p-2 shadow-sm flex overflow-x-auto no-scrollbar md:flex-col gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = currentAccountTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentAccountTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl whitespace-nowrap transition-all flex-shrink-0 md:flex-shrink-auto ${
                    isActive 
                      ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20' 
                      : 'text-slate-400 hover:bg-[#1e1e2e] hover:text-slate-200 font-medium border border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="text-sm">{tab.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto hidden md:block text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0 bg-[#13131a] border border-[#1e1e2e] rounded-3xl p-4 sm:p-6 lg:p-8 min-h-[60vh] shadow-sm">
          {currentAccountTab === 'orders' && <OrdersView orders={orders} selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} setActiveModal={setActiveModal} />}
          {currentAccountTab === 'wishlist' && <WishlistView wishlist={wishlist} products={products} toggleWishlist={toggleWishlist} addToCart={addToCart} handleProductClick={handleProductClick} />}
          {currentAccountTab === 'help' && <HelpView />}
          {currentAccountTab === 'faq' && <FaqView />}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                ORDERS VIEW                                 */
/* -------------------------------------------------------------------------- */
const OrdersView = ({ orders, selectedOrder, setSelectedOrder, setActiveModal }) => {
  const currentOrder = selectedOrder || (orders.length > 0 ? orders[0] : null);

  if (orders.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto shadow-inner border border-indigo-500/20">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-200">No Orders Placed Yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-2">
            You haven't placed any orders yet. Start exploring Infinity Store's 50 Lakh+ products today!
          </p>
        </div>
        <button
          onClick={() => window.location.reload()} // Just reload or navigate to home
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-8 py-3 rounded-2xl shadow-md transition-all active:scale-95 mt-4"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Left Column: Orders List */}
      <div className="xl:col-span-5 space-y-4">
        <h2 className="text-lg font-bold text-slate-200 font-['Outfit'] border-b border-[#1e1e2e] pb-4">
          Order History ({orders.length})
        </h2>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {orders.map((order) => {
            const isSelected = currentOrder?.id === order.id;
            const firstItem = order.items[0];

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-500/50 bg-indigo-500/10 shadow-sm'
                    : 'border-[#1e1e2e] hover:border-[#2a2a3a] bg-[#1a1a24]'
                }`}
              >
                <div className="flex gap-4 items-center">
                  {firstItem && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#1e1e2e] flex-shrink-0 bg-[#0a0a0f]">
                      <SafeImage
                        src={firstItem.product.images[0]}
                        alt=""
                        className="w-full h-full object-cover mix-blend-multiply"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-200 truncate">
                        {order.id}
                      </span>
                      <span className="text-[10px] sm:text-xs bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Confirmed
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • ₹{order.summary.finalAmount}
                    </p>
                    <p className="text-[11px] font-medium text-indigo-400 mt-1.5 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      Expected {order.estimatedDelivery}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Order Details & Live Timeline Stepper */}
      {currentOrder && (
        <div className="xl:col-span-7 bg-[#1a1a24] border border-[#1e1e2e] rounded-3xl p-5 sm:p-8 space-y-6 shadow-inner">
          <div className="flex items-center justify-between border-b border-[#1e1e2e] pb-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Order ID</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-200 mt-0.5">
                {currentOrder.id}
              </h3>
            </div>
            <span className="text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              On Schedule
            </span>
          </div>

          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Live Tracking
            </span>
            <div className="space-y-5 relative pl-7 before:content-[''] before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2a2a3a]">
              {currentOrder.trackingSteps.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className={`absolute -left-[30px] top-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    step.done 
                      ? 'bg-indigo-600 text-white shadow-md ring-4 ring-indigo-500/20' 
                      : 'bg-[#13131a] border-2 border-[#2a2a3a] text-slate-600'
                  }`}>
                    {step.done ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-slate-600"></div>}
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${step.done ? 'text-slate-200' : 'text-slate-500'}`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {step.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#1e1e2e] pt-5 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Items Ordered ({currentOrder.items.length})
            </span>
            <div className="space-y-3">
              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-[#13131a] p-3 rounded-2xl border border-[#1e1e2e] shadow-sm text-sm">
                  <div className="w-12 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#0a0a0f]">
                    <SafeImage src={item.product.images[0]} alt="" className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-200 truncate">{item.product.title}</div>
                    <div className="text-slate-500 text-xs mt-0.5">Size: {item.size} • Qty: {item.quantity}</div>
                  </div>
                  <span className="font-bold text-slate-200 font-['Outfit']">
                    ₹{item.product.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#1e1e2e] pt-5 text-sm space-y-2 text-slate-400 bg-[#13131a] p-4 rounded-2xl shadow-sm border mt-4">
            <div>
              <strong className="text-slate-300">Delivering to:</strong> {currentOrder.address?.name}, {currentOrder.address?.houseNo}, {currentOrder.address?.city} - {currentOrder.address?.pincode}
            </div>
            <div>
              <strong className="text-slate-300">Payment:</strong> {currentOrder.paymentMethod} (₹{currentOrder.summary.finalAmount})
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                WISHLIST VIEW                               */
/* -------------------------------------------------------------------------- */
const WishlistView = ({ wishlist, products, toggleWishlist, addToCart, handleProductClick }) => {
  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-[#1e1e2e] pb-4">
        <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
        <h2 className="text-xl font-bold text-slate-200 font-['Outfit']">
          My Wishlist ({wishlistedProducts.length})
        </h2>
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistedProducts.map((product) => (
            <div key={product.id} className="bg-[#1a1a24] border border-[#1e1e2e] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-500/50 transition-all flex flex-col group relative">
              <div onClick={() => handleProductClick(product)} className="relative aspect-[4/5] bg-[#0a0a0f] overflow-hidden cursor-pointer">
                <SafeImage src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform mix-blend-multiply" />
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#13131a]/80 backdrop-blur-sm shadow-md flex items-center justify-center text-rose-500 hover:bg-rose-500/20 transition-colors border border-[#2a2a3a]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#1a1a24]">
                <div>
                  <h4 onClick={() => handleProductClick(product)} className="text-sm font-bold text-slate-200 line-clamp-2 cursor-pointer hover:text-indigo-400 leading-snug">
                    {product.title}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                    <span className="text-base sm:text-lg font-black text-slate-200 font-['Outfit']">₹{product.price}</span>
                    <span className="text-xs text-slate-500 line-through">₹{product.originalPrice}</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{product.discount}% off</span>
                  </div>
                </div>
                <button onClick={() => addToCart(product)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold py-2.5 sm:py-3 rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-md">
                  <ShoppingBag className="w-4 h-4" /> Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center space-y-4">
          <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner border border-rose-500/20">
            <Heart className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">Your Wishlist is Empty</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Tap the heart icon on any product to save it to your wishlist for later.
          </p>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              HELP / CHAT VIEW                              */
/* -------------------------------------------------------------------------- */
const HelpView = () => {
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hello! Welcome to Infinity Store Support. I am your 24/7 AI Assistant. How can I help you today?" }
  ]);
  const [userInput, setUserInput] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMsg = { sender: "user", text: userInput };
    setChatMessages(prev => [...prev, newMsg]);
    setUserInput("");

    setTimeout(() => {
      let botReply = "Thank you for reaching out! A support executive will assist you shortly regarding your query.";
      const lower = userInput.toLowerCase();
      if (lower.includes("track") || lower.includes("status")) botReply = "You can view live status of your shipments in the 'My Orders' tab.";
      else if (lower.includes("return") || lower.includes("refund")) botReply = "Returns are accepted within 7 days. Refunds are credited instantly once picked up.";
      else if (lower.includes("payment")) botReply = "We support instant online payments via UPI, Credit/Debit Cards, and Net Banking.";

      setChatMessages(prev => [...prev, { sender: "bot", text: botReply }]);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-[#1e1e2e] pb-4">
        <MessageCircle className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-bold text-slate-200 font-['Outfit']">Live Support Chat</h2>
      </div>

      <div className="bg-[#0a0a0f] rounded-3xl border border-[#1e1e2e] p-4 h-[60vh] flex flex-col shadow-inner relative">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "bot" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className={`max-w-[75%] sm:max-w-[60%] p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed shadow-sm border ${
                msg.sender === "user" ? "bg-indigo-600 border-indigo-500 text-white rounded-br-none" : "bg-[#1e1e2e] border-[#2a2a3a] text-slate-200 rounded-bl-none"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 sm:gap-3 bg-[#13131a] p-2 rounded-2xl border border-[#1e1e2e] shadow-sm relative z-10">
          <input
            type="text"
            placeholder="Type your question..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-1 text-sm text-slate-200 bg-transparent px-3 py-2 focus:outline-none placeholder-slate-500"
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-all active:scale-95 shadow-md">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  FAQ VIEW                                  */
/* -------------------------------------------------------------------------- */
const FaqView = () => {
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  const faqs = [
    { q: "How do I track my order?", a: "Track your order live anytime by navigating to the 'My Orders' tab in this dashboard. You'll see real-time updates from packing to delivery." },
    { q: "What is the return & refund policy?", a: "We offer a 100% hassle-free 7-Day Easy Return policy. Initiate a return from your Orders tab, and our courier will pick it up for a full refund." },
    { q: "What online payment methods are accepted?", a: "We accept UPI (PhonePe, GPay, Paytm), Credit/Debit Cards, Net Banking, and digital wallets via our 256-bit SSL encrypted gateway." },
    { q: "How can I apply discount coupon codes?", a: "During checkout, enter your code in the 'Coupons & Offers' field and click 'Apply'." },
    { q: "Are shipping and delivery really free?", a: "Yes! 100% Free Shipping on all products across 28,000+ Indian pincodes without any hidden fees." }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-[#1e1e2e] pb-4">
        <FileText className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-bold text-slate-200 font-['Outfit']">Frequently Asked Questions</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-4 sm:p-5 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl shadow-sm">
          <Truck className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
          <span className="text-sm font-bold text-slate-200 block">Fast Delivery</span>
          <p className="text-xs text-slate-400 mt-1">2-4 Days Shipping</p>
        </div>
        <div className="p-4 sm:p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl shadow-sm">
          <CreditCard className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <span className="text-sm font-bold text-slate-200 block">Safe Payments</span>
          <p className="text-xs text-slate-400 mt-1">UPI & Cards verified</p>
        </div>
        <div className="p-4 sm:p-5 bg-rose-500/5 border border-rose-500/20 rounded-3xl shadow-sm">
          <RotateCcw className="w-6 h-6 text-rose-400 mx-auto mb-2" />
          <span className="text-sm font-bold text-slate-200 block">Easy Returns</span>
          <p className="text-xs text-slate-400 mt-1">7 Days Window</p>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        {faqs.map((faq, idx) => {
          const isOpen = activeFaqIndex === idx;
          return (
            <div key={idx} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-indigo-500/50 shadow-md bg-[#1e1e2e]' : 'border-[#1e1e2e] hover:border-[#2a2a3a] bg-[#1a1a24] shadow-sm'}`}>
              <button onClick={() => setActiveFaqIndex(isOpen ? null : idx)} className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-slate-200 focus:outline-none">
                <span className="pr-4">{faq.q}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'bg-indigo-500/20' : 'bg-[#2a2a3a]'}`}>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-[#2a2a3a] pt-4 bg-[#13131a]/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
