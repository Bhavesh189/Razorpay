import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Phone, 
  Mail, 
  Truck, 
  RotateCcw, 
  CreditCard, 
  Send,
  Sparkles,
  Bot
} from 'lucide-react';

export const HelpModal = () => {
  const { activeModal, setActiveModal, user } = useShop();

  const [activeFaqIndex, setActiveFaqIndex] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hello! Welcome to Infinity Store Support. How can I assist you with your orders, payments, or returns today?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [activeTab, setActiveTab] = useState("faq"); // 'faq' | 'chat'

  if (activeModal !== 'help') return null;

  const faqs = [
    {
      q: "How do I track my Infinity Store order?",
      a: "You can track your order live anytime by clicking on 'Track Orders' in the top header or opening your profile. You'll see real-time updates from packing to doorstep delivery."
    },
    {
      q: "What is the return & refund policy?",
      a: "Infinity Store offers a 100% hassle-free 7-Day Easy Return policy. If you receive a wrong, defective, or unsatisfactory item, you can initiate a return from Order Tracking, and our courier partner will pick it up from your doorstep for a full refund."
    },
    {
      q: "What online payment methods are accepted?",
      a: "We accept all major online payment options including UPI (PhonePe, Google Pay, Paytm, BHIM), Credit/Debit Cards (Visa, MasterCard, RuPay), Net Banking across 50+ banks, and digital wallets with 256-bit SSL encryption."
    },
    {
      q: "How can I apply discount coupon codes?",
      a: "During checkout or inside your Cart Drawer, enter your coupon code (e.g. FIRST50, INFINITY20) in the 'Coupons & Offers' field and click 'Apply'."
    },
    {
      q: "Are shipping and delivery really free?",
      a: "Yes! Infinity Store offers 100% Free Shipping on all products across 28,000+ Indian pincodes without any hidden fees or minimum purchase restrictions."
    }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMsg = { sender: "user", text: userInput };
    setChatMessages(prev => [...prev, newMsg]);
    setUserInput("");

    // Simulated Smart Support Bot Response
    setTimeout(() => {
      let botReply = "Thank you for reaching out! A support executive will assist you shortly regarding your query.";
      const lower = userInput.toLowerCase();

      if (lower.includes("track") || lower.includes("status")) {
        botReply = "You can view live status of your shipments in the 'Track Orders' section anytime.";
      } else if (lower.includes("return") || lower.includes("refund")) {
        botReply = "Returns are accepted within 7 days of delivery. Refunds are credited instantly to your original payment method once picked up.";
      } else if (lower.includes("payment") || lower.includes("upi")) {
        botReply = "We support instant online payments via UPI, Credit/Debit Cards, and Net Banking with 100% security.";
      }

      setChatMessages(prev => [...prev, { sender: "bot", text: botReply }]);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 relative my-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-5 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
              Infinity Store Help Centre & 24/7 Support
            </h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-4 border-b border-slate-100 flex gap-2">
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "faq"
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Frequently Asked Questions
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "chat"
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Live AI Assistant Chat
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          
          {activeTab === "faq" ? (
            <>
              {/* Quick Contact Action Strip */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <Truck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                  <span className="text-xs font-bold text-slate-900 block">Fast Delivery</span>
                  <p className="text-[10px] text-slate-500">2-4 Days Shipping</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <CreditCard className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                  <span className="text-xs font-bold text-slate-900 block">Safe Payments</span>
                  <p className="text-[10px] text-slate-500">UPI / Cards / Refunds</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <RotateCcw className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                  <span className="text-xs font-bold text-slate-900 block">Easy Returns</span>
                  <p className="text-[10px] text-slate-500">7 Days Window</p>
                </div>
              </div>

              {/* Accordion FAQ list */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Top Questions
                </h3>
                {faqs.map((faq, idx) => {
                  const isOpen = activeFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                    >
                      <button
                        onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Email & Hotline support */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Need more help?</span>
                  <span className="text-slate-500">Email: support@infinitystore.in • Phone: 1800-889-9999</span>
                </div>
                <button
                  onClick={() => setActiveTab("chat")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl transition-all"
                >
                  Start Chat
                </button>
              </div>
            </>
          ) : (
            /* Live Chat Interface */
            <div className="space-y-4">
              <div className="h-64 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "bot" && (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-[10px]">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-indigo-600 text-white rounded-br-none shadow-sm"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your question here (e.g. returns, tracking)..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="flex-1 text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
