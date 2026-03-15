import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ArrowUpRight } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  
  const isWishlisted = profile?.wishlist?.includes(product.id);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    try {
      if (isWishlisted) {
        await updateDoc(userRef, { wishlist: arrayRemove(product.id) });
      } else {
        await updateDoc(userRef, { wishlist: arrayUnion(product.id) });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50">
        <img 
          src={(product.images && product.images[0]) ? product.images[0] : 'https://picsum.photos/400/600'} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.stock === 0 ? (
            <span className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider">
              Sold Out
            </span>
          ) : product.stock < 5 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider">
              Low Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={toggleWishlist}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isWishlisted ? 'bg-brand-ink text-white' : 'bg-white/90 text-gray-400 hover:text-brand-ink shadow-sm'}`}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </Link>

      <div className="p-4">
        <Link to={`/product/${product.id}`} className="block mb-1">
          <h3 className="text-sm font-bold text-gray-900 line-clamp-1 hover:text-brand-ink transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">{product.category}</span>
          <p className="text-sm font-bold text-brand-ink">৳{product.price.toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
