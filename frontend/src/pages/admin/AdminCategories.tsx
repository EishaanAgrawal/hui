import React, { useEffect, useState } from 'react';
import { categoryApi } from '../../services/api';
import { Category } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Plus } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', image: '' });
  const [creating, setCreating] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await categoryApi.createCategory(form);
      setIsModalOpen(false);
      setForm({ name: '', description: '', image: '' });
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Loader fullPage message="Loading categories..." />;

  return (
    <DashboardLayout
      portalType="ADMIN"
      title="Produce Categories Management"
      subtitle="Organize agricultural produce into catalog groupings."
      actionButton={
        <Button onClick={() => setIsModalOpen(true)} variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
          New Category
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-full h-32 rounded-2xl overflow-hidden mb-4 bg-slate-100">
                <img
                  src={
                    c.image ||
                    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=300'
                  }
                  alt={c.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">{c.description}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Slug: {c.slug}</span>
              <span className="text-brand-700">{c.productCount || 0} produce items</span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Category">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Category Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Exotic Mushrooms"
          />
          <Input
            label="Cover Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={creating}>
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
