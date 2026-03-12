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
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Heart size={32} className="text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
        <p className="text-gray-500 mb-8 max-w-md text-center">
          Save items you love to your wishlist and they'll appear here for your future consideration.
        </p>
        <Link to="/shop" className="bg-brand-ink text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-gray-500">Items you've saved for later</p>
        </div>
        <Link to="/shop" className="flex items-center gap-2 text-brand-ink font-medium hover:underline">
          Continue Shopping <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
