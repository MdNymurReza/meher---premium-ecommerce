import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Review } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Heart, Share2, ChevronLeft, Star, MessageSquare, Send, Check, X, Shield, Truck, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, profile } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!id) return;
      
      try {
        setError(null);
        // Fetch Product
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Product;
          setProduct({ id: docSnap.id, ...data });
          if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
          if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
        } else {
          setError("Product not found in archive.");
        }

        // Fetch Reviews
        try {
          const reviewsQuery = query(
            collection(db, 'reviews'),
            where('productId', '==', id),
            orderBy('createdAt', 'desc')
          );
          const reviewsSnap = await getDocs(reviewsQuery);
          setReviews(reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
        } catch (reviewError: any) {
          console.error("Error fetching reviews (likely permissions or index):", reviewError);
          // Don't block the whole page if reviews fail, but log it
        }
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError(err.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !id) return;
    setSubmittingReview(true);
    try {
      const reviewData = {
        productId: id,
        userId: user.uid,
        userName: profile.name,
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'reviews'), reviewData);
      setNewReview({ rating: 5, comment: '' });
      // Refresh reviews
      const reviewsQuery = query(collection(db, 'reviews'), where('productId', '==', id), orderBy('createdAt', 'desc'));
      const reviewsSnap = await getDocs(reviewsQuery);
      setReviews(reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
    } catch (err: any) {
      console.error("Error submitting review:", err);
      if (err.code === 'permission-denied') {
        alert("Permission denied: You might not have permission to post reviews. Please contact support.");
      } else {
        alert("Failed to submit review. Please try again.");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-paper">
      <div className="w-12 h-12 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-brand-paper">
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-8">
          <X size={40} className="text-rose-500" />
        </div>
        <h1 className="text-3xl font-display font-bold uppercase tracking-tighter mb-4">Archive Error</h1>
        <p className="text-brand-ink/60 mb-8 max-w-md text-center font-light">
          {error}
        </p>
        <button 
          onClick={() => navigate('/shop')}
          className="premium-button-primary px-12 h-14 text-[10px] tracking-[0.2em]"
        >
          RETURN TO SHOP
        </button>
      </div>
    );
  }

  if (!product) return <div className="min-h-screen flex items-center justify-center bg-brand-paper">Product not found</div>;

  return (
    <div className="bg-brand-paper min-h-screen pb-32">
      {/* Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 hover:text-brand-ink transition-colors">
          <ChevronLeft size={16} /> BACK TO ARCHIVE
        </button>
        <div className="flex gap-6">
          <button className="p-3 hover:bg-brand-beige/50 rounded-full transition-colors"><Heart size={18} strokeWidth={1.5} /></button>
          <button className="p-3 hover:bg-brand-beige/50 rounded-full transition-colors"><Share2 size={18} strokeWidth={1.5} /></button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-24">
        {/* Image Gallery */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden bg-brand-beige/30 shadow-2xl shadow-black/5">
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                src={(product.images && product.images[activeImage]) ? product.images[activeImage] : 'https://picsum.photos/800/1000'} 
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                {product.images.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`h-1 transition-all duration-500 rounded-full ${activeImage === idx ? 'w-12 bg-white' : 'w-4 bg-white/40'}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-6">
            {product.images?.map((img, idx) => (
              img ? (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-500 ${activeImage === idx ? 'border-brand-gold opacity-100' : 'border-transparent opacity-40 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ) : null
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-5 space-y-16">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">{product.category}</span>
                <div className="h-px w-12 bg-brand-gold/30"></div>
              </div>
              <div className="flex items-center gap-1.5 bg-brand-beige/50 px-3 py-1.5 rounded-full">
                <Star size={12} className="text-brand-gold fill-brand-gold" />
                <span className="text-[10px] font-bold">{product.rating || '4.8'}</span>
                <span className="text-[10px] text-brand-ink/30 font-bold uppercase tracking-widest ml-1">({reviews?.length || 0})</span>
              </div>
            </div>
            <h1 className="text-7xl font-display font-bold uppercase tracking-tighter leading-[0.85]">{product.name}</h1>
            <div className="flex items-baseline gap-6">
              <p className="text-5xl font-light text-brand-ink">৳{product.price?.toLocaleString() || 0}</p>
              {product.stock < 5 && product.stock > 0 && (
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full">Only {product.stock} left</span>
              )}
            </div>
          </div>

          <div className="prose prose-sm text-brand-ink/60 leading-relaxed font-light text-lg">
            <p>{product.description}</p>
          </div>

          <div className="space-y-12">
            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Select Size</h3>
                  <button className="text-[10px] font-bold uppercase tracking-widest text-brand-gold underline underline-offset-4">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-4">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[64px] h-16 flex items-center justify-center rounded-2xl border transition-all font-bold text-sm ${selectedSize === size ? 'bg-brand-ink text-white border-brand-ink shadow-xl' : 'border-black/5 hover:border-brand-gold'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 mb-6">Select Color</h3>
                <div className="flex flex-wrap gap-4">
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-8 h-16 flex items-center justify-center rounded-2xl border transition-all font-bold text-xs uppercase tracking-widest ${selectedColor === color ? 'bg-brand-ink text-white border-brand-ink shadow-xl' : 'border-black/5 hover:border-brand-gold'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex gap-6 pt-8">
              <div className="flex items-center bg-brand-beige/30 rounded-2xl px-4 h-20">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-xl font-light hover:text-brand-gold transition-colors">-</button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-xl font-light hover:text-brand-gold transition-colors">+</button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-grow premium-button-primary h-20 text-sm tracking-[0.3em] flex items-center justify-center gap-4 group"
              >
                {added ? (
                  <><Check size={20} /> ADDED TO CART</>
                ) : (
                  <>
                    <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" /> 
                    {product.stock === 0 ? 'SOLD OUT' : 'ADD TO ARCHIVE'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-black/5">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-beige/50 flex items-center justify-center text-brand-gold">
                <Truck size={20} strokeWidth={1.5} />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest leading-tight">Fast <br /> Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-beige/50 flex items-center justify-center text-brand-gold">
                <Shield size={20} strokeWidth={1.5} />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest leading-tight">Secure <br /> Payment</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-beige/50 flex items-center justify-center text-brand-gold">
                <RotateCcw size={20} strokeWidth={1.5} />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest leading-tight">Easy <br /> Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-48">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          <div className="lg:col-span-4 space-y-12">
            <div>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px]">Feedback</span>
                <div className="h-px w-12 bg-brand-gold/30"></div>
              </div>
              <h2 className="text-5xl font-display font-bold uppercase tracking-tighter">Customer <br /> Reviews</h2>
            </div>
            
            <div className="bg-brand-beige/30 p-10 rounded-[2.5rem] space-y-8">
              <div className="flex items-center gap-6">
                <span className="text-7xl font-display font-bold text-brand-gold">{product.rating || '4.8'}</span>
                <div>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={16} className={i <= Math.round(product.rating || 4.8) ? 'text-brand-gold fill-brand-gold' : 'text-brand-ink/10'} />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Based on {reviews.length} reviews</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = reviews.filter(r => r.rating === stars).length;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-4">
                      <span className="text-[10px] font-bold w-4">{stars}</span>
                      <div className="flex-grow h-1.5 bg-black/5 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-gold transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-brand-ink/30 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-16">
            {/* Review Form */}
            {user ? (
              <div className="glass-card p-12">
                <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-8">Share your experience</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-8">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Your Rating</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button 
                          key={i} type="button" 
                          onClick={() => setNewReview({...newReview, rating: i})}
                          className="p-1 hover:scale-125 transition-transform"
                        >
                          <Star size={24} className={i <= newReview.rating ? 'text-brand-gold fill-brand-gold' : 'text-brand-ink/10'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <textarea 
                      required rows={4}
                      placeholder="TELL US WHAT YOU THINK..."
                      className="w-full bg-brand-beige/20 border-none rounded-3xl px-8 py-6 text-sm font-medium focus:ring-4 focus:ring-brand-gold/5 outline-none transition-all resize-none placeholder:text-brand-ink/20"
                      value={newReview.comment}
                      onChange={e => setNewReview({...newReview, comment: e.target.value})}
                    />
                    <button 
                      type="submit" 
                      disabled={submittingReview}
                      className="absolute bottom-6 right-6 w-14 h-14 bg-brand-ink text-white rounded-2xl flex items-center justify-center hover:bg-brand-gold transition-all duration-500 disabled:opacity-50"
                    >
                      {submittingReview ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send size={20} />}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-brand-beige/30 p-12 rounded-[2.5rem] text-center">
                <p className="text-sm font-light text-brand-ink/60 mb-8">Please sign in to share your thoughts with the community.</p>
                <Link to="/login" className="premium-button-outline px-12 h-14 inline-flex items-center justify-center text-[10px] tracking-[0.2em]">SIGN IN TO REVIEW</Link>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-12">
              {reviews.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-black/5 rounded-[3rem]">
                  <MessageSquare size={40} className="mx-auto text-brand-ink/10 mb-6" strokeWidth={1} />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/20">Be the first to leave a review</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    key={review.id} 
                    className="group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-brand-beige flex items-center justify-center text-brand-gold font-display font-bold text-xl">
                          {review.userName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-tight mb-1">{review.userName}</h4>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} size={10} className={i <= review.rating ? 'text-brand-gold fill-brand-gold' : 'text-brand-ink/10'} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-brand-ink/20 uppercase tracking-widest">
                        {review.createdAt?.toDate ? format(review.createdAt.toDate(), 'MMM dd, yyyy') : 'Recent'}
                      </span>
                    </div>
                    <p className="text-brand-ink/60 font-light leading-relaxed pl-18">{review.comment}</p>
                    <div className="h-px w-full bg-black/5 mt-12"></div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
