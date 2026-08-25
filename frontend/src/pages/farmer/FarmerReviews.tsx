import React, { useEffect, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { farmerApi } from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/Loader';

export const FarmerReviews: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    farmerApi
      .getDashboardStats()
      .then((res) => {
        // Backend returns stats with reviews
        setReviews(res.farmer?.reviews || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage message="Loading feedback and ratings..." />;

  return (
    <DashboardLayout
      portalType="FARMER"
      title="Customer Reviews & Soil Reputation"
      subtitle="Direct feedback and quality ratings from consumers and chefs who tasted your produce."
    >
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 text-sm">No reviews received yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reviews.map((rev: any) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {rev.user?.name || 'Verified Consumer'}
                  </span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                <span className="text-[11px] text-slate-400 block pt-2 border-t border-slate-100">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
