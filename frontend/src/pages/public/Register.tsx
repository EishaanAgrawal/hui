import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Tractor, Phone, MapPin, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const Register: React.FC = () => {
  const { registerConsumer, registerFarmer } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState<'CONSUMER' | 'FARMER'>(
    searchParams.get('type') === 'farmer' ? 'FARMER' : 'CONSUMER'
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    // Farmer specific fields
    farmName: '',
    location: '',
    description: '',
    farmSize: '15 Acres',
    farmingType: 'Certified Organic',
    experienceYears: 5,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (role === 'CONSUMER') {
        await registerConsumer({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        });
        navigate('/shop');
      } else {
        await registerFarmer({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          farmName: formData.farmName,
          location: formData.location,
          description: formData.description,
          farmSize: formData.farmSize,
          farmingType: formData.farmingType,
          experienceYears: Number(formData.experienceYears),
        });
        navigate('/farmer/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl organic-gradient text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md shadow-brand-500/20">
            🌾
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Create FarmDirect Account</h2>
          <p className="text-xs text-slate-500">
            Join the agricultural movement for fair prices and direct farm harvesting.
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setRole('CONSUMER')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              role === 'CONSUMER'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4 text-brand-600" />
            I am a Consumer
          </button>
          <button
            type="button"
            onClick={() => setRole('FARMER')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              role === 'FARMER'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tractor className="w-4 h-4" />
            I am a Farmer
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-200 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Eishaan Patil"
              icon={<User className="w-4 h-4" />}
            />
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              icon={<Phone className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Email Address"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="you@domain.com"
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            icon={<Lock className="w-4 h-4" />}
          />

          {/* Farmer specific fields */}
          {role === 'FARMER' && (
            <div className="p-5 rounded-2xl bg-brand-50/50 border border-brand-200 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-900">
                <Tractor className="w-4 h-4 text-brand-600" />
                <span>Farm & Cultivation Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Farm Name"
                  name="farmName"
                  required
                  value={formData.farmName}
                  onChange={handleChange}
                  placeholder="e.g. Green Valley Organics"
                  icon={<Building2 className="w-4 h-4" />}
                />
                <Input
                  label="Location (City, State)"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Nashik, Maharashtra"
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Farming Type
                  </label>
                  <select
                    name="farmingType"
                    value={formData.farmingType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Certified Organic">Certified Organic</option>
                    <option value="Natural & Chemical-Free">Natural & Chemical-Free</option>
                    <option value="Hydroponic">Hydroponic / Vertical</option>
                    <option value="Traditional Regenerative">Traditional Regenerative</option>
                  </select>
                </div>

                <Input
                  label="Farm Size"
                  name="farmSize"
                  value={formData.farmSize}
                  onChange={handleChange}
                  placeholder="e.g. 20 Acres"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Farm Story / Bio
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell consumers about your soil practices, heritage crops, and harvest passion..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full font-bold shadow-lg shadow-brand-600/20"
          >
            {role === 'FARMER' ? 'Complete Farmer Registration' : 'Register & Start Shopping'}
          </Button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-700 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
