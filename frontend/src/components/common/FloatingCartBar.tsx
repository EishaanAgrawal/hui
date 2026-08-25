import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const FloatingCartBar: React.FC = () => {
  const { cart, itemCount } = useCart();
  const location = useLocation();

  // Hide on cart and checkout pages to avoid redundancy
  if (!cart || itemCount === 0 || location.pathname === '/cart' || location.pathname === '/checkout') {
    return null;
  }

  return (
    <div className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg animate-bounce-subtle">
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-4 ring-2 ring-brand-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-sm shadow-md">
            {itemCount}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-base">₹{cart?.total || 0}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded-md">
                Direct Farm Rate
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {cart?.items?.length || itemCount} item{(cart?.items?.length || itemCount) > 1 ? 's' : ''} in your fresh basket
            </p>
          </div>
        </div>

        <Link
          to="/cart"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs transition duration-200 shadow-lg shadow-brand-500/25 group whitespace-nowrap"
        >
          <span>View Basket</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
        </Link>
      </div>
    </div>
  );
};
