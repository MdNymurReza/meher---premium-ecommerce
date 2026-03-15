import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { Package, MapPin, Phone, Calendar, ShoppingBag, ChevronRight, Clock, CheckCircle, Truck, XCircle, Tag, Heart, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import OrderTrackingTimeline from '../components/OrderTrackingTimeline';

const Profile: React.FC = () => {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <span className="status-pending"><Clock size={12} /> Pending</span>;
      case 'Confirmed': return <span className="status-confirmed"><CheckCircle size={12} /> Confirmed</span>;
      case 'Shipped': return <span className="status-shipped"><Truck size={12} /> Shipped</span>;
      case 'Delivered': return <span className="status-delivered"><Package size={12} /> Delivered</span>;
      case 'Cancelled': return <span className="status-cancelled"><XCircle size={12} /> Cancelled</span>;
      default: return <span className="status-badge bg-gray-50 text-gray-600">{status}</span>;
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Try with orderBy first
      const q = query(
        collection(db, 'orders'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    } catch (error: any) {
      console.error("Error fetching orders with orderBy:", error);
      // If it fails (likely due to missing index), try without orderBy and sort in memory
      try {
        const qSimple = query(
          collection(db, 'orders'), 
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(qSimple);
        const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        // Sort in memory
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

  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* User Info */}
        <div className="lg:col-span-4">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 sticky top-24">
            <div className="w-20 h-20 bg-brand-ink text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
              {profile?.name.charAt(0)}
            </div>
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">{profile?.name}</h2>
              <p className="text-gray-500 text-xs">{profile?.email}</p>
            </div>
            
            <div className="space-y-3 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                <span>Joined {profile?.createdAt?.toDate ? format(profile.createdAt.toDate(), 'MMMM yyyy') : 'Recently'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <ShoppingBag size={16} className="text-gray-400" />
                <span>{orders.length} Orders</span>
              </div>
              <Link to="/wishlist" className="flex items-center gap-3 text-xs text-gray-600 hover:text-brand-ink transition-colors">
                <Heart size={16} className="text-gray-400" />
                <span>{profile?.wishlist?.length || 0} Saved Items</span>
              </Link>
            </div>

            <button className="w-full border border-gray-200 h-10 mt-6 rounded-lg text-xs font-bold hover:bg-gray-100 transition-all">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Order History</h2>
            <button 
              onClick={fetchOrders}
              className="p-2 text-gray-400 hover:text-brand-ink transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          
          {orders.length === 0 ? (
            <div className="bg-gray-50 p-12 rounded-xl text-center border border-gray-100">
              <Package size={40} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-sm">You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div 
                  key={order.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
                >
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order #{order.id.slice(-8).toUpperCase()}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM dd, yyyy') : 'Recent'}</span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Order Timeline */}
                    <div className="mb-10 px-2">
                      <div className="flex items-center gap-2 mb-6">
                        <Clock size={14} className="text-gray-400" />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order Tracking</h3>
                      </div>
                      <OrderTrackingTimeline status={order.status} />
                    </div>

                    <div className="space-y-4 mb-8">
                      {order.products.map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-12 aspect-[3/4] rounded overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Package size={16} />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-xs font-bold mb-0.5">{item.name}</h4>
                            <p className="text-[10px] text-gray-500">
                              {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`} | Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-xs font-bold">৳{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin size={14} className="text-gray-400 mt-0.5" />
                          <div className="text-[10px] text-gray-600 leading-relaxed">
                            <p className="font-bold text-gray-900 mb-0.5">Shipping Address</p>
                            {order.address}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone size={14} className="text-gray-400" />
                          <div className="text-[10px] text-gray-600">
                            <p className="font-bold text-gray-900 mb-0.5">Contact Number</p>
                            {order.phone}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Tag size={14} className="text-gray-400" />
                          <div className="text-[10px] text-gray-600">
                            <p className="font-bold text-gray-900 mb-0.5">Payment Method</p>
                            {order.paymentMethod} {order.transactionId && `(${order.transactionId})`}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-end">
                        <div className="text-right space-y-1">
                          <div className="flex justify-end gap-8 text-[10px] text-gray-500">
                            <span>Subtotal</span>
                            <span>৳{order.subtotal?.toLocaleString() || order.totalPrice.toLocaleString()}</span>
                          </div>
                          {order.discountAmount && (
                            <div className="flex justify-end gap-8 text-[10px] text-rose-500">
                              <span>Discount</span>
                              <span>-৳{order.discountAmount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-end gap-8 pt-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total</span>
                            <span className="text-2xl font-bold text-brand-ink">৳{order.totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
