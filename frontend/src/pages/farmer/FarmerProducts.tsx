import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Sparkles, Layers, Image as ImageIcon } from 'lucide-react';
import { farmerApi, productApi, categoryApi } from '../../services/api';
import { Product, Category } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';

export const FarmerProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    description: '',
    price: '',
    estimatedMarketPrice: '',
    unit: 'KG',
    availableQuantity: '',
    minimumOrderQuantity: '1',
    organic: true,
    image: '',
    bulkPricingEnabled: false,
    bulkMinQty: '20',
    bulkPrice: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const [prods, catRes] = await Promise.all([
        farmerApi.getMyProducts(),
        categoryApi.getCategories(),
      ]);
      const validProds = Array.isArray(prods) ? prods : [];
      const validCats = Array.isArray(catRes) ? catRes : [];
      setProducts(validProds);
      setCategories(validCats);
    } catch (err) {
      console.error(err);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      categoryId: '',
      description: '',
      price: '',
      estimatedMarketPrice: '',
      unit: 'KG',
      availableQuantity: '100',
      minimumOrderQuantity: '1',
      organic: true,
      image: '',
      bulkPricingEnabled: false,
      bulkMinQty: '20',
      bulkPrice: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      categoryId: product.categoryId,
      description: product.description,
      price: product.price.toString(),
      estimatedMarketPrice: (product.estimatedMarketPrice || Math.round(product.price * 1.45)).toString(),
      unit: product.unit,
      availableQuantity: product.availableQuantity.toString(),
      minimumOrderQuantity: product.minimumOrderQuantity.toString(),
      organic: product.organic,
      image: product.image || '',
      bulkPricingEnabled: !!product.bulkPricing,
      bulkMinQty: product.bulkPricing ? (product.bulkPricing as any)[0]?.minQty.toString() : '20',
      bulkPrice: product.bulkPricing ? (product.bulkPricing as any)[0]?.price.toString() : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const productData = {
        name: form.name,
        categoryId: form.categoryId,
        description: form.description,
        price: parseFloat(form.price),
        estimatedMarketPrice: form.estimatedMarketPrice ? parseFloat(form.estimatedMarketPrice) : null,
        unit: form.unit,
        availableQuantity: parseFloat(form.availableQuantity),
        minimumOrderQuantity: parseFloat(form.minimumOrderQuantity),
        organic: form.organic,
        image: form.image,
        bulkPricing: form.bulkPricingEnabled && form.bulkPrice ? [{ minQty: parseFloat(form.bulkMinQty), maxQty: null, price: parseFloat(form.bulkPrice) }] : null
      };

      if (editingProduct) {
        await productApi.updateProduct(editingProduct.id, productData);
      } else {
        await productApi.createProduct(productData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product from the marketplace?')) return;
    try {
      await productApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) return <Loader fullPage message="Loading your farm inventory..." />;

  return (
    <DashboardLayout
      portalType="FARMER"
      title="Produce Catalog & Inventory"
      subtitle="Publish new harvests, adjust direct prices, and manage available harvest stock."
      actionButton={
        <Button onClick={handleOpenAddModal} variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
          Add Produce
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Produce</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Direct Farm Price</th>
                  <th className="py-3.5 px-4">Available Stock</th>
                  <th className="py-3.5 px-4">Organic</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p.image ||
                            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100'
                          }
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <span className="text-[11px] text-slate-400">Min Order: {p.minimumOrderQuantity} {p.unit}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs font-semibold text-slate-600">
                      {p.category?.name || 'General'}
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-black text-brand-800 text-sm">₹{p.price}</span>
                      <span className="text-xs text-slate-400">/{p.unit}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-lg text-xs ${
                          p.availableQuantity > 20
                            ? 'bg-emerald-50 text-emerald-800'
                            : p.availableQuantity > 0
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-red-50 text-red-800'
                        }`}
                      >
                        {p.availableQuantity} {p.unit}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {p.organic ? (
                        <Badge variant="organic" size="sm">
                          <Sparkles className="w-3 h-3" /> Organic
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-xs">Standard</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-brand-700 transition"
                          title="Edit Produce"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete Produce"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit ${editingProduct.name}` : 'List New Farm Harvest Produce'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Produce Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Heirloom Vine Tomatoes"
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Category
              </label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="" disabled>Select a Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Direct Farm Price (₹)"
              type="number"
              required
              min="1"
              step="any"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="e.g. 40"
            />
            <Input
              label="Estimated Market Price (₹)"
              type="number"
              min="1"
              step="any"
              value={form.estimatedMarketPrice}
              onChange={(e) => setForm({ ...form, estimatedMarketPrice: e.target.value })}
              placeholder="e.g. 65"
              helperText="For consumer savings comparison"
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Unit of Sale
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="KG">KG (Kilogram)</option>
                <option value="GRAM">GRAM</option>
                <option value="LITRE">LITRE</option>
                <option value="PIECE">PIECE</option>
                <option value="DOZEN">DOZEN</option>
                <option value="QUINTAL">QUINTAL</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Available Harvest Stock"
              type="number"
              required
              min="0"
              value={form.availableQuantity}
              onChange={(e) => setForm({ ...form, availableQuantity: e.target.value })}
              placeholder="e.g. 250"
            />
            <Input
              label="Image URL (Unsplash/Direct)"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Produce Description & Harvesting Method
            </label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe aroma, soil conditions, shelf life..."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.organic}
              onChange={(e) => setForm({ ...form, organic: e.target.checked })}
              className="rounded text-brand-600 focus:ring-brand-500 accent-brand-600"
            />
            <span>100% Certified Organic / Chemical-free produce</span>
          </label>

          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={form.bulkPricingEnabled}
                onChange={(e) => setForm({ ...form, bulkPricingEnabled: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="font-bold text-slate-900 block text-sm">Enable Bulk/B2B Pricing</span>
                <span className="text-xs text-slate-500 block">Offer a discount for large quantity orders.</span>
              </div>
            </label>

            {form.bulkPricingEnabled && (
              <div className="mt-4 grid grid-cols-2 gap-4 bg-brand-50 p-4 rounded-xl border border-brand-100">
                <div>
                  <label className="block text-xs font-bold text-brand-900 mb-1">
                    Minimum Qty ({form.unit})
                  </label>
                  <input
                    type="number"
                    required={form.bulkPricingEnabled}
                    min="2"
                    value={form.bulkMinQty}
                    onChange={(e) => setForm({ ...form, bulkMinQty: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-brand-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-900 mb-1">
                    Bulk Price (₹ per {form.unit})
                  </label>
                  <input
                    type="number"
                    required={form.bulkPricingEnabled}
                    min="1"
                    value={form.bulkPrice}
                    onChange={(e) => setForm({ ...form, bulkPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-brand-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingProduct ? 'Update Produce' : 'List on Marketplace'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
