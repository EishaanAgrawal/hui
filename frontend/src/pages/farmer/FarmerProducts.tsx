import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Sparkles, Layers, Image as ImageIcon } from 'lucide-react';
import { farmerApi, productApi, categoryApi, uploadApi } from '../../services/api';
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
    freshMarketEnabled: true,
    bulkPricingEnabled: false,
    bulkMinimumQuantity: '',
    bulkPrice: '',
  });
  const [saving, setSaving] = useState(false);

  // Image Upload State
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');

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
      freshMarketEnabled: true,
      bulkPricingEnabled: false,
      bulkMinimumQuantity: '',
      bulkPrice: '',
    });
    setImageTab('upload');
    setImageFile(null);
    setImagePreview('');
    setImageError('');
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
      freshMarketEnabled: product.freshMarketEnabled ?? true,
      bulkPricingEnabled: product.bulkPricingEnabled || false,
      bulkMinimumQuantity: product.bulkMinimumQuantity ? product.bulkMinimumQuantity.toString() : '',
      bulkPrice: product.bulkPrice ? product.bulkPrice.toString() : '',
    });
    setImageTab(product.image ? 'url' : 'upload');
    setImageFile(null);
    setImagePreview(product.image || '');
    setImageError('');
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
        freshMarketEnabled: form.freshMarketEnabled,
        bulkPricingEnabled: form.bulkPricingEnabled,
        bulkMinimumQuantity: form.bulkMinimumQuantity ? parseFloat(form.bulkMinimumQuantity) : undefined,
        bulkPrice: form.bulkPrice ? parseFloat(form.bulkPrice) : undefined,
      };

      if (!form.freshMarketEnabled && !form.bulkPricingEnabled) {
        alert('You must enable at least one marketplace (Fresh Market or Bulk Deals).');
        setSaving(false);
        return;
      }

      if (imageError) {
        alert('Please provide a valid image.');
        setSaving(false);
        return;
      }

      if (imageTab === 'upload' && imagePreview && imagePreview.startsWith('data:image')) {
        try {
          const uploadedUrl = await uploadApi.uploadImage(imagePreview);
          productData.image = uploadedUrl;
        } catch (err: any) {
          alert('Failed to upload image. Please try again.');
          setSaving(false);
          return;
        }
      }

      if (form.bulkPricingEnabled && parseFloat(form.bulkPrice) >= parseFloat(form.price)) {
        alert('Bulk price should normally be lower than the regular consumer price.');
        setSaving(false);
        return;
      }

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setImageError('');
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setForm({ ...form, image: url });
    if (!url) {
      setImagePreview('');
      setImageError('');
      return;
    }
    
    // Validate image URL by preloading
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImagePreview(url);
      setImageError('');
    };
    img.onerror = () => {
      setImageError('Unable to load this image. Please use:\n• A direct image URL\n• An Unsplash image URL\n• Or upload an image from your device');
      setImagePreview('');
    };
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
                          onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/f8fafc/94a3b8?text=Image+Unavailable'; }}
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
                      <div className="flex flex-col gap-1">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-lg text-xs w-max ${
                            p.availableQuantity > 20
                              ? 'bg-emerald-50 text-emerald-800'
                              : p.availableQuantity > 0
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-red-50 text-red-800'
                          }`}
                        >
                          Stock: {p.availableQuantity} {p.unit}
                        </span>
                        {p.reservedQuantity ? (
                          <span className="text-[10px] text-amber-600 font-bold">
                            Reserved: {p.reservedQuantity} {p.unit}
                          </span>
                        ) : null}
                      </div>
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
          </div>

          {/* Image Upload/URL Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3">
              Produce Image
            </label>
            
            <div className="flex bg-white rounded-lg p-1 border border-slate-200 mb-4 w-max">
              <button
                type="button"
                onClick={() => setImageTab('upload')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${imageTab === 'upload' ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Upload Image
              </button>
              <button
                type="button"
                onClick={() => setImageTab('url')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${imageTab === 'url' ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Use Image URL
              </button>
            </div>

            {imageTab === 'upload' ? (
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition"
                />
              </div>
            ) : (
              <div className="mb-4">
                <Input
                  label=""
                  value={form.image}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/image.jpg"
                  helperText="Paste a direct image link. Google search/page URLs cannot be used as product image URLs."
                />
              </div>
            )}

            {imageError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100 whitespace-pre-line">
                {imageError}
              </div>
            )}

            {imagePreview && (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm mt-2">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setImageFile(null);
                    setForm({ ...form, image: '' });
                  }}
                  className="absolute top-1 right-1 bg-white/80 p-1 rounded-md text-slate-600 hover:text-red-600"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            {!imagePreview && !imageError && (
              <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 mt-2 bg-white">
                <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                <span className="text-[10px] font-bold">IMAGE PREVIEW</span>
              </div>
            )}
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

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.freshMarketEnabled}
                onChange={(e) => setForm({ ...form, freshMarketEnabled: e.target.checked })}
                className="rounded text-brand-600 focus:ring-brand-500 accent-brand-600"
              />
              <span>Enable Fresh Market (Regular Consumer Sales)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.bulkPricingEnabled}
                onChange={(e) => setForm({ ...form, bulkPricingEnabled: e.target.checked })}
                className="rounded text-brand-600 focus:ring-brand-500 accent-brand-600"
              />
              <span>Enable Bulk/B2B Deals</span>
            </label>

            {form.bulkPricingEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6 border-l-2 border-brand-200">
                <Input
                  label={`Minimum Qty (${form.unit})`}
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={form.bulkMinimumQuantity}
                  onChange={(e) => setForm({ ...form, bulkMinimumQuantity: e.target.value })}
                  placeholder="e.g. 300"
                />
                <Input
                  label="Bulk Price (₹ per unit)"
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={form.bulkPrice}
                  onChange={(e) => setForm({ ...form, bulkPrice: e.target.value })}
                  placeholder="e.g. 35"
                />
              </div>
            )}
          </div>          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
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
