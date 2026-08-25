import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, Tractor, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      // Redirect based on role or previous location
      const stored = localStorage.getItem('farmdirect_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role === 'ADMIN') navigate('/admin/dashboard');
        else if (u.role === 'FARMER') navigate('/farmer/dashboard');
        else navigate(from === '/' ? '/shop' : from);
      } else {
        navigate('/shop');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl organic-gradient text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md shadow-brand-500/20">
            🌾
          </div>
          <h2 className="text-2xl font-black text-slate-900">Welcome to FarmDirect</h2>
          <p className="text-xs text-slate-500">Sign in to manage orders, produce, or your farm portal</p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            ⚡ Quick 1-Click Demo Logins
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('consumer1@farmdirect.com', 'User@123')}
              className="py-2 px-2 text-center rounded-xl bg-white border border-slate-200 hover:border-brand-500 text-slate-700 hover:text-brand-700 text-xs font-bold transition shadow-sm"
            >
              <User className="w-3.5 h-3.5 mx-auto mb-1 text-brand-600" />
              Consumer
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('farmer1@farmdirect.com', 'Farmer@123')}
              className="py-2 px-2 text-center rounded-xl bg-white border border-slate-200 hover:border-brand-500 text-slate-700 hover:text-brand-700 text-xs font-bold transition shadow-sm"
            >
              <Tractor className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-600" />
              Farmer
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@farmdirect.com', 'Admin@123')}
              className="py-2 px-2 text-center rounded-xl bg-white border border-slate-200 hover:border-brand-500 text-slate-700 hover:text-brand-700 text-xs font-bold transition shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 mx-auto mb-1 text-indigo-600" />
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-200 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full font-bold shadow-lg shadow-brand-600/20"
            icon={<LogIn className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
          New to FarmDirect?{' '}
          <Link to="/register" className="font-bold text-brand-700 hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
