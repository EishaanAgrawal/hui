import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Tractor,
  Sparkles,
  TrendingDown,
  Clock,
  Award,
  ChevronRight,
  HeartHandshake,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { productApi, categoryApi, farmerApi } from '../../services/api';
import { Product, Category, FarmerProfile } from '../../types';
import { ProductCard } from '../../components/products/ProductCard';
import { PriceTransparencyWidget } from '../../components/common/PriceTransparencyWidget';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { FloatingCartBar } from '../../components/common/FloatingCartBar';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [prodRes, catRes, farmRes] = await Promise.all([
          productApi.getProducts({ limit: 8, sort: 'newest' }),
          categoryApi.getCategories(),
          farmerApi.getFarmers(),
        ]);
        setFeaturedProducts(Array.isArray(prodRes?.products) ? prodRes.products : []);
        setCategories(Array.isArray(catRes) ? catRes : []);
        setFarmers(Array.isArray(farmRes) ? farmRes.slice(0, 4) : []);
      } catch (err) {
        console.error('Home page data load error:', err);
        setFeaturedProducts([]);
        setCategories([]);
        setFarmers([]);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  if (loading) {
    return <Loader fullPage message="Harvesting direct farm listings..." />;
  }

  return (
    <div className="space-y-16 pb-12">
      {/* Floating Bottom Cart Bar (Blinkit style) */}
      <FloatingCartBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-10 pb-20 sm:py-24">
        {/* Background glow ambient circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-900/60 border border-brand-500/30 text-brand-300 text-xs font-bold shadow-glow">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
                <span>Zero Middlemen • 100% Direct to Grower</span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Farm-Fresh Produce,{' '}
                <span className="bg-gradient-to-r from-brand-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  Harvested Today.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Connect directly with verified Indian growers. No cold-storage ripening, no 5-tier intermediary markups — just pure, nutritious harvest delivered to your doorstep within 24 hours.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/shop" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="primary"
                    className="w-full font-black text-sm shadow-xl shadow-brand-500/30 ring-2 ring-brand-400/40"
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Shop Sunrise Harvests
                  </Button>
                </Link>
                <Link to="/how-it-works" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full text-white border-slate-700 hover:bg-slate-900 font-bold text-sm"
                  >
                    Compare Mandi Prices
                  </Button>
                </Link>
              </div>

              {/* Trust Value Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800 text-center lg:text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-brand-400 font-display">85-90%</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Farmer Earning Share</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">&lt; 24h</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Harvest-to-Door Delivery</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-amber-400 font-display">100%</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Price Transparency</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl backdrop-blur-md space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌱</span>
                    <div>
                      <h4 className="text-sm font-black text-white">Live Morning Harvest</h4>
                      <p className="text-[11px] text-brand-400 font-bold">Dispatched from Nashik Valley</p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 font-black text-[10px] px-2.5 py-1 rounded-full">
                    Active Batch
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=150"
                        alt="Heirloom Tomatoes"
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">Organic Vine Tomatoes</p>
                        <p className="text-[11px] text-slate-400">Green Valley Organics</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-brand-400">₹38/KG</span>
                      <span className="block text-[10px] text-slate-400 line-through">₹65 Mandi</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=150"
                        alt="Alphonso Mango"
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">GI Ratnagiri Alphonso</p>
                        <p className="text-[11px] text-slate-400">Kokana Heritage Orchard</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-brand-400">₹650/Doz</span>
                      <span className="block text-[10px] text-slate-400 line-through">₹950 Retail</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-brand-950/70 border border-brand-800/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-brand-300 font-bold">
                    <span>🌾 Farmer Earning</span>
                    <span className="text-white font-black text-sm">88.5% of total</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full w-[88.5%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Icons Carousel Strip (Blinkit Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
              Explore Farm Harvest Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Directly sourced from certified growers across regions.
            </p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            All Categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-brand-500 transition duration-300 text-center flex flex-col items-center justify-center space-y-2 hover:-translate-y-1"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-100 p-1">
                <img
                  src={
                    cat.image ||
                    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=200'
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition duration-300"
                />
              </div>
              <span className="font-display font-bold text-xs text-slate-800 group-hover:text-brand-700 transition line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Today's Fresh Harvest Deals Grid (Blinkit style with interactive ADD buttons) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
                Fresh Sunrise Harvests
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Picked this morning from local orchards & fields.
              </p>
            </div>
          </div>

          <Link
            to="/shop"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-black text-brand-700 hover:text-brand-800"
          >
            Browse All {featuredProducts.length}+ Produce <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Middlemen Elimination Live Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PriceTransparencyWidget />
      </section>

      {/* Verified Farmers Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
              Meet Our Verified Producers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              100% Traceable. Know the exact family and farm growing your food.
            </p>
          </div>

          <Link
            to="/farmers"
            className="text-xs font-black text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            View All Farmers <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {farmers.map((farmer) => (
            <Link
              key={farmer.id}
              to={`/farmers/${farmer.id}`}
              className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between space-y-4 hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    farmer.avatar ||
                    farmer.user?.avatar ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
                  }
                  alt={farmer.farmName}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-brand-500 shadow-sm"
                />
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-sm group-hover:text-brand-700 transition">
                    {farmer.farmName}
                  </h3>
                  <p className="text-xs text-slate-500">{farmer.location}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Farm
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {farmer.description || 'Specializing in natural, pesticide-free cultivation practices.'}
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="text-brand-800">{farmer.farmingType || 'Organic'}</span>
                <span className="text-brand-700 group-hover:underline">Visit Farm →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3 Steps Pipeline (Amazon Fresh / Blinkit style) */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-950 px-3 py-1 rounded-full border border-brand-800">
              FarmDirect Quality Standard
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white">
              From Soil to Table in 4 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-800/60 rounded-3xl p-8 border border-slate-700/60 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-600/30 text-brand-400 flex items-center justify-center text-xl font-bold font-display">
                1
              </div>
              <h3 className="font-display text-lg font-bold text-white">You Order from Named Farms</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose heirloom tomatoes, mangoes, or cold-pressed oils from verified growers with full price transparency.
              </p>
            </div>

            <div className="bg-slate-800/60 rounded-3xl p-8 border border-slate-700/60 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-600/30 text-brand-400 flex items-center justify-center text-xl font-bold font-display">
                2
              </div>
              <h3 className="font-display text-lg font-bold text-white">Harvested at Morning Sunrise</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Produce is never held in chemical storage for weeks. Farmers harvest specifically to fulfill your basket.
              </p>
            </div>

            <div className="bg-slate-800/60 rounded-3xl p-8 border border-slate-700/60 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-600/30 text-brand-400 flex items-center justify-center text-xl font-bold font-display">
                3
              </div>
              <h3 className="font-display text-lg font-bold text-white">Direct 24-Hour Delivery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Express farm logistics brings nutrient-dense food to your doorstep while 85–90% goes directly to the grower.
              </p>
            </div>

            <div className="bg-slate-800/60 rounded-3xl p-8 border border-slate-700/60 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-600/30 text-brand-400 flex items-center justify-center text-xl font-bold font-display">
                4
              </div>
              <h3 className="font-display text-lg font-bold text-white">AI-Powered Logistics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uses AI for demand forecasting and route optimization to minimize waste and ensure the freshest delivery.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
