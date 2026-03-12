import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { Package, MapPin, Phone, Calendar, ShoppingBag, ChevronRight, Clock, CheckCircle, Truck, XCircle, Tag, Heart } from 'lucide-react';
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

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'), 
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
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
          <h2 className="text-lg font-bold mb-6">Order History</h2>
          
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
                      <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                        order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 
                        order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                        order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      {order.products.map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-10 aspect-[3/4] rounded overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Package size={14} />
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <MapPin size={12} className="text-gray-400" /> {order.address}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <Phone size={12} className="text-gray-400" /> {order.phone}
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-xl font-bold text-brand-ink">৳{order.totalPrice.toLocaleString()}</p>
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
