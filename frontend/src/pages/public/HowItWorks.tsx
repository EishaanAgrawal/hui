import React from 'react';
import { PriceTransparencyWidget } from '../../components/common/PriceTransparencyWidget';

export const HowItWorks: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
          Supply Chain Mechanics
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
          How FarmDirect Eliminates Middlemen
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Traditional agricultural supply chains pass farm produce through 4-5 layers of intermediaries before reaching the consumer table. Here is how FarmDirect's direct model re-engineers that pipeline.
        </p>
      </div>

      <PriceTransparencyWidget productName="Organic Sharbati Wheat Flour" farmPrice={45} unit="KG" />

      {/* Comparison Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-900">Side-by-Side Operational Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Dimension</th>
                <th className="py-3 px-4 text-red-600">Traditional Mandi Supply Chain</th>
                <th className="py-3 px-4 text-brand-700">FarmDirect Platform Model</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3.5 px-4 font-bold">Intermediaries</td>
                <td className="py-3.5 px-4 text-slate-500">4 to 6 (Trader, Commission Agent, Mandi Wholesaler, Semi-wholesaler, Retailer)</td>
                <td className="py-3.5 px-4 font-semibold text-brand-800">Zero (Direct Farm to Consumer Dispatch)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold">Farmer Earning Share</td>
                <td className="py-3.5 px-4 text-slate-500">25% – 38% of final consumer price</td>
                <td className="py-3.5 px-4 font-semibold text-brand-800">85% – 90% of listed produce value</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold">Harvest to Plate Time</td>
                <td className="py-3.5 px-4 text-slate-500">4 to 8 days with artificial chemical ripening</td>
                <td className="py-3.5 px-4 font-semibold text-brand-800">Under 24 hours from sunrise harvest</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold">Traceability</td>
                <td className="py-3.5 px-4 text-slate-500">Commingled batch; origin unknown</td>
                <td className="py-3.5 px-4 font-semibold text-brand-800">100% Traceable to named verified farm</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold">Farmer Payout Settlement</td>
                <td className="py-3.5 px-4 text-slate-500">15–45 days delayed, high commission deduction</td>
                <td className="py-3.5 px-4 font-semibold text-brand-800">Guaranteed within 24h of fulfillment</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
