import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  Search,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { NotificationDropdown } from '../common/NotificationDropdown';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isFarmer, isAdmin, logout } = useAuth();
  const { cart, itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
      {/* Top Banner Utility Strip (Amazon/Blinkit style) */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-brand-400 font-bold">
              <Clock className="w-3.5 h-3.5" /> Direct Morning Harvest • Delivered in 24 Hours
            </span>
            <span className="text-slate-500">|</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-brand-400" /> Delivering to: <strong className="text-white">Maharashtra & Metro Hubs</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link to="/about" className="hover:text-white transition">Why Direct Farm?</Link>
            <Link to="/how-it-works" className="hover:text-white transition">Price Transparency Tool</Link>
            <Link to="/register/farmer" className="text-brand-400 hover:text-brand-300 font-bold transition">
              🌾 Grow with Us (Farmer Onboarding)
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-11 h-11 rounded-2xl organic-gradient text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition duration-200">
              <span className="text-2xl">🌾</span>
            </div>
            <div>
              <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-slate-900 group-hover:text-brand-700 transition">
                Farm<span className="text-brand-600">Direct</span>
              </span>
              <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-emerald-700 -mt-1">
                Zero Middlemen • 100% Fair
              </span>
            </div>
          </Link>

          {/* Quick Search Bar (Blinkit / Amazon style) */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl hidden md:flex items-center relative"
          >
            <div className="w-full relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Search "organic tomatoes", "alphonso mangoes", "desi ghee", "wheat"...'
                className="w-full pl-10 pr-20 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none transition shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition shadow-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Farmers Directory Button */}
            <Link
              to="/farmers"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-700 hover:bg-slate-100 transition"
            >
              <Tractor className="w-4 h-4 text-brand-600" />
              <span>Verified Farmers</span>
            </Link>

            {/* In-App Notifications */}
            {isAuthenticated && <NotificationDropdown />}

            {/* Cart Button (Blinkit Style with Price Preview) */}
            <Link
              to="/cart"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-brand-50 border border-brand-200 text-brand-900 hover:bg-brand-600 hover:text-white transition group shadow-sm"
              title="View Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-600 group-hover:bg-slate-900 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider block leading-none">
                  Basket
                </span>
                <span className="text-xs font-black">
                  {cart && cart.total > 0 ? `₹${cart.total}` : 'Empty'}
                </span>
              </div>
            </Link>

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
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-brand-500"
                  />
                  <span className="hidden sm:inline font-bold text-xs max-w-[90px] truncate">
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
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-brand-700 hover:bg-brand-50"
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
                      </div>
                    )}

                    {isAdmin && (
                      <div className="py-1">
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50"
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
                        <Package className="w-4 h-4" /> My Orders & Timeline
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Heart className="w-4 h-4" /> Saved Items
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <UserIcon className="w-4 h-4" /> Account Settings
                      </Link>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
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
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-700 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black shadow-md shadow-brand-600/25 transition hidden sm:inline-block"
                >
                  Join FarmDirect
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 md:hidden transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 animate-fade-in">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search farm fresh produce..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </form>

          <nav className="space-y-1 text-sm font-semibold text-slate-700">
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              Fresh Marketplace
            </Link>
            <Link
              to="/farmers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-brand-700 font-bold"
            >
              🌾 Verified Farmers Directory
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              Middlemen Price Calculator
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              Our Mission
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
