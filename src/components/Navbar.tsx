import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Heart, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          {/* Desktop Menu Left */}
          <div className="hidden md:flex items-center space-x-10">
            <Link to="/shop" className="text-[10px] font-bold tracking-[0.3em] hover:text-brand-gold transition-colors uppercase">The Collection</Link>
            <Link to="/shop?category=Jewellery" className="text-[10px] font-bold tracking-[0.3em] hover:text-brand-gold transition-colors uppercase">Jewellery</Link>
          </div>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex flex-col items-center px-2">
            <span className="text-2xl md:text-3xl font-display font-bold tracking-tighter text-brand-ink leading-none">MEHER</span>
            <span className="text-[6px] md:text-[8px] font-bold tracking-[0.5em] text-brand-gold uppercase mt-1">Mala</span>
          </Link>
 
          {/* Desktop Menu Right */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin" className="p-2 hover:text-brand-gold transition-colors" title="Admin Dashboard">
                  <LayoutDashboard size={18} strokeWidth={1.5} />
                </Link>
              )}
              <Link to="/wishlist" className="p-2 hover:text-brand-gold transition-colors">
                <Heart size={18} strokeWidth={1.5} />
              </Link>
              <Link to="/cart" className="p-2 hover:text-brand-gold transition-colors relative">
                <ShoppingCart size={18} strokeWidth={1.5} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      key={totalItems}
                      className="absolute top-1 right-1 bg-brand-gold text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link to="/profile" className="p-2 hover:text-brand-gold transition-colors">
                    <User size={18} strokeWidth={1.5} />
                  </Link>
                  <button onClick={handleLogout} className="p-2 hover:text-rose-500 transition-colors">
                    <LogOut size={18} strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-[10px] font-bold tracking-[0.3em] hover:text-brand-gold transition-colors uppercase ml-4">Login</Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 relative w-10 h-10 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-white border-b border-black/5 overflow-hidden"
          >
            <div className="pb-6 px-4 space-y-4 pt-2">
              <Link to="/" className="block text-lg font-medium" onClick={() => setIsOpen(false)}>Home</Link>
              <Link to="/shop" className="block text-lg font-medium" onClick={() => setIsOpen(false)}>Shop</Link>
              <Link to="/wishlist" className="block text-lg font-medium" onClick={() => setIsOpen(false)}>Wishlist</Link>
              <Link to="/cart" className="block text-lg font-medium" onClick={() => setIsOpen(false)}>Cart ({totalItems})</Link>
              {user ? (
                <>
                  <Link to="/profile" className="block text-lg font-medium" onClick={() => setIsOpen(false)}>Profile</Link>
                  {isAdmin && <Link to="/admin" className="block text-lg font-medium" onClick={() => setIsOpen(false)}>Admin Dashboard</Link>}
                  <button onClick={handleLogout} className="block text-lg font-medium text-red-500">Logout</button>
                </>
              ) : (
                <Link to="/login" className="block text-lg font-medium" onClick={() => setIsOpen(false)}>Login</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
