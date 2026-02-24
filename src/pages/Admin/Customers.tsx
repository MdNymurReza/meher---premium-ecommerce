import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile } from '../../types';
import { Search, User, Mail, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        setCustomers(querySnapshot.docs.map(doc => doc.data() as UserProfile));
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex bg-brand-beige/30 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-grow p-16">
        <header className="mb-20">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-xs">CRM</span>
            <div className="h-px flex-grow bg-black/5"></div>
          </div>
          <div className="flex justify-between items-end">
            <h1 className="text-6xl font-display font-bold uppercase tracking-tighter">Customer Archive</h1>
            <div className="relative w-80">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-ink/20" size={16} />
              <input 
                type="text" 
                placeholder="SEARCH CUSTOMERS..." 
                className="w-full bg-white border border-black/5 rounded-2xl pl-14 pr-6 py-4 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all shadow-2xl shadow-black/5"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="bg-white rounded-[3rem] border border-black/5 overflow-hidden shadow-2xl shadow-black/5">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-beige/30 border-b border-black/5">
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Member</th>
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Contact</th>
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Joined</th>
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Role</th>
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredCustomers.map((customer) => (
                <tr key={customer.uid} className="hover:bg-brand-beige/10 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-brand-ink text-white rounded-full flex items-center justify-center text-sm font-display font-bold shadow-xl shadow-brand-ink/10">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-tight">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-brand-ink/40 tracking-widest uppercase">
                      <Mail size={12} strokeWidth={2} />
                      {customer.email}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-brand-ink/40 tracking-widest uppercase">
                      <Calendar size={12} strokeWidth={2} />
                      {customer.createdAt?.toDate ? format(customer.createdAt.toDate(), 'MMM dd, yyyy') : 'Recent'}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border ${
                        customer.role === 'admin' ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20' : 'bg-brand-beige/50 text-brand-ink/40 border-black/5'
                      }`}>
                        {customer.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <span className="text-[8px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && !loading && (
            <div className="text-center py-32">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/20">No members found in archive</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminCustomers;
