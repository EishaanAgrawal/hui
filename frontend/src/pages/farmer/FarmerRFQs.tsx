import React, { useEffect, useState } from 'react';
import { b2bApi } from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const FarmerRFQs: React.FC = () => {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState<any>(null);

  // Quote Form
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');
  const [delivery, setDelivery] = useState('0');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchRfqs();
  }, []);

  const fetchRfqs = async () => {
    try {
      const data = await b2bApi.getFarmerRfqs();
      setRfqs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuote = (rfq: any) => {
    setSelectedRfq(rfq);
    setPrice(rfq.product.price.toString());
    setQty(rfq.requiredQuantity.toString());
    setModalOpen(true);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await b2bApi.submitQuotation(selectedRfq.id, {
        quotedPrice: price,
        availableQuantity: qty,
        deliveryCost: delivery,
        notes
      });
      alert('Quotation Sent Successfully!');
      setModalOpen(false);
      fetchRfqs();
    } catch (err) {
      alert('Failed to send quotation');
    }
  };

  return (
    <DashboardLayout
      portalType="FARMER"
      title="B2B Requests (RFQs)"
      subtitle="Review incoming bulk requests and send custom quotations."
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Incoming RFQs</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading RFQs...</div>
        ) : rfqs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No active bulk requests.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rfqs.map(rfq => (
              <div key={rfq.id} className="p-6 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900">{rfq.product?.name}</h3>
                    <Badge variant={rfq.status === 'ACCEPTED' ? 'emerald' : rfq.status === 'QUOTED' ? 'blue' : 'slate'}>
                      {rfq.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">Buyer: {rfq.buyer?.name} {rfq.buyer?.companyName ? `(${rfq.buyer?.companyName})` : ''}</p>
                  <p className="text-sm text-slate-500">
                    Requested: <strong className="text-slate-800">{rfq.requiredQuantity} {rfq.product?.unit}</strong>
                  </p>
                  <p className="text-sm text-slate-500">
                    Delivery Address: {rfq.deliveryAddress}
                  </p>
                  {rfq.notes && (
                    <p className="text-xs bg-slate-50 p-2 rounded border border-slate-100 italic">"{rfq.notes}"</p>
                  )}
                </div>
                <div>
                  {rfq.status === 'PENDING' && (
                    <Button variant="primary" onClick={() => handleOpenQuote(rfq)}>
                      Send Quotation
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Send Quotation">
        {selectedRfq && (
          <form onSubmit={handleSubmitQuote} className="space-y-4">
            <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 mb-4">
              <p className="text-sm text-brand-900">Buyer requested <strong>{selectedRfq.requiredQuantity} {selectedRfq.product?.unit}</strong> of {selectedRfq.product?.name}. You currently have <strong>{selectedRfq.product?.availableQuantity} {selectedRfq.product?.unit}</strong> in stock.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Quoted Price (₹ per {selectedRfq.product?.unit})</label>
              <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Quantity You Can Supply</label>
              <input type="number" required value={qty} onChange={(e) => setQty(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Delivery Cost (₹) (Optional)</label>
              <input type="number" value={delivery} onChange={(e) => setDelivery(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Notes / Terms</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Terms or extra details" className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500" />
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Send Quotation
            </Button>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};
