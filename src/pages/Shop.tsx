import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Filter, X, ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') || 'All';
  const sortBy = searchParams.get('sort') || 'newest';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const cats = querySnapshot.docs.map(doc => doc.data().name);
        setCategories(['All', ...cats]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        
        if (category !== 'All') {
          q = query(collection(db, 'products'), where('category', '==', category), orderBy('createdAt', 'desc'));
        }

        const querySnapshot = await getDocs(q);
        let productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        // Client-side filtering for search
        if (searchQuery) {
          productsData = productsData.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Client-side sorting
        if (sortBy === 'price-low') {
          productsData.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
          productsData.sort((a, b) => b.price - a.price);
        }

        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, sortBy, searchQuery]);

  return (
    <div className="bg-brand-paper min-h-screen pb-32">
      {/* Header Section */}
      <section className="pt-32 pb-20 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12">
            <div className="max-w-2xl">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px]">The Archive</span>
                <div className="h-px w-20 bg-brand-gold/30"></div>
              </div>
              <h1 className="text-7xl lg:text-8xl font-display font-bold uppercase tracking-tighter leading-[0.85]">
                {category === 'All' ? 'Our' : category} <br /> 
                <span className="text-brand-gold italic font-serif lowercase tracking-normal">Collection</span>
              </h1>
            </div>
            <div className="flex flex-col items-end gap-6 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <input 
                  type="text" 
                  placeholder="SEARCH ARCHIVE..."
                  className="w-full bg-brand-beige/30 border-none rounded-2xl px-6 py-4 text-[10px] font-bold tracking-widest outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all placeholder:text-brand-ink/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-ink/20" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/30">Showing {products.length} unique pieces</p>
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="sticky top-20 z-30 bg-brand-paper/80 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar py-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSearchParams({ category: cat, sort: sortBy })}
                className={`text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all relative py-2 ${category === cat ? 'text-brand-ink' : 'text-brand-ink/30 hover:text-brand-ink'}`}
              >
                {cat}
                {category === cat && (
                  <motion.div layoutId="activeCat" className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold" />
                )}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group">
              <select 
                value={sortBy}
                onChange={(e) => setSearchParams({ category, sort: e.target.value })}
                className="appearance-none bg-transparent text-[10px] font-bold uppercase tracking-[0.2em] pr-8 outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-brand-ink/30" />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] bg-brand-ink text-white px-6 py-3 rounded-full hover:bg-brand-gold transition-colors"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="flex gap-16">
          {/* Side Filters - Desktop */}
          <aside className="hidden lg:block w-64 space-y-12">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30 mb-8">Refine By</h3>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest">Price Range</h4>
                  <div className="space-y-3">
                    {['Under ৳1000', '৳1000 - ৳5000', '৳5000 - ৳10000', 'Over ৳10000'].map(range => (
                      <label key={range} className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-4 h-4 rounded border border-black/10 flex items-center justify-center group-hover:border-brand-gold transition-colors">
                          <div className="w-2 h-2 bg-brand-gold rounded-sm opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        </div>
                        <span className="text-xs font-medium text-brand-ink/60 group-hover:text-brand-ink transition-colors">{range}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-brand-beige/30 rounded-[2rem] space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-widest">Need Help?</h4>
              <p className="text-[10px] text-brand-ink/40 leading-relaxed font-medium">Our curators are available to assist you with your selection.</p>
              <button className="text-[10px] font-bold uppercase tracking-widest text-brand-gold underline underline-offset-4">Contact Concierge</button>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-grow">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-[3/4] bg-brand-beige/30 animate-pulse rounded-[2.5rem]"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-40 bg-brand-beige/20 rounded-[3rem] border-2 border-dashed border-black/5">
                <Search size={48} className="mx-auto text-brand-ink/10 mb-6" strokeWidth={1} />
                <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-4">No pieces found</h3>
                <p className="text-brand-ink/40 text-sm font-light mb-8">Try adjusting your search or filters to find what you're looking for.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSearchParams({ category: 'All', sort: 'newest' }); }}
                  className="premium-button-outline px-10 h-14 text-[10px] tracking-[0.2em]"
                >
                  CLEAR ALL FILTERS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                {products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-brand-ink/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-brand-paper z-[70] shadow-2xl p-12"
            >
              <div className="flex justify-between items-center mb-16">
                <h2 className="text-3xl font-display font-bold uppercase tracking-tighter">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-brand-beige rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-12">
                <div className="space-y-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Categories</h3>
                  <div className="flex flex-wrap gap-3">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setSearchParams({ category: cat, sort: sortBy }); setShowFilters(false); }}
                        className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${category === cat ? 'bg-brand-ink text-white border-brand-ink' : 'border-black/5 hover:border-brand-gold'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Sort By</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Newest First', value: 'newest' },
                      { label: 'Price: Low to High', value: 'price-low' },
                      { label: 'Price: High to Low', value: 'price-high' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => { setSearchParams({ category, sort: option.value }); setShowFilters(false); }}
                        className={`w-full text-left py-4 border-b border-black/5 text-xs font-bold uppercase tracking-widest transition-colors ${sortBy === option.value ? 'text-brand-gold' : 'text-brand-ink/60 hover:text-brand-ink'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowFilters(false)}
                className="absolute bottom-12 left-12 right-12 premium-button-primary h-16 text-[10px] tracking-[0.3em]"
              >
                APPLY FILTERS
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
