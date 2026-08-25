import React from 'react';
import { ShieldCheck, HeartHandshake, Truck, Sparkles, Tractor, CheckCircle2 } from 'lucide-react';
import { PriceTransparencyWidget } from '../../components/common/PriceTransparencyWidget';

export const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
          About FarmDirect
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
          Restoring Fair Value to Indian Agriculture
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          For decades, complex intermediary chains extracted up to 65% of agricultural value, leaving farmers with meager returns while consumers paid inflated rates for stale, multi-day cold-stored food. FarmDirect was founded to engineer a direct, digital, and transparent bridge.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xl">
            🌾
          </div>
          <h3 className="text-lg font-bold text-slate-900">Direct Farmer Payouts</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            By operating on a nominal 5% tech fee, 85-90% of every transaction is transferred directly to the farmer bank account within 24 hours of fulfillment.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            ☀️
          </div>
          <h3 className="text-lg font-bold text-slate-900">Zero Cold Storage Aging</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Produce isn't warehoused for weeks. Farmers harvest in the morning upon order placement, and express logistics deliver to your door within 24 hours.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
            🛡️
          </div>
          <h3 className="text-lg font-bold text-slate-900">Radical Price Transparency</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every product displays its farm gate rate alongside traditional Mandi markups, showing users exactly what the grower earns and what they save.
          </p>
        </div>
      </div>

      {/* Embed calculator */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 text-center">Interactive Price Transparency Tool</h2>
        <PriceTransparencyWidget />
      </div>
    </div>
  );
};
