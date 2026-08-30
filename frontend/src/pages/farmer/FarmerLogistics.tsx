import React, { useEffect, useState } from 'react';
import { logisticsApi } from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Truck, Map, Layers, CheckCircle2 } from 'lucide-react';

export const FarmerLogistics: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, insightsRes] = await Promise.all([
        logisticsApi.getReadyOrders(),
        logisticsApi.getInsights()
      ]);
      setOrders(ordersRes);
      setInsights(insightsRes.insights || []);

      if (ordersRes.length > 0) {
        const orderIds = ordersRes.map((o: any) => o.id);
        const clustersRes = await logisticsApi.suggestClusters(orderIds);
        setClusters(clustersRes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (clusterName: string, clusterOrders: any[]) => {
    try {
      const orderIds = clusterOrders.map(o => o.id);
      
      // Calculate total load for the batch
      let totalLoad = 0;
      clusterOrders.forEach(o => {
        o.items.forEach((item: any) => {
          totalLoad += item.quantity;
        });
      });

      await logisticsApi.createBatch({
        orderIds,
        clusterName,
        totalLoadKg: totalLoad,
        vehicleId: undefined // In a full implementation, you'd select from a dropdown of `vehicles`
      });

      alert('Delivery Batch created successfully! Sent to Route Optimizer.');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to create delivery batch');
    }
  };

  return (
    <DashboardLayout
      portalType="FARMER"
      title="Smart Logistics & Batching"
      subtitle="AI-powered geographic clustering and vehicle capacity planning."
    >
      <div className="space-y-6">
        
        {/* Dynamic AI Insights */}
        {insights.length > 0 && (
          <div className="bg-brand-900 rounded-3xl p-6 text-white flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-800 flex items-center justify-center flex-shrink-0">
              <Layers className="w-6 h-6 text-brand-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">AI Logistics Insights</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-brand-100">
                {insights.map((insight, idx) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ready Orders */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Ready Orders
              </h2>
              <Badge variant="blue">{orders.length}</Badge>
            </div>
            
            {loading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-slate-500">No unbatched orders ready for delivery.</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm">
                    <p className="font-bold text-slate-900">Order #{order.orderNumber}</p>
                    <p className="text-slate-600 truncate">To: {order.customer?.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)} KG Total
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Clusters */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Map className="w-5 h-5 text-brand-500" /> AI Suggested Delivery Clusters
            </h2>

            {clusters.length === 0 && !loading && (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500">
                Generate clusters by preparing orders for delivery.
              </div>
            )}

            {clusters.map((cluster, idx) => {
              const totalKg = cluster.orders.reduce((acc: number, o: any) => {
                return acc + o.items.reduce((acc2: number, item: any) => acc2 + item.quantity, 0);
              }, 0);

              return (
                <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{cluster.name}</h3>
                      <p className="text-sm text-slate-500">{cluster.totalOrders} Orders • Approx {totalKg} KG Total Load</p>
                    </div>
                    <Button variant="primary" onClick={() => handleCreateBatch(cluster.name, cluster.orders)}>
                      <Truck className="w-4 h-4 mr-2" /> Dispatch as Batch
                    </Button>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {cluster.orders.map((o: any) => (
                      <Badge key={o.id} variant="slate" size="sm">#{o.orderNumber}</Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
