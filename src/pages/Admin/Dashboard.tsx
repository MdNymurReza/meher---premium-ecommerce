import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, Product } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, ShoppingBag, Package, DollarSign, Clock, ArrowUpRight, Plus, Users, Settings, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const productsSnap = await getDocs(collection(db, 'products'));
        const pendingSnap = await getDocs(query(collection(db, 'orders'), where('status', '==', 'Pending')));

        const orders = ordersSnap.docs.map(doc => doc.data() as Order);
        const revenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

        setStats({
          totalRevenue: revenue,
          totalOrders: ordersSnap.size,
          totalProducts: productsSnap.size,
          pendingOrders: pendingSnap.size
        });

        const recentQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
        const recentSnap = await getDocs(recentQ);
        setRecentOrders(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const data = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 2000 },
    { name: 'Apr', sales: 2780 },
    { name: 'May', sales: 1890 },
    { name: 'Jun', sales: 2390 },
  ];

  return (
    <div className="flex bg-brand-paper min-h-screen">
      <AdminSidebar />
      
      <main className="flex-grow p-12 lg:p-20 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20">
          <div>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px]">Management Console</span>
              <div className="h-px w-12 bg-brand-gold/30"></div>
            </div>
            <h1 className="text-6xl font-display font-bold uppercase tracking-tighter">Archive Intel</h1>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-3 bg-brand-ink text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-xl shadow-black/10">
              <Plus size={16} /> New Product
            </button>
            <button className="p-4 bg-brand-beige/30 rounded-2xl hover:bg-brand-beige transition-colors">
              <Settings size={20} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {[
            { label: 'Revenue', value: `৳${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+12.5%', color: 'text-emerald-600' },
            { label: 'Orders', value: stats.totalOrders, icon: ShoppingBag, trend: '+8.2%', color: 'text-brand-gold' },
            { label: 'Inventory', value: stats.totalProducts, icon: Package, trend: '-2.4%', color: 'text-brand-ink' },
            { label: 'Customers', value: '1,284', icon: Users, trend: '+15.1%', color: 'text-indigo-600' },
          ].map((stat, idx) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-2xl shadow-black/5 group hover:border-brand-gold transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-10">
                <div className={`w-14 h-14 bg-brand-beige/30 ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                  <ArrowUpRight size={12} /> {stat.trend}
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/30 mb-2">{stat.label}</p>
              <h3 className="text-4xl font-display font-bold tracking-tighter">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Chart Section */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-12 rounded-[3.5rem] border border-black/5 shadow-2xl shadow-black/5">
              <div className="flex justify-between items-center mb-16">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-brand-gold mb-2">Revenue Analytics</h3>
                  <p className="text-2xl font-display font-bold uppercase tracking-tight">Performance Overview</p>
                </div>
                <div className="flex gap-4">
                  {['Weekly', 'Monthly', 'Yearly'].map(period => (
                    <button key={period} className={`text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-xl transition-all ${period === 'Monthly' ? 'bg-brand-ink text-white' : 'bg-brand-beige/30 text-brand-ink/40 hover:bg-brand-beige'}`}>
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C5A059" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999', fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999', fontWeight: 'bold' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.1)', padding: '20px' }}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#C5A059" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="lg:col-span-4 space-y-12">
            {/* Recent Orders */}
            <div className="bg-white p-12 rounded-[3.5rem] border border-black/5 shadow-2xl shadow-black/5">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-brand-gold">Live Feed</h3>
                <button className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/30 hover:text-brand-ink">View All</button>
              </div>
              <div className="space-y-10">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-6 group cursor-pointer">
                    <div className="w-14 h-14 bg-brand-beige/30 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-gold group-hover:text-white transition-all duration-500">
                      <ShoppingBag size={20} strokeWidth={1.5} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-bold uppercase tracking-tight truncate mb-1">{order.customerName}</p>
                      <p className="text-[10px] font-bold text-brand-ink/30 tracking-widest">৳{order.totalPrice.toLocaleString()} • {order.status}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight size={14} className="text-brand-gold" />
                    </div>
                  </div>
                ))}
                {recentOrders.length === 0 && (
                  <div className="text-center py-20">
                    <Clock size={32} className="mx-auto text-brand-ink/10 mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-ink/20">Awaiting activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-brand-ink p-12 rounded-[3.5rem] text-white shadow-2xl shadow-black/20">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-brand-gold mb-8">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate('/admin/categories')}
                  className="flex flex-col items-center justify-center gap-4 p-6 bg-white/5 rounded-3xl hover:bg-white/10 transition-all border border-white/5"
                >
                  <Layers size={20} className="text-brand-gold" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Categories</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-4 p-6 bg-white/5 rounded-3xl hover:bg-white/10 transition-all border border-white/5">
                  <Users size={20} className="text-brand-gold" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Customers</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
