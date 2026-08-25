import React, { useState } from 'react';
import { ArrowRight, TrendingDown, CheckCircle2, AlertCircle } from 'lucide-react';

interface PriceTransparencyProps {
  productName?: string;
  farmPrice?: number;
  unit?: string;
}

export const PriceTransparencyWidget: React.FC<PriceTransparencyProps> = ({
  productName = 'Organic Vine Tomatoes',
  farmPrice = 40,
  unit = 'KG',
}) => {
  const [sliderPrice, setSliderPrice] = useState<number>(farmPrice);

  // Traditional Supply Chain Calculations (Typical Multi-tier markup)
  const traditionalFarmerShare = Math.round(sliderPrice * 0.55); // Middlemen pay farmer very little
  const traditionalTrader = Math.round(sliderPrice * 0.25);
  const traditionalWholesaler = Math.round(sliderPrice * 0.3);
  const traditionalRetailer = Math.round(sliderPrice * 0.45);
  const traditionalTotalConsumerCost =
    traditionalFarmerShare + traditionalTrader + traditionalWholesaler + traditionalRetailer;

  // FarmDirect Model
  const farmDirectFarmerPayout = sliderPrice; // 100% of listed farm price goes to farmer
  const farmDirectPlatformFee = Math.round(sliderPrice * 0.05); // 5% fair tech commission
  const farmDirectTotalConsumerCost = farmDirectFarmerPayout + farmDirectPlatformFee;

  const consumerSavings = Math.round(
    ((traditionalTotalConsumerCost - farmDirectTotalConsumerCost) / traditionalTotalConsumerCost) *
      100
  );
  const farmerEarningBoost = Math.round(
    ((farmDirectFarmerPayout - traditionalFarmerShare) / traditionalFarmerShare) * 100
  );

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl overflow-hidden relative">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
            100% Transparent Supply Chain
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            Middlemen Elimination Calculator
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Compare where your rupee actually goes for <span className="font-semibold text-slate-700">{productName}</span>
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase text-slate-500">Simulate Farm Price</div>
            <div className="text-lg font-black text-brand-700">₹{sliderPrice}/{unit}</div>
          </div>
          <input
            type="range"
            min={15}
            max={300}
            step={5}
            value={sliderPrice}
            onChange={(e) => setSliderPrice(Number(e.target.value))}
            className="w-28 accent-brand-600 cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Traditional Supply Chain */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                Traditional Multi-Tier Chain
              </span>
              <span className="text-xs text-slate-400 font-medium">4+ Intermediaries</span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-200/60">
                <span className="text-slate-600 font-medium">Farmer receives (Mandi Distress)</span>
                <span className="font-bold text-slate-900">₹{traditionalFarmerShare}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-200/60 text-slate-500">
                <span>Local Village Trader cut</span>
                <span className="font-semibold">+₹{traditionalTrader}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-200/60 text-slate-500">
                <span>APMC Mandi Wholesaler cut</span>
                <span className="font-semibold">+₹{traditionalWholesaler}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-200/60 text-slate-500">
                <span>City Retailer / Supermarket markup</span>
                <span className="font-semibold">+₹{traditionalRetailer}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 bg-white/50 -mx-5 -mb-5 p-5 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 font-semibold">Total Consumer Pays</div>
                <div className="text-2xl font-black text-slate-900">₹{traditionalTotalConsumerCost}/{unit}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-red-600 font-bold">Farmer gets only</div>
                <div className="text-sm font-black text-red-600">
                  {Math.round((traditionalFarmerShare / traditionalTotalConsumerCost) * 100)}% of total price
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FarmDirect Model */}
        <div className="rounded-2xl bg-brand-900 text-white p-5 flex flex-col justify-between relative overflow-hidden shadow-xl border border-brand-700">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-300 bg-brand-800/80 px-2.5 py-1 rounded-lg border border-brand-600/40">
                FarmDirect Direct Model
              </span>
              <span className="text-xs text-brand-200 font-medium">Direct Producer to Doorstep</span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-brand-800/80">
                <span className="text-brand-100 font-medium">Farmer receives (100% list price)</span>
                <span className="font-black text-brand-300 text-base">₹{farmDirectFarmerPayout}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-brand-800/80 text-brand-200">
                <span>Fair Platform & Logistics tech fee (5%)</span>
                <span className="font-semibold">+₹{farmDirectPlatformFee}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-brand-800/80 text-brand-300 font-medium">
                <span>Intermediaries & Middlemen cut</span>
                <span className="font-bold text-emerald-400">₹0 (Eliminated)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-brand-800 bg-brand-950/60 -mx-5 -mb-5 p-5 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-brand-300 font-semibold">Total You Pay</div>
                <div className="text-2xl font-black text-white">₹{farmDirectTotalConsumerCost}/{unit}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-brand-300 font-bold">Farmer gets directly</div>
                <div className="text-sm font-black text-brand-300">
                  {Math.round((farmDirectFarmerPayout / farmDirectTotalConsumerCost) * 100)}% of selling price
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Highlights */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3 bg-emerald-50 text-emerald-900 p-3.5 rounded-xl border border-emerald-100">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
            +{farmerEarningBoost}%
          </div>
          <div className="text-xs">
            <strong className="block text-sm text-emerald-950 font-bold">Higher Farmer Earnings</strong>
            Farmers earn {farmerEarningBoost}% more per harvest compared to traditional Mandi rates.
          </div>
        </div>

        <div className="flex items-center gap-3 bg-blue-50 text-blue-900 p-3.5 rounded-xl border border-blue-100">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
            -{consumerSavings}%
          </div>
          <div className="text-xs">
            <strong className="block text-sm text-blue-950 font-bold">Consumer Savings</strong>
            You save {consumerSavings}% on fresher, non-refrigerated produce delivered within 24 hours.
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Price comparisons are estimated based on prevailing Mandi market indices and platform transaction averages.</span>
      </div>
    </div>
  );
};
