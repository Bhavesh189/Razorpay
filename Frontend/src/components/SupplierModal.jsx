import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, 
  Store, 
  Percent, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Calculator, 
  Building, 
  Truck
} from 'lucide-react';

export const SupplierModal = () => {
  const { activeModal, setActiveModal, showToast } = useShop();

  const [monthlyOrders, setMonthlyOrders] = useState(250);
  const [avgPrice, setAvgPrice] = useState(400);
  const [isRegistered, setIsRegistered] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    mobile: "",
    email: "",
    gstin: "",
    city: ""
  });

  if (activeModal !== 'supplier') return null;

  const commissionSaved = Math.round((monthlyOrders * avgPrice) * 0.18); // 18% commission saved compared to other platforms
  const estimatedRevenue = monthlyOrders * avgPrice;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsRegistered(true);
    showToast("Supplier Application Submitted! Our team will contact you within 24 hours.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 relative my-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-white/80 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#4338ca] via-[#4f46e5] to-[#7c3aed] text-white p-6 sm:p-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-yellow-300">
            <Percent className="w-3.5 h-3.5" /> 0% Commission Forever
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] leading-tight">
            Grow Your Business Online with Infinity Store
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
            Join 11 Lakh+ sellers who trust Infinity Store to sell to 14 Crore+ customers across 28,000+ Indian pincodes.
          </p>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
          
          {/* Key Advantages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {[
              { title: "0% Commission", desc: "Keep 100% of your sales profits", icon: Percent, color: "text-indigo-600" },
              { title: "7 Days Payment", desc: "Fastest 7-day secure payment cycle", icon: Clock, color: "text-emerald-600" },
              { title: "0 Penalty", desc: "No cancellation or return penalties", icon: ShieldCheck, color: "text-blue-600" },
              { title: "PAN India Reach", desc: "Deliver to 28,000+ pincodes", icon: Truck, color: "text-amber-600" },
            ].map((adv, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
                <adv.icon className={`w-5 h-5 ${adv.color}`} />
                <h4 className="text-xs font-bold text-slate-900">{adv.title}</h4>
                <p className="text-[11px] text-slate-500 leading-tight">{adv.desc}</p>
              </div>
            ))}
          </div>

          {/* Interactive Profit Calculator */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-3xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                Infinity Profit & Commission Savings Calculator
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Sliders */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Estimated Monthly Orders</span>
                    <strong className="text-indigo-600 text-sm">{monthlyOrders} Orders</strong>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={2000}
                    step={25}
                    value={monthlyOrders}
                    onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Average Selling Price</span>
                    <strong className="text-indigo-600 text-sm">₹{avgPrice}</strong>
                  </div>
                  <input
                    type="range"
                    min={150}
                    max={2500}
                    step={50}
                    value={avgPrice}
                    onChange={(e) => setAvgPrice(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Earnings Box */}
              <div className="bg-white border border-indigo-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-sm">
                <div>
                  <span className="text-xs text-slate-500">Estimated Gross Monthly Sales</span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
                    ₹{estimatedRevenue.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                  <div className="text-[11px] text-emerald-800 font-medium">
                    💰 Commission Saved on Infinity Store vs Other Platforms:
                  </div>
                  <div className="text-lg font-black text-emerald-700 font-['Outfit']">
                    ₹{commissionSaved.toLocaleString('en-IN')} / month
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Registration Form */}
          {!isRegistered ? (
            <div className="space-y-4 border-t border-slate-200 pt-6">
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Register as an Infinity Supplier in 3 Easy Steps
                </h3>
                <p className="text-xs text-slate-500">
                  All you need is a valid GSTIN, Bank Account, and active phone number.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Business / Store Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Textile Mills"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    required
                    placeholder="15-digit GSTIN (e.g. 07AAAAA0000A1Z5)"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 uppercase focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">City & State</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Surat, Gujarat"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Building className="w-4 h-4" />
                    <span>Create Seller Account & Start Selling</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-lg font-bold text-slate-900">Application Received!</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Thank you for applying to sell on Infinity Store with <strong>0% Commission</strong>. Our supplier onboarding executive will verify your GSTIN and contact you within 24 hours.
              </p>
              <button
                onClick={() => setActiveModal(null)}
                className="bg-indigo-600 text-white text-xs font-bold px-6 py-2 rounded-xl shadow"
              >
                Close
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
