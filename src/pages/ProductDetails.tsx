import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Review } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Heart, Share2, ChevronLeft, Star, MessageSquare, Send, Check, X, Shield, Truck, RotateCcw, ArrowRight } from 'lucide-react';
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

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : product?.rating || '0.0';

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
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-brand-ink border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <X size={32} className="text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Error</h1>
        <p className="text-gray-600 mb-8 max-w-md text-center">
          {error}
        </p>
        <button 
          onClick={() => navigate('/shop')}
          className="bg-brand-ink text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-ink transition-colors"
        >
          <ChevronLeft size={18} />
          Back to Shop
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100">
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={(product.images && product.images[activeImage]) ? product.images[activeImage] : 'https://picsum.photos/800/1000'} 
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
          </div>

          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-brand-ink' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{product.category}</span>
            <h1 className="text-3xl font-bold mt-1 text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-amber-400">
                <Star size={16} className="fill-current" />
                <span className="font-bold text-gray-900 text-sm">{averageRating}</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500 text-xs">{reviews.length} Reviews</span>
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <p className="text-2xl font-bold text-gray-900">৳{product.price?.toLocaleString()}</p>
            {product.stock < 5 && product.stock > 0 && (
              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded uppercase tracking-wider">Only {product.stock} left</span>
            )}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-6 pt-6 border-t border-gray-100">
            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Select Size</h3>
                  <button className="text-xs font-bold text-gray-400 hover:underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 flex items-center justify-center rounded-lg border transition-all font-bold text-sm ${selectedSize === size ? 'bg-brand-ink text-white border-brand-ink' : 'border-gray-200 hover:border-brand-ink'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Select Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border transition-all font-bold text-xs uppercase tracking-wider ${selectedColor === color ? 'bg-brand-ink text-white border-brand-ink' : 'border-gray-200 hover:border-brand-ink'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <div className="flex items-center bg-gray-50 rounded-lg px-3 h-12 border border-gray-200">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center text-lg hover:text-brand-ink">-</button>
                <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center text-lg hover:text-brand-ink">+</button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-grow h-12 rounded-lg font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all ${
                  added 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-brand-ink text-white hover:bg-gray-800'
                } disabled:bg-gray-200 disabled:cursor-not-allowed`}
              >
                {added ? (
                  <><Check size={18} /> Added to Cart</>
                ) : (
                  <><ShoppingCart size={18} /> {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}</>
                )}
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100">
            {[
              { icon: Truck, label: 'Fast Delivery' },
              { icon: Shield, label: 'Secure Payment' },
              { icon: RotateCcw, label: 'Easy Returns' }
            ].map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-1">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                  <badge.icon size={16} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            
            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-brand-ink">{averageRating}</span>
                <div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={14} className={i <= Math.round(Number(averageRating)) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Based on {reviews.length} reviews</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = reviews.filter(r => r.rating === stars).length;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="text-[10px] font-bold w-6">{stars} ★</span>
                      <div className="flex-grow h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-ink" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-[10px] font-medium text-gray-400 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-10">
            {/* Review Form */}
            {user ? (
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button 
                          key={i} type="button" 
                          onClick={() => setNewReview({...newReview, rating: i})}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star size={20} className={i <= newReview.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <textarea 
                      required rows={3}
                      placeholder="Share your experience..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm focus:ring-1 focus:ring-brand-ink outline-none transition-all resize-none"
                      value={newReview.comment}
                      onChange={e => setNewReview({...newReview, comment: e.target.value})}
                    />
                    <button 
                      type="submit" 
                      disabled={submittingReview}
                      className="mt-3 bg-brand-ink text-white px-6 py-2 rounded-lg font-bold text-xs tracking-wider hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-xl text-center border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm mb-2">Please sign in to write a review.</p>
                <Link to="/login" className="text-brand-ink font-bold text-sm hover:underline">Sign In Now</Link>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-400 text-xs">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-brand-ink font-bold text-xs">
                          {review.userName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900">{review.userName}</h4>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} size={8} className={i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {review.createdAt?.toDate ? format(review.createdAt.toDate(), 'MMM dd, yyyy') : 'Recent'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed">{review.comment}</p>
                  </div>
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
