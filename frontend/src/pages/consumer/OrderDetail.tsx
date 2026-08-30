import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  MapPin,
  ShieldCheck,
  Star,
  CheckCircle2,
  Calendar,
  XCircle,
} from 'lucide-react';
import { orderApi, reviewApi, routeApi } from '../../services/api';
import { Order } from '../../types';
import { OrderTimeline } from '../../components/common/OrderTimeline';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { RouteMap } from '../../components/common/RouteMap';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // Review state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProductName, setSelectedProductName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Multi-Farm fulfillment state
  const [routePlan, setRoutePlan] = useState<any>(null);
  const [optimizing, setOptimizing] = useState(false);

  const handleOptimizeMultiFarm = async () => {
      setOptimizing(true);
      try {
          const res = await routeApi.optimizeMultiFarm(order!.id);
          setRoutePlan(res);
      } catch (err: any) {
          alert(err.response?.data?.message || 'Failed to generate fulfillment plan');
      } finally {
          setOptimizing(false);
      }
  };

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await orderApi.getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <Loader fullPage message="Loading order tracking timeline..." />;
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Order not found</h2>
        <Link to="/orders" className="text-brand-600 font-bold mt-4 inline-block">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order? Any payments will be refunded.')) return;
    setCancelling(true);
    try {
      const updated = await orderApi.cancelOrder(order.id);
      setOrder(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenReviewModal = (productId: string, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setRating(5);
    setComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await reviewApi.createReview({
        productId: selectedProductId,
        orderId: order.id,
        rating,
        comment,
      });
      alert('Thank you for reviewing the produce! 🌾');
      setReviewModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const uniqueFarmersCount = new Set((order.items || []).map(i => i.farmerId)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {order.orderStatus === 'CONFIRMED' || order.orderStatus === 'PENDING' ? (
          <Button
            variant="danger"
            size="sm"
            onClick={handleCancelOrder}
            loading={cancelling}
            icon={<XCircle className="w-4 h-4" />}
          >
            Cancel Order
          </Button>
        ) : null}
      </div>

      {/* Interactive Timeline Tracker */}
      <OrderTimeline
        status={order.orderStatus}
        deliveryStatus={order.delivery?.status}
        orderDate={order.createdAt}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Items list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              Harvest Produce ({order.items?.length || 0} items)
            </h3>

            <div className="divide-y divide-slate-100">
              {(order.items || []).map((item) => (
                <div
                  key={item.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        item.product?.image ||
                        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150'
                      }
                      alt={item.productName}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-100"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.productName}</h4>
                      <p className="text-xs text-slate-500">
                        Farm: {item.farmer?.farmName} ({item.farmer?.location})
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.quantity} {item.unit} × ₹{item.unitPrice}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-sm font-black text-slate-900">₹{item.subtotal}</span>
                    {order.orderStatus === 'DELIVERED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReviewModal(item.productId, item.productName)}
                        icon={<Star className="w-3.5 h-3.5 text-amber-500" />}
                      >
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Fulfillment Plan (Multi-Farm Optimization) */}
          {uniqueFarmersCount > 1 && (
             <div className="bg-brand-50 rounded-3xl p-6 sm:p-8 border border-brand-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-200/60 pb-4">
                    <div>
                        <h3 className="text-lg font-bold text-brand-900 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-brand-600" />
                            SMART FULFILLMENT PLAN
                        </h3>
                        <p className="text-xs text-brand-700 mt-1">This order requires pickups from {uniqueFarmersCount} Farms.</p>
                    </div>
                    {!routePlan && (
                        <Button
                           onClick={handleOptimizeMultiFarm}
                           loading={optimizing}
                           size="sm"
                           className="bg-brand-600 hover:bg-brand-700 text-white border-transparent"
                        >
                           Optimize Pickup Route
                        </Button>
                    )}
                </div>

                {routePlan ? (
                    <div className="pt-2 space-y-4 text-sm text-slate-800">
                       <h4 className="font-bold text-brand-800 uppercase text-[11px] tracking-wider mb-4">Optimized Pickup & Delivery Plan</h4>
                       
                       <RouteMap 
                           startLocation={{
                               lat: routePlan.optimizedStops[0].lat,
                               lon: routePlan.optimizedStops[0].lon,
                               name: routePlan.optimizedStops[0].name
                           }}
                           stops={routePlan.optimizedStops.slice(1)}
                       />

                       <div className="space-y-0 relative mt-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-brand-200 before:to-transparent">
                          {routePlan.optimizedStops.map((stop: any, idx: number) => (
                             <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                                {/* Marker */}
                                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-brand-500 text-white text-[10px] font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                   {idx === 0 ? 'S' : idx === routePlan.optimizedStops.length - 1 ? 'E' : stop.sequence}
                                </div>
                                
                                {/* Content */}
                                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                                    {stop.type === 'DELIVERY' ? (
                                        <Badge variant="emerald" size="sm" className="mb-2 inline-flex absolute -top-2 -right-2">FINAL DESTINATION</Badge>
                                    ) : (
                                        <Badge variant="blue" size="sm" className="mb-2 inline-flex absolute -top-2 -right-2">PICKUP</Badge>
                                    )}
                                    <h5 className="font-bold text-slate-900">{stop.sequence}. {stop.name}</h5>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {stop.type === 'PICKUP' ? `Pickup: ${stop.details}` : `Deliver to: ${stop.address}`}
                                    </p>
                                    {stop.distanceFromPrevious > 0 && (
                                        <p className="text-[10px] text-brand-600 font-bold mt-2 pt-2 border-t border-slate-100">
                                            + {stop.distanceFromPrevious} km from previous stop
                                        </p>
                                    )}
                                </div>
                             </div>
                          ))}
                       </div>

                       <div className="grid grid-cols-3 gap-4 pt-4 border-t border-brand-200/60 text-center">
                          <div className="bg-white p-3 rounded-xl border border-brand-100">
                              <span className="block text-2xl font-black text-brand-700">{routePlan.totalDistance} <span className="text-sm font-semibold text-slate-500">km</span></span>
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Est. Distance</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-brand-100">
                              <span className="block text-2xl font-black text-brand-700">{Math.round(routePlan.estimatedDuration / 60)}<span className="text-sm font-semibold text-slate-500">h</span> {routePlan.estimatedDuration % 60}<span className="text-sm font-semibold text-slate-500">m</span></span>
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Est. Travel Time</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-brand-100">
                              <span className="block text-2xl font-black text-brand-700">{routePlan.optimizedStops.length}</span>
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Stops</span>
                          </div>
                       </div>
                    </div>
                ) : (
                    <div className="pt-2">
                        <p className="text-sm text-slate-600">
                            Supplier Locations:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-slate-700 font-medium">
                            {Array.from(new Set(order.items.map(i => i.farmer?.farmName))).map((fName: any, idx) => (
                                <li key={idx}>{fName}</li>
                            ))}
                        </ul>
                    </div>
                )}
             </div>
          )}

          {/* Delivery & Logistics details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-600" />
              <span>Direct Logistics Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
                <span className="text-slate-400 font-semibold block">Delivery Partner</span>
                <span className="font-bold text-slate-800 text-sm">
                  {order.delivery?.deliveryPartner || 'FarmDirect Express'}
                </span>
                <span className="text-slate-500 block">
                  Tracking #: <code className="font-mono text-brand-700">{order.delivery?.trackingNumber}</code>
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
                <span className="text-slate-400 font-semibold block">Estimated Arrival</span>
                <span className="font-bold text-slate-800 text-sm">
                  {order.delivery?.estimatedDelivery
                    ? new Date(order.delivery.estimatedDelivery).toLocaleDateString()
                    : 'Within 24 hours of harvest'}
                </span>
                <span className="text-emerald-700 font-semibold block">
                  Status: {order.delivery?.status || 'ASSIGNED'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Address & Payment Breakdown */}
        <div className="space-y-6">
          {/* Destination */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" /> Destination
            </h3>
            {order.deliveryAddress ? (
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-900">{order.deliveryAddress.name}</p>
                <p>{order.deliveryAddress.addressLine1}</p>
                {order.deliveryAddress.addressLine2 && <p>{order.deliveryAddress.addressLine2}</p>}
                <p>
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.postalCode}
                </p>
                <p className="font-semibold text-slate-700">📞 {order.deliveryAddress.phone}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">{order.deliveryAddressSnapshot}</p>
            )}
          </div>

          {/* Payment receipt */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Payment & Invoice
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Produce Gross Subtotal</span>
                <span className="font-bold text-slate-900">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform & Quality Fee</span>
                <span className="font-bold text-slate-900">₹{order.platformFee}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span className="font-bold text-slate-900">
                  {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between text-base">
                <span className="font-black text-slate-900">{order.payment?.provider === 'CASH_ON_DELIVERY' ? 'Total to Pay' : 'Total Paid'}</span>
                <span className="text-2xl font-black text-brand-900">₹{order.total}</span>
              </div>

              <div className="pt-2 flex justify-between items-center text-[11px] text-slate-400">
                <span>
                  Provider: <span className="font-bold text-slate-700">{order.payment?.provider || 'RAZORPAY'}</span>
                </span>
                <span>
                  Status: {' '}
                  {order.payment?.provider === 'CASH_ON_DELIVERY' ? (
                    <span className="font-bold text-amber-600">PENDING (COD)</span>
                  ) : (
                    <span className="font-bold text-emerald-600">{order.paymentStatus}</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Review ${selectedProductName}`}
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Rating (1 to 5 Stars)
            </label>
            <div className="flex gap-2 text-2xl">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  className={`transition ${s <= rating ? 'text-amber-400' : 'text-slate-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Feedback on freshness and flavor
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others how fresh and tasty the produce was..."
              className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingReview}>
              Publish Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
