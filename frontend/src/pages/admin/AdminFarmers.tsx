import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { FarmerProfile } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Check, X, ShieldAlert, Tractor, MapPin } from 'lucide-react';

export const AdminFarmers: React.FC = () => {
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchFarmers = async () => {
    try {
      const data = await adminApi.getFarmers();
      setFarmers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setFarmers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await adminApi.updateFarmerStatus(id, status);
      fetchFarmers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loader fullPage message="Loading farmer verification queue..." />;

  return (
    <DashboardLayout
      portalType="ADMIN"
      title="Farmer Verification & Compliance"
      subtitle="Audit farm registration applications, verify soil certifications, and manage producer status."
    >
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Farm & Grower</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Farming Practice</th>
                  <th className="py-3.5 px-4">Farm Size</th>
                  <th className="py-3.5 px-4">Verification Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {farmers.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            farmer.avatar ||
                            farmer.user?.avatar ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100'
                          }
                          alt={farmer.farmName}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{farmer.farmName}</p>
                          <span className="text-[11px] text-slate-400">
                            {farmer.user?.name} ({farmer.user?.email})
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-xs text-slate-600">{farmer.location}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold text-brand-800 bg-brand-50 px-2 py-0.5 rounded-lg">
                        {farmer.farmingType || 'Organic'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-600 font-medium">
                      {farmer.farmSize || 'N/A'}
                    </td>

                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          farmer.verificationStatus === 'VERIFIED'
                            ? 'emerald'
                            : farmer.verificationStatus === 'PENDING'
                            ? 'amber'
                            : 'red'
                        }
                        size="sm"
                      >
                        {farmer.verificationStatus}
                      </Badge>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {farmer.verificationStatus !== 'VERIFIED' && (
                          <Button
                            size="sm"
                            variant="primary"
                            loading={updatingId === farmer.id}
                            onClick={() => handleUpdateStatus(farmer.id, 'VERIFIED')}
                            icon={<Check className="w-3.5 h-3.5" />}
                          >
                            Approve
                          </Button>
                        )}

                        {farmer.verificationStatus !== 'SUSPENDED' && (
                          <Button
                            size="sm"
                            variant="danger"
                            loading={updatingId === farmer.id}
                            onClick={() => handleUpdateStatus(farmer.id, 'SUSPENDED')}
                            icon={<X className="w-3.5 h-3.5" />}
                          >
                            Suspend
                          </Button>
                        )}
                      </div>
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
