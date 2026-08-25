import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, Mail, Phone, Calendar, Tractor } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';

export const Profile: React.FC = () => {
  const { user, isFarmer, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Account Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Manage personal information and roles.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-slate-100">
          <img
            src={
              user.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
            }
            alt={user.name}
            className="w-20 h-20 rounded-3xl object-cover ring-4 ring-brand-500 shadow-md"
          />
          <div>
            <h2 className="text-xl font-black text-slate-900">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800">
                {user.role}
              </span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Verified Account
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="p-4 rounded-2xl bg-slate-50 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </span>
            <p className="font-bold text-slate-900">{user.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> Contact Phone
            </span>
            <p className="font-bold text-slate-900">{user.phone || '+91 Not Provided'}</p>
          </div>
        </div>

        {isFarmer && user.farmerProfile && (
          <div className="p-6 rounded-3xl bg-brand-50/60 border border-brand-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-900 flex items-center gap-1.5">
                <Tractor className="w-4 h-4 text-brand-600" /> Linked Farm Entity
              </span>
              <Link to="/farmer/dashboard">
                <Button size="sm" variant="primary">
                  Go to Farmer Portal
                </Button>
              </Link>
            </div>
            <p className="font-bold text-brand-950 text-base">{user.farmerProfile.farmName}</p>
            <p className="text-xs text-brand-800">Location: {user.farmerProfile.location}</p>
          </div>
        )}
      </div>
    </div>
  );
};
