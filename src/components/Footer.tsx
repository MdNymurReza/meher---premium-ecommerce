import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-ink text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
          {/* Brand */}
          <div className="md:col-span-5 space-y-8">
            <Link to="/" className="flex flex-col">
              <span className="text-4xl font-display font-bold tracking-tighter leading-none">MEHER</span>
              <span className="text-[10px] font-bold tracking-[0.6em] text-brand-gold uppercase mt-2">Mala — Archive</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm font-light">
              Crafting timeless elegance for the modern soul. Our collections are a testament to heritage, blending traditional craftsmanship with contemporary vision.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-white/40 hover:text-brand-gold transition-colors"><Instagram size={18} strokeWidth={1.5} /></a>
              <a href="#" className="text-white/40 hover:text-brand-gold transition-colors"><Facebook size={18} strokeWidth={1.5} /></a>
              <a href="#" className="text-white/40 hover:text-brand-gold transition-colors"><Twitter size={18} strokeWidth={1.5} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold mb-8">Collections</h3>
            <ul className="space-y-4 text-white/40 text-xs font-medium tracking-widest uppercase">
              <li><Link to="/shop?category=Jewellery" className="hover:text-white transition-colors">Jewellery</Link></li>
              <li><Link to="/shop?category=Women's Clothing" className="hover:text-white transition-colors">Women's</Link></li>
              <li><Link to="/shop?category=Men's Clothing" className="hover:text-white transition-colors">Men's</Link></li>
              <li><Link to="/shop?category=Kids Clothing" className="hover:text-white transition-colors">Kids</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="md:col-span-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold mb-8">Service</h3>
            <ul className="space-y-4 text-white/40 text-xs font-medium tracking-widest uppercase">
              <li><Link to="/profile" className="hover:text-white transition-colors">Account</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shipping</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Returns</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Privacy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold mb-8">Stay Informed</h3>
            <p className="text-white/40 text-xs mb-6 leading-relaxed">Join our inner circle for exclusive previews and archival updates.</p>
            <form 
              className="relative"
              onSubmit={(e) => {
                e.preventDefault();
                const email = (e.target as any).email.value;
                if (email) {
                  alert(`Thank you! ${email} has been added to our archive list.`);
                  (e.target as any).reset();
                }
              }}
            >
              <input 
                type="email" 
                name="email"
                required
                placeholder="EMAIL ADDRESS" 
                className="bg-transparent border-b border-white/10 w-full py-3 text-[10px] font-bold tracking-widest outline-none focus:border-brand-gold transition-colors placeholder:text-white/20"
              />
              <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-widest text-brand-gold hover:text-white transition-colors">
                SIGN UP
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-white/20 text-[10px] font-bold tracking-[0.2em] uppercase">
          <p>&copy; {new Date().getFullYear()} MEHER MALA. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
