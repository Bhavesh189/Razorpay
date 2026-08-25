import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Smartphone, QrCode, Star, ArrowRight, ShieldCheck, Download } from 'lucide-react';

export const DownloadAppModal = () => {
  const { activeModal, setActiveModal, showToast } = useShop();
  const [phoneInput, setPhoneInput] = useState("");
  const [smsSent, setSmsSent] = useState(false);

  if (activeModal !== 'downloadApp') return null;

  const handleSendLink = (e) => {
    e.preventDefault();
    if (phoneInput.length === 10) {
      setSmsSent(true);
      showToast(`Download link sent to +91 ${phoneInput}! 📲`);
    } else {
      alert("Please enter a valid 10-digit mobile number");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 relative my-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#4338ca] via-[#4f46e5] to-[#7c3aed] text-white p-6 text-center space-y-2">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-md shadow-inner border border-white/20">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-black font-['Outfit']">Download Infinity Store App</h3>
          <p className="text-xs text-indigo-100">
            Get an extra <strong>₹50 OFF</strong> on your first app order & free delivery on 100,000+ styles!
          </p>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* QR Code & App Ratings */}
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 border border-slate-200 rounded-2xl p-4">
            
            {/* Mock QR Code */}
            <div className="p-2.5 bg-white rounded-xl border border-slate-300 shadow-sm flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-24 h-24">
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="30" height="30" fill="#4f46e5" />
                <rect x="15" y="15" width="20" height="20" fill="white" />
                <rect x="20" y="20" width="10" height="10" fill="#4f46e5" />

                <rect x="60" y="10" width="30" height="30" fill="#4f46e5" />
                <rect x="65" y="15" width="20" height="20" fill="white" />
                <rect x="70" y="20" width="10" height="10" fill="#4f46e5" />

                <rect x="10" y="60" width="30" height="30" fill="#4f46e5" />
                <rect x="15" y="65" width="20" height="20" fill="white" />
                <rect x="20" y="70" width="10" height="10" fill="#4f46e5" />

                <rect x="50" y="50" width="15" height="15" fill="#7c3aed" />
                <rect x="70" y="65" width="20" height="15" fill="#4f46e5" />
                <rect x="48" y="25" width="8" height="15" fill="#4f46e5" />
              </svg>
            </div>

            {/* Ratings info */}
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-500 font-bold text-sm">
                <span>4.8</span>
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="text-slate-500 text-xs font-normal">(5 Crore+ Happy Users)</span>
              </div>
              <div className="text-xs text-slate-700 font-medium">
                Scan QR code with your phone camera to download directly.
              </div>
              <div className="text-[11px] text-slate-500">
                10 Crore+ Downloads on Google Play & App Store
              </div>
            </div>

          </div>

          {/* SMS Link Form */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Or receive download link via SMS
            </span>

            {!smsSent ? (
              <form onSubmit={handleSendLink} className="flex gap-2">
                <div className="flex-1 flex border border-slate-300 rounded-2xl overflow-hidden focus-within:border-indigo-600">
                  <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-2.5 flex items-center border-r border-slate-200">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 text-xs px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-colors active:scale-95"
                >
                  Send Link
                </button>
              </form>
            ) : (
              <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-2xl flex items-center gap-2 border border-emerald-200">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Link sent! Check your SMS to install the Infinity Store App.</span>
              </div>
            )}
          </div>

          {/* App Store badges */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <button 
              onClick={() => showToast("Redirecting to Google Play Store...")}
              className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-colors active:scale-95"
            >
              <div className="text-left">
                <div className="text-[9px] uppercase tracking-wider text-slate-400">GET IT ON</div>
                <div className="text-xs font-bold">Google Play</div>
              </div>
            </button>

            <button 
              onClick={() => showToast("Redirecting to Apple App Store...")}
              className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-colors active:scale-95"
            >
              <div className="text-left">
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Download on the</div>
                <div className="text-xs font-bold">App Store</div>
              </div>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
