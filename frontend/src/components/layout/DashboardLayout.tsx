import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Tractor,
  ShieldCheck,
  LayoutDashboard,
  Package,
  Layers,
  IndianRupee,
  Star,
  Users,
  Settings,
  ArrowLeft,
  LogOut,
  FolderTree,
  Menu,
  X,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  portalType: 'FARMER' | 'ADMIN';
  title?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  portalType,
  title,
  subtitle,
  actionButton,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const farmerNavItems = [
    { label: 'Overview', path: '/farmer/dashboard', icon: LayoutDashboard },
    { label: 'My Products', path: '/farmer/products', icon: Layers },
    { label: 'Inventory Control', path: '/farmer/inventory', icon: Package },
    { label: 'Fulfillment Orders', path: '/farmer/orders', icon: Package },
    { label: 'B2B RFQs', path: '/farmer/rfqs', icon: Tractor },
    { label: 'Smart Logistics', path: '/farmer/logistics', icon: Tractor },
    { label: 'Earnings & Payouts', path: '/farmer/earnings', icon: IndianRupee },
    { label: 'Reviews & Ratings', path: '/farmer/reviews', icon: Star },
    { label: 'Farm Profile', path: '/farmer/profile', icon: Settings },
    { label: 'AI Demand Forecast', path: '/farmer/forecast', icon: TrendingUp },
  ];

  const adminNavItems = [
    { label: 'Overview & GMV', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Farmer Verification', path: '/admin/farmers', icon: Tractor },
    { label: 'Users Directory', path: '/admin/users', icon: Users },
    { label: 'Platform Orders', path: '/admin/orders', icon: Package },
    { label: 'Categories Manager', path: '/admin/categories', icon: FolderTree },
  ];

  const navItems = portalType === 'FARMER' ? farmerNavItems : adminNavItems;
  const isFarmer = portalType === 'FARMER';

  const renderNavLinks = () => (
    <nav className="px-3 space-y-1.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileDrawerOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition duration-200 ${
              isActive
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between hidden md:flex border-r border-slate-800">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl organic-gradient text-white flex items-center justify-center font-bold text-lg">
                🌾
              </div>
              <div>
                <span className="text-xl font-black text-white">FarmDirect</span>
                <span
                  className={`block text-[10px] font-black uppercase tracking-wider ${
                    isFarmer ? 'text-brand-400' : 'text-indigo-400'
                  }`}
                >
                  {isFarmer ? 'Farmer Portal' : 'Admin Console'}
                </span>
              </div>
            </Link>
          </div>

          {/* User Preview */}
          <div className="p-4 mx-3 my-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
              }
              alt={user?.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-500"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.farmerProfile?.farmName || user?.email}
              </p>
            </div>
          </div>

          {renderNavLinks()}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/shop"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileDrawerOpen(false)}
          />

          <div className="relative w-72 max-w-[80vw] bg-slate-900 text-slate-300 flex flex-col justify-between p-4 shadow-2xl z-10 animate-slide-left">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <Link to="/" className="flex items-center gap-2">
                  <span className="text-lg">🌾</span>
                  <span className="text-lg font-black text-white">FarmDirect</span>
                </Link>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User badge */}
              <div className="p-3 mb-4 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-3">
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
                  }
                  alt={user?.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-500"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-brand-400 font-semibold">{user?.role}</p>
                </div>
              </div>

              {renderNavLinks()}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <Link
                to="/shop"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" /> Marketplace
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Mobile & Desktop Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              {title && <h1 className="text-lg sm:text-2xl font-black text-slate-900">{title}</h1>}
              {subtitle && <p className="text-xs text-slate-500 hidden sm:block mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {actionButton && <div>{actionButton}</div>}
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:text-brand-700 text-xs font-bold text-slate-700 transition"
            >
              Storefront
            </Link>
          </div>
        </header>

        {/* Dashboard Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};
