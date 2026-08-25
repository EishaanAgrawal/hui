import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, Tractor, User, LayoutDashboard } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const { itemCount } = useCart();
  const { isAuthenticated, isFarmer, isAdmin } = useAuth();

  const getDashboardLink = () => {
    if (!isAuthenticated) return '/login';
    if (isAdmin) return '/admin/dashboard';
    if (isFarmer) return '/farmer/dashboard';
    return '/profile';
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 shadow-lg safe-bottom">
      <nav className="flex items-center justify-around">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-xl transition ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </NavLink>

        {/* Shop */}
        <NavLink
          to="/shop"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-xl transition ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Shop</span>
        </NavLink>

        {/* Farmers */}
        <NavLink
          to="/farmers"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-xl transition ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Tractor className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Farmers</span>
        </NavLink>

        {/* Cart with Live Badge */}
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-xl relative transition ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-brand-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Cart</span>
        </NavLink>

        {/* Account / Dashboard */}
        <NavLink
          to={getDashboardLink()}
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-xl transition ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          {isFarmer || isAdmin ? (
            <LayoutDashboard className="w-5 h-5" />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px] mt-0.5">
            {isAdmin ? 'Admin' : isFarmer ? 'Portal' : 'Account'}
          </span>
        </NavLink>
      </nav>
    </div>
  );
};
