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
    totalCustomers: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const productsSnap = await getDocs(collection(db, 'products'));
        const usersSnap = await getDocs(collection(db, 'users'));
        const pendingSnap = await getDocs(query(collection(db, 'orders'), where('status', '==', 'Pending')));

        const orders = ordersSnap.docs.map(doc => doc.data() as Order);
        const revenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

        setStats({
          totalRevenue: revenue,
          totalOrders: ordersSnap.size,
          totalProducts: productsSnap.size,
          totalCustomers: usersSnap.size,
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
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-grow p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-500 text-sm">Overview of your store's performance</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/admin/products')}
              className="flex items-center gap-2 bg-brand-ink text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-all"
            >
              <Plus size={16} /> New Product
            </button>
            <button 
              onClick={() => navigate('/admin/settings')}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings size={18} className="text-gray-600" />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Revenue', value: `৳${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Inventory', value: stats.totalProducts.toLocaleString(), icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Customers', value: stats.totalCustomers.toLocaleString(), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ].map((stat, idx) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
              <h3 className="text-xl font-bold">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-bold">Revenue Analytics</h3>
                <div className="flex gap-2">
                  {['Weekly', 'Monthly', 'Yearly'].map(period => (
                    <button key={period} className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${period === 'Monthly' ? 'bg-brand-ink text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#1A1A1A" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="lg:col-span-4 space-y-8">
            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold">Recent Orders</h3>
                <button onClick={() => navigate('/admin/orders')} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-brand-ink">View All</button>
              </div>
              <div className="space-y-6">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/admin/orders')}>
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-brand-ink group-hover:text-white transition-all">
                      <ShoppingBag size={18} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-bold truncate mb-0.5">{order.customerName}</p>
                      <p className="text-[10px] text-gray-500">৳{order.totalPrice.toLocaleString()} • {order.status}</p>
                    </div>
                    <ArrowUpRight size={14} className="text-gray-300 group-hover:text-brand-ink transition-colors" />
                  </div>
                ))}
                {recentOrders.length === 0 && (
                  <div className="text-center py-12">
                    <Clock size={24} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-brand-ink p-6 rounded-xl text-white shadow-lg shadow-black/10">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigate('/admin/categories')}
                  className="flex flex-col items-center justify-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/5"
                >
                  <Layers size={18} className="text-gray-300" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Categories</span>
                </button>
                <button 
                  onClick={() => navigate('/admin/settings')}
                  className="flex flex-col items-center justify-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/5"
                >
                  <Settings size={18} className="text-gray-300" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Settings</span>
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
