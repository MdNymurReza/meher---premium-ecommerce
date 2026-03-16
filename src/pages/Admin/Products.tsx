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
  const [imageUrlInput, setImageUrlInput] = useState('');

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
      setImageUrlInput('');
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

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setFormData(prev => ({ ...prev, images: [...prev.images, imageUrlInput.trim()] }));
      setImageUrlInput('');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-grow p-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Products</h1>
            <div className="flex gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-brand-ink outline-none transition-all"
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
                  setImageUrlInput('');
                  setIsModalOpen(true);
                }}
                className="bg-brand-ink text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>
          </div>
        </header>

        {/* Product Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Product</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Price</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Stock</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Plus size={16} />
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-bold">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{product.category}</td>
                    <td className="px-6 py-4 font-bold text-sm">৳{product.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border ${
                        product.stock > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {product.stock > 0 ? 'Available' : 'Sold Out'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(product)} 
                          className="p-2 text-gray-400 hover:text-brand-ink transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)} 
                          className="p-2 text-gray-400 hover:text-rose-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">No products found</p>
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
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              ></motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-8 lg:p-12"
              >
                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>

                <div className="mb-8">
                  <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Product Name</label>
                      <input 
                        type="text" required 
                        className="input-field" 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Category</label>
                      <select 
                        className="input-field appearance-none" 
                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Description</label>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Supports Markdown</span>
                      </div>
                      <textarea 
                        required rows={8} 
                        className="input-field resize-none font-mono text-xs" 
                        placeholder="Use markdown for formatting. Example:
**Bold Text**
- Bullet point 1
- Bullet point 2"
                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Price (৳)</label>
                        <input 
                          type="number" required 
                          className="input-field" 
                          value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Stock</label>
                        <input 
                          type="number" required 
                          className="input-field" 
                          value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Images</label>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {formData.images.map((url, idx) => (
                          <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                            <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button 
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                              className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full shadow-lg"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        <label className="aspect-[3/4] rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-brand-ink hover:bg-gray-50 transition-all group">
                          <Upload size={20} className="text-gray-300 mb-1 group-hover:text-brand-ink transition-colors" />
                          <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Upload</span>
                          <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                        </label>
                      </div>
                      {isUploading && <p className="text-[10px] font-bold text-brand-ink animate-pulse uppercase tracking-widest">Uploading...</p>}
                      
                      <div className="mt-4">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Or Image URL</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            className="input-field py-2" 
                            placeholder="https://example.com/image.jpg"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                          />
                          <button 
                            type="button"
                            onClick={handleAddImageUrl}
                            className="bg-brand-ink text-white px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Sizes (Comma Separated)</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="S, M, L, XL"
                        value={sizesInput} 
                        onChange={e => setSizesInput(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Colors (Comma Separated)</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Gold, Silver, Black"
                        value={colorsInput} 
                        onChange={e => setColorsInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-6">
                    <button type="submit" className="w-full button-primary py-4">
                      {editingProduct ? 'Update Product' : 'Add Product'}
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
