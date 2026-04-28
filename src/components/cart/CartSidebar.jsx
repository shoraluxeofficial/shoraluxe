import React from 'react';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Link, useNavigate } from 'react-router-dom';
import './CartSidebar.css';

const CartSidebar = () => {
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    cartTotal,
    cartSubtotal,
    cartDiscount,
    qtyDiscountPct,
    cartQty,
    b2g1Discount,
    tierDiscountAmt,
    user
  } = useShop();
  const navigate = useNavigate();

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('cart-overlay')) {
      setIsCartOpen(false);
    }
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    if (!user) {
      navigate('/account?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  const formatSize = (sizeStr) => {
    if (!sizeStr) return '';
    try {
      const parsed = JSON.parse(sizeStr);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].label) {
        return parsed[0].label;
      }
    } catch (e) {
      return sizeStr; // Not JSON, return as is
    }
    return sizeStr;
  };

  return (
    <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={handleOverlayClick}>
      <aside className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Your Bag ({cartItems.length})</h2>
          <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={48} strokeWidth={1} color="#aaa" />
              <h3>Your bag is empty</h3>
              <p>Discover our best-selling formulas designed for results.</p>
              <button className="cart-shop-btn" onClick={() => setIsCartOpen(false)}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-list">


              {cartItems.map(item => (
                <div className="cart-item" key={item.id}>
                  <img src={item.gallery?.[0] || item.img} alt={item.title} className="cart-item-img" />
                  <div className="cart-item-details">
                    <div className="cart-item-row">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h4 className="cart-item-title">{item.title.split('|')[0]}</h4>
                        {(() => {
                           const mrp = item.mrp || item.originalPrice || Math.round(item.price / 0.8);
                           if (mrp > item.price) {
                             const pct = Math.round(((mrp - item.price) / mrp) * 100);
                             return (
                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                 <span style={{ fontSize: '0.65rem', color: '#b81c54', background: 'rgba(228,66,128,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{pct}% OFF</span>
                               </div>
                             );
                           }
                           return null;
                        })()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                        <span className="cart-item-price" style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
                        {(() => {
                           const mrp = item.mrp || item.originalPrice || Math.round(item.price / 0.8);
                           if (mrp > item.price) {
                              return <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.75rem' }}>₹{mrp * item.quantity}</span>
                           }
                           return null;
                        })()}
                      </div>
                    </div>
                    <span className="cart-item-size">{formatSize(item.size)}</span>
                    <div className="cart-item-control-row">
                      <div className="cart-qty-ctrl">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                      </div>
                      <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal-row">
              <span>Subtotal</span>
              <span className="cart-subtotal-val">₹{cartSubtotal.toLocaleString('en-IN')}</span>
            </div>
            
            {/* Promo Discounts Breakdown */}
            {b2g1Discount > 0 && (
              <div className="cart-subtotal-row discount-row" style={{ color: '#16a34a' }}>
                <span>✨ B2G1 Free Offer Applied!</span>
                <span className="cart-subtotal-val" style={{ fontWeight: 700 }}>-₹{b2g1Discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            {tierDiscountAmt > 0 && (
              <div className="cart-subtotal-row discount-row" style={{ background: '#f0fdf4', padding: '6px 10px', borderRadius: '4px', margin: '8px 0' }}>
                <span style={{ color: '#15803d', fontWeight: 600 }}>🎉 Extra {qtyDiscountPct}% OFF!</span>
                <span className="cart-subtotal-val" style={{ color: '#15803d', fontWeight: 800 }}>-₹{tierDiscountAmt.toLocaleString('en-IN')}</span>
              </div>
            )}

            {/* Dynamic Nudge to next tier */}
            {cartQty >= 1 && cartQty < 6 && (
              <div className="cart-tier-nudge" style={{ background: 'linear-gradient(90deg, rgba(255,126,179,0.1) 0%, rgba(228,66,128,0.1) 100%)', padding: '10px', borderRadius: '8px', margin: '10px 0', fontSize: '0.9rem', color: '#b81c54', textAlign: 'center', fontWeight: 500, border: '1px dashed rgba(228,66,128,0.3)' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.9, marginBottom: '4px', fontWeight: 600 }}>✨ 20% Base Discount Already Applied!</span>
                Add <strong>1 more item</strong> to unlock an <strong>Extra {cartQty === 1 ? '5' : cartQty === 2 ? '10' : cartQty === 3 ? '15' : cartQty === 4 ? '20' : '25'}% OFF!</strong>
              </div>
            )}
            <div className="cart-subtotal-row total-row" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
              <span style={{ fontWeight: 800 }}>Total</span>
              <span className="cart-subtotal-val" style={{ fontWeight: 800, fontSize: '1.1rem' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <p className="cart-tax-note">Taxes and shipping calculated at checkout.</p>
            <button onClick={handleCheckoutClick} className="btn-luxe-checkout">
              Proceed to Checkout
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartSidebar;
