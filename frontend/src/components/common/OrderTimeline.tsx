import React from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  CheckCheck,
  XCircle,
} from 'lucide-react';
import { OrderStatus } from '../../types';

interface OrderTimelineProps {
  status: OrderStatus;
  deliveryStatus?: string;
  orderDate?: string;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  status,
  deliveryStatus,
  orderDate,
}) => {
  if (status === 'CANCELLED' || status === 'REJECTED') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4 text-red-800">
        <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-base">Order {status}</h4>
          <p className="text-xs text-red-600 mt-0.5">
            This order has been {status.toLowerCase()}. Any payments made have been credited back to your account.
          </p>
        </div>
      </div>
    );
  }

  const steps = [
    {
      id: 'CONFIRMED',
      label: 'Order Placed',
      desc: 'Received & paid',
      icon: Clock,
    },
    {
      id: 'ACCEPTED',
      label: 'Farmer Accepted',
      desc: 'Harvest queued',
      icon: CheckCircle2,
    },
    {
      id: 'PREPARING',
      label: 'Freshly Harvested',
      desc: 'Packed at farm',
      icon: Package,
    },
    {
      id: 'IN_TRANSIT',
      label: 'Express In-Transit',
      desc: 'On route to city hub',
      icon: Truck,
    },
    {
      id: 'DELIVERED',
      label: 'Delivered',
      desc: 'Enjoy your fresh food',
      icon: CheckCheck,
    },
  ];

  const getStepIndex = (currentStatus: OrderStatus): number => {
    switch (currentStatus) {
      case 'PENDING':
      case 'CONFIRMED':
        return 0;
      case 'ACCEPTED':
        return 1;
      case 'PREPARING':
      case 'READY_FOR_PICKUP':
        return 2;
      case 'PICKED_UP':
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h4 className="font-bold text-slate-900 text-base">Order Fulfillment Pipeline</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Current Status:{' '}
            <span className="font-semibold text-brand-700 capitalize">
              {status.replace(/_/g, ' ').toLowerCase()}
            </span>
          </p>
        </div>
        {orderDate && (
          <span className="text-xs font-medium text-slate-400">
            {new Date(orderDate).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>

      <div className="relative">
        {/* Step Line */}
        <div className="hidden sm:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-100 -z-0">
          <div
            className="h-full bg-brand-500 transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const StepIcon = step.icon;

            return (
              <div
                key={step.id}
                className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 ring-4 ring-brand-50'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  <StepIcon className="w-5 h-5" />
                </div>
                <div className="text-left sm:text-center">
                  <div
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-brand-700' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-[11px] text-slate-400 hidden sm:block">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
