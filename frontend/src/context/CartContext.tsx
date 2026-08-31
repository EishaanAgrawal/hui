import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartResponse, CartItem } from '../types';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartResponse | null;
  loading: boolean;
  itemCount: number;
  addToCart: (productId: string, quantity?: number, purchaseType?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  toastMessage: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  const addToCart = async (productId: string, quantity: number = 1, purchaseType: string = 'NORMAL') => {
    if (!isAuthenticated) {
      showToast('Please sign in to add items to your cart.');
      return;
    }
    try {
      const updatedCart = await cartApi.addItem(productId, quantity, purchaseType);
      setCart(updatedCart);
      showToast('Added to fresh cart! 🌾');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      showToast(msg);
      throw err;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const updatedCart = await cartApi.updateItem(itemId, quantity);
      setCart(updatedCart);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update item';
      showToast(msg);
      throw err;
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const updatedCart = await cartApi.removeItem(itemId);
      setCart(updatedCart);
      showToast('Item removed from cart');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to remove item';
      showToast(msg);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      setCart(null);
      showToast('Cart cleared');
    } catch (err: any) {
      console.error('Failed to clear cart:', err);
    }
  };

  const itemCount = cart?.itemCount || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
        toastMessage,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-400"></span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
