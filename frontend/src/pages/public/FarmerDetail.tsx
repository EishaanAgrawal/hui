import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Tractor,
  MapPin,
  Star,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { farmerApi } from '../../services/api';
import { FarmerProfile } from '../../types';
import { Loader } from '../../components/common/Loader';
import { ProductCard } from '../../components/products/ProductCard';

export const FarmerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchFarmer = async () => {
      setLoading(true);
      try {
        const data = await farmerApi.getFarmerById(id);
        setFarmer(data);
      } catch (err) {
        console.error('Failed to load farmer:', err);
        setFarmer(null);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmer();
  }, [id]);

  if (loading) return <Loader fullPage message="Visiting farm profile..." />;
  if (!farmer) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Farmer not found</h2>
        <Link to="/farmers" className="text-brand-600 font-bold mt-4 inline-block">
          ← Return to Farmers Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link to="/" className="hover:text-slate-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/farmers" className="hover:text-slate-600">Verified Farmers</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700">{farmer.farmName}</span>
      </nav>

      {/* Hero Farm Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <img
              src={
                farmer.avatar ||
                farmer.user?.avatar ||
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
              }
              alt={farmer.farmName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-brand-500 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{farmer.farmName}</h1>
                <ShieldCheck className="w-6 h-6 text-brand-400" />
              </div>
              <p className="text-sm text-slate-300 font-medium mt-0.5">
                Head Grower: {farmer.user?.name}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" /> {farmer.location}
                </span>
                <span>•</span>
                <span className="text-brand-300 font-semibold">{farmer.farmingType}</span>
                <span>•</span>
                <span>{farmer.farmSize}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {farmer.avgRating || 4.9} ({farmer.totalReviews || 0} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 max-w-3xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2">Our Soil Story</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{farmer.description}</p>
        </div>
      </div>

      {/* Listed Products Catalog */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Live Harvest Offerings ({farmer.products?.length || 0})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Order fresh produce directly from {farmer.farmName}.
            </p>
          </div>
        </div>

        {!farmer.products || farmer.products.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
            <p className="text-sm text-slate-500">This farm currently has no active products listed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {farmer.products.map((product) => (
              <ProductCard key={product.id} product={{ ...product, farmer }} />
            ))}
          </div>
        )}
      </section>

      {/* Reviews on this farm */}
      {farmer.reviews && farmer.reviews.length > 0 && (
        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Customer Feedback for {farmer.farmName}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {farmer.reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{rev.user?.name || 'Customer'}</span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                {rev.product && (
                  <span className="text-[10px] text-brand-700 font-semibold block">
                    Product: {rev.product.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
