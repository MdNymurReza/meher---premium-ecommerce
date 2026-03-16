import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { Filter, X, ChevronDown, Search, SlidersHorizontal } from 'lucide-react';

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
        // Fetch all products and sort by date in memory to avoid index requirements
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        let productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        // Filter by category in memory
        if (category !== 'All') {
          productsData = productsData.filter(p => p.category === category);
        }

        // Filter by search query
        if (searchQuery) {
          productsData = productsData.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Apply sorting
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
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {category === 'All' ? 'All Products' : category}
          </h1>
          <p className="text-gray-500 text-sm">
            Showing {products.length} products
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <input 
                type="text" 
                placeholder="Search products..."
                className="w-full bg-white border border-gray-200 rounded-lg px-10 py-2 text-sm outline-none focus:border-brand-ink transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Filter size={16} /> Filters
            </button>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSearchParams({ category, sort: e.target.value })}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium outline-none cursor-pointer focus:border-brand-ink transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden md:block w-64 space-y-8">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Categories</h3>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSearchParams({ category: cat, sort: sortBy })}
                    className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${category === cat ? 'bg-brand-ink text-white font-bold' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Price Range</h3>
              <div className="space-y-2">
                {['Under ৳1000', '৳1000 - ৳5000', '৳5000 - ৳10000', 'Over ৳10000'].map(range => (
                  <label key={range} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-ink focus:ring-brand-ink" />
                    <span className="text-sm text-gray-600 group-hover:text-brand-ink transition-colors">{range}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-grow">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-xl">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSearchParams({ category: 'All', sort: 'newest' }); }}
                  className="bg-brand-ink text-white px-6 py-2 rounded-lg text-sm font-bold"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)}></div>
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setShowFilters(false)}><X size={24} /></button>
            </div>
            
            <div className="space-y-8">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Categories</h3>
                <div className="grid grid-cols-1 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setSearchParams({ category: cat, sort: sortBy }); setShowFilters(false); }}
                      className={`px-4 py-2 rounded-lg text-sm text-left ${category === cat ? 'bg-brand-ink text-white font-bold' : 'bg-gray-100'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => setShowFilters(false)}
                className="w-full bg-brand-ink text-white py-3 rounded-lg font-bold mt-8"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
