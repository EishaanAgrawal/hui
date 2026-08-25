import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { farmerApi } from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { Building2, MapPin, Save, ShieldCheck } from 'lucide-react';

export const FarmerProfile: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    farmName: '',
    location: '',
    farmingType: '',
    farmSize: '',
    description: '',
    experienceYears: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    farmerApi
      .getDashboardStats()
      .then((res) => {
        const f = res.farmer;
        if (f) {
          setForm({
            farmName: f.farmName || '',
            location: f.location || '',
            farmingType: f.farmingType || 'Certified Organic',
            farmSize: f.farmSize || '15 Acres',
            description: f.description || '',
            experienceYears: f.experienceYears || 5,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await farmerApi.updateProfile({
        ...form,
        experienceYears: Number(form.experienceYears),
      });
      alert('Farm profile updated successfully! 🌾');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullPage message="Loading farm profile details..." />;

  return (
    <DashboardLayout
      portalType="FARMER"
      title="Farm Entity & Cultivation Settings"
      subtitle="Update public farm branding, bio story, and certified farming methodologies."
    >
      <div className="max-w-3xl bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl organic-gradient text-white flex items-center justify-center font-bold text-xl">
            🚜
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-lg">{form.farmName || 'Your Farm'}</h3>
              <ShieldCheck className="w-5 h-5 text-brand-600" />
            </div>
            <p className="text-xs text-slate-500">Verified Producer ID: {user?.id?.slice(0, 8)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Farm Name"
              required
              value={form.farmName}
              onChange={(e) => setForm({ ...form, farmName: e.target.value })}
              icon={<Building2 className="w-4 h-4" />}
            />
            <Input
              label="Location (City, State)"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Farming Type
              </label>
              <select
                value={form.farmingType}
                onChange={(e) => setForm({ ...form, farmingType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Certified Organic">Certified Organic</option>
                <option value="Natural & Chemical-Free">Natural & Chemical-Free</option>
                <option value="Hydroponic & Vertical">Hydroponic & Vertical</option>
                <option value="Traditional Regenerative">Traditional Regenerative</option>
              </select>
            </div>

            <Input
              label="Farm Size"
              value={form.farmSize}
              onChange={(e) => setForm({ ...form, farmSize: e.target.value })}
            />

            <Input
              label="Experience (Years)"
              type="number"
              value={form.experienceYears}
              onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Public Story & Soil Principles
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              icon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
