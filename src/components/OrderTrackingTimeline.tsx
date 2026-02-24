import React from 'react';
import { OrderStatus } from '../types';
import { Check, Clock, Package, Truck, Home } from 'lucide-react';

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

  return (
    <div className="relative pt-8 pb-4">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black/5 -translate-y-1/2"></div>
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-brand-gold -translate-y-1/2 transition-all duration-1000 ease-in-out"
        style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
      ></div>
      
      <div className="relative flex justify-between">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= currentIndex;
          const isActive = idx === currentIndex;
          
          return (
            <div key={step.label} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                  isActive ? 'bg-brand-gold text-white scale-125 shadow-xl shadow-brand-gold/20' : 
                  isCompleted ? 'bg-brand-gold text-white' : 'bg-white text-brand-ink/20 border border-black/5'
                }`}
              >
                <Icon size={16} strokeWidth={2.5} />
              </div>
              <span className={`mt-4 text-[8px] font-bold uppercase tracking-[0.2em] transition-colors ${
                isCompleted ? 'text-brand-ink' : 'text-brand-ink/20'
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
