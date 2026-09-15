import React from 'react';
import { useShop } from '../context/ShopContext';
import { BarChart3, Package, DollarSign, TrendingUp, Sparkles, Plus, Settings } from 'lucide-react';

export const SupplierDashboard = () => {
  const { user, setUser } = useShop();

  const handleLogout = () => {
    setUser({ isLoggedIn: false, phone: "", name: "", role: "user" });
    localStorage.removeItem('infinity_user');
    // Remove token cookie
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col">
        <h1 className="text-2xl font-black font-['Outfit'] mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          Supplier Portal
        </h1>
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 bg-indigo-600 rounded-xl text-white font-medium">
            <BarChart3 className="w-5 h-5" /> <span>Dashboard</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
            <Package className="w-5 h-5" /> <span>Products</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
            <Settings className="w-5 h-5" /> <span>Settings</span>
          </button>
        </nav>
        <div className="pt-8 mt-auto border-t border-slate-800">
          <p className="text-sm text-slate-400 mb-4">Logged in as<br/><strong className="text-white">{user.name}</strong></p>
          <button onClick={handleLogout} className="text-red-400 text-sm hover:text-red-300 font-medium">
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Welcome back, {user.name}</h2>
            <p className="text-slate-500">Here is your store's performance today.</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center shadow-lg shadow-indigo-200 transition-all">
            <Plus className="w-5 h-5 mr-2" /> Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Sales</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2">₹1,24,500</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-emerald-600 font-medium mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" /> +14.5% from last week
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">Active Orders</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2">42</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-blue-600 font-medium mt-4">12 pending dispatch</p>
          </div>
        </div>

        {/* AI Agent Panel */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.4rem] p-6 md:p-8 relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Supplier AI Assistant</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 border border-white/10 p-4 rounded-2xl">
                <p className="text-indigo-200 text-sm mb-1 font-medium">Trending Insights</p>
                <p className="text-white">Your "Gaming Laptops" category is seeing a 300% surge in searches today. I recommend increasing inventory or running a flash sale.</p>
              </div>
              <div className="bg-white/10 border border-white/10 p-4 rounded-2xl">
                <p className="text-amber-200 text-sm mb-1 font-medium">Action Required</p>
                <p className="text-white">3 customers have requested returns for "Wireless Earbuds X". There might be a quality defect in this batch. Should I pause the listing?</p>
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
              <input type="text" placeholder="Ask AI for market trends or inventory advice..." className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400" />
              <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                Ask AI
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
