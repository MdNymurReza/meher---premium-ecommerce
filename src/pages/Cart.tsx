import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-brand-beige rounded-full flex items-center justify-center mb-8">
          <ShoppingBag size={40} className="text-brand-ink/20" />
        </div>
        <h1 className="text-3xl font-serif font-bold mb-4">Your cart is empty</h1>
        <p className="text-brand-ink/60 mb-8 max-w-md text-center">
          Looks like you haven't added anything to your cart yet. Explore our collections and find something you love.
        </p>
        <Link to="/shop" className="premium-button-primary">
          START SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-20">
        <div className="flex items-baseline gap-4 mb-4">
          <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-xs">Shopping Bag</span>
          <div className="h-px flex-grow bg-black/5"></div>
        </div>
        <h1 className="text-7xl font-display font-bold uppercase tracking-tighter">Your Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-8">
          {items.map((item, idx) => (
            <motion.div 
              key={`${item.productId}-${item.size}-${item.color}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-8 pb-8 border-b border-black/5 last:border-0"
            >
              <div className="w-32 aspect-[3/4] rounded-2xl overflow-hidden flex-shrink-0 bg-brand-beige/50">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              
              <div className="flex-grow flex flex-col justify-between py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-2">{item.name}</h3>
                    <div className="flex gap-6 text-[10px] font-bold text-brand-ink/40 uppercase tracking-[0.2em]">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                  </div>
                  <p className="text-lg font-light">৳{item.price.toLocaleString()}</p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center border border-black/10 rounded-xl overflow-hidden h-12 bg-white">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                      className="w-12 h-full hover:bg-black/5 transition-colors flex items-center justify-center"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center text-sm font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                      className="w-12 h-full hover:bg-black/5 transition-colors flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.productId, item.size, item.color)}
                    className="text-rose-500 hover:text-rose-600 transition-colors p-2 hover:bg-rose-50 rounded-full"
                  >
                    <Trash2 size={20} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white p-10 rounded-[2rem] border border-black/5 sticky top-32 shadow-2xl shadow-black/5">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-brand-gold mb-10">Order Summary</h2>
            
            <div className="space-y-6 mb-10">
              <div className="flex justify-between text-sm font-medium text-brand-ink/60">
                <span className="uppercase tracking-widest">Subtotal</span>
                <span>৳{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-brand-ink/60">
                <span className="uppercase tracking-widest">Shipping</span>
                <span className="text-emerald-600">{totalPrice > 5000 ? 'COMPLIMENTARY' : '৳120'}</span>
              </div>
              <div className="h-px bg-black/5"></div>
              <div className="flex justify-between font-bold text-2xl tracking-tighter">
                <span className="uppercase tracking-widest text-xs self-center">Total</span>
                <span>৳{(totalPrice + (totalPrice > 5000 ? 0 : 120)).toLocaleString()}</span>
              </div>
            </div>

            <Link to="/checkout" className="w-full premium-button-primary h-16 flex items-center justify-center gap-3 text-sm tracking-[0.2em]">
              CHECKOUT NOW <ArrowRight size={18} />
            </Link>

            <div className="mt-8 space-y-4">
              <p className="text-[10px] text-brand-ink/40 uppercase tracking-widest text-center">
                Secure Checkout Powered by Meher
              </p>
              <div className="flex justify-center gap-4 opacity-30 grayscale">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bkash_logo.png/1200px-Bkash_logo.png" alt="bKash" className="h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
