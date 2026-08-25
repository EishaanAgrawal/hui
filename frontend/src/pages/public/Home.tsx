import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Tractor,
  HeartHandshake,
  CheckCircle2,
  ChevronRight,
  Star,
} from 'lucide-react';
import { productApi, categoryApi, farmerApi } from '../../services/api';
import { Product, Category, FarmerProfile } from '../../types';
import { ProductCard } from '../../components/products/ProductCard';
import { PriceTransparencyWidget } from '../../components/common/PriceTransparencyWidget';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, catData, farmerData] = await Promise.all([
          productApi.getProducts({ limit: 8, sort: 'newest' }),
          categoryApi.getCategories(),
          farmerApi.getFarmers(),
        ]);
        setFeaturedProducts(prodData.products);
        setCategories(catData);
        setFarmers(farmerData.slice(0, 4));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Loader fullPage message="Harvesting direct farm offerings..." />;
  }

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-12 sm:pt-20 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1800"
            alt="Farm Sunrise"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto pt-20">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Direct From Certified Soil To Your Doorstep</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              Fresh harvest. <br />
              <span className="bg-gradient-to-r from-brand-400 via-emerald-300 to-amber-300 bg-clip-text text-transparent">
                Zero Middlemen.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal max-w-2xl">
              Connect directly with verified local growers. Farmers receive up to{' '}
              <strong className="text-white font-bold">90% of your payment</strong>, while you get
              pesticide-free seasonal produce picked at sunrise.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link to="/shop">
                <Button size="lg" variant="primary" icon={<ArrowRight className="w-5 h-5" />}>
                  Explore Today’s Harvest
                </Button>
              </Link>
              <Link to="/farmers">
                <Button size="lg" variant="outline" className="bg-slate-900/80 text-white border-slate-700 hover:bg-slate-800">
                  <Tractor className="w-5 h-5 text-brand-400" /> Meet The Farmers
                </Button>
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-lg">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-brand-400">100%</div>
                <div className="text-xs text-slate-400 font-medium">Price Transparent</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">&lt; 24h</div>
                <div className="text-xs text-slate-400 font-medium">Harvest to Door</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400">90%</div>
                <div className="text-xs text-slate-400 font-medium">Direct Farmer Share</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Price Transparency Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-24 relative z-20">
        <PriceTransparencyWidget
          productName="GI-Tagged Ratnagiri Alphonso Mangoes"
          farmPrice={650}
          unit="DOZEN"
        />
      </section>

      {/* 3. Browse Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
              Farm Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Browse Pure Agro Produce
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            All Produce <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group bg-white rounded-2xl border border-slate-200/80 p-3.5 text-center hover:border-brand-500 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-between"
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden mb-3 bg-slate-100 group-hover:scale-110 transition duration-300">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=200'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-brand-700 transition">
                {cat.name}
              </h3>
              <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {cat.productCount || 0} items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Fresh Harvests */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Direct From Soil
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Today’s Fresh Farm Harvests
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Harvested upon your order placement for peak crispness and nutrient integrity.
            </p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:flex text-sm font-bold text-brand-700 hover:text-brand-800 items-center gap-1"
          >
            View Marketplace <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link to="/shop">
            <Button variant="outline" className="w-full">
              View All Products
            </Button>
          </Link>
        </div>
      </section>

      {/* 5. Verified Farmers Showcase */}
      <section className="bg-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-7xl mx-auto overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-950 px-3 py-1 rounded-full border border-brand-800">
                Verified Producers
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
                Meet The Stewards of Clean Agriculture
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Every farm on FarmDirect undergoes strict soil health and zero-adulteration verification.
              </p>
            </div>
            <Link to="/farmers">
              <Button variant="primary" size="sm" icon={<Tractor className="w-4 h-4" />}>
                View All Verified Farms
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {farmers.map((farmer) => (
              <Link
                key={farmer.id}
                to={`/farmers/${farmer.id}`}
                className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-brand-500 rounded-3xl p-5 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <img
                      src={
                        farmer.avatar ||
                        farmer.user?.avatar ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
                      }
                      alt={farmer.farmName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-500"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white text-base group-hover:text-brand-400 transition truncate">
                        {farmer.farmName}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">{farmer.location}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {farmer.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-brand-300 font-semibold">{farmer.farmingType}</span>
                  <span className="flex items-center gap-1 font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {farmer.avgRating || 4.9}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. How It Works Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
            Transparent Logistics
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            How Direct Farm Dispatch Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            We replaced warehouse stockpiling with demand-driven sunrise harvesting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 font-black text-lg flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Select Farm & Produce</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Browse products listed directly by verified growers with transparent price breakdown.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 font-black text-lg flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Dawn Harvest</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Farmer receives notification and harvests your exact order quantity at sunrise.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 font-black text-lg flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Coldless Transit</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Express dispatch directly from farm gate to your city cluster without days of storage.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 font-black text-lg flex items-center justify-center mx-auto mb-4">
              4
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Direct Settlement</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Farmer receives 85-90% net sales deposited directly to their bank account.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="organic-gradient text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4 text-center md:text-left">
            <span className="bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-sm">
              Are You An Agricultural Producer?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              Sell Directly To Thousands of Consumers & Cafes
            </h2>
            <p className="text-brand-100 text-sm leading-relaxed">
              Eliminate mandi commissions, control your own produce pricing, and enjoy timely guaranteed payouts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link to="/register/farmer">
              <Button size="lg" className="bg-white text-brand-900 hover:bg-brand-50 shadow-xl font-black">
                🚜 Register Your Farm
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                Learn Benefits
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
