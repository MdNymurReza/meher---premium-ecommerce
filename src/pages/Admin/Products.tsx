import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { Product } from '../../types';
import { Plus, Search, Edit2, Trash2, X, Upload, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sizesInput, setSizesInput] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: 0,
    stock: 0,
    sizes: [] as string[],
    colors: [] as string[],
    images: [] as string[]
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const cats = querySnapshot.docs.map(doc => doc.data().name);
      setCategories(cats);
      if (cats.length > 0 && !editingProduct) {
        setFormData(prev => ({ ...prev, category: cats[0] }));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, 'products'));
    setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);
    
    try {
      const uploadPromises = files.map(async (f) => {
        const file = f as File;
        const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });
      
      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        sizes: sizesInput.split(',').map(s => s.trim()).filter(s => s),
        colors: colorsInput.split(',').map(s => s.trim()).filter(s => s),
        status: formData.stock > 0 ? 'Available' : 'Out of Stock',
        createdAt: serverTimestamp()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        await addDoc(collection(db, 'products'), productData);
      }
      
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({
        name: '', category: categories[0] || '', description: '', price: 0, stock: 0,
        sizes: [], colors: [], images: []
      });
      setSizesInput('');
      setColorsInput('');
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      stock: product.stock,
      sizes: product.sizes,
      colors: product.colors,
      images: product.images
    });
    setSizesInput(product.sizes.join(', '));
    setColorsInput(product.colors.join(', '));
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex bg-brand-beige/30 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-grow p-16">
        <header className="mb-20">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-xs">Inventory</span>
            <div className="h-px flex-grow bg-black/5"></div>
          </div>
          <div className="flex justify-between items-end">
            <h1 className="text-6xl font-display font-bold uppercase tracking-tighter">Product Archive</h1>
            <div className="flex gap-6">
              <div className="relative w-80">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-ink/20" size={16} />
                <input 
                  type="text" 
                  placeholder="SEARCH PRODUCTS..." 
                  className="w-full bg-white border border-black/5 rounded-2xl pl-14 pr-6 py-4 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all shadow-2xl shadow-black/5"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({
                    name: '', category: categories[0] || '', description: '', price: 0, stock: 0,
                    sizes: [], colors: [], images: []
                  });
                  setSizesInput('');
                  setColorsInput('');
                  setIsModalOpen(true);
                }}
                className="premium-button-primary flex items-center gap-3 px-8 h-14 text-[10px] tracking-[0.2em]"
              >
                <Plus size={18} strokeWidth={2} /> ADD PRODUCT
              </button>
            </div>
          </div>
        </header>

        {/* Product Table */}
        <div className="bg-white rounded-[3rem] border border-black/5 overflow-hidden shadow-2xl shadow-black/5">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-beige/30 border-b border-black/5">
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Product</th>
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Category</th>
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Price</th>
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Stock</th>
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Status</th>
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-brand-beige/10 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 aspect-[3/4] rounded-xl overflow-hidden bg-brand-beige/50 flex-shrink-0">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-ink/10">
                            <Plus size={20} />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-tight">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-[10px] font-bold text-brand-ink/30 uppercase tracking-widest">{product.category}</td>
                  <td className="px-10 py-8 font-display font-bold text-lg tracking-tighter">৳{product.price.toLocaleString()}</td>
                  <td className="px-10 py-8 text-[10px] font-bold uppercase tracking-widest">{product.stock}</td>
                  <td className="px-10 py-8">
                    <span className={`text-[8px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border ${
                      product.stock > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {product.stock > 0 ? 'Available' : 'Sold Out'}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => openEditModal(product)} 
                        className="p-3 bg-brand-beige/30 text-brand-ink/40 hover:bg-brand-ink hover:text-white rounded-xl transition-all"
                      >
                        <Edit2 size={16} strokeWidth={1.5} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)} 
                        className="p-3 bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-32">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/20">No products found in archive</p>
            </div>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-brand-ink/60 backdrop-blur-md"
              ></motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 40 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl p-16 scrollbar-hide"
              >
                <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-3 hover:bg-brand-beige rounded-full transition-colors">
                  <X size={24} strokeWidth={1.5} />
                </button>

                <div className="mb-12">
                  <div className="flex items-baseline gap-4 mb-4">
                    <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px]">Product Details</span>
                    <div className="h-px flex-grow bg-black/5"></div>
                  </div>
                  <h2 className="text-4xl font-display font-bold uppercase tracking-tighter">{editingProduct ? 'Edit Archive' : 'New Entry'}</h2>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Product Name</label>
                      <input 
                        type="text" required 
                        className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all" 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Category</label>
                      <select 
                        className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all appearance-none" 
                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Description</label>
                      <textarea 
                        required rows={4} 
                        className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all resize-none" 
                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Price (৳)</label>
                        <input 
                          type="number" required 
                          className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all" 
                          value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Stock</label>
                        <input 
                          type="number" required 
                          className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all" 
                          value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Visuals</label>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {formData.images.map((url, idx) => (
                          url ? (
                            <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-black/5 shadow-lg">
                              <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <button 
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                                className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-xl"
                              >
                                <X size={10} strokeWidth={3} />
                              </button>
                            </div>
                          ) : null
                        ))}
                        <label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-black/10 flex flex-col items-center justify-center cursor-pointer hover:border-brand-gold hover:bg-brand-gold/5 transition-all group">
                          <Upload size={24} className="text-brand-ink/20 mb-2 group-hover:text-brand-gold transition-colors" strokeWidth={1.5} />
                          <span className="text-[8px] font-bold uppercase tracking-widest text-brand-ink/40">Add Image</span>
                          <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                        </label>
                      </div>
                      {isUploading && <p className="text-[10px] font-bold text-brand-gold animate-pulse uppercase tracking-widest">Processing Upload...</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Sizes (Comma Separated)</label>
                      <input 
                        type="text" 
                        className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all placeholder:text-brand-ink/20" 
                        placeholder="S, M, L, XL"
                        value={sizesInput} 
                        onChange={e => setSizesInput(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Colors (Comma Separated)</label>
                      <input 
                        type="text" 
                        className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all placeholder:text-brand-ink/20" 
                        placeholder="GOLD, SILVER, BLACK"
                        value={colorsInput} 
                        onChange={e => setColorsInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-12">
                    <button type="submit" className="w-full premium-button-primary h-20 text-sm tracking-[0.3em]">
                      {editingProduct ? 'UPDATE ARCHIVE' : 'ADD TO ARCHIVE'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminProducts;
