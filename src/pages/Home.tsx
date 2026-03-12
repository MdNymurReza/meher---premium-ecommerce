import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, limit, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, SiteSettings } from '../types';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { motion } from 'motion/react';
import { ArrowRight, ShoppingBag, Star, Shield, Truck } from 'lucide-react';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    heroImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=2000',
    heroHeading: 'MEHER MALA',
    heroSubheading: 'A sanctuary of timeless elegance. Handcrafted jewellery and premium apparel for the discerning soul.',
    marqueeText: ['Handcrafted Excellence', 'Premium Materials', 'Timeless Design'],
    brandStoryImage: 'https://images.unsplash.com/photo-1573408302185-912757078a7b?auto=format&fit=crop&q=80&w=1000',
    updatedAt: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'site');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SiteSettings);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();

    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        setCategories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();

    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8));
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setFeaturedProducts(products);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={settings.heroImage} 
            alt="Hero" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {settings.heroHeading}
            </h1>
            <p className="text-lg md:text-xl mb-10 text-white/90">
              {settings.heroSubheading}
            </p>
            <div className="flex gap-4">
              <Link to="/shop" className="bg-brand-ink text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-all flex items-center gap-2">
                Shop Now <ShoppingBag size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand-ink shadow-sm">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Fast Shipping</h3>
                <p className="text-xs text-gray-500">All Bangladesh delivery to your doorstep</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand-ink shadow-sm">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Secure Payment</h3>
                <p className="text-xs text-gray-500">100% secure payment processing</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand-ink shadow-sm">
                <Star size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Premium Quality</h3>
                <p className="text-xs text-gray-500">Handcrafted with the finest materials</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* Marquee - Refined */}
      <div className="w-full py-10 bg-brand-ink overflow-hidden whitespace-nowrap border-y border-white/5">
        <div className="flex animate-marquee">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-20 px-10">
              {settings.marqueeText.map((text, idx) => (
                <React.Fragment key={idx}>
                  <span className="text-white/40 font-display italic text-4xl tracking-tight">{text}</span>
                  <span className="w-2 h-2 bg-brand-gold rounded-full"></span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl font-bold">Shop by Category</h2>
            <p className="text-gray-500 mt-2">Explore our collections</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link 
                key={cat.id}
                to={`/shop?category=${cat.name}`}
                className="relative group overflow-hidden rounded-xl aspect-[4/5]"
              >
                <img 
                  src={`https://picsum.photos/seed/${cat.name.toLowerCase()}/800/1000`} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                  <span className="text-xs font-medium flex items-center gap-2">
                    Explore <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <p className="text-gray-500 mt-2">Our most loved pieces, selected for you</p>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-2 text-brand-ink font-bold hover:underline">
              View All <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            <Link to="/shop" className="inline-flex items-center gap-2 text-brand-ink font-bold">
              View All Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                Our Story: <br />
                <span className="text-gray-400">Crafted with Passion</span>
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                At Meher Mala, we believe that every piece tells a story. From the selection of the finest materials to the final finishing touches, our artisans pour their heart and soul into every creation.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Our mission is to provide you with quality that is both accessible and sustainable, ensuring that you feel as good as you look.
              </p>
              <Link to="/shop" className="bg-brand-ink text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-all">
                Learn More
              </Link>
            </div>
            <div className="order-1 lg:order-2">
              <img 
                src={settings.brandStoryImage} 
                alt="Brand Story" 
                className="rounded-2xl shadow-lg w-full aspect-video object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-brand-ink text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
          <p className="text-white/60 mb-8">Subscribe to receive early access to new collections and exclusive offers.</p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-grow bg-white/10 border border-white/20 rounded-lg px-6 py-3 text-sm outline-none focus:border-white/40 transition-all"
            />
            <button className="bg-white text-brand-ink px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all">
              SUBSCRIBE
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
