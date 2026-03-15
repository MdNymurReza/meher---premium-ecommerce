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
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-grow p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Customers</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-brand-ink outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Member</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Joined</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.uid} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand-ink text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <span className="text-xs font-bold">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                        <Mail size={12} />
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                        <Calendar size={12} />
                        {customer.createdAt?.toDate ? format(customer.createdAt.toDate(), 'MMM dd, yyyy') : 'Recent'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border ${
                        customer.role === 'admin' ? 'bg-brand-ink text-white border-brand-ink' : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                        {customer.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredCustomers.length === 0 && !loading && (
            <div className="text-center py-20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">No members found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminCustomers;
