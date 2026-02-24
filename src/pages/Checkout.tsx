import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { CheckCircle2, CreditCard, Truck, ShieldCheck } from 'lucide-react';

const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: '',
    address: '',
    paymentMethod: 'COD' as 'COD' | 'bKash',
    transactionId: ''
  });

  const shippingCost = totalPrice > 5000 ? 0 : 100;
  const finalTotal = totalPrice + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const rawOrderData = {
        userId: user.uid,
        customerName: formData.name || 'Guest',
        email: user.email || '',
        products: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || '',
          color: item.color || '',
          image: item.image || ''
        })),
        totalPrice: finalTotal,
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId || '',
        address: formData.address || '',
        phone: formData.phone || '',
        status: 'Pending' as const,
        createdAt: serverTimestamp()
      };

      // 1. Save to Firestore
      const orderRef = await addDoc(collection(db, 'orders'), rawOrderData);

      // 2. Update stock for each product
      for (const item of items) {
        const productRef = doc(db, 'products', item.productId);
        await updateDoc(productRef, {
          stock: increment(-item.quantity)
        });
      }

      // 3. Sync to Google Sheets via our Express backend
      // Use a clean object for sync (no Firestore FieldValues)
      const syncData = {
        id: orderRef.id,
        customerName: rawOrderData.customerName,
        email: rawOrderData.email,
        phone: rawOrderData.phone,
        address: rawOrderData.address,
        products: rawOrderData.products,
        totalPrice: rawOrderData.totalPrice,
        paymentMethod: rawOrderData.paymentMethod,
        status: rawOrderData.status,
        date: new Date().toLocaleString()
      };

      await fetch('/api/orders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncData)
      });

      setOrderComplete(true);
      clearCart();
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h1 className="text-4xl font-serif font-bold mb-4 text-center">Order Confirmed!</h1>
        <p className="text-brand-ink/60 mb-12 max-w-md text-center">
          Thank you for shopping with Meher. Your order has been placed successfully and is being processed.
        </p>
        <div className="flex gap-4">
          <button onClick={() => navigate('/profile')} className="premium-button-primary">
            VIEW ORDER HISTORY
          </button>
          <button onClick={() => navigate('/shop')} className="premium-button-outline">
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-20">
        <div className="flex items-baseline gap-4 mb-4">
          <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-xs">Secure</span>
          <div className="h-px flex-grow bg-black/5"></div>
        </div>
        <h1 className="text-7xl font-display font-bold uppercase tracking-tighter">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Shipping Info */}
        <div className="lg:col-span-8 space-y-12">
          <section className="bg-white p-10 rounded-[2rem] border border-black/5 shadow-2xl shadow-black/5">
            <div className="flex items-center gap-4 mb-10">
              <Truck className="text-brand-gold" size={24} strokeWidth={1.5} />
              <h2 className="text-xl font-bold uppercase tracking-tight">Delivery Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-brand-beige/20 border-none rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  className="w-full bg-brand-beige/20 border-none rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all" 
                  placeholder="01XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Detailed Address</label>
                <textarea 
                  required 
                  rows={3}
                  className="w-full bg-brand-beige/20 border-none rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all resize-none" 
                  placeholder="House #, Road #, Area, City"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-10 rounded-[2rem] border border-black/5 shadow-2xl shadow-black/5">
            <div className="flex items-center gap-4 mb-10">
              <CreditCard className="text-brand-gold" size={24} strokeWidth={1.5} />
              <h2 className="text-xl font-bold uppercase tracking-tight">Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className={`flex items-center justify-between p-8 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'COD' ? 'border-brand-gold bg-brand-gold/5' : 'border-black/5 hover:border-brand-gold/20'}`}>
                <div className="flex items-center gap-4">
                  <input 
                    type="radio" 
                    name="payment" 
                    className="accent-brand-gold w-5 h-5"
                    checked={formData.paymentMethod === 'COD'}
                    onChange={() => setFormData({...formData, paymentMethod: 'COD'})}
                  />
                  <div>
                    <span className="font-bold block uppercase tracking-tight">Cash on Delivery</span>
                    <span className="text-[10px] text-brand-ink/40 uppercase tracking-widest font-bold">Pay at your door</span>
                  </div>
                </div>
              </label>

              <label className={`flex flex-col p-8 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'bKash' ? 'border-brand-gold bg-brand-gold/5' : 'border-black/5 hover:border-brand-gold/20'}`}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="payment" 
                      className="accent-brand-gold w-5 h-5"
                      checked={formData.paymentMethod === 'bKash'}
                      onChange={() => setFormData({...formData, paymentMethod: 'bKash'})}
                    />
                    <div>
                      <span className="font-bold block uppercase tracking-tight">bKash Manual</span>
                      <span className="text-[10px] text-brand-ink/40 uppercase tracking-widest font-bold">Send to: 01700000000</span>
                    </div>
                  </div>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bkash_logo.png/1200px-Bkash_logo.png" alt="bKash" className="h-6" />
                </div>
                
                {formData.paymentMethod === 'bKash' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-8 pt-8 border-t border-black/5"
                  >
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Transaction ID</label>
                    <input 
                      type="text" 
                      required={formData.paymentMethod === 'bKash'}
                      className="w-full bg-white border border-black/10 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all" 
                      placeholder="Enter bKash TrxID"
                      value={formData.transactionId}
                      onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                    />
                  </motion.div>
                )}
              </label>
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white p-10 rounded-[2rem] border border-black/5 sticky top-32 shadow-2xl shadow-black/5">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-brand-gold mb-10">Your Order</h2>
            
            <div className="space-y-6 mb-10 max-h-80 overflow-y-auto pr-4 scrollbar-hide">
              {items.map(item => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-6">
                  <div className="w-16 aspect-[3/4] rounded-xl overflow-hidden bg-brand-beige/50 flex-shrink-0">
                    <img src={item.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow py-1">
                    <h4 className="text-xs font-bold uppercase tracking-tight line-clamp-1 mb-1">{item.name}</h4>
                    <p className="text-[10px] font-bold text-brand-ink/40 uppercase tracking-widest">{item.quantity} × ৳{item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6 mb-10 border-t border-black/5 pt-10">
              <div className="flex justify-between text-sm font-medium text-brand-ink/60">
                <span className="uppercase tracking-widest">Subtotal</span>
                <span>৳{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-brand-ink/60">
                <span className="uppercase tracking-widest">Shipping</span>
                <span className="text-emerald-600">{shippingCost === 0 ? 'COMPLIMENTARY' : `৳${shippingCost}`}</span>
              </div>
              <div className="h-px bg-black/5"></div>
              <div className="flex justify-between font-bold text-2xl tracking-tighter">
                <span className="uppercase tracking-widest text-xs self-center">Total</span>
                <span>৳{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full premium-button-primary h-16 flex items-center justify-center gap-3 text-sm tracking-[0.2em]"
            >
              {loading ? 'PROCESSING...' : 'CONFIRM ORDER'}
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-brand-ink/40 uppercase tracking-widest">
              <ShieldCheck size={14} /> 100% Secure Checkout
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
