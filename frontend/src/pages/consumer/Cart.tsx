import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tractor,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';

export const Cart: React.FC = () => {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto text-2xl font-bold">
          🛒
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your Fresh Cart</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Please log in to view items in your cart or proceed to checkout.
        </p>
        <Link to="/login">
          <Button variant="primary">Sign In to Continue</Button>
        </Link>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <EmptyState
          title="Your cart is empty"
          description="You have not added any fresh farm produce to your cart yet. Discover local growers now!"
          actionText="Browse Marketplace"
          onAction={() => navigate('/shop')}
        />
      </div>
    );
  }

  const progressToFreeDelivery = Math.min(
    100,
    Math.round((cart.subtotal / cart.freeDeliveryThreshold) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Your Fresh Harvest Cart</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Items from {cart.groupedByFarmer.length} verified farm partner{cart.groupedByFarmer.length > 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      {/* Free Delivery Progress Bar */}
      <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4">
        <div className="flex items-center justify-between text-xs font-bold text-brand-900 mb-2">
          <span>
            {cart.subtotal >= cart.freeDeliveryThreshold
              ? '🎉 You unlocked Free Express Delivery!'
              : `Add ₹${cart.freeDeliveryThreshold - cart.subtotal} more to get Free Delivery!`}
          </span>
          <span>{progressToFreeDelivery}%</span>
        </div>
        <div className="w-full h-2.5 bg-brand-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 rounded-full transition-all duration-500"
            style={{ width: `${progressToFreeDelivery}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left List Grouped by Farmer */}
        <div className="lg:col-span-2 space-y-6">
          {cart.groupedByFarmer.map((group) => (
            <div
              key={group.farmerId}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Farmer Header */}
              <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Tractor className="w-4 h-4 text-brand-600" />
                  <span>Harvested by: {group.farmName}</span>
                  <span className="text-slate-400 font-normal">({group.location})</span>
                </div>
                <span className="text-xs font-bold text-brand-700">
                  Subtotal: ₹{group.subtotal}
                </span>
              </div>

              {/* Items in this farm */}
              <div className="divide-y divide-slate-100 p-6 space-y-4">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 first:pt-0"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          item.product.image ||
                          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150'
                        }
                        alt={item.product.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-100"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{item.product.name}</h4>
                        <p className="text-xs text-slate-500">
                          ₹{item.product.price} / {item.product.unit}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-slate-100 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded-lg text-slate-600 hover:bg-white"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-slate-900 px-3 text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded-lg text-slate-600 hover:bg-white"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-black text-slate-900 text-sm min-w-[60px] text-right">
                        ₹{item.quantity * item.product.price}
                      </span>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-600 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Summary Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 lg:sticky lg:top-28">
          <h3 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100">
            Order Financial Summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Gross Farm Produce Subtotal</span>
              <span className="font-bold text-slate-900">₹{cart.subtotal}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Platform & Quality Fee (5%)</span>
              <span className="font-bold text-slate-900">₹{cart.platformFee}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Direct Express Delivery Fee</span>
              <span className="font-bold text-slate-900">
                {cart.deliveryFee === 0 ? (
                  <span className="text-emerald-600 uppercase font-black text-xs">FREE</span>
                ) : (
                  `₹${cart.deliveryFee}`
                )}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between text-base">
              <span className="font-black text-slate-900">Total Payable</span>
              <span className="text-2xl font-black text-brand-900">₹{cart.total}</span>
            </div>
          </div>

          <Button
            onClick={() => navigate('/checkout')}
            size="lg"
            variant="primary"
            className="w-full font-bold shadow-lg shadow-brand-600/30"
            icon={<ArrowRight className="w-5 h-5" />}
          >
            Proceed to Checkout (₹{cart.total})
          </Button>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Direct Payout to Growers Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
