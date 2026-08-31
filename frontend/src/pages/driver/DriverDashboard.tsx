import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import api from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export const DriverDashboard: React.FC = () => {
  // Mock data for phase 2
  const [activeRoute, setActiveRoute] = useState({
    id: 'RTE-7890',
    stops: [
      { id: 1, type: 'PICKUP', name: 'Green Valley Organics', location: 'Nashik, Maharashtra', status: 'PENDING', quantity: '250 KG' },
      { id: 2, type: 'DELIVERY', name: 'Bulk Buyer: Metro Foods', location: 'Mumbai, Maharashtra', status: 'PENDING', quantity: '250 KG' }
    ]
  });

  const [otpMode, setOtpMode] = useState<number | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleVerifyPickup = async (stopId: number) => {
    setProcessing(true);
    try {
      // In a real app we'd pass the actual job ID. Mocking here.
      await api.post('/logistics/jobs/mock-job-id/verify-pickup', { quantity: '250 KG' });
      setActiveRoute(prev => ({
        ...prev,
        stops: prev.stops.map(s => s.id === stopId ? { ...s, status: 'COMPLETED' } : s)
      }));
      alert('Pickup Verified!');
    } catch (e: any) {
      alert('Error verifying pickup');
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteDelivery = async (stopId: number) => {
    setProcessing(true);
    try {
      await api.post('/logistics/jobs/mock-job-id/complete-delivery', { otp: otpValue });
      setActiveRoute(prev => ({
        ...prev,
        stops: prev.stops.map(s => s.id === stopId ? { ...s, status: 'COMPLETED' } : s)
      }));
      setOtpMode(null);
      alert('Delivery Successfully Completed!');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Invalid OTP');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout portalType="DRIVER" title="Driver Terminal" subtitle="Vehicle: MH-15-AB-1234 (Mini Truck)">
      <div className="space-y-6">

      <div className="px-4 -mt-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Active Route: {activeRoute.id}</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase">In Progress</span>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {activeRoute.stops.map((stop, idx) => (
              <div key={stop.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  {stop.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <MapPin className="w-5 h-5" />}
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg uppercase ${stop.type === 'PICKUP' ? 'bg-amber-100 text-amber-700' : 'bg-brand-100 text-brand-700'}`}>
                      {stop.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 mt-2">{stop.name}</h3>
                  <p className="text-sm text-slate-500">{stop.location}</p>
                  <p className="text-sm font-semibold text-slate-700 mt-2">Quantity: {stop.quantity}</p>
                  
                  {stop.status === 'PENDING' && idx === 0 && (
                    <button 
                      onClick={() => handleVerifyPickup(stop.id)}
                      disabled={processing}
                      className="mt-4 w-full bg-slate-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                      <Navigation className="w-4 h-4" /> Verify & Start Navigation
                    </button>
                  )}
                  {stop.type === 'DELIVERY' && stop.status === 'PENDING' && idx !== 0 && (
                     <button 
                      onClick={() => setOtpMode(stop.id)}
                      className="mt-4 w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Enter Delivery OTP
                   </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {otpMode !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative shadow-2xl border border-slate-100">
             <button onClick={() => setOtpMode(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
               <X className="w-5 h-5" />
             </button>
             <h3 className="font-bold text-slate-900 text-lg mb-1">Confirm Delivery</h3>
             <p className="text-sm text-slate-500 mb-6">Ask the customer for their 4-digit PIN to securely complete this handover.</p>
             
             <input 
               type="text" 
               maxLength={4}
               value={otpValue}
               onChange={(e) => setOtpValue(e.target.value)}
               className="w-full text-center tracking-[1em] text-3xl font-black rounded-2xl border-2 border-slate-200 py-4 mb-4 focus:ring-brand-500 focus:border-brand-500"
               placeholder="0000"
             />

             <button 
               onClick={() => handleCompleteDelivery(otpMode)}
               disabled={processing || otpValue.length < 4}
               className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm"
             >
               {processing ? 'Verifying...' : 'Complete Delivery'}
             </button>
           </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};
