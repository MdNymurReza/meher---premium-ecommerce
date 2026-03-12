import React from 'react';

const ProductSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[4/5] bg-gray-200 rounded-xl mb-4"></div>
      
      {/* Content Skeleton */}
      <div className="space-y-3">
        {/* Category Line */}
        <div className="h-3 bg-gray-200 rounded-full w-20"></div>
        
        {/* Title Line */}
        <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
        
        {/* Price Line */}
        <div className="h-4 bg-gray-200 rounded-full w-16"></div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
