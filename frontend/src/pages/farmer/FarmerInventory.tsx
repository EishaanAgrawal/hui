import React, { useEffect, useState } from 'react';
import { farmerApi, productApi } from '../../services/api';
import { Product } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { Save, AlertTriangle } from 'lucide-react';

export const FarmerInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});

  const fetchProducts = async () => {
    try {
      const res = await farmerApi.getMyProducts();
      setProducts(res);
      const map: Record<string, number> = {};
      res.forEach((p) => {
        map[p.id] = p.availableQuantity;
      });
      setStockUpdates(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockChange = (id: string, val: string) => {
    const num = parseFloat(val) || 0;
    setStockUpdates((prev) => ({ ...prev, [id]: num }));
  };

  const handleSaveStock = async (id: string) => {
    setSavingId(id);
    try {
      await productApi.updateProduct(id, {
        availableQuantity: stockUpdates[id],
      });
      alert('Stock inventory updated successfully! 🌾');
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <Loader fullPage message="Loading inventory control..." />;

  return (
    <DashboardLayout
      portalType="FARMER"
      title="Rapid Inventory Control"
      subtitle="Quickly adjust daily harvest yields and mark items as in-stock or depleted."
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Produce Item</th>
                <th className="py-3.5 px-4">Direct Price</th>
                <th className="py-3.5 px-4">Available Quantity</th>
                <th className="py-3.5 px-4">Status Alert</th>
                <th className="py-3.5 px-4 text-right">Quick Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {products.map((p) => {
                const currentStock = stockUpdates[p.id] ?? p.availableQuantity;
                const isLow = currentStock <= 15;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100'}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <span className="font-bold text-slate-900">{p.name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-900">
                      ₹{p.price} / {p.unit}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 max-w-[140px]">
                        <input
                          type="number"
                          min="0"
                          value={currentStock}
                          onChange={(e) => handleStockChange(p.id, e.target.value)}
                          className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 text-center"
                        />
                        <span className="text-xs font-semibold text-slate-500">{p.unit}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg text-xs font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-bold">
                          Healthy Stock
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Button
                        size="sm"
                        variant="primary"
                        loading={savingId === p.id}
                        onClick={() => handleSaveStock(p.id)}
                        icon={<Save className="w-3.5 h-3.5" />}
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
