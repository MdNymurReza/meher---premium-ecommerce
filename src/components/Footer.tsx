import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="text-2xl font-bold tracking-tight">
              MEHER MALA
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your destination for handcrafted jewellery and premium apparel. Quality and style in every piece.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6">Shop</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><Link to="/shop?category=Jewellery" className="hover:text-white transition-colors">Jewellery</Link></li>
              <li><Link to="/shop?category=Women's Clothing" className="hover:text-white transition-colors">Women's</Link></li>
              <li><Link to="/shop?category=Men's Clothing" className="hover:text-white transition-colors">Men's</Link></li>
              <li><Link to="/shop?category=Kids Clothing" className="hover:text-white transition-colors">Kids</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6">Support</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><Link to="/profile" className="hover:text-white transition-colors">My Account</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">Subscribe to get special offers and updates.</p>
            <form 
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                (e.target as any).reset();
              }}
            >
              <input 
                type="email" 
                name="email"
                required
                placeholder="Email address" 
                className="bg-gray-800 border-none rounded-lg w-full py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-gray-700 transition-all"
              />
              <button type="submit" className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">
                JOIN
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs">
          <p>&copy; {new Date().getFullYear()} MEHER MALA. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
