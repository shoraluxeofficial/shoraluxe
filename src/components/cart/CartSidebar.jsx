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
              <div className="shipping-promo">
                {cartTotal < 999 
                  ? <p>You are ₹{999 - cartTotal} away from <strong>Free Standard Shipping!</strong></p>
                  : <p>🎉 You have unlocked <strong>Free Standard Shipping!</strong></p>
                }
                <div className="shipping-bar-wrap">
                  <div className="shipping-progress" style={{ width: `${Math.min(100, (cartTotal / 999) * 100)}%` }}></div>
                </div>
              </div>

              {cartItems.map(item => (
                <div className="cart-item" key={item.id}>
                  <img src={item.gallery?.[0] || item.img} alt={item.title} className="cart-item-img" />
                  <div className="cart-item-details">
                    <div className="cart-item-row">
                      <h4 className="cart-item-title">{item.title.split('|')[0]}</h4>
                      <span className="cart-item-price">₹{item.price * item.quantity}</span>
                    </div>
                    <span className="cart-item-size">{item.size}</span>
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
              <span className="cart-subtotal-val">₹{cartTotal.toLocaleString('en-IN')}</span>
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
