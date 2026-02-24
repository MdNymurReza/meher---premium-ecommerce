import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const Wishlist: React.FC = () => {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!profile?.wishlist || profile.wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'products'), where(documentId(), 'in', profile.wishlist));
        const querySnapshot = await getDocs(q);
        setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [profile?.wishlist]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (products.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-brand-beige/50 rounded-full flex items-center justify-center mb-10 shadow-2xl shadow-black/5"
        >
          <Heart size={48} className="text-brand-ink/10" strokeWidth={1} />
        </motion.div>
        <h1 className="text-4xl font-display font-bold uppercase tracking-tighter mb-4 text-center">Your wishlist is empty</h1>
        <p className="text-brand-ink/40 mb-12 max-w-md text-center text-[10px] font-bold uppercase tracking-widest leading-loose">
          Save items you love to your wishlist and they'll appear here for your future consideration.
        </p>
        <Link to="/shop" className="premium-button-primary px-12 h-16 text-[10px] tracking-[0.3em]">
          EXPLORE COLLECTION
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-20">
        <div className="flex items-baseline gap-4 mb-4">
          <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-xs">Curated Selection</span>
          <div className="h-px flex-grow bg-black/5"></div>
        </div>
        <div className="flex justify-between items-end">
          <h1 className="text-7xl font-display font-bold uppercase tracking-tighter">Your Wishlist</h1>
          <Link to="/shop" className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold hover:gap-5 transition-all">
            CONTINUE SHOPPING <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {products.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
