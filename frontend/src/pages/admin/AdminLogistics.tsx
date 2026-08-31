import React, { useEffect, useState } from 'react';
import { Truck, MapPin, Package, Clock, Users, ArrowRight, Activity, Calendar, Search, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Check } from 'lucide-react';

export const AdminLogistics: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'JOBS' | 'DRIVERS'>('JOBS');
  const [assigningJobId, setAssigningJobId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, driversRes] = await Promise.all([
          api.get('/logistics/jobs'),
          api.get('/logistics/drivers')
        ]);
        setJobs(jobsRes.data.data);
        setDrivers(driversRes.data.data);
      } catch (error) {
        console.error('Failed to load logistics jobs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVerifyDriver = async (driverId: string) => {
    try {
      await api.put(`/logistics/drivers/${driverId}/verify`);
      setDrivers(drivers.map(d => d.id === driverId ? { ...d, isVerified: true } : d));
      alert('Driver verified successfully');
    } catch (e: any) {
      alert('Failed to verify driver');
    }
  };

  const handleAssignDriver = async (jobId: string, driverId: string, vehicleId: string) => {
    try {
      await api.put(`/logistics/jobs/${jobId}/assign`, { driverId, vehicleId });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'PICKUP_SCHEDULED', driverId, vehicleId } : j));
      setAssigningJobId(null);
      alert('Rider successfully assigned to job!');
    } catch (e: any) {
      alert('Failed to assign driver');
    }
  };

  return (
    <DashboardLayout portalType="ADMIN" title="Logistics Fleet & Dispatch" subtitle="Monitor active deliveries, vehicle health, and driver assignments in real-time.">
      <div className="space-y-8">
        
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-brand-50 w-14 h-14 rounded-2xl flex items-center justify-center text-brand-600 shrink-0">
                    <Truck className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Fleet</h3>
                    <p className="text-3xl font-black text-slate-900">12<span className="text-sm font-semibold text-slate-400 ml-1">/ 15</span></p>
                </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                    <Package className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">In Transit</h3>
                    <p className="text-3xl font-black text-slate-900">38</p>
                </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-amber-50 w-14 h-14 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                    <Clock className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Awaiting Dispatch</h3>
                    <p className="text-3xl font-black text-slate-900">{jobs.filter(j => j.status === 'AWAITING_LOGISTICS').length}</p>
                </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Avg. Delivery Time</h3>
                    <p className="text-3xl font-black text-slate-900">45<span className="text-sm font-semibold text-slate-400 ml-1">mins</span></p>
                </div>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-slate-200">
            <button 
               className={`pb-4 px-4 font-bold text-sm ${activeTab === 'JOBS' ? 'border-b-2 border-brand-600 text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}
               onClick={() => setActiveTab('JOBS')}
            >
                Logistics Queue
            </button>
            <button 
               className={`pb-4 px-4 font-bold text-sm ${activeTab === 'DRIVERS' ? 'border-b-2 border-brand-600 text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}
               onClick={() => setActiveTab('DRIVERS')}
            >
                Driver Management
                {drivers.filter(d => !d.isVerified).length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                    {drivers.filter(d => !d.isVerified).length} New
                  </span>
                )}
            </button>
        </div>

        {activeTab === 'JOBS' ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
               <div>
                  <h2 className="text-lg font-bold text-slate-900">Recent Logistics Jobs</h2>
                  <p className="text-sm text-slate-500">Live feed of orders awaiting dispatch or currently in transit.</p>
               </div>
               <div className="flex gap-3">
                  <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Search orders..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64 shadow-sm" />
                  </div>
                  <Button variant="outline" icon={<Calendar className="w-4 h-4" />}>Today</Button>
               </div>
            </div>

            {loading ? (
              <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
                  Loading logistics queue...
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-bold text-slate-700">All caught up!</p>
                  <p className="text-sm text-slate-500 max-w-sm mt-1">There are no pending jobs in the queue. New orders will automatically appear here for dispatch.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                      <tr>
                          <th className="px-6 py-4">Job ID</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Pickup</th>
                          <th className="px-6 py-4">Dropoff</th>
                          <th className="px-6 py-4">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4 font-mono font-medium text-slate-900">{job.id.substring(0,8).toUpperCase()}</td>
                          <td className="px-6 py-4">
                              <Badge variant={job.status === 'AWAITING_LOGISTICS' ? 'amber' : job.status === 'IN_TRANSIT' ? 'blue' : 'emerald'}>
                                  {job.status.replace(/_/g, ' ')}
                              </Badge>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700 max-w-[200px] truncate" title={job.pickupLocation}>
                              {job.pickupLocation}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700 max-w-[200px] truncate" title={job.deliveryLocation}>
                              {job.deliveryLocation}
                          </td>
                          <td className="px-6 py-4 text-right">
                              {job.status === 'AWAITING_LOGISTICS' ? (
                                  assigningJobId === job.id ? (
                                    <select 
                                      className="text-xs p-2 border rounded-md"
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          const dr = drivers.find(d => d.id === e.target.value);
                                          if (dr) handleAssignDriver(job.id, dr.id, dr.assignedVehicleId);
                                        }
                                      }}
                                    >
                                      <option value="">Select Rider...</option>
                                      {drivers.filter(d => d.isVerified && d.status === 'AVAILABLE').map(d => (
                                        <option key={d.id} value={d.id}>{d.user?.name} (Loc: Base)</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <Button size="sm" variant="primary" onClick={() => setAssigningJobId(job.id)}>Assign Rider</Button>
                                  )
                              ) : (
                                  <Button size="sm" variant="outline" icon={<ArrowRight className="w-4 h-4" />}>Track Route</Button>
                              )}
                          </td>
                      </tr>
                      ))}
                  </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
               <div>
                  <h2 className="text-lg font-bold text-slate-900">Driver Fleet</h2>
                  <p className="text-sm text-slate-500">Manage registered riders and verify their identities.</p>
               </div>
            </div>
            
            {drivers.length === 0 ? (
              <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
                      <Users className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-bold text-slate-700">No riders yet</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                      <tr>
                          <th className="px-6 py-4">Rider Info</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Verification</th>
                          <th className="px-6 py-4">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {drivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4">
                              <div className="font-bold text-slate-900">{driver.user?.name}</div>
                              <div className="text-slate-500 text-xs">{driver.user?.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                              <Badge variant={driver.status === 'AVAILABLE' ? 'emerald' : 'amber'}>{driver.status}</Badge>
                          </td>
                          <td className="px-6 py-4">
                              {driver.isVerified ? (
                                <Badge variant="blue">Verified Rider</Badge>
                              ) : (
                                <Badge variant="red">Unverified</Badge>
                              )}
                          </td>
                          <td className="px-6 py-4">
                              {!driver.isVerified ? (
                                  <Button size="sm" variant="primary" onClick={() => handleVerifyDriver(driver.id)} icon={<Check className="w-4 h-4"/>}>Verify</Button>
                              ) : (
                                  <Button size="sm" variant="outline">View Profile</Button>
                              )}
                          </td>
                      </tr>
                      ))}
                  </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
