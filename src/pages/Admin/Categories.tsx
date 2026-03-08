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
    <div className="flex bg-brand-paper min-h-screen">
      <AdminSidebar />
      
      <main className="flex-grow p-12 lg:p-20 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20">
          <div>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px]">Taxonomy</span>
              <div className="h-px w-12 bg-brand-gold/30"></div>
            </div>
            <h1 className="text-6xl font-display font-bold uppercase tracking-tighter">Categories</h1>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 bg-brand-ink text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-xl shadow-black/10"
          >
            <Plus size={16} /> Add Category
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <motion.div 
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-2xl shadow-black/5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-brand-beige/30 text-brand-gold rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layers size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">{category.name}</h3>
                    <p className="text-[8px] font-bold text-brand-ink/30 uppercase tracking-widest mt-1">Archive Segment</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(category.id)}
                  className="p-3 bg-brand-beige/30 text-brand-ink/40 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
            
            {categories.length === 0 && (
              <div className="col-span-full py-40 text-center">
                <Layers size={48} className="mx-auto text-brand-ink/10 mb-6" strokeWidth={1} />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/20">No categories defined in archive</p>
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
                className="absolute inset-0 bg-brand-ink/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl"
              >
                <div className="p-12">
                  <div className="flex justify-between items-center mb-12">
                    <h2 className="text-3xl font-display font-bold uppercase tracking-tighter">New Category</h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-4 bg-brand-beige/30 rounded-2xl hover:bg-brand-beige transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Category Name</label>
                      <input 
                        type="text" 
                        required 
                        autoFocus
                        className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all" 
                        placeholder="E.G. ACCESSORIES"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="w-full premium-button-primary h-16 text-[10px] tracking-[0.3em] mt-8">
                      ADD TO ARCHIVE
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
