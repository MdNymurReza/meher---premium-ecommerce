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
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={32} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 max-w-md text-center">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link to="/shop" className="bg-brand-ink text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div 
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100"
            >
              <div className="w-20 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              
              <div className="flex-grow flex flex-col justify-between py-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{item.name}</h3>
                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                  </div>
                  <p className="font-bold text-sm">৳{item.price.toLocaleString()}</p>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-8">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                      className="w-8 h-full hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                      className="w-8 h-full hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.productId, item.size, item.color)}
                    className="text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-4">
          <div className="bg-gray-50 p-6 rounded-xl sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>৳{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-medium">{totalPrice > 5000 ? 'Free' : '৳100'}</span>
              </div>
              <div className="h-px bg-gray-200 my-1"></div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>৳{(totalPrice + (totalPrice > 5000 ? 0 : 100)).toLocaleString()}</span>
              </div>
            </div>

            <Link to="/checkout" className="w-full bg-brand-ink text-white h-12 flex items-center justify-center gap-2 rounded-lg font-bold hover:bg-gray-800 transition-all">
              Checkout Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
