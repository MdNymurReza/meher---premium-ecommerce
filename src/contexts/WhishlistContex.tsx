import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setWishlist(doc.data().wishlist || []);
      }
    });

    return unsubscribe;
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      alert('Please login to add items to your wishlist');
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const isItemInWishlist = wishlist.includes(productId);

    try {
      if (isItemInWishlist) {
        await updateDoc(userRef, {
          wishlist: arrayRemove(productId)
        });
      } else {
        await updateDoc(userRef, {
          wishlist: arrayUnion(productId)
        });
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
