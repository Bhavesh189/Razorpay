import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, 
  PackageCheck, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ChevronRight, 
  RotateCcw,
  ShoppingBag,
  HelpCircle
} from 'lucide-react';
import { SafeImage } from './SafeImage';

export const OrderTrackingModal = () => {
  const { 
    orders, 
    activeModal, 
    setActiveModal, 
    selectedOrder, 
    setSelectedOrder 
  } = useShop();

  if (activeModal !== 'orderTracking') return null;

  const currentOrder = selectedOrder || (orders.length > 0 ? orders[0] : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 relative my-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-5 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PackageCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
                My Orders & Live Tracking
              </h2>
              <p className="text-xs text-slate-500">
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Placed
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-6">
          
          {orders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Orders List */}
              <div className="md:col-span-5 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Select Order
                </span>

                <div className="space-y-2.5 max-h-[60vh] overflow-y-auto no-scrollbar">
                  {orders.map((order) => {
                    const isSelected = currentOrder?.id === order.id;
                    const firstItem = order.items[0];

                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex gap-3 items-center">
                          {firstItem && (
                            <div className="w-14 h-16 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                              <SafeImage
                                src={firstItem.product.images[0]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {order.id}
                              </span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                                Confirmed
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • ₹{order.summary.finalAmount}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Delivery by {order.estimatedDelivery}
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
                <div className="md:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-5">
                  
                  {/* Status Banner */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-xs text-slate-500">Order ID: <strong>{currentOrder.id}</strong></span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-indigo-600" />
                        Expected by {currentOrder.estimatedDelivery}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      On Schedule
                    </span>
                  </div>

                  {/* Order Progress Stepper */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Live Delivery Progress
                    </span>

                    <div className="space-y-4 relative pl-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {currentOrder.trackingSteps.map((step, idx) => (
                        <div key={idx} className="relative flex items-start gap-3">
                          <div className={`absolute -left-[23px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                            step.done 
                              ? 'bg-indigo-600 text-white shadow-sm' 
                              : 'bg-white border-2 border-slate-300 text-slate-400'
                          }`}>
                            {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>}
                          </div>
                          <div>
                            <div className={`text-xs font-bold ${step.done ? 'text-slate-900' : 'text-slate-500'}`}>
                              {step.label}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {step.date}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Items Summary in this Order */}
                  <div className="border-t border-slate-200 pt-3 space-y-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Items Ordered ({currentOrder.items.length})
                    </span>

                    <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar">
                      {currentOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                          <div className="w-10 h-12 rounded overflow-hidden flex-shrink-0">
                            <SafeImage
                              src={item.product.images[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 truncate">{item.product.title}</div>
                            <div className="text-slate-500 text-[11px]">Size: {item.size} • Qty: {item.quantity}</div>
                          </div>
                          <span className="font-bold text-slate-900 font-['Outfit']">
                            ₹{item.product.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address & Payment */}
                  <div className="border-t border-slate-200 pt-3 text-xs space-y-1 text-slate-600">
                    <div>
                      <strong>Delivering to:</strong> {currentOrder.address?.name}, {currentOrder.address?.houseNo}, {currentOrder.address?.city} - {currentOrder.address?.pincode}
                    </div>
                    <div>
                      <strong>Payment Method:</strong> {currentOrder.paymentMethod} (₹{currentOrder.summary.finalAmount})
                    </div>
                  </div>

                </div>
              )}

            </div>
          ) : (
            /* No Orders State */
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Orders Placed Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven't placed any orders yet. Start exploring Infinity Store's 50 Lakh+ products today!
              </p>
              <button
                onClick={() => setActiveModal(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                Browse Products
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
