import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, OrderStatus } from '../../types';
import { Search, Eye, CheckCircle, Truck, Package, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return <span className="status-pending"><Clock size={12} /> Pending</span>;
      case 'Confirmed': return <span className="status-confirmed"><CheckCircle size={12} /> Confirmed</span>;
      case 'Shipped': return <span className="status-shipped"><Truck size={12} /> Shipped</span>;
      case 'Delivered': return <span className="status-delivered"><Package size={12} /> Delivered</span>;
      case 'Cancelled': return <span className="status-cancelled"><XCircle size={12} /> Cancelled</span>;
      default: return <span className="status-badge bg-gray-50 text-gray-600">{status}</span>;
    }
  };

  return (
    <div className="flex bg-brand-beige/30 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-grow p-16">
        <header className="mb-20">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-xs">Fulfillment</span>
            <div className="h-px flex-grow bg-black/5"></div>
          </div>
          <div className="flex justify-between items-end">
            <h1 className="text-6xl font-display font-bold uppercase tracking-tighter">Order Archive</h1>
            <div className="relative w-80">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-ink/20" size={16} />
              <input 
                type="text" 
                placeholder="SEARCH BY NAME OR ID..." 
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
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Order ID</th>
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Customer</th>
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Date</th>
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Total</th>
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Payment</th>
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Status</th>
                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-brand-beige/10 transition-colors group">
                  <td className="px-10 py-8">
                    <span className="text-[10px] font-mono font-bold text-brand-ink/30 uppercase tracking-widest">#{order.id.slice(-8)}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-tight">{order.customerName}</span>
                      <span className="text-[10px] font-bold text-brand-ink/30 tracking-widest">{order.phone}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-[10px] font-bold text-brand-ink/40 uppercase tracking-widest">
                    {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM dd, yyyy') : 'Recent'}
                  </td>
                  <td className="px-10 py-8 font-display font-bold text-lg tracking-tighter">৳{order.totalPrice.toLocaleString()}</td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest">{order.paymentMethod}</span>
                      {order.transactionId && <span className="text-[8px] font-bold text-brand-gold uppercase tracking-[0.2em] mt-1">Trx: {order.transactionId}</span>}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`text-[8px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border ${
                      order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      order.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                      order.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <select 
                      className="bg-brand-beige/50 border-none rounded-xl text-[8px] font-bold uppercase tracking-widest px-4 py-2 focus:ring-2 focus:ring-brand-gold/20 outline-none cursor-pointer transition-all"
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && !loading && (
            <div className="text-center py-32">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/20">No orders found in archive</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminOrders;
