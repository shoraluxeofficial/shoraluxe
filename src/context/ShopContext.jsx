import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { productsData as fallbackProducts } from '../data/products';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);

  // Cart State
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('shoraluxe_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch products from Supabase
  const fetchProducts = async () => {
    // If env vars are missing, we stay on fallback data
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn('Supabase keys missing. Using local fallback data.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      
      // Normalize data: Map snake_case from DB back to camelCase for the App
      const normalizedData = (data || []).map(p => ({
        ...p,
        originalPrice: p.original_price,
        skinType: p.skin_type,
        howToUse: p.how_to_use,
        bestFor: p.best_for,
        reviewsCount: p.reviews_count,
        isNew: p.is_new,
        isBestseller: p.is_bestseller,
        isSale: p.is_sale,
      }));

      if (normalizedData.length > 0) {
        setProducts(normalizedData);
      } else {
        setProducts([]); 
      }
    } catch (error) {
      console.error('Error fetching products:', error.message);
      // Stay with fallbackProducts already in state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Sync cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('shoraluxe_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Actions: Cart
  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) return;
    setCartItems(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity: newQty } : item
    ));
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Actions: Admin Database (Supabase)
  const addProduct = async (newProduct) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select();

      if (error) throw error;
      setProducts(prev => [data[0], ...prev]);
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error adding product:', error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error.message);
      return { success: false, error: error.message };
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updatedData)
        .eq('id', id)
        .select();

      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === id ? data[0] : p));
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error updating product:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Popup Ad State
  const [popupConfig, setPopupConfig] = useState(() => {
    const saved = localStorage.getItem('shoraluxe_popup_config');
    return saved ? JSON.parse(saved) : {
      active: true,
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800',
      title: 'Exclusive Launch 🎁',
      subtitle: 'Unlock 20% off your entire first skincare routine right now!',
      buttonText: 'Claim Offer',
      link: '/#products'
    };
  });

  const updatePopupConfig = (config) => {
    setPopupConfig(config);
    localStorage.setItem('shoraluxe_popup_config', JSON.stringify(config));
  };

  return (
    <ShopContext.Provider value={{
      products,
      loading,
      fetchProducts,
      addProduct,
      deleteProduct,
      updateProduct,
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      isCartOpen,
      setIsCartOpen,
      cartTotal,
      cartCount,
      popupConfig,
      updatePopupConfig
    }}>
      {children}
    </ShopContext.Provider>
  );
};
