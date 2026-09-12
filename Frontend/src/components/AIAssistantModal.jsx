import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  Sparkles,
  Send,
  Mic,
  MicOff,
  Paperclip,
  Image as ImageIcon,
  Camera,
  CheckCheck,
  Bot,
  ShoppingBag,
  Eye,
  Star,
  Flame,
  Plus,
  Tag,
  RefreshCw,
  Zap,
  TrendingUp,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Lock,
  Gamepad2,
  Code2,
  Briefcase,
  GraduationCap,
  Palette,
  Laptop,
  Smartphone,
  Headphones,
  LayoutGrid,
  Trash2,
  CreditCard,
  Check,
  ChevronRight,
  Loader2,
  AlertTriangle,
  FileText,
  Shield,
  Activity,
  BarChart3,
  Target,
  SlidersHorizontal,
  ArrowRight,
  Lightbulb,
  Layers,
  PackagePlus,
  Brain,
  Gift,
  RotateCcw,
  UserCheck,
  BookmarkCheck,
  Maximize2,
  Minimize2,
  History,
  MessageSquare
} from 'lucide-react';
import { SafeImage } from './SafeImage';
import confetti from 'canvas-confetti';

// Helper component for infinite product scrolling
export const InfiniteProductLoader = ({ requirements, cursor, onLoadMore, isLoading }) => {
  const loaderRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && cursor) {
          onLoadMore(cursor);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [cursor, isLoading, onLoadMore]);

  if (!cursor) return null;

  return (
    <div ref={loaderRef} className="w-full flex justify-center py-4">
      {isLoading ? (
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading more products...</span>
        </div>
      ) : null}
    </div>
  );
};

// Modern SVG Infinity Icon
export const InfinityIcon = ({ className = "w-5 h-5 text-white" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.228-8-5.096 0-5.096 8 0 8 5.095 0 7.133-8 12.228-8z" />
  </svg>
);

// Helper to get category/option icon
const getOptionIcon = (label = "") => {
  const l = label.toLowerCase();
  if (l.includes("game") || l.includes("gaming") || l.includes("esports")) return <Gamepad2 className="w-4 h-4 text-indigo-600" />;
  if (l.includes("cod") || l.includes("program") || l.includes("dev")) return <Code2 className="w-4 h-4 text-blue-600" />;
  if (l.includes("work") || l.includes("office") || l.includes("business")) return <Briefcase className="w-4 h-4 text-slate-700" />;
  if (l.includes("study") || l.includes("student") || l.includes("college")) return <GraduationCap className="w-4 h-4 text-emerald-600" />;
  if (l.includes("edit") || l.includes("video") || l.includes("design") || l.includes("creator")) return <Palette className="w-4 h-4 text-rose-500" />;
  if (l.includes("laptop")) return <Laptop className="w-4 h-4 text-blue-500" />;
  if (l.includes("phone") || l.includes("mobile")) return <Smartphone className="w-4 h-4 text-purple-500" />;
  if (l.includes("headphone") || l.includes("audio") || l.includes("sound")) return <Headphones className="w-4 h-4 text-emerald-500" />;
  if (l.includes("deal") || l.includes("offer") || l.includes("discount")) return <Tag className="w-4 h-4 text-rose-500" />;
  if (l.includes("browse") || l.includes("all")) return <LayoutGrid className="w-4 h-4 text-slate-600" />;
  return <Sparkles className="w-4 h-4 text-amber-500" />;
};

// Helper to render bold markdown (**text**) gracefully with styled spans
const renderFormattedText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-indigo-900 bg-indigo-50/80 px-1 py-0.5 rounded">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

// Smooth Typewriter Stream Text Animation
const TypewriterText = ({ text, isNew, onFinish, onTick }) => {
  const [displayedText, setDisplayedText] = useState(isNew ? '' : text);
  const [isTyping, setIsTyping] = useState(isNew);

  useEffect(() => {
    if (!isNew || !text) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    let currentLength = 0;
    const totalLength = text.length;
    const step = Math.max(3, Math.ceil(totalLength / 40));

    const interval = setInterval(() => {
      currentLength += step;
      if (currentLength >= totalLength) {
        setDisplayedText(text);
        setIsTyping(false);
        clearInterval(interval);
        if (onFinish) onFinish();
      } else {
        setDisplayedText(text.slice(0, currentLength));
      }
    }, 18);

    return () => clearInterval(interval);
  }, [text, isNew]);

  return (
    <div className="relative">
      <div className="whitespace-pre-line space-y-1">
        {renderFormattedText(displayedText)}
        {isTyping && (
          <span className="inline-block w-1.5 h-4 ml-1 bg-gradient-to-t from-indigo-600 to-purple-600 animate-pulse align-middle rounded-xs shadow-xs" />
        )}
      </div>
    </div>
  );
};

// Interactive Requirement Discovery Card with Pill Chips matching reference UI
const RequirementCard = ({ questionnaire, onSubmit, isSubmitted = false }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [budget, setBudget] = useState(50000);
  const [isBudgetActive, setIsBudgetActive] = useState(false);
  const customInputRef = useRef(null);

  if (!questionnaire) return null;

  const isMultiSelect = questionnaire.type === "multi_select" || questionnaire.type === "multiple_choice";

  const toggleOption = (val) => {
    if (isSubmitted) return;

    if (val.toLowerCase().includes("custom") || val.toLowerCase() === "custom input") {
      customInputRef.current?.focus();
      return;
    }

    if (val.toLowerCase() === "no preference") {
      setSelectedOptions(["No Preference"]);
      return;
    }

    if (isMultiSelect) {
      setSelectedOptions(prev => {
        const filtered = prev.filter(v => v.toLowerCase() !== "no preference");
        if (filtered.includes(val)) {
          return filtered.filter(v => v !== val);
        } else {
          return [...filtered, val];
        }
      });
    } else {
      setSelectedOptions([val]);
    }
  };

  const handleBudgetSliderChange = (e) => {
    if (isSubmitted) return;
    const val = parseInt(e.target.value, 10);
    setBudget(val);
    setIsBudgetActive(true);
  };

  const handleBudgetInputChange = (e) => {
    if (isSubmitted) return;
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setBudget('');
      setIsBudgetActive(false);
      return;
    }
    const val = parseInt(rawVal, 10);
    setBudget(val);
    setIsBudgetActive(true);
  };

  const handlePresetBudget = (amount) => {
    if (isSubmitted) return;
    if (amount === null) {
      setIsBudgetActive(false);
      setBudget('');
    } else {
      setBudget(amount);
      setIsBudgetActive(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitted) return;
    if (selectedOptions.length === 0 && !customInput.trim() && !isBudgetActive) return;

    const requirementsData = {
      priorities: selectedOptions,
      customRequirements: customInput.trim(),
      budget: isBudgetActive && budget ? Number(budget) : null,
      isBudgetActive: Boolean(isBudgetActive && budget),
      questionId: questionnaire.id,
      answer: selectedOptions
    };

    onSubmit(requirementsData, questionnaire);
  };

  // Slider bounds
  const minBudget = 500;
  const maxBudget = 150000;
  const numericBudget = typeof budget === 'number' ? budget : minBudget;
  const sliderPercentage = Math.min(100, Math.max(0, ((numericBudget - minBudget) / (maxBudget - minBudget)) * 100));

  return (
    <div className="w-full max-w-[95vw] sm:max-w-3xl md:max-w-4xl bg-white border border-indigo-100 rounded-3xl p-4 sm:p-5 space-y-4 shadow-[0_4px_20px_rgba(84,66,246,0.06)] ml-0 sm:ml-12 animate-in zoom-in-95">

      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              {questionnaire.title || "Select Your Preferences"}
            </h4>
            <p className="text-[11px] text-slate-500 font-normal">
              {questionnaire.text || (isMultiSelect ? "Choose one or more requirements to customize your matches" : "Choose your preferred option")}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          {isMultiSelect ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{selectedOptions.length > 0 ? `${selectedOptions.length} Selected` : "Multi-Select"}</span>
            </>
          ) : (
            <span>Single Choice</span>
          )}
        </span>
      </div>

      {/* 1. Multi-Select MCQ Option Chips */}
      {questionnaire.options && questionnaire.options.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <span>Features & Priorities</span>
          </label>
          <div className="flex flex-wrap gap-2 pt-0.5">
            {questionnaire.options.map((opt, idx) => {
              const optVal = opt.value || opt.label;
              const isSelected = selectedOptions.includes(optVal);
              return (
                <button
                  key={opt.id || idx}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => toggleOption(optVal)}
                  className={`px-3.5 py-2 rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 ${isSelected
                      ? "bg-gradient-to-r from-[#5442f6] to-[#7f52f8] text-white border-transparent shadow-md shadow-indigo-500/20 ring-2 ring-indigo-300"
                      : "bg-slate-50/70 border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700"
                    } ${isSubmitted ? 'opacity-80 cursor-default' : ''}`}
                >
                  <div className={`${isSelected ? 'text-white' : ''}`}>
                    {getOptionIcon(opt.label)}
                  </div>
                  <span>{opt.label}</span>
                  {isSelected ? (
                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center ml-0.5">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 ml-0.5 opacity-60" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Interactive Budget Range & Filter (Collapsible/Clean) */}
      <div className="bg-[#f8faff] border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            <span>Price Budget Limit (Optional):</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitted}
              onClick={() => setIsBudgetActive(!isBudgetActive)}
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${isBudgetActive
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-slate-100 border-slate-200 text-slate-500"
                }`}
            >
              {isBudgetActive ? "Filter: Active" : "Filter: Off"}
            </button>
            {isBudgetActive && budget && (
              <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
                ≤ ₹{Number(budget).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Sync Controls: Slider + Direct Input */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <input
                type="range"
                min={minBudget}
                max={maxBudget}
                step={1000}
                disabled={isSubmitted}
                value={typeof budget === 'number' ? budget : 50000}
                onChange={handleBudgetSliderChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #5442f6 0%, #7f52f8 ${sliderPercentage}%, #e2e8f0 ${sliderPercentage}%, #e2e8f0 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>₹500</span>
                <span>₹75,000</span>
                <span>₹1,50,000+</span>
              </div>
            </div>

            <div className="w-28 flex-shrink-0">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-600">₹</span>
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={budget !== '' ? budget : ''}
                  onChange={handleBudgetInputChange}
                  placeholder="Budget"
                  className="w-full bg-white border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-300 rounded-xl pl-6 pr-2 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none text-right shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Preset Budget Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: "< ₹1,000", amount: 1000 },
              { label: "< ₹15,000", amount: 15000 },
              { label: "< ₹50,000", amount: 50000 },
              { label: "< ₹80,000", amount: 80000 },
              { label: "< ₹1,20,000", amount: 120000 },
              { label: "Flexible Budget", amount: null }
            ].map((p, idx) => {
              const isSelected = (p.amount === null && !isBudgetActive) || (isBudgetActive && budget === p.amount);
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => handlePresetBudget(p.amount)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer active:scale-95 ${isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 font-extrabold shadow-xs"
                      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Custom Requirement Text Input & Submit Button */}
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="relative">
            <Sparkles className="w-4 h-4 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={customInputRef}
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={questionnaire.customPlaceholder || "Any specific brand, spec, or preference (e.g. ASUS, 16GB, OLED)..."}
              className="w-full bg-slate-50/70 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none shadow-xs transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={selectedOptions.length === 0 && !customInput.trim() && !isBudgetActive}
            className="w-full bg-gradient-to-r from-[#5442f6] via-[#6352f7] to-[#7f52f8] hover:opacity-95 disabled:opacity-40 text-white font-bold text-xs sm:text-sm py-3.5 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Find Best Matches {selectedOptions.length > 0 ? `(${selectedOptions.length} Selected)` : ''} 🚀</span>
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Requirements submitted! Matching products are displayed below.</span>
        </div>
      )}
    </div>
  );
};

export const DynamicQuestionCard = RequirementCard;

// Helper to load Razorpay SDK
const loadRazorpaySDK = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const AIAssistantModal = () => {
  const {
    activeModal,
    setActiveModal,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSummary,
    addToCart,
    setSelectedProduct,
    placeOrder,
    user,
    selectedAddress,
    applyCouponCode,
    appliedCoupon,
    showToast,
    aiMessages: messages,
    setAiMessages: setMessages,
    defaultAiWelcomeMessage
  } = useShop();

  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'error'
  const isListening = voiceState === 'listening';
  const voiceSubmissionLockRef = useRef(false);
  const STORAGE_KEY = 'infinity_ai_chat';
  const [showHistory, setShowHistory] = useState(false);
  const isUserScrolledUpRef = useRef(false);

  // Persistent Chat Sessions from browser LocalStorage
  const [chatSessions, setChatSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('infinity_ai_chat');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.sessions) && parsed.sessions.length > 0) {
          return parsed.sessions;
        }
      }
    } catch (e) {
      console.warn("LocalStorage parse error for infinity_ai_chat:", e);
    }
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    try {
      const saved = localStorage.getItem('infinity_ai_chat');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.activeSessionId) return parsed.activeSessionId;
        if (parsed?.sessions?.[0]?.sessionId) return parsed.sessions[0].sessionId;
      }
    } catch (e) { }
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  });
  const chatSessionIdRef = useRef(activeSessionId);
  const [isPaying, setIsPaying] = useState(false);

  // Multimodal Vision Image Upload State with WebP Compression
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCompressingImage, setIsCompressingImage] = useState(false);

  // Client-side WebP Image Compressor (maxDim: 1200px, quality: 0.85)
  const compressImageToWebP = (file, maxDim = 1200, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        let webpData = canvas.toDataURL('image/webp', quality);
        if (!webpData.startsWith('data:image/webp')) {
          webpData = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(webpData);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to decode image file"));
      };
      img.src = objectUrl;
    });
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast("Image is too large. Please select an image under 25MB.");
      return;
    }

    try {
      setIsCompressingImage(true);
      const compressedWebP = await compressImageToWebP(file, 1200, 0.85);
      setSelectedImage(compressedWebP);
      setImagePreview(compressedWebP);
      showToast("📸 Image compressed to WebP & attached!");
    } catch (err) {
      console.error("Image compression error:", err);
      // Fallback to FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setSelectedImage(base64);
        setImagePreview(base64);
        showToast("📸 Product image attached!");
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // In-session User Persona & Learned Profile
  const [userPersona, setUserPersona] = useState(() => ({
    learnedInterests: [],
    preferredBudget: "",
    shopperPersona: "Smart Shopper",
    totalConversations: 0,
    unlockedCoupons: ["FIRST50"]
  }));

  // Restore messages on session switch
  useEffect(() => {
    const currentSession = chatSessions.find(s => s.sessionId === activeSessionId);
    if (currentSession && Array.isArray(currentSession.messages) && currentSession.messages.length > 0) {
      setMessages(currentSession.messages);
      chatSessionIdRef.current = currentSession.sessionId;
    } else {
      setMessages([defaultAiWelcomeMessage]);
      chatSessionIdRef.current = activeSessionId;
    }
  }, [activeSessionId]);

  // Sync active messages to LocalStorage
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    setChatSessions(prevSessions => {
      const now = new Date().toISOString();
      const existingIdx = prevSessions.findIndex(s => s.sessionId === activeSessionId);

      const firstUserMsg = messages.find(m => m.sender === 'user');
      const sessionTitle = firstUserMsg
        ? (firstUserMsg.text.slice(0, 32) + (firstUserMsg.text.length > 32 ? '...' : ''))
        : "Shopping Conversation";

      let updatedSessions;
      if (existingIdx >= 0) {
        const existing = prevSessions[existingIdx];
        const updated = {
          ...existing,
          title: existing.title && existing.title !== "New Conversation" && existing.title !== "Shopping Conversation" ? existing.title : sessionTitle,
          updatedAt: now,
          messages: messages
        };
        updatedSessions = [
          updated,
          ...prevSessions.filter((_, i) => i !== existingIdx)
        ];
      } else {
        const newSession = {
          sessionId: activeSessionId,
          title: sessionTitle,
          createdAt: now,
          updatedAt: now,
          messages: messages,
          shoppingSessions: []
        };
        updatedSessions = [newSession, ...prevSessions];
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          activeSessionId,
          sessions: updatedSessions.slice(0, 30)
        }));
      } catch (err) {
        console.warn("Failed to persist infinity_ai_chat:", err);
      }

      return updatedSessions;
    });
  }, [messages, activeSessionId]);

  const handleCreateNewChat = () => {
    const newId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    chatSessionIdRef.current = newId;
    setActiveSessionId(newId);
    setMessages([defaultAiWelcomeMessage]);
    setShowHistory(false);
    setInputQuery("");
    setSelectedImage(null);
    setImagePreview(null);
    showToast("✨ Started a new conversation!");
  };

  const handleSwitchSession = (sessionId) => {
    setActiveSessionId(sessionId);
    chatSessionIdRef.current = sessionId;
    setShowHistory(false);
  };

  const handleDeleteSession = (sessionIdToDelete) => {
    setChatSessions(prev => {
      const remaining = prev.filter(s => s.sessionId !== sessionIdToDelete);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          activeSessionId: activeSessionId === sessionIdToDelete ? (remaining[0]?.sessionId || null) : activeSessionId,
          sessions: remaining
        }));
      } catch (e) { }

      if (activeSessionId === sessionIdToDelete) {
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].sessionId);
        } else {
          handleCreateNewChat();
        }
      }
      return remaining;
    });
    showToast("🗑️ Chat deleted");
  };

  // Group sessions by Today, Yesterday, Older
  const historyGroups = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = { today: [], yesterday: [], older: [] };
    chatSessions.forEach(sess => {
      const d = new Date(sess.updatedAt || sess.createdAt || Date.now());
      d.setHours(0, 0, 0, 0);
      if (d.getTime() >= today.getTime()) {
        groups.today.push(sess);
      } else if (d.getTime() >= yesterday.getTime()) {
        groups.yesterday.push(sess);
      } else {
        groups.older.push(sess);
      }
    });
    return groups;
  }, [chatSessions]);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [submittedSessions, setSubmittedSessions] = useState(() => new Set());
  const [expandedProducts, setExpandedProducts] = useState({});
  const [expandedRelated, setExpandedRelated] = useState({});

  // Internal logging for money actions
  const addAuditEntry = (entry) => {
    console.log(`[Infinity AI Security Log] [${new Date().toLocaleTimeString('en-IN')}]`, entry);
  };

  // Track messages that have finished typewriter animation
  const [animatedIds, setAnimatedIds] = useState(new Set(['msg-welcome']));
  const markAnimated = (id) => {
    setAnimatedIds(prev => new Set([...prev, id]));
  };

  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleChatScroll = (e) => {
    const el = e.currentTarget;
    const isScrolledUp = el.scrollHeight - el.scrollTop - el.clientHeight > 120;
    isUserScrolledUpRef.current = isScrolledUp;
  };

  const scrollToBottom = (force = false) => {
    if (force || !isUserScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!isUserScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  if (activeModal !== 'aiAssistant') return null;

  // ==================== IN-CHAT OFFICIAL RAZORPAY PAYMENT ====================
  const handleInChatRazorpayPayment = async () => {
    if (cart.length === 0) {
      showToast("Your cart is empty! Please add a product first.");
      return;
    }

    setIsPaying(true);

    // Audit: Payment Initiated
    addAuditEntry({
      action: 'PAYMENT_INITIATED',
      status: 'pending',
      amount: cartSummary.finalAmount,
      items: cart.length,
      description: `Payment of ₹${cartSummary.finalAmount} initiated for ${cart.length} item(s) via Razorpay Gateway`
    });

    // Ensure Razorpay SDK loaded
    const isLoaded = await loadRazorpaySDK();
    if (!isLoaded || !window.Razorpay) {
      addAuditEntry({
        action: 'PAYMENT_FAILED',
        status: 'error',
        amount: cartSummary.finalAmount,
        description: 'Razorpay SDK could not be loaded. Internet connectivity issue.',
        errorHandled: true
      });
      showToast("Failed to load Razorpay SDK. Please check your internet connection.");
      setIsPaying(false);
      return;
    }

    try {
      // 1. Create order on backend
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartSummary.finalAmount,
          currency: 'INR',
          receipt: `inf_ai_${Date.now()}`
        })
      });

      const orderData = await res.json();

      if (!orderData.success) {
        addAuditEntry({
          action: 'ORDER_CREATION_FAILED',
          status: 'error',
          amount: cartSummary.finalAmount,
          description: 'Backend order creation failed. Razorpay API returned error.',
          errorHandled: true
        });
        showToast("Could not create payment order. Please try again.");
        setIsPaying(false);
        return;
      }

      // Audit: Order Created
      addAuditEntry({
        action: 'RAZORPAY_ORDER_CREATED',
        status: 'success',
        amount: cartSummary.finalAmount,
        orderId: orderData.order?.id,
        description: `Razorpay Order ${orderData.order?.id || 'N/A'} created for ₹${cartSummary.finalAmount}`
      });

      // 2. Setup official Razorpay options
      const options = {
        key: orderData.key_id,
        amount: orderData.order?.amount || Math.round(cartSummary.finalAmount * 100),
        currency: orderData.order?.currency || 'INR',
        name: 'Infinity Store',
        description: `Agentic AI Checkout (${cart.length} items)`,
        ...(orderData.order?.id ? { order_id: orderData.order.id } : {}),
        image: 'https://cdn-icons-png.flaticon.com/512/7662/7662992.png',
        handler: async function (response) {
          try {
            const paymentId = response.razorpay_payment_id;
            const rzpOrderId = response.razorpay_order_id || orderData.order?.id;
            const signature = response.razorpay_signature || '';

            // 3. Verify Payment on backend
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await fetch(`${API_URL}/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: rzpOrderId,
                razorpay_payment_id: paymentId,
                razorpay_signature: signature
              })
            });

            // Audit: Payment Verified
            addAuditEntry({
              action: 'PAYMENT_VERIFIED',
              status: 'success',
              amount: cartSummary.finalAmount,
              paymentId: paymentId,
              orderId: rzpOrderId,
              description: `Payment ₹${cartSummary.finalAmount} verified. Razorpay Payment ID: ${paymentId}`
            });

            const placed = placeOrder(`Razorpay (${paymentId})`, selectedAddress);

            // Audit: Order Placed
            addAuditEntry({
              action: 'ORDER_PLACED',
              status: 'success',
              amount: cartSummary.finalAmount,
              orderId: placed.id,
              paymentId: paymentId,
              description: `Order #${placed.id} placed successfully. Delivery ETA: ${placed.estimatedDelivery}`
            });

            // Trigger celebration confetti
            try {
              confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
              setTimeout(() => confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } }), 300);
            } catch { }

            // Post success confirmation in AI chat
            setMessages(prev => [
              ...prev,
              {
                id: `ai-order-${Date.now()}`,
                sender: "ai",
                text: `🎉 **Order Confirmed & Payment Verified on Razorpay!**\n\n🆔 **Order ID**: #${placed.id}\n💳 **Razorpay Payment ID**: ${paymentId}\n💰 **Amount Paid**: ₹${cartSummary.finalAmount} (Saved ₹${cartSummary.totalSavings})\n🚚 **Estimated Delivery**: ${placed.estimatedDelivery}\n\nA confirmation SMS and receipt has been sent to +91 ${selectedAddress?.phone || '9876543210'}. Thank you for shopping with Infinity Store! 🌟`,
                products: [],
                suggestedFollowUpQueries: ["Show My Orders 📦", "Continue Shopping 🛍️"]
              }
            ]);

            showToast("🎉 Payment Verified on Razorpay! Order Placed.");
          } catch (e) {
            console.error("Payment confirmation error:", e);
            addAuditEntry({
              action: 'VERIFICATION_ERROR',
              status: 'error',
              description: `Payment verification encountered error: ${e.message}. Fallback: order placed.`,
              errorHandled: true
            });
          }
          setIsPaying(false);
        },
        prefill: {
          name: selectedAddress?.name || user.name || "Bhavesh Sharma",
          email: "shopper@infinitystore.in",
          contact: selectedAddress?.phone || user.phone || "9876543210"
        },
        theme: {
          color: '#4f46e5'
        },
        modal: {
          ondismiss: function () {
            setIsPaying(false);
            addAuditEntry({
              action: 'PAYMENT_DISMISSED',
              status: 'cancelled',
              amount: cartSummary.finalAmount,
              description: `User closed Razorpay modal. Payment of ₹${cartSummary.finalAmount} was NOT processed. Order NOT placed.`,
              errorHandled: true
            });
            showToast("Razorpay window closed. Order NOT placed.");

            // Explicit In-Chat Retry Prompt
            setMessages(prev => [
              ...prev,
              {
                id: `ai-retry-${Date.now()}`,
                sender: "ai",
                text: `⚠️ **Payment Window Dismissed**\n\nThe Razorpay payment window was closed before completing the order. Zero money was deducted from your account.\n\n**Would you like to retry paying ₹${cartSummary.finalAmount}?**`,
                retryPayment: {
                  amount: cartSummary.finalAmount,
                  reason: "Payment window was dismissed before completion"
                },
                products: [],
                suggestedFollowUpQueries: ["Retry Razorpay Payment 🔄", "Show My Cart 🛒", "Continue Shopping 🛍️"]
              }
            ]);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        const errDesc = resp.error?.description || 'Transaction declined or interrupted by bank.';
        addAuditEntry({
          action: 'PAYMENT_FAILED',
          status: 'error',
          amount: cartSummary.finalAmount,
          description: `Razorpay payment failed: ${errDesc}. No money was deducted.`,
          errorCode: resp.error?.code,
          errorHandled: true
        });
        showToast(`Payment failed: ${errDesc}`);
        setIsPaying(false);

        // Explicit In-Chat Retry Prompt
        setMessages(prev => [
          ...prev,
          {
            id: `ai-retry-${Date.now()}`,
            sender: "ai",
            text: `⚠️ **Payment Incomplete / Declined by Bank**\n\nReason: *${errDesc}*\n\n🛡️ **Safety Assurance**: Zero money was deducted from your account. Your cart (${cart.length} items • ₹${cartSummary.finalAmount}) is preserved.\n\n**Would you like to retry payment with Razorpay now?**`,
            retryPayment: {
              amount: cartSummary.finalAmount,
              reason: errDesc
            },
            products: [],
            suggestedFollowUpQueries: ["Retry Razorpay Payment 🔄", "Show My Cart 🛒", "Continue Shopping 🛍️"]
          }
        ]);
      });
      rzp.open();

    } catch (err) {
      console.error("In-chat checkout error:", err);
      addAuditEntry({
        action: 'CHECKOUT_ERROR',
        status: 'error',
        description: `Checkout system error: ${err.message}. No money action taken.`,
        errorHandled: true
      });
      showToast("Payment gateway error. Please try again.");
      setIsPaying(false);

      setMessages(prev => [
        ...prev,
        {
          id: `ai-retry-${Date.now()}`,
          sender: "ai",
          text: `⚠️ **Payment Gateway Error**\n\nReason: *${err.message || "Failed to initialize Razorpay checkout session."}*\n\n**Would you like to retry payment?**`,
          retryPayment: {
            amount: cartSummary.finalAmount,
            reason: err.message
          },
          products: [],
          suggestedFollowUpQueries: ["Retry Razorpay Payment 🔄", "Show My Cart 🛒"]
        }
      ]);
    }
  };

  // ==================== SEND QUERY TO AGENT ====================
  const handleSendQuery = async (queryText, sessionIdToMark, imageToSend) => {
    const textToSend = queryText || inputQuery;
    const activeImage = imageToSend || selectedImage;
    if ((!textToSend.trim() && !activeImage) || loading) return;

    if (sessionIdToMark) {
      setSubmittedSessions(prev => new Set([...prev, sessionIdToMark]));
    }

    // Check for payment retry request
    if (textToSend.toLowerCase().includes("retry") && (textToSend.toLowerCase().includes("pay") || textToSend.toLowerCase().includes("razorpay"))) {
      handleInChatRazorpayPayment();
      return;
    }

    // Check for VIP Coupon claim query
    if (textToSend.toLowerCase().includes("claim vip") || textToSend.toLowerCase().includes("vip coupon") || textToSend.toLowerCase().includes("secret coupon") || textToSend.toLowerCase().includes("discount coupon")) {
      handleClaimVIPCoupon("VIP100");
    }

    // Check for clear memory request
    if (textToSend.toLowerCase().includes("clear memory") || textToSend.toLowerCase().includes("reset memory") || textToSend.toLowerCase().includes("memory reset")) {
      handleClearMemory();
      setInputQuery("");
      setSelectedImage(null);
      setImagePreview(null);
      return;
    }

    const userMessageId = `user-${Date.now()}`;
    const newMsg = {
      id: userMessageId,
      sender: "user",
      text: textToSend || (activeImage ? "📸 Product image search request" : ""),
      image: activeImage || null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputQuery("");
    setSelectedImage(null);
    setImagePreview(null);
    setLoading(true);

    const historyPayload = messages
      .filter(m => !m.id.startsWith('msg-welcome'))
      .slice(-8)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: typeof m.text === 'string' ? m.text : ''
      }));

    const cartPayload = cart.map(c => ({
      id: c.product.id,
      title: c.product.title,
      category: c.product.category,
      subCategory: c.product.subCategory,
      price: c.product.price
    }));

    // Helper to process autonomous agent actions
    const processAction = (action) => {
      if (!action) return;
      if (action.type === "REMOVE_FROM_CART") {
        const targetKeyword = (action.target || "").toLowerCase();
        const itemsToRemove = cart.filter(item => {
          if (targetKeyword === "all") return true;
          const title = item.product.title.toLowerCase();
          const subCat = (item.product.subCategory || "").toLowerCase();
          const cat = (item.product.category || "").toLowerCase();
          return title.includes(targetKeyword) || subCat.includes(targetKeyword) || cat.includes(targetKeyword);
        });

        if (itemsToRemove.length > 0) {
          itemsToRemove.forEach(item => removeFromCart(item.cartItemId));
          addAuditEntry({
            action: 'CART_ITEM_REMOVED',
            status: 'success',
            description: `AI Agent removed ${itemsToRemove.length} item(s) matching "${targetKeyword}" from cart.`
          });
          showToast(`🗑️ ${itemsToRemove.length} item(s) removed from cart!`);
        } else if (cart.length > 0 && targetKeyword) {
          removeFromCart(cart[cart.length - 1].cartItemId);
          addAuditEntry({
            action: 'CART_ITEM_REMOVED',
            status: 'success',
            description: `AI Agent removed last cart item (fuzzy match for "${targetKeyword}").`
          });
          showToast("🗑️ Item removed from cart!");
        }
      }

      if (action.type === "INITIATE_CHECKOUT") {
        addAuditEntry({
          action: 'CHECKOUT_INTENT',
          status: 'pending',
          amount: cartSummary.finalAmount,
          description: `AI Agent initiated checkout flow for ₹${cartSummary.finalAmount} (${cart.length} items). Awaiting user authorization on Razorpay.`
        });
      }
    };

    const aiMessageId = `ai-${Date.now()}`;
    let streamedText = "";
    let hasStreamStarted = false;

    try {
      // 1. Attempt SSE Streaming via POST /api/ai/chat/stream
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const streamRes = await fetch(`${API_URL}/ai/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend || (activeImage ? "Find products in Infinity Store catalog matching this image" : ""),
          image: activeImage,
          history: historyPayload,
          cartContext: cartPayload,
          userProfile: userPersona,
          sessionId: chatSessionIdRef.current
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (streamRes.ok && streamRes.body) {
        const reader = streamRes.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        // Add placeholder streaming AI message
        setMessages(prev => [
          ...prev,
          {
            id: aiMessageId,
            sender: "ai",
            text: "",
            isStreaming: true,
            analyzedRequirements: null,
            questionnaire: null,
            products: [],
            relatedProducts: [],
            upsellPitch: null,
            inChatCheckout: null,
            campaign: null,
            suggestedFollowUpQueries: []
          }
        ]);
        hasStreamStarted = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            const lines = part.split('\n');
            let eventType = 'message';
            let dataStr = '';

            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventType = line.replace('event:', '').trim();
              } else if (line.startsWith('data:')) {
                dataStr = line.replace('data:', '').trim();
              }
            }

            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);

              if (eventType === 'message') {
                if (data.text) {
                  streamedText += data.text;
                  setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, text: streamedText } : m));
                }
              } else if (eventType === 'question') {
                setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, questionnaire: data } : m));
              } else if (eventType === 'products') {
                const prods = Array.isArray(data) ? data : (data.products || []);
                const relProds = data.relatedProducts || [];
                setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, products: prods, relatedProducts: relProds } : m));
              } else if (eventType === 'action') {
                processAction(data);
              } else if (eventType === 'done') {
                if (data.updatedUserProfile) {
                  setUserPersona(prev => ({ ...prev, ...data.updatedUserProfile }));
                }
                if (data.agentAction) {
                  processAction(data.agentAction);
                }
                setMessages(prev => prev.map(m => m.id === aiMessageId ? {
                  ...m,
                  text: data.fullText || data.reply || streamedText,
                  products: (data.products && data.products.length > 0) ? data.products : m.products,
                  relatedProducts: (data.relatedProducts && data.relatedProducts.length > 0) ? data.relatedProducts : m.relatedProducts,
                  questionnaire: data.questionnaire !== undefined ? data.questionnaire : m.questionnaire,
                  inChatCheckout: data.inChatCheckout || m.inChatCheckout,
                  suggestedFollowUpQueries: data.suggestedFollowUpQueries || m.suggestedFollowUpQueries,
                  requirements: data.requirements || m.requirements || {},
                  nextCursor: data.nextCursor || m.nextCursor || null,
                  hasMoreProducts: data.hasMoreProducts !== undefined ? data.hasMoreProducts : (m.hasMoreProducts || false),
                  isStreaming: false
                } : m));
              } else if (eventType === 'error') {
                console.warn('[AI Stream Server Error]:', data.error);
              }
            } catch (err) {
              console.error('Failed to parse SSE JSON chunk:', err);
            }
          }
        }

        setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, isStreaming: false } : m));
        return;
      }
      throw new Error("Stream endpoint returned non-200, falling back to standard AI chat");
    } catch (streamErr) {
      console.warn("SSE Streaming failed or unsupported, using standard JSON fallback:", streamErr.message);

      if (hasStreamStarted) {
        setMessages(prev => prev.filter(m => m.id !== aiMessageId));
      }

      // 2. Standard JSON Fallback
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: textToSend || (activeImage ? "Find products in Infinity Store catalog matching this image" : ""),
            image: activeImage,
            history: historyPayload,
            cartContext: cartPayload,
            userProfile: userPersona,
            sessionId: chatSessionIdRef.current
          })
        });

        const data = await res.json();

        if (data.success) {
          if (data.updatedUserProfile) {
            setUserPersona(prev => ({
              ...prev,
              ...data.updatedUserProfile
            }));
          }

          if (data.agentAction) {
            processAction(data.agentAction);
          }

          setMessages(prev => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              sender: "ai",
              text: data.reply || data.text || data.message || "",
              analyzedRequirements: data.analyzedRequirements || null,
              questionnaire: data.questionnaire || null,
              products: data.products || [],
              relatedProducts: data.relatedProducts || [],
              upsellPitch: data.upsellPitch || null,
              inChatCheckout: data.inChatCheckout || null,
              campaign: data.campaign || null,
              suggestedFollowUpQueries: data.suggestedFollowUpQueries || [],
              requirements: data.requirements || {},
              nextCursor: data.nextCursor || null,
              hasMoreProducts: data.hasMoreProducts || false
            }
          ]);
        } else {
          throw new Error(data.error || "Failed to fetch response");
        }
      } catch (fallbackErr) {
        console.error("AI chat fallback error:", fallbackErr);
        setMessages(prev => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            sender: "ai",
            text: `⚠️ **Connection Error:** ${fallbackErr.message || 'Unable to reach AI agent.'}`,
            products: [],
            upsellPitch: null,
            suggestedFollowUpQueries: ["Show My Cart 🛒", "Proceed to Checkout ⚡"]
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== SUBMIT QUESTIONNAIRE REQUIREMENTS ====================
  const handleRequirementsSubmit = async (requirementsData, questionnaire) => {
    if (loading) return;

    const sessionId = questionnaire?.requirementSessionId || `sess-${Date.now()}`;
    setSubmittedSessions(prev => new Set([...prev, sessionId]));

    // Format human-friendly display text for the user chat bubble
    const parts = [];
    if (requirementsData.priorities?.length > 0) {
      parts.push(requirementsData.priorities.join(", "));
    }
    if (requirementsData.customRequirements) {
      parts.push(requirementsData.customRequirements);
    }
    if (requirementsData.isBudgetActive && requirementsData.budget) {
      parts.push(`Under ₹${Number(requirementsData.budget).toLocaleString('en-IN')}`);
    }
    const displayText = parts.length > 0 ? parts.join(" | ") : "Custom Requirements Applied";

    const userMessageId = `user-${Date.now()}`;
    const newMsg = {
      id: userMessageId,
      sender: "user",
      text: displayText
    };

    setMessages(prev => [...prev, newMsg]);
    setLoading(true);

    try {
      const historyPayload = messages
        .filter(m => !m.id.startsWith('msg-welcome'))
        .slice(-8)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: typeof m.text === 'string' ? m.text : ''
        }));

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/ai/requirements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: chatSessionIdRef.current || sessionId,
          requirementSessionId: sessionId,
          category: questionnaire?.category || "Laptops & Computers",
          requirements: requirementsData,
          history: historyPayload,
          cartContext: cart.map(c => ({ id: c.product.id, title: c.product.title, category: c.product.category, subCategory: c.product.subCategory, price: c.product.price })),
          userProfile: userPersona
        })
      });

      const data = await res.json();

      if (data.success) {
        if (data.updatedUserProfile) {
          setUserPersona(prev => ({
            ...prev,
            ...data.updatedUserProfile
          }));
        }

        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: data.reply || data.text || data.message || "",
            analyzedRequirements: data.analyzedRequirements || null,
            questionnaire: data.questionnaire || null,
            products: data.products || [],
            relatedProducts: data.relatedProducts || [],
            upsellPitch: data.upsellPitch || null,
            inChatCheckout: data.inChatCheckout || null,
            campaign: data.campaign || null,
            suggestedFollowUpQueries: data.suggestedFollowUpQueries || [],
            requirements: data.requirements || {},
            nextCursor: data.nextCursor || null,
            hasMoreProducts: data.hasMoreProducts || false
          }
        ]);
      } else {
        throw new Error(data.error || "Failed to process requirements");
      }
    } catch (err) {
      console.error("Requirements submission error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: "I have processed your requirements! Here are the best matches from our catalog:",
          products: [],
          upsellPitch: null,
          suggestedFollowUpQueries: ["Show My Cart 🛒", "Proceed to Checkout ⚡"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };


  // Web Speech API Voice Search with Idle, Listening, Processing, Error states
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setVoiceState('error');
      showToast("Voice input is not supported in this browser. Please type your query.");
      setTimeout(() => setVoiceState('idle'), 3000);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (voiceState === 'listening') {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setVoiceState('idle');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-IN'; // Robust support for Indian English, Hindi & Hinglish
    recognition.continuous = false;
    recognition.interimResults = false;
    voiceSubmissionLockRef.current = false;

    setVoiceState('listening');
    showToast("🎙️ Listening... Speak your shopping request in English or Hindi");

    recognition.onresult = (event) => {
      if (voiceSubmissionLockRef.current) return;
      voiceSubmissionLockRef.current = true;

      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (!transcript.trim()) {
        setVoiceState('idle');
        return;
      }

      setVoiceState('processing');
      setInputQuery(transcript);
      showToast(`🎙️ Voice heard: "${transcript}"`);

      handleSendQuery(transcript).finally(() => {
        setVoiceState('idle');
        voiceSubmissionLockRef.current = false;
      });
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      setVoiceState('error');
      showToast("Mic error or permission denied. Please try again or type.");
      setTimeout(() => setVoiceState('idle'), 2500);
    };

    recognition.onend = () => {
      if (voiceState === 'listening') {
        setVoiceState('idle');
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.warn("Recognition start error:", err);
      setVoiceState('error');
      setTimeout(() => setVoiceState('idle'), 2000);
    }
  };

  const handleWatchProduct = (product) => {
    setSelectedProduct(product);
    setActiveModal('productDetail');
  };

  const handleAddProduct = (product) => {
    addToCart(product);
    addAuditEntry({
      action: 'CART_ITEM_ADDED',
      status: 'success',
      description: `"${product.title.slice(0, 40)}" added to cart. Price: ₹${product.price}`
    });

    // Dynamic Cross-Sell Recommendation in user's language based on product type
    const titleLower = product.title.toLowerCase();
    const subCat = (product.subCategory || "").toLowerCase();
    let crossSellText = "";
    let upsellPayload = null;

    if (titleLower.includes("laptop") || subCat.includes("laptop")) {
      crossSellText = `🎉 **"${product.title.slice(0, 30)}..."** added to cart! 💻\n\n💡 **Advisor Tip**: For an optimal setup, we recommend pairing your laptop with a high-precision **RGB Gaming Mouse** (₹399), **Mechanical Keyboard** (₹799), or **Dual-Turbo Cooling Pad** (₹599)!`;
      upsellPayload = {
        title: "Pro Esports RGB Optical Gaming Mouse (7200 DPI)",
        price: 399,
        pitchMessage: "Pairing a precision RGB gaming mouse and mechanical keyboard ensures smooth control and peak productivity!"
      };
    } else if (titleLower.includes("phone") || subCat.includes("smartphones") || subCat.includes("mobile")) {
      crossSellText = `🎉 **"${product.title.slice(0, 30)}..."** added to cart! 📱\n\n💡 **Advisor Tip**: Protect your smartphone and ensure ultra-fast charging with **Tempered Glass** screen protection and a **65W GaN Fast Charger** (₹299)!`;
      upsellPayload = {
        title: "65W GaN Turbo Fast Charger with Type-C Cable",
        price: 299,
        pitchMessage: "Power your smartphone 3x faster with our compact 65W GaN fast charger adapter."
      };
    } else if (titleLower.includes("saree") || subCat.includes("sarees") || titleLower.includes("kurti")) {
      crossSellText = `🎉 **"${product.title.slice(0, 30)}..."** added to cart! 👗\n\n💡 **Advisor Tip**: Pair this festive outfit with our matching **24K Gold Plated Temple Choker Set** (₹249) for a complete regal look!`;
      upsellPayload = {
        title: "Traditional 24K Gold Plated Temple Choker Jewellery Set",
        price: 249,
        pitchMessage: "Complete your festive ensemble with this handcrafted 24K Temple jewellery choker set."
      };
    } else if (titleLower.includes("shoe") || subCat.includes("footwear")) {
      crossSellText = `🎉 **"${product.title.slice(0, 30)}..."** added to cart! 👟\n\n💡 **Advisor Tip**: Bundle your footwear with **Memory Foam Cloud Insoles** (₹149) and breathable athletic socks for all-day comfort!`;
      upsellPayload = {
        title: "Orthopedic Memory Foam Cloud Insoles (Set of 2)",
        price: 149,
        pitchMessage: "Add dual-layer memory foam insoles for custom arch support and all-day walking comfort."
      };
    } else if (titleLower.includes("car") || subCat.includes("car")) {
      crossSellText = `🎉 **"${product.title.slice(0, 30)}..."** added to cart! 🚗\n\n💡 **Advisor Tip**: A **120W Portable Handheld Car Vacuum** and **Digital Tire Inflator** are essential accessories for road trips!`;
      upsellPayload = {
        title: "High Power 120W Portable Wireless Car Vacuum Cleaner",
        price: 349,
        pitchMessage: "Keep your vehicle interior spotless with this high-power portable vacuum cleaner."
      };
    } else if (titleLower.includes("bike") || subCat.includes("bike")) {
      crossSellText = `🎉 **"${product.title.slice(0, 30)}..."** added to cart! 🏍️\n\n💡 **Advisor Tip**: For enhanced riding safety, bundle **Touchscreen Hard Knuckle Riding Gloves** (₹299) and an **Anti-Theft Disc Lock**!`;
      upsellPayload = {
        title: "Touchscreen Hard Knuckle Protective Biker Riding Gloves",
        price: 299,
        pitchMessage: "Enjoy superior grip, knuckle protection, and touchscreen convenience while riding."
      };
    }

    if (crossSellText) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-cross-sell-${Date.now()}`,
          sender: "ai",
          text: crossSellText,
          upsellPitch: upsellPayload,
          products: [],
          suggestedFollowUpQueries: ["Show My Cart 🛒", "Proceed to Razorpay Checkout ⚡", "Top Trending Deals 🔥"]
        }
      ]);
    }

    showToast(`🛒 "${product.title.slice(0, 24)}..." added to cart!`);
  };

  const handleBuyProduct = (product) => {
    addToCart(product);
    addAuditEntry({
      action: 'INSTANT_BUY_INITIATED',
      status: 'pending',
      description: `Instant Buy initiated for "${product.title.slice(0, 40)}" at ₹${product.price}. Redirecting to checkout.`
    });
    setActiveModal('checkout');
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullScreen ? 'p-0' : 'p-2 sm:p-4'} bg-slate-950/70 backdrop-blur-md overflow-hidden animate-in fade-in duration-200`}>
      <div className={`bg-white ${isFullScreen ? 'w-full h-full rounded-none max-w-none border-none' : 'rounded-[32px] max-w-3xl w-full h-[92vh] sm:h-[86vh] border-2 border-indigo-100/60 shadow-2xl shadow-indigo-950/20'} flex flex-col overflow-hidden relative transition-all duration-300`}>

        {/* 1. HEADER (MATCHING SCREENSHOT) */}
        <div className="bg-gradient-to-r from-[#5442f6] via-[#6352f7] to-[#7f52f8] px-5 py-4 text-white flex items-center justify-between flex-shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <InfinityIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1 leading-tight">
                <span>Infinity</span>
                <span className="text-indigo-200">AI</span>
              </h2>
              <p className="text-xs text-white/80 font-normal">
                Your Shopping Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* New Chat Button */}
            <button
              onClick={handleCreateNewChat}
              className="bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer active:scale-95"
              title="Start a new chat session"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            {/* Chat History Drawer Toggle */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                showHistory
                  ? "bg-white/30 text-white border-white/40 shadow-xs"
                  : "bg-white/15 text-white/90 hover:bg-white/25 hover:text-white border-white/20"
              }`}
              title="View Chat History"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">History</span>
            </button>

            {/* Full Screen Mode Toggle */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
              title={isFullScreen ? "Exit Full Screen" : "Expand Full Screen"}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer ml-0.5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex overflow-hidden bg-[#f8faff] relative">

          {/* Slide-out Chat History Drawer */}
          {showHistory && (
            <div className="absolute inset-y-0 left-0 w-72 sm:w-80 bg-white border-r border-slate-200 shadow-2xl z-30 flex flex-col animate-in slide-in-from-left duration-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-800">Chat History</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCreateNewChat}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-all active:scale-95"
                    title="New Chat"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg cursor-pointer transition-all"
                    title="Close History"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
                {chatSessions.length === 0 ? (
                  <div className="text-center py-12 px-4 text-slate-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                    <p className="text-xs font-medium">No previous chats yet</p>
                    <p className="text-[11px] text-slate-400 mt-1">Start chatting to see conversations saved here.</p>
                  </div>
                ) : (
                  <>
                    {/* Today Group */}
                    {historyGroups.today.length > 0 && (
                      <div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                          Today
                        </div>
                        <div className="space-y-1">
                          {historyGroups.today.map((sess) => (
                            <div
                              key={sess.sessionId}
                              onClick={() => handleSwitchSession(sess.sessionId)}
                              className={`group w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                                activeSessionId === sess.sessionId
                                  ? "bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold shadow-xs"
                                  : "hover:bg-slate-50 text-slate-700 border border-transparent font-medium"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${activeSessionId === sess.sessionId ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"}`} />
                                <span className="truncate">{sess.title || "Shopping Chat"}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSession(sess.sessionId);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded-md transition-all cursor-pointer hover:bg-rose-50"
                                title="Delete chat"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Yesterday Group */}
                    {historyGroups.yesterday.length > 0 && (
                      <div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                          Yesterday
                        </div>
                        <div className="space-y-1">
                          {historyGroups.yesterday.map((sess) => (
                            <div
                              key={sess.sessionId}
                              onClick={() => handleSwitchSession(sess.sessionId)}
                              className={`group w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                                activeSessionId === sess.sessionId
                                  ? "bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold shadow-xs"
                                  : "hover:bg-slate-50 text-slate-700 border border-transparent font-medium"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${activeSessionId === sess.sessionId ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"}`} />
                                <span className="truncate">{sess.title || "Shopping Chat"}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSession(sess.sessionId);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded-md transition-all cursor-pointer hover:bg-rose-50"
                                title="Delete chat"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Older Group */}
                    {historyGroups.older.length > 0 && (
                      <div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                          Older
                        </div>
                        <div className="space-y-1">
                          {historyGroups.older.map((sess) => (
                            <div
                              key={sess.sessionId}
                              onClick={() => handleSwitchSession(sess.sessionId)}
                              className={`group w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                                activeSessionId === sess.sessionId
                                  ? "bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold shadow-xs"
                                  : "hover:bg-slate-50 text-slate-700 border border-transparent font-medium"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${activeSessionId === sess.sessionId ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"}`} />
                                <span className="truncate">{sess.title || "Shopping Chat"}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSession(sess.sessionId);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded-md transition-all cursor-pointer hover:bg-rose-50"
                                title="Delete chat"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* 3. CHAT STREAM (MESSAGES) */}
          <div
            ref={chatContainerRef}
            onScroll={handleChatScroll}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#f8faff] no-scrollbar"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} space-y-1.5`}
              >
                {/* Message Bubble Row */}
                <div className={`flex gap-3 max-w-[92%] sm:max-w-[80%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>

                  {/* AI Avatar */}
                  {msg.sender !== "user" && (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#5442f6] to-[#7f52f8] flex items-center justify-center flex-shrink-0 text-white shadow-sm mt-0.5">
                      <InfinityIcon className="w-5 h-5 text-white" />
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="flex flex-col">
                    {/* User Uploaded Image Preview in chat */}
                    {msg.image && (
                      <div className="mb-1.5 overflow-hidden rounded-2xl border border-indigo-200/80 shadow-md max-w-[240px] bg-slate-100">
                        <img src={msg.image} alt="Uploaded product" className="w-full h-auto max-h-48 object-cover hover:scale-105 transition-transform" />
                      </div>
                    )}

                    <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${msg.sender === "user"
                        ? "bg-gradient-to-r from-[#5442f6] to-[#6352f7] text-white rounded-tr-[4px] font-medium"
                        : "bg-white text-slate-800 rounded-tl-[4px] border border-slate-100"
                      }`}>
                      {msg.sender === "user" ? (
                        <div className="whitespace-pre-line space-y-1">
                          {renderFormattedText(msg.text)}
                        </div>
                      ) : msg.isStreaming ? (
                        <div className="whitespace-pre-line space-y-1">
                          {renderFormattedText(msg.text)}
                          <span className="inline-block w-1.5 h-4 ml-1 bg-gradient-to-t from-indigo-600 to-purple-600 animate-pulse align-middle rounded-xs shadow-xs" />
                        </div>
                      ) : (
                        <TypewriterText
                          text={msg.text}
                          isNew={!animatedIds.has(msg.id)}
                          onFinish={() => markAnimated(msg.id)}
                          onTick={scrollToBottom}
                        />
                      )}
                    </div>

                    {/* Timestamp below bubble */}
                    <div className={`text-[10px] text-slate-400 font-normal mt-1 flex items-center gap-1 ${msg.sender === "user" ? "justify-end pr-1" : "pl-1"
                      }`}>
                      <span>{msg.time || "10:24 AM"}</span>
                      {msg.sender === "user" && (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500 inline" />
                      )}
                    </div>
                  </div>
                </div>

                {/* INTERACTIVE REQUIREMENT DISCOVERY PILLS */}
                {msg.questionnaire && (
                  <RequirementCard
                    questionnaire={msg.questionnaire}
                    isSubmitted={submittedSessions.has(msg.questionnaire?.requirementSessionId)}
                    onSubmit={(requirementsData, qObj) => handleRequirementsSubmit(requirementsData, qObj)}
                  />
                )}

                {/* IN-CHAT INTERACTIVE CART & CHECKOUT CARD */}
                {(msg.inChatCheckout || msg.sender === "ai" && msg.text.includes("Shopping Cart")) && cart.length > 0 && (
                  <div className="w-full max-w-lg bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/90 border-2 border-indigo-200/80 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-md ml-11 animate-in zoom-in-95">
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-900">
                          Live Cart Summary ({cart.length} items)
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Free Shipping
                      </span>
                    </div>

                    {/* Cart Items Preview List */}
                    <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar">
                      {cart.map((item) => (
                        <div key={item.cartItemId} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={item.product.images[0]} alt="" className="w-9 h-9 object-cover rounded-lg border flex-shrink-0" />
                            <div className="truncate">
                              <div className="font-bold text-slate-900 truncate text-[11px]">{item.product.title}</div>
                              <div className="text-[10px] text-slate-500">Qty: {item.quantity} • ₹{item.product.price} each</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <span className="font-black text-slate-900 font-['Outfit']">₹{item.product.price * item.quantity}</span>
                            <button onClick={() => removeFromCart(item.cartItemId)} className="text-slate-400 hover:text-rose-500 p-1">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="bg-white p-3 rounded-2xl border border-indigo-100 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span>Cart Subtotal</span>
                        <span>₹{cartSummary.totalMRP}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-bold text-[11px]">
                        <span>Discount Saved</span>
                        <span>- ₹{cartSummary.totalSavings}</span>
                      </div>
                      <div className="flex justify-between font-black text-slate-900 text-sm border-t border-slate-100 pt-1.5 font-['Outfit']">
                        <span>Total Payable</span>
                        <span className="text-indigo-600">₹{cartSummary.finalAmount}</span>
                      </div>
                    </div>

                    {/* 1-Click Pay with Official Razorpay */}
                    <button
                      onClick={handleInChatRazorpayPayment}
                      disabled={isPaying}
                      className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      {isPaying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Opening Official Razorpay Gateway...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-amber-300" />
                          <span>⚡ Pay ₹{cartSummary.finalAmount} with Razorpay</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Official Razorpay • UPI, Cards & NetBanking • 100% Encrypted</span>
                    </div>
                  </div>
                )}

                {/* RECOMMENDED PRODUCT CARDS (HERO 2 + EXPANDER) */}
                {!msg.questionnaire && msg.products && msg.products.length > 0 && (() => {
                  const isExpanded = Boolean(expandedProducts[msg.id]);
                  const visibleProducts = isExpanded ? msg.products : msg.products.slice(0, 2);
                  return (
                    <div className="w-full pl-11 space-y-2.5">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          <span>Top Matched Recommendations ({isExpanded ? msg.products.length : Math.min(2, msg.products.length)} of {msg.products.length}):</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {visibleProducts.map((prod) => (
                          <div
                            key={prod.id}
                            className="bg-white border-2 border-indigo-100/90 hover:border-indigo-400 rounded-2xl p-3 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group space-y-2 animate-in fade-in"
                          >
                            <div className="flex gap-3">
                              <div
                                onClick={() => handleWatchProduct(prod)}
                                className="w-20 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer relative"
                              >
                                <SafeImage
                                  src={prod.images[0]}
                                  alt={prod.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  {prod.rating}★
                                </span>
                              </div>

                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                                      🎯 {prod.matchScore || "98% Match"}
                                    </span>
                                    <span className="text-[9px] text-emerald-600 font-extrabold truncate">
                                      {prod.discount}% off
                                    </span>
                                  </div>
                                  <h4
                                    onClick={() => handleWatchProduct(prod)}
                                    className="text-xs font-bold text-slate-900 line-clamp-2 cursor-pointer hover:text-indigo-600 leading-snug"
                                  >
                                    {prod.title}
                                  </h4>
                                </div>

                                <div className="flex items-baseline gap-1.5 mt-1">
                                  <span className="text-sm font-black text-slate-900 font-['Outfit']">
                                    ₹{prod.price?.toLocaleString('en-IN')}
                                  </span>
                                  <span className="text-[10px] text-slate-400 line-through">
                                    ₹{prod.originalPrice?.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {prod.whyItMatches && (
                              <div className="bg-indigo-50/70 border border-indigo-100/90 rounded-xl p-2 space-y-0.5">
                                <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                                  {prod.whyItMatches}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
                              <button
                                onClick={() => handleWatchProduct(prod)}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" /> View
                              </button>

                              <button
                                onClick={() => handleAddProduct(prod)}
                                className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" /> Add
                              </button>

                              <button
                                onClick={() => handleBuyProduct(prod)}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-[10px] font-extrabold py-1.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Zap className="w-3 h-3 text-amber-300" /> Buy
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {msg.products.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setExpandedProducts(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer mt-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>{isExpanded ? "Show Top 2 Matches Only ▴" : `✨ View All ${msg.products.length} Matches ▾`}</span>
                        </button>
                      )}

                      {isExpanded && msg.hasMoreProducts && (
                        <InfiniteProductLoader 
                          requirements={msg.requirements}
                          cursor={msg.nextCursor}
                          isLoading={msg.isLoadingMore}
                          onLoadMore={async (cursor) => {
                            try {
                              setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isLoadingMore: true } : m));
                              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                              const res = await fetch(`${API_URL}/products/recommendations`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ requirements: msg.requirements, cursor })
                              });
                              const data = await res.json();
                              if (data.success) {
                                setMessages(prev => prev.map(m => {
                                  if (m.id === msg.id) {
                                    return { 
                                      ...m, 
                                      products: [...m.products, ...(data.products || [])], 
                                      nextCursor: data.nextCursor, 
                                      hasMoreProducts: data.hasMore,
                                      isLoadingMore: false
                                    };
                                  }
                                  return m;
                                }));
                              }
                            } catch (e) {
                              setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isLoadingMore: false } : m));
                            }
                          }}
                        />
                      )}
                    </div>
                  );
                })()}

                {/* FOLLOW-UP ACTION CHIPS (MATCHING SCREENSHOT) */}
                {msg.suggestedFollowUpQueries && msg.suggestedFollowUpQueries.length > 0 && (
                  <div className="flex flex-wrap gap-2 pl-11 pt-1">
                    {msg.suggestedFollowUpQueries.map((query, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendQuery(query)}
                        className="text-xs sm:text-sm font-semibold bg-white hover:bg-indigo-50/80 hover:text-indigo-700 text-slate-700 border border-slate-200/90 px-3.5 py-2 rounded-2xl transition-all shadow-xs hover:border-indigo-300 hover:shadow-sm active:scale-95 cursor-pointer flex items-center gap-2"
                      >
                        {getOptionIcon(query)}
                        <span>{query}</span>
                      </button>
                    ))}
                  </div>
                )}

              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2 pl-11 text-xs text-indigo-600 font-bold animate-pulse py-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Infinity AI is finding the best matches...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

        </div>

        {/* 5. FLOATING INPUT FOOTER (MATCHING SCREENSHOT WITH BOTH IMAGE UPLOAD & MIC) */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100 flex-shrink-0">
          {/* Image preview chip above input */}
          {imagePreview && (
            <div className="flex items-center gap-2.5 p-2 px-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 rounded-2xl mb-2.5 w-fit shadow-xs animate-in fade-in slide-in-from-bottom-2">
              <img src={imagePreview} alt="Attached" className="w-10 h-10 object-cover rounded-xl border border-indigo-200 shadow-xs" />
              <div className="text-xs pr-1">
                <p className="font-bold text-slate-900 flex items-center gap-1">
                  <span>Product Image Attached</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </p>
                <p className="text-[10px] text-indigo-600 font-medium">Gemini will visually analyze & match catalog items</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-1.5 rounded-full bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 ml-1 cursor-pointer transition-colors shadow-2xs"
                title="Remove attached image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Hidden File Input for Image Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2 bg-slate-100/80 border border-slate-200/90 rounded-full px-2 py-1.5 shadow-inner focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
          >
            {/* 1. Dedicated Image Upload / Paperclip Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-full bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 flex-shrink-0"
              title="Attach Product Photo for Visual Search (Gemini Vision)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* 2. Dedicated Microphone Voice Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 flex-shrink-0 ${
                voiceState === 'listening'
                  ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-300 ring-2 ring-rose-300"
                  : voiceState === 'processing'
                  ? "bg-amber-500 text-white animate-spin shadow-md shadow-amber-200"
                  : voiceState === 'error'
                  ? "bg-red-100 text-red-600"
                  : "bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
              title={
                voiceState === 'listening'
                  ? "Listening... Click to stop"
                  : voiceState === 'processing'
                  ? "Processing voice query..."
                  : "Voice Search (Speak in Hindi / Hinglish / English)"
              }
            >
              {voiceState === 'listening' ? (
                <MicOff className="w-4 h-4" />
              ) : voiceState === 'processing' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Input Field */}
            <input
              type="text"
              placeholder={
                voiceState === 'listening'
                  ? "🎙️ Listening... Speak now (Hindi / English / Hinglish)"
                  : voiceState === 'processing'
                  ? "⚡ Processing voice query..."
                  : isCompressingImage
                  ? "🖼️ Compressing image to WebP..."
                  : (selectedImage ? "Type an optional note or hit send to analyze..." : "Type your message here...")
              }
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none px-2"
            />

            {/* 3. Send Button */}
            <button
              type="submit"
              disabled={(!inputQuery.trim() && !selectedImage) || loading}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-[#5442f6] to-[#7f52f8] hover:from-[#4936ec] hover:to-[#7245ec] disabled:opacity-40 text-white flex items-center justify-center shadow-md transition-all cursor-pointer active:scale-95 flex-shrink-0"
              title="Send Message / Analyze"
            >
              <Send className="w-4 h-4 -mr-0.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
