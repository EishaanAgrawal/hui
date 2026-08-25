import React, { useEffect, useState } from 'react';
import { IndianRupee, ShieldCheck, Download, ArrowUpRight } from 'lucide-react';
import { farmerApi } from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';

export const FarmerEarnings: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    farmerApi
      .getEarnings()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage message="Fetching payout ledger..." />;

  const summary = data?.summary || {};
  const payouts = data?.payouts || [];

  return (
    <DashboardLayout
      portalType="FARMER"
      title="Earnings & Payout Ledger"
      subtitle="Complete accounting transparency: gross produce sales, platform 5% fee deduction, and net settled payouts."
    >
      <div className="space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Gross Sales
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{summary.grossAmount || 0}
            </div>
            <p className="text-[11px] text-slate-500">Value of produce ordered</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Platform & Tech Fee (5%)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-600">
              -₹{summary.platformFee || 0}
            </div>
            <p className="text-[11px] text-slate-500">Quality verification & escrow</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-emerald-200 bg-emerald-50/40 shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Total Net Farmer Earnings
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950">
              ₹{summary.netAmount || 0}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Guaranteed Settlement
            </p>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Transaction Payout History</h3>
            <span className="text-xs text-slate-500">{payouts.length} transactions recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Order Reference</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Gross Item Sales</th>
                  <th className="py-3.5 px-4">Platform Fee (5%)</th>
                  <th className="py-3.5 px-4">Net Payout</th>
                  <th className="py-3.5 px-4 text-right">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No payout records yet.
                    </td>
                  </tr>
                ) : (
                  payouts.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        #{p.order?.orderNumber || 'FD-ORDER'}
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900">₹{p.amount}</td>
                      <td className="py-4 px-4 text-red-600">-₹{p.platformFee}</td>
                      <td className="py-4 px-4 font-black text-emerald-700 text-sm">
                        ₹{p.netAmount}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Badge variant="emerald" size="sm">
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
