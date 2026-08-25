import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi, categoryApi } from '../../services/api';
import { Product, Category } from '../../types';
import { ProductCard } from '../../components/products/ProductCard';
import { ProductFilters } from '../../components/products/ProductFilters';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  // Filter States
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const organicParam = searchParams.get('organic') === 'true';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    categoryApi.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productApi.getProducts({
          category: categoryParam,
          search: searchParam,
          organic: organicParam ? 'true' : '',
          sort: sortParam,
          page: pageParam,
          limit: 12,
        });
        setProducts(data?.products || []);
        setPagination(data?.pagination || { total: 0, page: 1, totalPages: 1 });
      } catch (err) {
        console.error('Failed to load products:', err);
        setProducts([]);
        setPagination({ total: 0, page: 1, totalPages: 1 });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryParam, searchParam, organicParam, sortParam, pageParam]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Banner */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 mb-10 overflow-hidden relative shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-300 bg-brand-900/60 px-3 py-1 rounded-full border border-brand-700/50">
            Agricultural Marketplace
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white mt-2 mb-3">
            Fresh Produce & Farm Supplies
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            All prices listed here are set directly by the farmers. Zero middlemen markups, 100% price transparency.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Filters Sidebar */}
        <div className="lg:col-span-1">
          <ProductFilters
            categories={categories}
            selectedCategory={categoryParam}
            onSelectCategory={(slug) => updateParam('category', slug)}
            searchQuery={searchParam}
            onSearchChange={(q) => updateParam('search', q)}
            isOrganicOnly={organicParam}
            onToggleOrganic={() => updateParam('organic', organicParam ? '' : 'true')}
            sortBy={sortParam}
            onSortChange={(s) => updateParam('sort', s)}
            priceRange={[0, 1000]}
            onPriceChange={() => {}}
            onReset={handleResetFilters}
          />
        </div>

        {/* Right Products Catalog */}
        <div className="lg:col-span-3">
          {loading ? (
            <Loader message="Loading fresh farm produce..." />
          ) : products.length === 0 ? (
            <EmptyState
              title="No produce found"
              description="No agricultural items match your selected filters. Try changing category or search terms."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Showing {products.length} of {pagination.total} produce items</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8 border-t border-slate-100">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => updateParam('page', pg.toString())}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition ${
                        pg === pagination.page
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
