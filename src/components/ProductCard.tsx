import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ArrowUpRight } from 'lucide-react';
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
  const { addToCart } = useCart();
  const { profile, user } = useAuth();
  
  const isWishlisted = profile?.wishlist?.includes(product.id);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative w-full overflow-hidden"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden rounded-[1.5rem] lg:rounded-[2.5rem] bg-brand-beige/30 shadow-xl shadow-black/5">
        <img 
          src={(product.images && product.images[0]) ? product.images[0] : 'https://picsum.photos/400/600'} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[0.16, 1, 0.3, 1] group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-3">
          {product.stock === 0 ? (
            <span className="bg-brand-ink text-white text-[8px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] backdrop-blur-md">
              Sold Out
            </span>
          ) : product.stock < 5 && (
            <span className="bg-rose-500 text-white text-[8px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] backdrop-blur-md">
              Limited
            </span>
          )}
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
            <Star size={10} className="text-brand-gold fill-brand-gold" />
            <span className="text-[9px] font-bold text-brand-ink">{product.rating || '4.8'}</span>
          </div>
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={toggleWishlist}
          className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${isWishlisted ? 'bg-brand-gold text-white scale-110' : 'bg-white/90 backdrop-blur-md text-brand-ink hover:bg-brand-ink hover:text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'}`}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={1.5} />
        </button>

        {/* View Details Button */}
        <div className="absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] lg:w-[calc(100%-4rem)] translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-[0.16, 1, 0.3, 1]">
          <div className="bg-white/95 backdrop-blur-xl p-3 lg:p-5 rounded-2xl lg:rounded-3xl shadow-2xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[7px] lg:text-[8px] font-bold uppercase tracking-widest text-brand-ink/30 mb-0.5 lg:mb-1">View Piece</span>
              <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-brand-ink">Details</span>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl bg-brand-ink text-white flex items-center justify-center">
              <ArrowUpRight size={16} className="lg:hidden" />
              <ArrowUpRight size={18} className="hidden lg:block" />
            </div>
          </div>
        </div>
      </Link>

      <div className="pt-8 px-2">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-grow">
            <Link to={`/product/${product.id}`} className="block group/title">
              <h3 className="text-sm font-bold text-brand-ink uppercase tracking-tight mb-2 line-clamp-1 group-hover/title:text-brand-gold transition-colors duration-500">
                {product.name}
              </h3>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-[9px] uppercase tracking-[0.3em] text-brand-ink/30 font-bold">{product.category}</span>
              <div className="h-px w-6 bg-brand-ink/10"></div>
            </div>
          </div>
          <p className="text-lg font-display font-bold text-brand-gold tracking-tight">৳{product.price.toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
