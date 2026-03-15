import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, OrderStatus } from '../../types';
import { Search, Eye, CheckCircle, Truck, Package, XCircle, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    } catch (error) {
      console.error("Error fetching orders with orderBy:", error);
      try {
        const qSimple = query(collection(db, 'orders'));
        const querySnapshot = await getDocs(qSimple);
        const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        fetchedOrders.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return dateB - dateA;
        });
        setOrders(fetchedOrders);
      } catch (innerError) {
        console.error("Error fetching orders without orderBy:", innerError);
      }
    } finally {
      setLoading(false);
    }
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
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-grow p-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Orders</h1>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-brand-ink outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Order ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Total</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Payment</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">#{order.id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{order.customerName}</span>
                        <span className="text-[10px] text-gray-500">{order.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM dd, yyyy') : 'Recent'}
                    </td>
                    <td className="px-6 py-4 font-bold text-sm">৳{order.totalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest">{order.paymentMethod}</span>
                        {order.transactionId && <span className="text-[8px] font-bold text-brand-ink/40 uppercase tracking-widest mt-1">Trx: {order.transactionId}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-400 hover:text-brand-ink transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <select 
                          className="bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 focus:ring-1 focus:ring-brand-ink outline-none cursor-pointer transition-all"
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && !loading && (
            <div className="text-center py-20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">No orders found</p>
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative bg-white w-full max-w-2xl rounded-xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold">Order Details</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">#{selectedOrder.id.toUpperCase()}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-8">
                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Customer Information</h3>
                      <div className="space-y-2">
                        <p className="text-xs font-bold">{selectedOrder.customerName}</p>
                        <p className="text-xs text-gray-600">{selectedOrder.phone}</p>
                        <p className="text-xs text-gray-600">{selectedOrder.address}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Order Summary</h3>
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600 flex justify-between">
                          <span>Payment Method:</span>
                          <span className="font-bold text-brand-ink uppercase">{selectedOrder.paymentMethod}</span>
                        </p>
                        {selectedOrder.transactionId && (
                          <p className="text-xs text-gray-600 flex justify-between">
                            <span>Transaction ID:</span>
                            <span className="font-bold text-brand-ink">{selectedOrder.transactionId}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-600 flex justify-between">
                          <span>Status:</span>
                          <span className="font-bold text-brand-ink uppercase">{selectedOrder.status}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {selectedOrder.products.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                          <div className="w-12 aspect-[3/4] bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-xs font-bold">{item.name}</h4>
                            <p className="text-[10px] text-gray-500 mt-1">
                              {item.size && `Size: ${item.size}`} {item.color && ` • Color: ${item.color}`}
                            </p>
                            <p className="text-[10px] text-gray-500">Qty: {item.quantity} × ৳{item.price.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold">৳{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="bg-gray-50 p-6 rounded-xl space-y-3">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Subtotal</span>
                      <span>৳{(selectedOrder.totalPrice - (selectedOrder.shippingCost || 0)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Shipping</span>
                      <span>৳{(selectedOrder.shippingCost || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-3 border-t border-gray-200">
                      <span>Total</span>
                      <span>৳{selectedOrder.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="px-6 py-2 border border-gray-200 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                  >
                    Close
                  </button>
                  <select 
                    className="bg-brand-ink text-white rounded-lg text-[10px] font-bold uppercase tracking-widest px-4 py-2 outline-none cursor-pointer transition-all"
                    value={selectedOrder.status}
                    onChange={(e) => {
                      updateStatus(selectedOrder.id, e.target.value as OrderStatus);
                      setSelectedOrder({...selectedOrder, status: e.target.value as OrderStatus});
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminOrders;
