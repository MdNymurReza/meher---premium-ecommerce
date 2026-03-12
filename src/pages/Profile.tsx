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
      <div className="mb-20">
        <div className="flex items-baseline gap-4 mb-4">
          <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-xs">Member Archive</span>
          <div className="h-px flex-grow bg-black/5"></div>
        </div>
        <h1 className="text-7xl font-display font-bold uppercase tracking-tighter">Your Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* User Info */}
        <div className="lg:col-span-4">
          <div className="bg-white p-12 rounded-[3rem] border border-black/5 shadow-2xl shadow-black/5 sticky top-32">
            <div className="w-32 h-32 bg-brand-ink text-white rounded-full flex items-center justify-center text-4xl font-display font-bold mb-8 mx-auto shadow-2xl shadow-brand-ink/20">
              {profile?.name.charAt(0)}
            </div>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">{profile?.name}</h2>
              <p className="text-brand-ink/40 text-[10px] font-bold uppercase tracking-[0.2em]">{profile?.email}</p>
            </div>
            
            <div className="space-y-6 pt-10 border-t border-black/5">
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-brand-ink/60">
                <Calendar size={16} className="text-brand-gold" strokeWidth={1.5} />
                <span>Joined {profile?.createdAt?.toDate ? format(profile.createdAt.toDate(), 'MMMM yyyy') : 'Recently'}</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-brand-ink/60">
                <ShoppingBag size={16} className="text-brand-gold" strokeWidth={1.5} />
                <span>{orders.length} Orders in Archive</span>
              </div>
              <Link to="/wishlist" className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-brand-ink/60 hover:text-brand-gold transition-colors">
                <Heart size={16} className="text-brand-gold" strokeWidth={1.5} />
                <span>{profile?.wishlist?.length || 0} Saved Pieces</span>
              </Link>
            </div>

            <button className="w-full premium-button-outline h-14 mt-12 text-[10px] tracking-[0.2em]">
              EDIT ARCHIVE
            </button>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-8">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-xl font-bold uppercase tracking-tight">Order History</h2>
            <div className="h-px flex-grow bg-black/5"></div>
          </div>
          
          {orders.length === 0 ? (
            <div className="bg-white p-20 rounded-[3rem] border border-black/5 text-center shadow-2xl shadow-black/5">
              <Package size={48} className="mx-auto text-brand-ink/10 mb-6" strokeWidth={1} />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/40">Your archive is currently empty</p>
            </div>
          ) : (
            <div className="space-y-10">
              {orders.map((order, idx) => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-[2.5rem] border border-black/5 overflow-hidden shadow-2xl shadow-black/5"
                >
                  <div className="px-10 py-8 bg-brand-beige/20 border-b border-black/5 flex flex-wrap justify-between items-center gap-6">
                    <span className="text-[10px] font-mono font-bold text-brand-ink/30 uppercase tracking-widest">Order #{order.id.slice(-8)}</span>
                    <div className="flex items-center gap-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest">{order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM dd, yyyy') : 'Recent'}</span>
                      <span className={`text-[8px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border ${
                        order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        order.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        order.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-10">
                    <div className="space-y-6 mb-10">
                      {order.products.map((item, i) => (
                        <div key={i} className="flex items-center gap-6">
                          <div className="w-16 aspect-[3/4] rounded-xl overflow-hidden bg-brand-beige/50 flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-brand-ink/10">
                                <Package size={20} />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-xs font-bold uppercase tracking-tight mb-1">{item.name}</h4>
                            <p className="text-[10px] font-bold text-brand-ink/40 uppercase tracking-widest">
                              {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`} | Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-bold tracking-tight">৳{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    {order.status !== 'Cancelled' && (
                      <div className="mb-12 px-4">
                        <OrderTrackingTimeline status={order.status} />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-black/5">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">
                          <MapPin size={14} className="text-brand-gold" strokeWidth={1.5} /> {order.address}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">
                          <Phone size={14} className="text-brand-gold" strokeWidth={1.5} /> {order.phone}
                        </div>
                        {order.discountCode && (
                          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                            <Tag size={14} strokeWidth={1.5} /> Promo: {order.discountCode} (-৳{order.discountAmount?.toLocaleString()})
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end justify-center">
                        {order.discountAmount && order.discountAmount > 0 && (
                          <p className="text-[10px] font-bold text-brand-ink/30 uppercase tracking-[0.2em] mb-1 line-through">৳{order.subtotal?.toLocaleString()}</p>
                        )}
                        <p className="text-[8px] font-bold text-brand-ink/30 uppercase tracking-[0.3em] mb-1">Total Amount</p>
                        <p className="text-3xl font-display font-bold tracking-tighter text-brand-gold">৳{order.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
