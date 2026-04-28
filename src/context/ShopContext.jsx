import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { productsData as fallbackProducts } from '../data/products';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);

  // Auth State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shoraluxe_user');
    return (saved && saved !== 'undefined') ? JSON.parse(saved) : null;
  });

  // Cart State
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('shoraluxe_cart');
    return (saved && saved !== 'undefined') ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const normalizeProduct = (p) => ({
    ...p,
    originalPrice: p.original_price,
    skinType: p.skin_type,
    howToUse: p.how_to_use,
    bestFor: p.best_for,
    reviewsCount: p.reviews_count,
    isNew: p.is_new,
    isBestseller: p.is_bestseller,
    isSale: p.is_sale,
    netQuantity: p.net_quantity,
    idealFor: p.ideal_for,
    cautions: p.cautions,
    promoCode: p.promo_group,
    promoPrice: p.price
  });

  // Fetch products from Supabase
  const fetchProducts = async (isBackground = false) => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn('Supabase keys missing. Using local fallback data.');
      if (!isBackground) setLoading(false);
      return;
    }

    try {
      if (!isBackground) setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setProducts(data.map(normalizeProduct));
      } else {
        setProducts(fallbackProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error.message);
      setProducts(fallbackProducts);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const subscription = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Sync cart to LocalStorage AND Supabase Cloud
  useEffect(() => {
    localStorage.setItem('shoraluxe_cart', JSON.stringify(cartItems));

    // Sync to Cloud if user is logged in
    const syncCloudCart = async () => {
      if (user && user.id) {
        try {
          // Attempt to update - will fail gracefully if SQL script hasn't been run yet
          await supabase.from('users').update({ cart_items: cartItems }).eq('id', user.id);
        } catch (err) {
          console.error("Cloud cart sync failed:", err);
        }
      }
    };

    const timeout = setTimeout(syncCloudCart, 500);
    return () => clearTimeout(timeout);
  }, [cartItems, user]);

  // Fetch Cloud Cart on Login
  useEffect(() => {
    const fetchCloudCart = async () => {
      if (user && user.id) {
        try {
          const { data, error } = await supabase.from('users').select('cart_items').eq('id', user.id).single();
          if (!error && data && data.cart_items && Array.isArray(data.cart_items)) {
            const cloudCart = data.cart_items;
            
            // Merge local and cloud carts
            setCartItems(prevLocal => {
              const merged = [...cloudCart];
              prevLocal.forEach(localItem => {
                if (!merged.find(c => c.id === localItem.id)) {
                  merged.push(localItem);
                }
              });
              return merged;
            });
          }
        } catch (err) {
          console.error("Failed to fetch cloud cart:", err);
        }
      }
    };

    fetchCloudCart();
  }, [user?.id]);

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

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('shoraluxe_cart');
  };

  // 🎁 DYNAMIC PROMO ENGINE: B2G1 & Quantity Tiers
  const calculateCartTotals = () => {
    let subtotal = 0;
    let eligibleQty = 0;
    let eligibleSubtotal = 0;

    cartItems.forEach(item => {
      subtotal += item.price * item.quantity;
      
      const baseId = parseInt(String(item.id).split('-')[0], 10);
      // Only apply tiered discounts to individual products (ID < 100), not combos
      if (baseId < 100) {
        eligibleQty += item.quantity;
        eligibleSubtotal += item.price * item.quantity;
      }
    });

    // Calculate Extra Discount Percentage based on eligible quantity
    let extraDiscountPct = 0;
    if (eligibleQty >= 6) extraDiscountPct = 0.25;      // Extra 25%
    else if (eligibleQty === 5) extraDiscountPct = 0.20; // Extra 20%
    else if (eligibleQty === 4) extraDiscountPct = 0.15; // Extra 15%
    else if (eligibleQty === 3) extraDiscountPct = 0.10; // Extra 10%
    else if (eligibleQty === 2) extraDiscountPct = 0.05; // Extra 5%

    // The extra discount amount is taken off the eligible subtotal directly
    const tierDiscountAmt = Math.round(eligibleSubtotal * extraDiscountPct);
    const finalTotal = subtotal - tierDiscountAmt;
    
    // The exact percentage shown in the UI
    const displayPct = extraDiscountPct * 100;

    return { 
      subtotal, 
      total: Math.max(0, finalTotal), 
      discount: tierDiscountAmt,
      qtyDiscountPct: displayPct, 
      totalQty: eligibleQty, // Used for the nudge UI
      b2g1Discount: 0,
      tierDiscountAmt
    };
  };

  const { subtotal: cartSubtotal, total: cartTotal, discount: cartDiscount, qtyDiscountPct, totalQty: cartQty, b2g1Discount, tierDiscountAmt } = calculateCartTotals();
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Actions: Admin Database (Supabase)
  const addProduct = async (newProduct) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select();

      if (error) throw error;
      const normalized = normalizeProduct(data[0]);
      setProducts(prev => [normalized, ...prev]);
      return { success: true, data: normalized };
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
      const normalized = normalizeProduct(data[0]);
      setProducts(prev => prev.map(p => p.id === id ? normalized : p));
      return { success: true, data: normalized };
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
      user,
      setUser,
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
      clearCart,
      isCartOpen,
      setIsCartOpen,
      cartTotal,
      cartSubtotal,
      cartDiscount,
      cartCount,
      qtyDiscountPct,
      cartQty,
      b2g1Discount,
      tierDiscountAmt,
      popupConfig,
      updatePopupConfig
    }}>
      {children}
    </ShopContext.Provider>
  );
};
