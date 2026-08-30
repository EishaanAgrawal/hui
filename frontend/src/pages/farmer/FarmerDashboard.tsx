import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  Package,
  Layers,
  Star,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { farmerApi, orderApi } from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const FarmerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await farmerApi.getDashboardStats();
      setData(res);
    } catch (err) {
      console.error('Failed to load farmer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <Loader fullPage message="Harvesting farmer analytics..." />;

  const stats = data?.stats || {};
  const chartData = data?.chartData || [];
  const topProducts = data?.topProducts || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <DashboardLayout
      portalType="FARMER"
      title={`Welcome Back, ${data?.farmer?.farmName || 'Farmer'} 🌾`}
      subtitle="Track your daily harvest revenue, manage stock, and fulfill customer orders directly."
      actionButton={
        <Link to="/farmer/products">
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
            Add New Harvest
          </Button>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Today's Net Sales</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{stats.todaySales || 0}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Direct to your escrow account
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Net Earnings</span>
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{stats.totalNetEarnings || 0}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Gross: ₹{stats.totalGrossSales || 0} (Fee: ₹{stats.totalPlatformFee || 0})
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Orders</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.pendingOrdersCount || 0}
            </div>
            <Link to="/farmer/orders" className="text-[11px] text-amber-700 font-semibold hover:underline block">
              Fulfill incoming produce →
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Average Farm Rating</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.avgRating || 4.9} / 5.0
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Based on {stats.reviewsCount || 0} verified customer reviews
            </p>
          </div>
        </div>

        {/* AI Insights Card */}
        <div className="bg-gradient-to-r from-brand-900 to-emerald-900 rounded-3xl p-6 border border-brand-800 shadow-md text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <TrendingUp className="w-6 h-6 text-brand-300" />
            </div>
            <div>
              <h3 className="text-lg font-black font-display">AI Demand Forecast</h3>
              <p className="text-xs text-brand-200 mt-0.5">
                Predicted Demand: <span className="text-white font-bold">↑ 18%</span> • Trending: <span className="text-white font-bold">Top Products</span>
              </p>
            </div>
          </div>
          <Link to="/farmer/forecast">
            <Button variant="outline" className="border-brand-500 text-brand-50 hover:bg-brand-800 w-full sm:w-auto text-xs font-bold shadow-glow">
              View Forecast
            </Button>
          </Link>
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">7-Day Net Earnings Trend</h3>
              <p className="text-xs text-slate-500">Daily earnings after 5% platform commission</p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-4 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val: any) => [`₹${val}`, 'Net Earnings']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '1rem',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products & Recent Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Top Selling Produce */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Top-Selling Farm Produce</h3>
              <Link to="/farmer/products" className="text-xs font-bold text-brand-700 hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {topProducts.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No sales data yet.</p>
              ) : (
                topProducts.map((p: any) => (
                  <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100'}
                        alt={p.name}
                        className="w-11 h-11 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{p.name}</h4>
                        <p className="text-[11px] text-slate-500">₹{p.price} / {p.unit}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <span className="font-bold text-slate-900">{p.totalSold} sold</span>
                      <span className="block text-[11px] text-slate-400">
                        {p.availableQuantity} {p.unit} in stock
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Incoming Orders to Fulfill */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
              <Link to="/farmer/orders" className="text-xs font-bold text-brand-700 hover:underline">
                Manage All Orders
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No orders received yet.</p>
              ) : (
                recentOrders.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        #{item.order?.orderNumber} • {item.productName}
                      </span>
                      <span className="text-slate-500">
                        Customer: {item.order?.customer?.name} ({item.quantity} {item.unit})
                      </span>
                    </div>

                    <Badge
                      variant={
                        item.order?.orderStatus === 'DELIVERED'
                          ? 'emerald'
                          : item.order?.orderStatus === 'CANCELLED'
                          ? 'red'
                          : 'blue'
                      }
                      size="sm"
                    >
                      {item.order?.orderStatus?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
