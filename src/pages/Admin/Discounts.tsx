import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Discount } from '../../types';
import { Plus, Trash2, Tag, Check, X, Percent, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AdminDiscounts: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minPurchase: 0,
    active: true
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'discounts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setDiscounts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Discount)));
    } catch (error) {
      console.error("Error fetching discounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const discountData = {
        ...formData,
        code: formData.code.toUpperCase(),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'discounts'), discountData);
      
      setIsModalOpen(false);
      setFormData({
        code: '', type: 'percentage', value: 0, minPurchase: 0, active: true
      });
      fetchDiscounts();
    } catch (error) {
      console.error("Error saving discount:", error);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'discounts', id), { active: !currentStatus });
      fetchDiscounts();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this promo code?')) {
      try {
        await deleteDoc(doc(db, 'discounts', id));
        fetchDiscounts();
      } catch (error) {
        console.error("Error deleting discount:", error);
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
              <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px]">Promotions</span>
              <div className="h-px w-12 bg-brand-gold/30"></div>
            </div>
            <h1 className="text-6xl font-display font-bold uppercase tracking-tighter">Promo Codes</h1>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 bg-brand-ink text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-xl shadow-black/10"
          >
            <Plus size={16} /> Create Code
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {discounts.map((discount) => (
              <motion.div 
                key={discount.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-2xl shadow-black/5 relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150 ${discount.active ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                
                <div className="flex justify-between items-start mb-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${discount.active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <Tag size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleActive(discount.id, discount.active)}
                      className={`p-3 rounded-xl transition-all ${discount.active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                    >
                      {discount.active ? <Check size={16} /> : <X size={16} />}
                    </button>
                    <button 
                      onClick={() => handleDelete(discount.id)}
                      className="p-3 bg-brand-beige/30 text-brand-ink/40 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-2">{discount.code}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/30">
                      {discount.type === 'percentage' ? `${discount.value}% OFF` : `৳${discount.value} OFF`}
                    </span>
                    <div className="h-px w-6 bg-brand-ink/10"></div>
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${discount.active ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {discount.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="pt-8 border-t border-black/5 flex justify-between items-center">
                  <div>
                    <p className="text-[8px] font-bold text-brand-ink/30 uppercase tracking-widest mb-1">Min. Purchase</p>
                    <p className="text-sm font-bold tracking-tight">৳{discount.minPurchase?.toLocaleString() || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-brand-ink/30 uppercase tracking-widest mb-1">Type</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest">{discount.type}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {discounts.length === 0 && (
              <div className="col-span-full py-40 text-center">
                <Tag size={48} className="mx-auto text-brand-ink/10 mb-6" strokeWidth={1} />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/20">No active promotions</p>
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
                className="relative bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl"
              >
                <div className="p-12">
                  <div className="flex justify-between items-center mb-12">
                    <h2 className="text-3xl font-display font-bold uppercase tracking-tighter">New Promo Code</h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-4 bg-brand-beige/30 rounded-2xl hover:bg-brand-beige transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Promo Code</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all uppercase" 
                        placeholder="E.G. MEHER10"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Discount Type</label>
                        <div className="flex bg-brand-beige/20 p-1.5 rounded-2xl">
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, type: 'percentage'})}
                            className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.type === 'percentage' ? 'bg-white text-brand-ink shadow-sm' : 'text-brand-ink/40'}`}
                          >
                            <Percent size={14} /> Percentage
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, type: 'fixed'})}
                            className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.type === 'fixed' ? 'bg-white text-brand-ink shadow-sm' : 'text-brand-ink/40'}`}
                          >
                            <DollarSign size={14} /> Fixed
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Value</label>
                        <input 
                          type="number" 
                          required 
                          className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all" 
                          value={formData.value}
                          onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Min. Purchase Amount (৳)</label>
                      <input 
                        type="number" 
                        className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all" 
                        value={formData.minPurchase}
                        onChange={(e) => setFormData({...formData, minPurchase: Number(e.target.value)})}
                      />
                    </div>

                    <button type="submit" className="w-full premium-button-primary h-16 text-[10px] tracking-[0.3em] mt-8">
                      CREATE PROMOTION
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

export default AdminDiscounts;
