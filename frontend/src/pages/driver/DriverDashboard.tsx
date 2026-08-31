import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import api from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export const DriverDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [otpMode, setOtpMode] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [processing, setProcessing] = useState(false);

  React.useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/logistics/jobs');
        setJobs(res.data.data.filter((j: any) => j.status !== 'DELIVERED'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleVerifyPickup = async (jobId: string) => {
    setProcessing(true);
    try {
      await api.post(`/logistics/jobs/${jobId}/verify-pickup`, { quantity: 'Verified' });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'IN_TRANSIT' } : j));
      alert('Pickup Verified!');
    } catch (e: any) {
      alert('Error verifying pickup');
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteDelivery = async (jobId: string) => {
    setProcessing(true);
    try {
      await api.post(`/logistics/jobs/${jobId}/complete-delivery`, { otp: otpValue });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'DELIVERED' } : j));
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

      {loading ? (
          <div className="p-8 text-center text-slate-500">Loading jobs...</div>
      ) : jobs.length === 0 ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                 <CheckCircle2 className="w-8 h-8" />
             </div>
             <p className="text-lg font-bold text-slate-700">No active jobs</p>
          </div>
      ) : (
      <div className="px-4 -mt-6">
        {jobs.map(job => (
        <div key={job.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Job: {job.id.substring(0,8)}</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase">{job.status.replace(/_/g, ' ')}</span>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {/* PICKUP STOP */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                {['IN_TRANSIT', 'DELIVERED'].includes(job.status) ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <MapPin className="w-5 h-5" />}
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold px-2 py-1 rounded-lg uppercase bg-amber-100 text-amber-700">
                    PICKUP
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 mt-2">Farm Location</h3>
                <p className="text-sm text-slate-500">{job.pickupLocation}</p>
                <p className="text-sm font-semibold text-slate-700 mt-2">
                  Order items: {job.order?.items?.length || 0}
                </p>
                
                {job.status === 'PICKUP_SCHEDULED' && (
                  <button 
                    onClick={() => handleVerifyPickup(job.id)}
                    disabled={processing}
                    className="mt-4 w-full bg-slate-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    <Navigation className="w-4 h-4" /> Verify Pickup
                  </button>
                )}
              </div>
            </div>

            {/* DELIVERY STOP */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                {job.status === 'DELIVERED' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <MapPin className="w-5 h-5" />}
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold px-2 py-1 rounded-lg uppercase bg-brand-100 text-brand-700">
                    DELIVERY
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 mt-2">{job.order?.customer?.name || 'Customer'}</h3>
                <p className="text-sm text-slate-500">{job.deliveryLocation}</p>
                
                {job.status === 'IN_TRANSIT' && (
                   <button 
                    onClick={() => setOtpMode(job.id)}
                    className="mt-4 w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Enter Delivery OTP
                 </button>
                )}
              </div>
            </div>
          </div>
        </div>
        ))}
      </div>
      )}

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
