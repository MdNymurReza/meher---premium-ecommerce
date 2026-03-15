import React from 'react';
import { OrderStatus } from '../types';
import { Check, Clock, Package, Truck, Home, XCircle } from 'lucide-react';

interface OrderTrackingTimelineProps {
  status: OrderStatus;
}

const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({ status }) => {
  const steps: { label: OrderStatus; icon: any }[] = [
    { label: 'Pending', icon: Clock },
    { label: 'Confirmed', icon: Check },
    { label: 'Shipped', icon: Truck },
    { label: 'Delivered', icon: Home },
  ];

  const getStatusIndex = (s: OrderStatus) => {
    const index = steps.findIndex(step => step.label === s);
    return index === -1 ? 0 : index;
  };

  const currentIndex = getStatusIndex(status);
  const isCancelled = status === 'Cancelled';

  if (isCancelled) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 flex items-center justify-center gap-3 text-rose-600">
        <XCircle size={20} />
        <span className="text-sm font-bold uppercase tracking-wider">This order has been cancelled</span>
      </div>
    );
  }

  return (
    <div className="relative pt-8 pb-4">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black/5 -translate-y-1/2"></div>
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-brand-ink -translate-y-1/2 transition-all duration-1000 ease-in-out"
        style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
      ></div>
      
      <div className="relative flex justify-between">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= currentIndex;
          const isActive = idx === currentIndex;
          
          return (
            <div key={step.label} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isActive ? 'bg-brand-ink text-white scale-110 shadow-lg shadow-black/10' : 
                  isCompleted ? 'bg-brand-ink text-white' : 'bg-white text-gray-300 border border-gray-200'
                }`}
              >
                <Icon size={18} strokeWidth={2.5} />
              </div>
              <span className={`mt-3 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                isCompleted ? 'text-brand-ink' : 'text-gray-300'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTrackingTimeline;
