import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Users,
  Tractor,
  Package,
  IndianRupee,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { adminApi } from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getDashboardStats()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage message="Aggregating platform metrics..." />;

  const summary = data?.summary || {};
  const salesTimeline = data?.salesTimeline || [];
  const categoryDistribution = data?.categoryDistribution || [];
  const recentOrders = data?.recentOrders || [];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  return (
    <DashboardLayout
      portalType="ADMIN"
      title="Platform Operations & GMV Oversight"
      subtitle="Live metrics on marketplace gross sales, 5% tech commission, order volume, and grower verification."
    >
      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Gross Merchandise Value</span>
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{summary.totalGMV || 0}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Total consumer spending
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-indigo-200 bg-indigo-50/40 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-indigo-400">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Platform Commission (5%)
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-950">
              ₹{summary.totalPlatformRevenue || 0}
            </div>
            <p className="text-[11px] text-indigo-800 font-semibold">
              Net platform software revenue
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Verified Farmers</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Tractor className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {summary.totalFarmers || 0}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Total Consumers: {summary.totalConsumers || 0}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {summary.totalOrders || 0}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Live Produce SKUs: {summary.totalProducts || 0}
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* GMV Timeline Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Platform GMV & Order Velocity</h3>
              <p className="text-xs text-slate-500">Daily gross transaction volume</p>
            </div>

            <div className="h-64 sm:h-72 w-full pt-4 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={salesTimeline}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(val: any) => [`₹${val}`, 'GMV']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '1rem',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="gmv" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Categories Pie Chart */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Produce Category Distribution</h3>
              <p className="text-xs text-slate-500">Active listed items by agricultural category</p>
            </div>

            <div className="h-56 w-full flex items-center justify-center min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {categoryDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              {categoryDistribution.slice(0, 6).map((c: any, idx: number) => (
                <span
                  key={c.name}
                  className="px-2 py-0.5 rounded-md flex items-center gap-1.5"
                  style={{ backgroundColor: `${COLORS[idx % COLORS.length]}15`, color: COLORS[idx % COLORS.length] }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {c.name} ({c.count})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders Overview */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Recent Platform Orders</h3>
            <span className="text-xs text-slate-500">Real-time marketplace transactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Order Number</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Fee (5%)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentOrders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-6 font-bold text-slate-900">#{o.orderNumber}</td>
                    <td className="py-3.5 px-4">{o.customer?.name}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900">₹{o.total}</td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-700">₹{o.platformFee}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          o.orderStatus === 'DELIVERED'
                            ? 'emerald'
                            : o.orderStatus === 'CANCELLED'
                            ? 'red'
                            : 'blue'
                        }
                        size="sm"
                      >
                        {o.orderStatus.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
