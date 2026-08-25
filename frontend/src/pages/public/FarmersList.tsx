import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tractor, MapPin, Star, ShieldCheck, ChevronRight, Search } from 'lucide-react';
import { farmerApi } from '../../services/api';
import { FarmerProfile } from '../../types';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';

export const FarmersList: React.FC = () => {
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true);
      try {
        const data = await farmerApi.getFarmers({ search });
        setFarmers(data);
      } catch (err) {
        console.error('Failed to load farmers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmers();
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-950 px-3 py-1 rounded-full border border-brand-800">
            Verified Soil Stewards
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Meet Our Direct Agricultural Partners
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Every farm listed on FarmDirect is audited for ethical soil cultivation, fair worker wages, and pesticide-free farming methods.
          </p>
        </div>

        <div className="w-full md:w-80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search farm name or region..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading verified farm partners..." />
      ) : farmers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <p className="text-slate-500 text-sm">No farm partners matched your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {farmers.map((farmer) => (
            <Link
              key={farmer.id}
              to={`/farmers/${farmer.id}`}
              className="group bg-white rounded-3xl border border-slate-200/80 hover:border-brand-500 overflow-hidden shadow-sm hover:shadow-xl transition duration-300 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        farmer.avatar ||
                        farmer.user?.avatar ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
                      }
                      alt={farmer.farmName}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-brand-500 group-hover:scale-105 transition"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-brand-700 transition">
                          {farmer.farmName}
                        </h3>
                        <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500">Lead Farmer: {farmer.user?.name || farmer.farmerName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-1 rounded-lg text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{farmer.avgRating || 4.9}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  <span>{farmer.location}</span>
                  <span>•</span>
                  <span>{farmer.farmSize || '20 Acres'}</span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-6">
                  {farmer.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
                  {farmer.farmingType || 'Natural Farming'}
                </span>
                <span className="text-xs font-bold text-slate-700 group-hover:text-brand-700 flex items-center gap-1">
                  View Harvest Catalog <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
