import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, Truck, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900">
      {/* Top Value Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Direct Farmer Payouts</h4>
              <p className="text-xs text-slate-500 mt-0.5">85-90% goes straight to the grower</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Sunrise Harvest</h4>
              <p className="text-xs text-slate-500 mt-0.5">Zero cold-storage degradation</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Farm-to-Door Dispatch</h4>
              <p className="text-xs text-slate-500 mt-0.5">Direct 24-hour delivery logistics</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">100% Traceable</h4>
              <p className="text-xs text-slate-500 mt-0.5">Know your grower and soil origin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl organic-gradient text-white flex items-center justify-center font-bold text-lg">
              🌾
            </div>
            <span className="text-xl font-black text-white">FarmDirect</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            Empowering agricultural producers with transparent direct-to-consumer technology.
            Fresh, ethical, and fairly priced food for every household.
          </p>
          <div className="pt-2">
            <Link
              to="/register/farmer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-brand-600/20"
            >
              🚜 Register As A Farm Partner
            </Link>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Marketplace</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/shop?category=vegetables" className="hover:text-brand-400 transition">
                Fresh Vegetables
              </Link>
            </li>
            <li>
              <Link to="/shop?category=fruits" className="hover:text-brand-400 transition">
                Farm Fruits
              </Link>
            </li>
            <li>
              <Link to="/shop?category=grains" className="hover:text-brand-400 transition">
                Heritage Grains & Atta
              </Link>
            </li>
            <li>
              <Link to="/shop?category=spices" className="hover:text-brand-400 transition">
                Aromatic Spices
              </Link>
            </li>
            <li>
              <Link to="/shop?organic=true" className="hover:text-brand-400 transition">
                100% Certified Organic
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Farmers & Transparency</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/farmers" className="hover:text-brand-400 transition">
                Directory of Farmers
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-brand-400 transition">
                Price Transparency Calculator
              </Link>
            </li>
            <li>
              <Link to="/register/farmer" className="hover:text-brand-400 transition">
                Farmer Verification Process
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-brand-400 transition">
                Our Supply Chain Story
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Demo Credentials</h4>
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-2">
            <div>
              <span className="text-slate-500 font-semibold block">Admin:</span>
              <code className="text-brand-400 font-mono">admin@farmdirect.com</code> / <span className="text-slate-300">Admin@123</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Farmer:</span>
              <code className="text-brand-400 font-mono">farmer1@farmdirect.com</code> / <span className="text-slate-300">Farmer@123</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Consumer:</span>
              <code className="text-brand-400 font-mono">consumer1@farmdirect.com</code> / <span className="text-slate-300">User@123</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} FarmDirect Agricultural Marketplace. All rights reserved.
        </div>
        <div className="flex gap-6">
          <Link to="/how-it-works" className="hover:text-slate-400">Fair Pricing Policy</Link>
          <Link to="/about" className="hover:text-slate-400">Privacy & Terms</Link>
          <a href="#top" className="hover:text-brand-400">Back to Top ↑</a>
        </div>
      </div>
    </footer>
  );
};
