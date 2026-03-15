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
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-grow p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Discounts</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-ink text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-all"
          >
            <Plus size={16} /> Create Code
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-ink"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discounts.map((discount) => (
              <motion.div 
                key={discount.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${discount.active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <Tag size={20} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleActive(discount.id, discount.active)}
                      className={`p-2 rounded-lg transition-all ${discount.active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                    >
                      {discount.active ? <Check size={14} /> : <X size={14} />}
                    </button>
                    <button 
                      onClick={() => handleDelete(discount.id)}
                      className="p-2 text-gray-400 hover:text-rose-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-1">{discount.code}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      {discount.type === 'percentage' ? `${discount.value}% OFF` : `৳${discount.value} OFF`}
                    </span>
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${discount.active ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {discount.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Min. Purchase</p>
                    <p className="text-xs font-bold">৳{discount.minPurchase?.toLocaleString() || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Type</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest">{discount.type}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {discounts.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <Tag size={32} className="mx-auto text-gray-200 mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">No active promotions</p>
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
                    <h2 className="text-lg font-bold">New Promo Code</h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Promo Code</label>
                      <input 
                        type="text" 
                        required 
                        className="input-field uppercase" 
                        placeholder="e.g. MEHER10"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Type</label>
                        <select 
                          className="input-field appearance-none" 
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value as 'percentage' | 'fixed'})}
                        >
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed Amount</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Value</label>
                        <input 
                          type="number" 
                          required 
                          className="input-field" 
                          value={formData.value}
                          onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Min. Purchase (৳)</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        value={formData.minPurchase}
                        onChange={(e) => setFormData({...formData, minPurchase: Number(e.target.value)})}
                      />
                    </div>

                    <button type="submit" className="w-full button-primary py-3">
                      Create Promotion
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
