import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  Tractor,
  ShieldCheck,
  Package,
  Layers,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { NotificationDropdown } from '../common/NotificationDropdown';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isFarmer, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl organic-gradient text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition duration-200">
              <span className="text-xl">🌾</span>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-brand-700 transition">
                Farm<span className="text-brand-600">Direct</span>
              </span>
              <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-slate-600 -mt-1">
                Zero Middlemen • 100% Fair
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/shop"
              className="text-sm font-semibold text-slate-700 hover:text-brand-700 transition"
            >
              Fresh Marketplace
            </Link>
            <Link
              to="/farmers"
              className="text-sm font-semibold text-slate-700 hover:text-brand-700 transition flex items-center gap-1.5"
            >
              <Tractor className="w-4 h-4 text-brand-600" />
              Verified Farmers
            </Link>
            <Link
              to="/how-it-works"
              className="text-sm font-semibold text-slate-700 hover:text-brand-700 transition"
            >
              Price Transparency
            </Link>
            <Link
              to="/about"
              className="text-sm font-semibold text-slate-700 hover:text-brand-700 transition"
            >
              Our Mission
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-2xl bg-slate-100/80 hover:bg-brand-50 hover:text-brand-700 text-slate-700 transition group"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md ring-2 ring-white animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* In-App Notifications */}
            {isAuthenticated && <NotificationDropdown />}

            {/* Auth / Profile Area */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 transition text-slate-800 font-medium text-sm"
                >
                  <img
                    src={
                      user?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
                    }
                    alt={user?.name}
                    className="w-7 h-7 rounded-xl object-cover ring-2 ring-brand-500"
                  />
                  <span className="hidden sm:inline font-semibold max-w-[100px] truncate">
                    {user?.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-slate-100 py-2 z-50 animate-fade-in divide-y divide-slate-100">
                    <div className="px-4 py-3">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Signed in as
                      </p>
                      <p className="text-sm font-black text-slate-900 truncate">{user?.name}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                        {user?.role}
                      </span>
                    </div>

                    {isFarmer && (
                      <div className="py-1">
                        <Link
                          to="/farmer/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                        >
                          <Tractor className="w-4 h-4" /> Farmer Portal
                        </Link>
                        <Link
                          to="/farmer/products"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Layers className="w-4 h-4" /> Manage Harvest Products
                        </Link>
                        <Link
                          to="/farmer/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Package className="w-4 h-4" /> Incoming Orders
                        </Link>
                      </div>
                    )}

                    {isAdmin && (
                      <div className="py-1">
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                        >
                          <ShieldCheck className="w-4 h-4" /> Admin Console
                        </Link>
                      </div>
                    )}

                    <div className="py-1">
                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Package className="w-4 h-4" /> My Orders & Tracking
                      </Link>
                      <Link
                        to="/addresses"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <UserIcon className="w-4 h-4" /> Delivery Addresses
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Heart className="w-4 h-4" /> Saved Farm Harvests
                      </Link>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-bold text-slate-700 hover:text-brand-700 px-3 py-2 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-brand-500/30 transition active:scale-95"
                >
                  Join FarmDirect
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl">
          <Link
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            Fresh Marketplace
          </Link>
          <Link
            to="/farmers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            Verified Farmers
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            Price Transparency
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            About FarmDirect
          </Link>

          {isAuthenticated && (
            <div className="pt-3 border-t border-slate-100 space-y-1">
              {isFarmer && (
                <Link
                  to="/farmer/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-bold text-brand-700 bg-brand-50"
                >
                  Farmer Portal
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50"
                >
                  Admin Console
                </Link>
              )}
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700"
              >
                My Orders
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
