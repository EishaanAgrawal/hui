import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  CheckCircle2,
  CreditCard,
  Truck,
  Plus,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { userApi, orderApi, paymentApi } from '../../services/api';
import { Address } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';

export const Checkout: React.FC = () => {
  const { cart, clearCart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentProvider, setPaymentProvider] = useState<'RAZORPAY' | 'UPI' | 'CASH_ON_DELIVERY'>('RAZORPAY');
  const [notes, setNotes] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Address Modal State
  const [newAddressModal, setNewAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400050',
    isDefault: true,
  });

  // Razorpay Test Mode Simulator Modal
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await userApi.getAddresses();
        setAddresses(data);
        if (data.length > 0) {
          const defaultAddr = data.find((a) => a.isDefault) || data[0];
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, []);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Your cart is empty</h2>
        <Link to="/shop">
          <Button variant="primary">Browse Marketplace</Button>
        </Link>
      </div>
    );
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await userApi.addAddress(addressForm);
      setAddresses((prev) => [added, ...prev]);
      setSelectedAddressId(added.id);
      setNewAddressModal(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handleInitiatePayment = () => {
    if (!selectedAddressId) {
      alert('Please select or add a delivery address.');
      return;
    }
    if (paymentProvider === 'RAZORPAY' || paymentProvider === 'UPI') {
      setRazorpayModalOpen(true);
    } else {
      handleFinalizeOrder();
    }
  };

  const handleFinalizeOrder = async () => {
    setIsProcessing(true);
    try {
      const order = await orderApi.createOrder({
        addressId: selectedAddressId,
        notes,
        paymentProvider,
      });

      // Verify payment signature in simulator mode
      if (paymentProvider === 'RAZORPAY' || paymentProvider === 'UPI') {
        await paymentApi.verifyPayment({
          orderId: order.id,
          razorpay_order_id: `rzp_order_${order.id}`,
          razorpay_payment_id: `pay_${Date.now()}`,
          razorpay_signature: 'sim_sig_valid_test_token',
        });
      }

      await refreshCart();
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
      setRazorpayModalOpen(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Checkout & Order Placement</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review delivery destination and secure payment method.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Form: Step 1 & Step 2 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900">Delivery Address</h3>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setNewAddressModal(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                New Address
              </Button>
            </div>

            {addresses.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-500 mb-3">No saved addresses found.</p>
                <Button size="sm" variant="primary" onClick={() => setNewAddressModal(true)}>
                  Add Delivery Address
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 ${
                      selectedAddressId === addr.id
                        ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedAddress"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 text-brand-600 focus:ring-brand-500"
                    />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-900">{addr.name}</p>
                      <p className="text-slate-600">{addr.addressLine1}</p>
                      {addr.addressLine2 && <p className="text-slate-500">{addr.addressLine2}</p>}
                      <p className="text-slate-600">
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-slate-500 font-medium">📞 {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Payment Provider Selection */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Payment Gateway</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between gap-3 ${
                  paymentProvider === 'RAZORPAY'
                    ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">Razorpay / Cards</span>
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentProvider === 'RAZORPAY'}
                    onChange={() => setPaymentProvider('RAZORPAY')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <div className="text-[11px] text-slate-500">
                  Credit/Debit cards, NetBanking & Razorpay checkout
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between gap-3 ${
                  paymentProvider === 'UPI'
                    ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">Instant UPI QR</span>
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentProvider === 'UPI'}
                    onChange={() => setPaymentProvider('UPI')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <div className="text-[11px] text-slate-500">
                  Google Pay, PhonePe, Paytm & BHIM UPI
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between gap-3 ${
                  paymentProvider === 'CASH_ON_DELIVERY'
                    ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">Cash on Delivery</span>
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentProvider === 'CASH_ON_DELIVERY'}
                    onChange={() => setPaymentProvider('CASH_ON_DELIVERY')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <div className="text-[11px] text-slate-500">
                  Pay cash at doorstep upon harvest receipt
                </div>
              </label>
            </div>

            {/* Delivery Instructions */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Special Delivery Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Ring bell twice, leave at apartment gate..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Right Summary */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 lg:sticky lg:top-28">
          <h3 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100">
            Order Review ({cart.itemCount} items)
          </h3>

          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs pt-2 first:pt-0">
                <div className="truncate pr-2">
                  <p className="font-bold text-slate-900 truncate">{item.product.name}</p>
                  <p className="text-slate-400">
                    {item.quantity} {item.product.unit} × ₹{item.product.price}
                  </p>
                </div>
                <span className="font-bold text-slate-900 flex-shrink-0">
                  ₹{item.quantity * item.product.price}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Produce Subtotal</span>
              <span className="font-bold text-slate-900">₹{cart.subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Fair Platform Fee (5%)</span>
              <span className="font-bold text-slate-900">₹{cart.platformFee}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Direct Farm Logistics</span>
              <span className="font-bold text-slate-900">
                {cart.deliveryFee === 0 ? 'FREE' : `₹${cart.deliveryFee}`}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between text-base">
              <span className="font-black text-slate-900">Grand Total</span>
              <span className="text-2xl font-black text-brand-900">₹{cart.total}</span>
            </div>
          </div>

          <Button
            onClick={handleInitiatePayment}
            loading={isProcessing}
            size="lg"
            variant="primary"
            className="w-full font-bold shadow-lg shadow-brand-600/30"
          >
            Pay & Confirm Order (₹{cart.total})
          </Button>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit Encrypted Payment & Direct Payout</span>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={newAddressModal}
        onClose={() => setNewAddressModal(false)}
        title="Add Delivery Destination"
      >
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Recipient Name"
              required
              value={addressForm.name}
              onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
              placeholder="Full name"
            />
            <Input
              label="Contact Phone"
              required
              value={addressForm.phone}
              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
              placeholder="10-digit mobile"
            />
          </div>

          <Input
            label="Address Line 1"
            required
            value={addressForm.addressLine1}
            onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
            placeholder="Flat, House No, Building, Street"
          />

          <Input
            label="Address Line 2 (Optional)"
            value={addressForm.addressLine2}
            onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
            placeholder="Landmark, Area"
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="City"
              required
              value={addressForm.city}
              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
            />
            <Input
              label="State"
              required
              value={addressForm.state}
              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
            />
            <Input
              label="Postal Code"
              required
              value={addressForm.postalCode}
              onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setNewAddressModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>

      {/* Razorpay Test Simulator Modal */}
      <Modal
        isOpen={razorpayModalOpen}
        onClose={() => setRazorpayModalOpen(false)}
        title="Razorpay Test Mode Checkout"
      >
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-300 font-bold uppercase tracking-wider">
                FarmDirect Secure Checkout
              </span>
              <span className="text-[10px] bg-brand-800 text-brand-200 px-2 py-0.5 rounded-full font-bold">
                Test Mode
              </span>
            </div>
            <div className="text-3xl font-black text-white">₹{cart.total}.00</div>
            <p className="text-xs text-slate-400">Merchant Account: FarmDirect Direct Agri Escrow</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <p className="font-bold">⚡ Simulation Mode Active</p>
            <p>
              Clicking below will simulate a successful Razorpay payment response and verify the cryptographic signature on the backend.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleFinalizeOrder}
              loading={isProcessing}
              variant="primary"
              size="lg"
              className="w-full font-bold"
            >
              Simulate Successful Payment (₹{cart.total})
            </Button>
            <Button
              onClick={() => setRazorpayModalOpen(false)}
              variant="ghost"
              className="w-full"
            >
              Cancel Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
