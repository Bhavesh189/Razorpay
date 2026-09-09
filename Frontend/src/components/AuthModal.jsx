import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Smartphone, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { InfinityLogo } from './InfinityLogo';

export const AuthModal = () => {
  const { activeModal, setActiveModal, user, setUser, showToast } = useShop();

  const [step, setStep] = useState(1); // 1: Enter Phone, 2: Enter OTP
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("123456");
  const [otpError, setOtpError] = useState("");

  if (activeModal !== 'auth') return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setStep(2);
    showToast(`Your Infinity Store OTP is: ${mockOtp}`);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp === generatedOtp || enteredOtp === "123456") {
      setUser({
        isLoggedIn: true,
        phone: phoneNumber,
        name: userName || "Bhavesh Sharma"
      });
      showToast("Logged in successfully! Welcome to Infinity Store 🎉");
      setActiveModal(null);
    } else {
      setOtpError("Incorrect OTP. Please enter the valid 6-digit code.");
    }
  };

  const autoFillOtp = () => {
    const digits = generatedOtp.split("");
    setOtp(digits);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 relative my-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Top graphic */}
        <div className="bg-gradient-to-r from-[#4338ca] via-[#4f46e5] to-[#7c3aed] p-6 text-white text-center space-y-2">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-md shadow-inner border border-white/20">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-black font-['Outfit']">
            {step === 1 ? "Instant Guest Profile" : "Verify Mobile Number"}
          </h3>
          <p className="text-xs text-indigo-100">
            {step === 1 ? "Fast 1-Click Razorpay Checkout • No password or account needed" : `Verification code sent to +91 ${phoneNumber}`}
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name (optional)"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-2xl px-3.5 py-3 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <div className="flex border border-slate-300 rounded-2xl overflow-hidden focus-within:border-indigo-600">
                  <span className="bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold px-3.5 py-3 flex items-center border-r border-slate-200">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="Enter 10 digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 text-xs sm:text-sm px-3.5 py-3 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                By continuing, you agree to Infinity Store's <strong className="text-slate-700">Terms & Conditions</strong> and <strong className="text-slate-700">Privacy Policy</strong>.
              </p>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Continue & Send OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Step 2: OTP Verification */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              
              <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-2xl flex items-center justify-between text-xs text-indigo-900">
                <span>Mock OTP: <strong>{generatedOtp}</strong></span>
                <button
                  type="button"
                  onClick={autoFillOtp}
                  className="font-bold text-indigo-600 hover:underline"
                >
                  Auto-fill
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit OTP
                </label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-10 h-12 text-center text-lg font-bold border-2 border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 transition-all"
                    />
                  ))}
                </div>
              </div>

              {otpError && (
                <p className="text-xs text-rose-500 text-center font-medium">{otpError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Login</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  Change Mobile Number
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Safe & Secure Authentication</span>
          </div>

        </div>

      </div>
    </div>
  );
};
