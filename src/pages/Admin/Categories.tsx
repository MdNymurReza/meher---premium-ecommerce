import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Category } from '../../types';
import { Plus, Trash2, Layers, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setCategories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    try {
      await addDoc(collection(db, 'categories'), {
        name: newCategoryName.trim(),
        createdAt: serverTimestamp()
      });
      
      setIsModalOpen(false);
      setNewCategoryName('');
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? Products in this category will not be deleted but may not appear in filtered results.')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-grow p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Categories</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-ink text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-all"
          >
            <Plus size={16} /> Add Category
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-ink"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <motion.div 
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{category.name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Category</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-gray-400 hover:text-rose-500 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
            
            {categories.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <Layers size={32} className="mx-auto text-gray-200 mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">No categories found</p>
              </div>
            )}
          </div>
        )}

        {/* Create Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative bg-white w-full max-w-md rounded-xl overflow-hidden shadow-xl"
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">New Category</h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Category Name</label>
                      <input 
                        type="text" 
                        required 
                        autoFocus
                        className="input-field" 
                        placeholder="e.g. Accessories"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="w-full button-primary py-3">
                      Add Category
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminCategories;
