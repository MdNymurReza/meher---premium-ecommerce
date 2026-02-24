import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrderItem, Product } from '../types';

interface CartItem extends OrderItem {}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number, size?: string, color?: string) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id && i.size === size && i.color === color);
      if (existing) {
        return prev.map(i => 
          (i.productId === product.id && i.size === size && i.color === color)
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        size,
        color,
        image: product.images[0]
      }];
    });
  };

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.size === size && i.color === color)));
  };

  const updateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setItems(prev => prev.map(i => 
      (i.productId === productId && i.size === size && i.color === color)
        ? { ...i, quantity }
        : i
    ));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
