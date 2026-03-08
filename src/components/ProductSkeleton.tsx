import React from 'react';

const ProductSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[3/4] bg-brand-beige/40 rounded-[2.5rem] mb-8 shadow-xl shadow-black/5"></div>
      
      {/* Content Skeleton */}
      <div className="px-2">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-grow space-y-3">
            {/* Title Line */}
            <div className="h-4 bg-brand-beige/60 rounded-full w-3/4"></div>
            
            {/* Category Line */}
            <div className="flex items-center gap-3">
              <div className="h-2 bg-brand-beige/40 rounded-full w-20"></div>
              <div className="h-px w-6 bg-brand-beige/20"></div>
            </div>
          </div>
          
          {/* Price Line */}
          <div className="h-6 bg-brand-beige/60 rounded-full w-16"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
