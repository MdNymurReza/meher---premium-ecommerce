import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, ArrowLeft, LogOut, Tag } from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Discounts', path: '/admin/discounts', icon: Tag },
    { name: 'Customers', path: '/admin/customers', icon: Users },
  ];

  return (
    <aside className="w-80 bg-white border-r border-black/5 min-h-screen sticky top-0 flex flex-col">
      <div className="p-10 flex-grow">
        <Link to="/" className="flex items-center gap-3 text-brand-ink/30 hover:text-brand-ink transition-all mb-16 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Storefront</span>
        </Link>
        
        <div className="flex flex-col mb-20">
          <span className="text-3xl font-display font-bold tracking-tighter text-brand-ink leading-none">MEHER</span>
          <span className="text-[8px] font-bold tracking-[0.5em] text-brand-gold uppercase mt-2">Management Console</span>
        </div>
        
        <nav className="space-y-4">
          <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-brand-ink/20 mb-6 ml-6">Main Menu</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-6 py-5 rounded-2xl transition-all duration-500 group ${isActive ? 'bg-brand-ink text-white shadow-2xl shadow-brand-ink/20' : 'text-brand-ink/40 hover:bg-brand-beige/50 hover:text-brand-ink'}`}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className={isActive ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-16 space-y-4">
          <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-brand-ink/20 mb-6 ml-6">System</p>
          <Link
            to="/admin/settings"
            className="flex items-center gap-4 px-6 py-5 rounded-2xl text-brand-ink/40 hover:bg-brand-beige/50 hover:text-brand-ink transition-all duration-500 group"
          >
            <Settings size={18} strokeWidth={1.5} className="group-hover:text-brand-gold transition-colors" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Settings</span>
          </Link>
        </div>
      </div>

      <div className="p-10 border-t border-black/5">
        <div className="p-6 bg-brand-beige/30 rounded-3xl border border-black/5 flex items-center justify-between group cursor-pointer hover:bg-brand-beige transition-colors">
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-brand-ink/30 mb-1">Operator</p>
            <p className="text-[10px] font-bold uppercase tracking-widest truncate">Administrator</p>
          </div>
          <LogOut size={14} className="text-brand-ink/20 group-hover:text-rose-500 transition-colors" />
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
