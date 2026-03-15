import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, ArrowLeft, LogOut, Tag, Layers } from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Discounts', path: '/admin/discounts', icon: Tag },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0 flex flex-col">
      <div className="p-6 flex-grow">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-brand-ink transition-all mb-10 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="text-[10px] font-bold uppercase tracking-widest">Storefront</span>
        </Link>
        
        <div className="flex flex-col mb-10">
          <span className="text-xl font-bold text-brand-ink">MEHER MALA</span>
          <span className="text-[8px] font-bold tracking-widest text-gray-400 uppercase mt-1">Admin Panel</span>
        </div>
        
        <nav className="space-y-1">
          <p className="text-[8px] font-bold uppercase tracking-widest text-gray-300 mb-4 px-4">Main Menu</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${isActive ? 'bg-brand-ink text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-ink'}`}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-gray-100">
        <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Operator</p>
            <p className="text-[10px] font-bold truncate">Administrator</p>
          </div>
          <LogOut size={14} className="text-gray-400 group-hover:text-rose-500 transition-colors" />
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
