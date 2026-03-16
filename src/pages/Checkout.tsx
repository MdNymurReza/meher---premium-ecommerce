import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, CreditCard, Truck, ShieldCheck, Tag, X, Copy, Check } from 'lucide-react';
import { Discount } from '../types';

const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const bkashNumber = "01700000000";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bkashNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  const [orderComplete, setOrderComplete] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: '',
    address: '',
    paymentMethod: 'COD' as 'COD' | 'bKash',
    transactionId: ''
  });

  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [checkingDiscount, setCheckingDiscount] = useState(false);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setCheckingDiscount(true);
    setDiscountError('');
    
    try {
      const q = query(collection(db, 'discounts'), where('code', '==', discountCode.toUpperCase()), where('active', '==', true));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setDiscountError('Invalid or expired code');
      } else {
        const discount = { id: snap.docs[0].id, ...snap.docs[0].data() } as Discount;
        if (discount.minPurchase && totalPrice < discount.minPurchase) {
          setDiscountError(`Minimum purchase of ৳${discount.minPurchase} required`);
        } else {
          setAppliedDiscount(discount);
          setDiscountCode('');
        }
      }
    } catch (error) {
      console.error("Error checking discount:", error);
      setDiscountError('Failed to verify code');
    } finally {
      setCheckingDiscount(false);
    }
  };

  const discountAmount = appliedDiscount 
    ? (appliedDiscount.type === 'percentage' 
        ? (totalPrice * appliedDiscount.value) / 100 
        : appliedDiscount.value)
    : 0;

  const shippingCost = totalPrice > 5000 ? 0 : 100;
  const finalTotal = totalPrice - discountAmount + shippingCost;

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
        subtotal: totalPrice,
        discountCode: appliedDiscount?.code || null,
        discountAmount: discountAmount,
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
          className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 size={40} />
        </motion.div>
        <h1 className="text-2xl font-bold mb-2 text-center">Order Confirmed!</h1>
        <p className="text-gray-500 mb-8 max-w-md text-center">
          Thank you for shopping with Meher Mala. Your order has been placed successfully.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => navigate('/profile')} className="bg-brand-ink text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
            View Order History
          </button>
          <button onClick={() => navigate('/shop')} className="border border-gray-200 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Shipping Info */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Truck className="text-brand-ink" size={20} />
              <h2 className="text-lg font-bold">Shipping Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-2">Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-brand-ink outline-none transition-all" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-brand-ink outline-none transition-all" 
                  placeholder="01XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-2">Detailed Address</label>
                <textarea 
                  required 
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-brand-ink outline-none transition-all resize-none" 
                  placeholder="House #, Road #, Area, City"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="text-brand-ink" size={20} />
              <h2 className="text-lg font-bold">Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${formData.paymentMethod === 'COD' ? 'border-brand-ink bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="payment" 
                    className="accent-brand-ink w-4 h-4"
                    checked={formData.paymentMethod === 'COD'}
                    onChange={() => setFormData({...formData, paymentMethod: 'COD'})}
                  />
                  <div>
                    <span className="font-bold block text-sm">Cash on Delivery</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Pay when you receive</span>
                  </div>
                </div>
              </label>

              <label className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all ${formData.paymentMethod === 'bKash' ? 'border-brand-ink bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment" 
                      className="accent-brand-ink w-4 h-4"
                      checked={formData.paymentMethod === 'bKash'}
                      onChange={() => setFormData({...formData, paymentMethod: 'bKash'})}
                    />
                    <div>
                      <span className="font-bold block text-sm">bKash Manual</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">Send to: 01700000000</span>
                    </div>
                  </div>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bkash_logo.png/1200px-Bkash_logo.png" alt="bKash" className="h-4" />
                </div>
                
                {formData.paymentMethod === 'bKash' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <div className="bg-brand-ink/5 p-3 rounded-lg mb-4">
                      <p className="text-[10px] text-gray-600 leading-relaxed">
                        Please send the total amount to the number below using <span className="font-bold">Send Money</span>.
                      </p>
                      <div className="flex items-center justify-between mt-2 bg-white p-2 rounded border border-brand-ink/10">
                        <span className="text-xs font-bold font-mono">{bkashNumber}</span>
                        <button 
                          type="button"
                          onClick={copyToClipboard}
                          className="text-brand-ink hover:text-gray-600 transition-colors"
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Transaction ID</label>
                    <input 
                      type="text" 
                      required={formData.paymentMethod === 'bKash'}
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-brand-ink outline-none transition-all" 
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
          <div className="bg-gray-50 p-6 rounded-xl sticky top-24">
            <h2 className="text-lg font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {items.map(item => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-4">
                  <div className="w-12 aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <img src={item.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow py-0.5">
                    <h4 className="text-xs font-bold line-clamp-1 mb-0.5">{item.name}</h4>
                    <p className="text-[10px] text-gray-500">{item.quantity} × ৳{item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6 border-t border-gray-200 pt-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>৳{totalPrice.toLocaleString()}</span>
              </div>
              
              {/* Discount Section */}
              <div className="space-y-2">
                {appliedDiscount ? (
                  <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <Tag size={12} className="text-emerald-600" />
                      <div>
                        <p className="text-[10px] font-bold text-emerald-600">{appliedDiscount.code}</p>
                        <p className="text-[8px] text-emerald-600/60 font-bold">
                          {appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}% OFF` : `৳${appliedDiscount.value} OFF`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-600">-৳{discountAmount.toLocaleString()}</span>
                      <button onClick={() => setAppliedDiscount(null)} className="text-emerald-600 hover:text-emerald-800"><X size={12} /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="PROMO CODE" 
                      className="flex-grow bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-ink"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    />
                    <button 
                      type="button"
                      onClick={handleApplyDiscount}
                      disabled={checkingDiscount || !discountCode}
                      className="bg-brand-ink text-white px-4 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {checkingDiscount ? '...' : 'APPLY'}
                    </button>
                  </div>
                )}
                {discountError && <p className="text-[10px] font-bold text-rose-500 ml-2">{discountError}</p>}
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-medium">{shippingCost === 0 ? 'Free' : `৳${shippingCost}`}</span>
              </div>
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>৳{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-ink text-white h-12 rounded-lg font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
