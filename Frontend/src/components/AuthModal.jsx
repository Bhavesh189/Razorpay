import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Smartphone, ShieldCheck, CheckCircle2, ArrowRight, Lock, User } from 'lucide-react';

export const AuthModal = () => {
  const { activeModal, setActiveModal, setUser, showToast } = useShop();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [step, setStep] = useState(1); // 1: Form, 2: OTP (only for signup)
  
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    password: ''
  });
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (activeModal !== 'auth') return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber, password: formData.password })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setUser({ isLoggedIn: true, phone: data.user.phoneNumber, name: data.user.name, id: data.user._id });
        showToast("Logged in successfully! 🎉");
        setActiveModal(null);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupInit = async (e) => {
    e.preventDefault();
    if (formData.phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Send OTP
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStep(2);
        showToast(data._mockOtp ? `Mock OTP: ${data._mockOtp}` : "OTP sent to your phone");
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 2. Verify OTP
      const verifyRes = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber, otp: enteredOtp })
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        setError(verifyData.message || "Invalid OTP");
        setLoading(false);
        return;
      }

      // 3. Signup
      const signupRes = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const signupData = await signupRes.json();

      if (signupRes.ok && signupData.success) {
        setUser({ isLoggedIn: true, phone: signupData.user.phoneNumber, name: signupData.user.name, id: signupData.user._id });
        showToast("Account created successfully! Welcome 🎉");
        setActiveModal(null);
      } else {
        setError(signupData.message || "Signup failed");
      }
    } catch (err) {
      setError("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto overflow-hidden shadow-2xl border border-slate-100 relative my-auto">
        
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-r from-[#4338ca] via-[#4f46e5] to-[#7c3aed] p-6 text-white text-center space-y-2">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-md shadow-inner border border-white/20">
            {step === 2 ? <Smartphone className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}
          </div>
          <h3 className="text-xl font-black font-['Outfit']">
            {step === 2 ? "Verify Mobile Number" : (mode === 'login' ? "Welcome Back" : "Create Account")}
          </h3>
          <p className="text-xs text-indigo-100">
            {step === 2 ? `Verification code sent to +91 ${formData.phoneNumber}` : "Login or signup to manage your orders & wishlist"}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl text-center font-semibold border border-red-100">{error}</div>}

          {step === 1 ? (
            <form onSubmit={mode === 'login' ? handleLogin : handleSignupInit} className="space-y-4">
              
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-2xl px-3.5 py-3 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mobile Number</label>
                <div className="flex border border-slate-300 rounded-2xl overflow-hidden focus-within:border-indigo-600">
                  <span className="bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold px-3.5 py-3 flex items-center border-r border-slate-200">+91</span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    required
                    maxLength={10}
                    placeholder="Enter 10 digit number"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value.replace(/\D/g, '')})}
                    className="flex-1 text-xs sm:text-sm px-3.5 py-3 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
                <div className="flex border border-slate-300 rounded-2xl overflow-hidden focus-within:border-indigo-600 items-center px-3.5">
                  <Lock className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    className="flex-1 text-xs sm:text-sm py-3 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
              >
                <span>{loading ? "Processing..." : (mode === 'login' ? "Secure Login" : "Continue & Send OTP")}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(""); }}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  {mode === 'login' ? "New here? Create an account" : "Already have an account? Login"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">Enter 6-Digit OTP</label>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
              >
                {loading ? "Verifying..." : <><CheckCircle2 className="w-4 h-4" /><span>Verify & Create Account</span></>}
              </button>

              <div className="text-center pt-2">
                <button type="button" onClick={() => setStep(1)} className="text-xs text-indigo-600 font-semibold hover:underline">
                  Back to Details
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
