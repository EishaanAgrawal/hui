import React, { useEffect, useState } from 'react';
import { orderApi } from '../../services/api';
import { Order } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi
      .getOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage message="Loading system-wide orders..." />;

  return (
    <DashboardLayout
      portalType="ADMIN"
      title="Platform Orders & Logistics"
      subtitle="Complete ledger of all customer orders, logistics tracking numbers, and settlement states."
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Order</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items Count</th>
                <th className="py-3.5 px-4">Gross Total</th>
                <th className="py-3.5 px-4">Platform Cut</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-6 font-bold text-slate-900">#{o.orderNumber}</td>
                  <td className="py-4 px-4 text-slate-700">
                    <p className="font-semibold">{o.customer?.name}</p>
                    <p className="text-[11px] text-slate-400">{o.customer?.phone || o.customer?.email}</p>
                  </td>
                  <td className="py-4 px-4 text-slate-600">{o.items.length} items</td>
                  <td className="py-4 px-4 font-black text-slate-900">₹{o.total}</td>
                  <td className="py-4 px-4 font-bold text-indigo-700">₹{o.platformFee}</td>
                  <td className="py-4 px-4">
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
                  <td className="py-4 px-4 text-right">
                    <Link
                      to={`/orders/${o.id}`}
                      className="text-xs font-bold text-brand-700 hover:underline inline-flex items-center gap-1"
                    >
                      Inspect <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
