import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { motion } from 'motion/react';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(4));
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setFeaturedProducts(products);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section - Split Layout */}
      <section className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        <div className="relative flex items-center justify-center p-8 lg:p-24 bg-brand-paper">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl z-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="text-brand-gold font-bold tracking-[0.5em] uppercase text-[10px]">Est. 2026 — Dhaka</span>
              <div className="h-px w-12 bg-brand-gold/30"></div>
            </div>
            <h1 className="text-[12vw] lg:text-[8vw] font-display font-bold leading-[0.85] text-brand-ink uppercase tracking-tighter mb-12">
              Meher <br /> <span className="text-brand-gold italic font-serif lowercase tracking-normal ml-[2vw]">Mala</span>
            </h1>
            <p className="text-xl text-brand-ink/60 max-w-md leading-relaxed font-light mb-12">
              A sanctuary of timeless elegance. Handcrafted jewellery and premium apparel for the discerning soul.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link to="/shop" className="premium-button-primary px-12 h-16 flex items-center justify-center text-[10px] tracking-[0.3em]">
                EXPLORE COLLECTION
              </Link>
              <button className="flex items-center gap-4 group">
                <div className="w-16 h-16 rounded-full border border-brand-ink/10 flex items-center justify-center group-hover:bg-brand-gold group-hover:border-brand-gold group-hover:text-white transition-all duration-500">
                  <Play size={16} fill="currentColor" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Watch Film</span>
              </button>
            </div>
          </motion.div>
          
          {/* Background Text Accent */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[30vw] font-display font-bold text-brand-ink/[0.02] pointer-events-none select-none whitespace-nowrap">
            MEHER MALA
          </div>
        </div>
        
        <div className="relative h-[60vh] lg:h-screen overflow-hidden">
          <motion.img 
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            src="https://picsum.photos/seed/luxury-vibe/1200/1600" 
            alt="Hero" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-brand-ink/10"></div>
          
          {/* Floating Element */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="absolute bottom-12 right-12 glass-card p-8 max-w-xs hidden md:block"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-white">
                <Sparkles size={14} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">New Season</span>
            </div>
            <p className="text-sm font-light text-brand-ink/60 leading-relaxed">
              Discover our latest handcrafted pieces, inspired by the heritage of Bengal.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Marquee - Refined */}
      <div className="w-full py-10 bg-brand-ink overflow-hidden whitespace-nowrap border-y border-white/5">
        <div className="flex animate-marquee">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-20 px-10">
              <span className="text-white/40 font-display italic text-4xl tracking-tight">Handcrafted Excellence</span>
              <span className="w-2 h-2 bg-brand-gold rounded-full"></span>
              <span className="text-white/40 font-display italic text-4xl tracking-tight">Premium Materials</span>
              <span className="w-2 h-2 bg-brand-gold rounded-full"></span>
              <span className="text-white/40 font-display italic text-4xl tracking-tight">Timeless Design</span>
              <span className="w-2 h-2 bg-brand-gold rounded-full"></span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Grid - Bento Style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div className="max-w-2xl">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px]">The Archive</span>
              <div className="h-px w-20 bg-brand-gold/30"></div>
            </div>
            <h2 className="text-6xl lg:text-7xl font-display font-bold uppercase tracking-tighter leading-[0.9]">Curated <br /> Collections</h2>
          </div>
          <p className="text-brand-ink/40 text-sm max-w-xs font-light leading-relaxed">
            Explore our meticulously crafted categories, each designed to elevate your personal style.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {categories.slice(0, 4).map((cat, idx) => (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`${idx === 0 || idx === 3 ? 'md:col-span-7' : 'md:col-span-5'} relative group aspect-[16/10] md:aspect-auto overflow-hidden rounded-[3rem] shadow-2xl shadow-black/5 min-h-[400px]`}
            >
              <img 
                src={`https://picsum.photos/seed/${cat.name.toLowerCase()}/1200/800`} 
                alt={cat.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-brand-ink/20 group-hover:bg-brand-ink/40 transition-colors duration-500"></div>
              <div className="absolute bottom-12 left-12 text-white">
                <h3 className="text-4xl font-display font-bold uppercase tracking-tight mb-4">{cat.name}</h3>
                <Link to={`/shop?category=${cat.name}`} className="inline-flex items-center gap-3 text-[10px] font-bold tracking-[0.3em] uppercase hover:gap-5 transition-all">
                  EXPLORE <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
          
          {categories.length === 0 && (
            <div className="col-span-full py-20 text-center bg-brand-beige/20 rounded-[3rem] border-2 border-dashed border-black/5">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/20">No collections available</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products - Horizontal Scroll / Grid */}
      <section className="py-32 bg-brand-beige/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px]">New Arrivals</span>
                <div className="h-px w-20 bg-brand-gold/30"></div>
              </div>
              <h2 className="text-6xl font-display font-bold uppercase tracking-tighter">Latest Pieces</h2>
            </div>
            <Link to="/shop" className="premium-button-outline px-10 h-14 flex items-center justify-center text-[10px] tracking-[0.2em]">
              VIEW ALL ARCHIVE
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
              {[1, 2, 3, 4].map(i => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
              {featuredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand Story - Immersive */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl shadow-black/10">
              <img 
                src="https://picsum.photos/seed/craft/1000/1250" 
                alt="Craftsmanship" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Floating Detail Image */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="absolute -bottom-16 -right-16 w-64 aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-brand-paper hidden xl:block"
            >
              <img src="https://picsum.photos/seed/detail/500/500" alt="Detail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>
          </div>
          <div className="space-y-12">
            <div className="flex items-baseline gap-4">
              <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px]">Our Philosophy</span>
              <div className="h-px flex-grow bg-brand-gold/30"></div>
            </div>
            <h2 className="text-7xl lg:text-8xl font-display font-bold uppercase tracking-tighter leading-[0.85]">Crafted <br /> with <span className="text-brand-gold italic font-serif lowercase tracking-normal">Soul</span></h2>
            <div className="space-y-6">
              <p className="text-xl text-brand-ink/60 leading-relaxed font-light">
                At Meher Mala, we believe that every piece tells a story. From the selection of the finest materials to the final finishing touches, our artisans pour their heart and soul into every creation.
              </p>
              <p className="text-xl text-brand-ink/60 leading-relaxed font-light">
                Our mission is to provide you with luxury that is both accessible and sustainable, ensuring that you feel as good as you look.
              </p>
            </div>
            <Link to="/shop" className="inline-flex premium-button-primary px-16 h-20 items-center justify-center text-[10px] tracking-[0.3em]">
              OUR STORY
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
