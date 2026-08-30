import React, { useEffect, useState } from 'react';
import { b2bApi } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FileText, CheckCircle2, Clock } from 'lucide-react';

export const B2BRFQs: React.FC = () => {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRfqs();
  }, []);

  const fetchRfqs = async () => {
    try {
      const data = await b2bApi.getMyRfqs();
      setRfqs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (quotationId: string) => {
    try {
      await b2bApi.acceptQuotation(quotationId);
      alert('Quotation accepted! Order created.');
      fetchRfqs();
    } catch (err) {
      console.error(err);
      alert('Failed to accept quotation');
    }
  };

  if (loading) return <div className="p-12 text-center">Loading RFQs...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-slate-900 mb-8 font-display flex items-center gap-3">
        <FileText className="w-8 h-8 text-brand-600" /> My RFQs & Quotations
      </h1>
      
      {rfqs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
          <p className="text-slate-500">You haven't submitted any bulk RFQs yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {rfqs.map(rfq => (
            <div key={rfq.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-start shadow-sm">
              <div className="w-24 h-24 rounded-xl flex-shrink-0 overflow-hidden bg-slate-100">
                <img src={rfq.product?.image} alt={rfq.product?.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">RFQ: {rfq.product?.name}</h3>
                  <Badge variant={rfq.status === 'ACCEPTED' ? 'emerald' : rfq.status === 'QUOTED' ? 'blue' : 'slate'}>
                    {rfq.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">Farmer: <span className="font-semibold">{rfq.farmer?.farmName}</span></p>
                <div className="flex gap-6 text-sm text-slate-500">
                  <span>Req Qty: <strong className="text-slate-900">{rfq.requiredQuantity} {rfq.product?.unit}</strong></span>
                  <span>Needed by: <strong className="text-slate-900">{rfq.preferredDate ? new Date(rfq.preferredDate).toLocaleDateString() : 'N/A'}</strong></span>
                </div>
                
                {rfq.quotation && rfq.status !== 'ACCEPTED' && (
                  <div className="mt-4 p-4 bg-brand-50 rounded-xl border border-brand-100">
                    <h4 className="font-bold text-brand-900 mb-2">Quotation Received!</h4>
                    <div className="flex flex-wrap gap-4 text-sm text-brand-800 mb-4">
                      <span>Quoted Price: <strong>₹{rfq.quotation.quotedPrice} / {rfq.product?.unit}</strong></span>
                      <span>Available: <strong>{rfq.quotation.availableQuantity} {rfq.product?.unit}</strong></span>
                      <span>Delivery Cost: <strong>₹{rfq.quotation.deliveryCost}</strong></span>
                    </div>
                    <Button variant="primary" onClick={() => handleAccept(rfq.quotation.id)}>
                      Accept & Place Order
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
