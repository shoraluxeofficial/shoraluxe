import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { supabase } from '../../lib/supabase';
import { CheckCircle } from 'lucide-react';
import { useNotify } from '../../components/common/Notification/Notification';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, cartTotal, setIsCartOpen } = useShop();
  const navigate = useNavigate();
  const { notify } = useNotify();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'razorpay' // default to simulated razorpay
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Make sure cart sidebar is closed when entering checkout
    setIsCartOpen(false);
    
    // Redirect if cart is empty
    if (cartItems.length === 0 && !success) {
      navigate('/');
    }
  }, [cartItems, setIsCartOpen, navigate, success]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First Name is required';
    if (!formData.lastName) newErrors.lastName = 'Last Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is valid';
    if (!formData.phone || formData.phone.length < 10) newErrors.phone = 'Valid Phone number is required';
    if (!formData.address1) newErrors.address1 = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);

    try {
      // Simulate Razorpay/Payment delay
      if (formData.paymentMethod === 'razorpay') {
        const razorpayMock = new Promise((resolve) => setTimeout(resolve, 1500));
        await razorpayMock;
      }

      // 1. Construct order payload
      const shipping_address = {
        address_line1: formData.address1,
        address_line2: formData.address2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      };
      
      const orderPayload = {
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_phone: formData.phone,
        customer_email: formData.email,
        shipping_address: shipping_address,
        total_amount: cartTotal,
        payment_status: formData.paymentMethod === 'razorpay' ? 'paid' : 'pending',
        payment_method: formData.paymentMethod,
        order_status: 'placed',
        items: cartItems,
        razorpay_payment_id: formData.paymentMethod === 'razorpay' ? `pay_mock_${Math.random().toString(36).substr(2, 9)}` : null,
      };

      // 2. Insert into Supabase 'orders' table
      const { data, error } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select();

      if (error) throw error;

      // 3. Clear cart (Assuming we add a clearCart method to ShopContext soon, for now we manipulate local storage or reload after success)
      
      setOrderId(data[0].id);
      setSuccess(true);
      
      // Auto redirect after 5 seconds
      setTimeout(() => {
        localStorage.removeItem('shoraluxe_cart');
        window.location.href = '/'; 
      }, 5000);

    } catch (err) {
      console.error("Order creation failed:", err.message);
      notify("Failed to create order. Please make sure the 'orders' table exists in Supabase.", 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-success-container">
        <CheckCircle size={64} className="success-icon" />
        <h2>Thank You for Your Order!</h2>
        <p>Your order <strong>#{orderId?.slice(0,8).toUpperCase()}</strong> has been placed successfully.</p>
        <p>You will receive an email confirmation shortly.</p>
        <em>Redirecting to home page...</em>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      <div className="checkout-left">
        <h2>Checkout securely</h2>
        
        <form onSubmit={handleCheckout} className="checkout-form">
          <div className="checkout-section">
            <h3>1. Contact Information</h3>
            <div className="form-row">
              <div className="form-group">
                <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className={errors.firstName ? 'error-input' : ''} />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className={errors.lastName ? 'error-input' : ''} />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className={errors.email ? 'error-input' : ''} />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              <div className="form-group">
                <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className={errors.phone ? 'error-input' : ''} />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h3>2. Shipping Address</h3>
            <div className="form-group">
              <input type="text" name="address1" placeholder="Address Line 1" value={formData.address1} onChange={handleChange} className={errors.address1 ? 'error-input' : ''} />
              {errors.address1 && <span className="error-text">{errors.address1}</span>}
            </div>
            <div className="form-group">
              <input type="text" name="address2" placeholder="Apartment, suite, etc. (optional)" value={formData.address2} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className={errors.city ? 'error-input' : ''} />
                {errors.city && <span className="error-text">{errors.city}</span>}
              </div>
              <div className="form-group">
                <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className={errors.state ? 'error-input' : ''} />
                {errors.state && <span className="error-text">{errors.state}</span>}
              </div>
              <div className="form-group">
                <input type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} className={errors.pincode ? 'error-input' : ''} />
                {errors.pincode && <span className="error-text">{errors.pincode}</span>}
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h3>3. Payment Method</h3>
            <div className="payment-options">
              <label className={`pay-option ${formData.paymentMethod === 'razorpay' ? 'selected' : ''}`}>
                <input type="radio" name="paymentMethod" value="razorpay" checked={formData.paymentMethod === 'razorpay'} onChange={handleChange} />
                <div className="pay-details">
                  <strong>Online Payment (Razorpay)</strong>
                  <span>UPI, Cards, Wallets, NetBanking</span>
                </div>
              </label>
              <label className={`pay-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} />
                <div className="pay-details">
                  <strong>Cash on Delivery (COD)</strong>
                  <span>Pay when your order arrives</span>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" className="pay-button" disabled={loading}>
            {loading ? 'Processing Securely...' : `Pay ₹${(cartTotal > 0 && cartTotal < 999 ? cartTotal + 50 : cartTotal).toLocaleString('en-IN')}`}
          </button>
        </form>
      </div>

      <div className="checkout-right">
        <div className="order-summary-box">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cartItems.map(item => (
              <div className="summary-item" key={item.id}>
                <div className="s-img-wrap">
                  <img src={item.gallery?.[0] || item.img} alt={item.title} />
                  <span className="s-qty-badge">{item.quantity}</span>
                </div>
                <div className="s-info">
                  <h4>{item.title.split('|')[0]}</h4>
                  <p>{item.size}</p>
                </div>
                <div className="s-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="tot-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="tot-row">
              <span>Shipping</span>
              <span>{cartTotal > 999 ? 'FREE' : '₹50'}</span>
            </div>
            <div className="tot-row final">
              <span>Total</span>
              <span>₹{(cartTotal > 0 && cartTotal < 999 ? cartTotal + 50 : cartTotal).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
