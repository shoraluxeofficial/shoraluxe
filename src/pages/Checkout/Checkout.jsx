import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { supabase } from '../../lib/supabase';
import { CheckCircle, Truck, ShieldCheck, MapPin, CreditCard, User, Navigation } from 'lucide-react';
import { useNotify } from '../../components/common/Notification/Notification';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, cartTotal, setIsCartOpen, user, clearCart } = useShop();
  const navigate = useNavigate();
  const { notify } = useNotify();
  const API_URL = import.meta.env.PROD ? '/api/payment' : 'http://localhost:5000/api/payment';
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: user?.mobile?.replace('+91', '') || '',
    alternatePhone: '',
    flatNo: '',
    address1: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'home', // home, work
    paymentMethod: 'razorpay'
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Dynamic Shipping Logic
    if (name === 'state' || name === 'city') {
      calculateShipping(value, name);
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const calculateShipping = (value, name) => {
    if (cartTotal >= 999) {
      setShippingFee(0);
      return;
    }

    const state = name === 'state' ? value : formData.state;
    const city = name === 'city' ? value : formData.city;

    if (state.toLowerCase().includes('telangana') || city.toLowerCase().includes('hyderabad')) {
      setShippingFee(45);
    } else if (state) {
      setShippingFee(60);
    }
  };

  const fetchAddressByPincode = async (pin) => {
    if (pin.length !== 6) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          city: postOffice.District,
          state: postOffice.State,
          pincode: pin
        }));
        calculateShipping(postOffice.State, 'state');
        notify(`Location detected: ${postOffice.District}, ${postOffice.State}`, 'success');
      }
    } catch (err) {
      console.error("Pincode fetch failed", err);
    }
  };

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Using reverse geocoding via OpenStreetMap (Free)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&countrycodes=in`);
          const data = await res.json();
          
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || '';
            const state = data.address.state || '';
            const pincode = data.address.postcode || '';
            
            setFormData(prev => ({
              ...prev,
              city,
              state,
              pincode
            }));
            if (state) calculateShipping(state, 'state');
            notify(`Current location detected! 📍`, 'success');
          }
        } catch (err) {
          notify("Could not detect precise address. Please enter Pincode.", "error");
        } finally {
          setLoading(false);
        }
      }, (err) => {
        notify("Location access denied. Please enter Pincode manually.", "error");
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    if (formData.pincode.length === 6) {
        fetchAddressByPincode(formData.pincode);
    }
  }, [formData.pincode]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processRazorpay = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      notify("Razorpay SDK failed to load. Are you online?", "error");
      return;
    }

    // 1. Create Order on Server
    const orderRes = await fetch(`${API_URL}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: cartTotal + shippingFee,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      })
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) throw new Error(orderData.error || "Failed to create Razorpay order");

    return new Promise((resolve, reject) => {
      const options = {
        key: "rzp_live_SdI77DtoaiASCw", 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Shoraluxe",
        description: "Premium Skincare Purchase",
        image: "/logo.png",
        order_id: orderData.id,
        handler: async (response) => {
          // 3. Verify Payment on Server
          const verifyRes = await fetch(`${API_URL}/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            resolve(response.razorpay_payment_id);
          } else {
            reject(new Error("Payment verification failed"));
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        theme: { color: "#6d0e2c" },
        modal: { ondismiss: () => reject(new Error("Payment cancelled by user")) }
      };

      console.log("Razorpay Options generated:", {
         key: options.key,
         order_id: options.order_id,
         amount: options.amount
      });

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error("RAZORPAY INTERNAL ERROR:", response.error);
        alert(`Razorpay Error: ${response.error.reason || response.error.description || 'Unknown'}\nStep: ${response.error.step}`);
        reject(new Error(`Razorpay Error: ${response.error.description}`));
      });

      rzp.open();
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First Name is required';
    if (!formData.lastName) newErrors.lastName = 'Last Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is valid';
    if (!formData.phone || formData.phone.length < 10) newErrors.phone = 'Valid Phone number is required';
    if (!formData.flatNo) newErrors.flatNo = 'House/Flat No is required';
    if (!formData.address1) newErrors.address1 = 'Street address is required';
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
      console.log("Starting Checkout Process...");
      let paymentId = 'cod_pending';
      let paymentStatus = 'pending';

      // Live Razorpay Flow
      if (formData.paymentMethod === 'razorpay') {
        console.log("Initializing Razorpay Flow...");
        paymentId = await processRazorpay();
        if (!paymentId) throw new Error("Payment initialization failed");
        paymentStatus = 'paid';
      }

      console.log("Constructing Order Payload...");
      // 1. Construct order payload
      const shipping_address = {
        flat_no: formData.flatNo,
        address_line1: formData.address1,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        address_type: formData.addressType,
        alternate_phone: formData.alternatePhone
      };
      
      const orderPayload = {
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_phone: formData.phone,
        customer_email: formData.email,
        shipping_address: shipping_address,
        total_amount: cartTotal + shippingFee,
        subtotal: cartTotal,
        shipping_fee: shippingFee,
        payment_status: paymentStatus,
        payment_method: formData.paymentMethod,
        order_status: 'placed',
        items: cartItems,
        razorpay_payment_id: paymentId,
      };

      console.log("Sending to Supabase:", orderPayload);
      // 2. Insert into Supabase 'orders' table
      const { data, error: sbError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select();

      if (sbError) {
        console.error("Supabase Error Details:", sbError);
        throw new Error(`Database Error: ${sbError.message}`);
      }

      console.log("Order SUCCESS! ID:", data[0]?.id);

      // 3. Clear cart (Assuming we add a clearCart method to ShopContext soon, for now we manipulate local storage or reload after success)
      
      setOrderId(data[0].id);
      setSuccess(true);
      clearCart();
      
      // Auto redirect after 5 seconds
      setTimeout(() => {
        window.location.href = '/'; 
      }, 5000);

    } catch (err) {
      console.error("CRITICAL Checkout Error:", err);
      notify(`Checkout Error: ${err.message}`, 'error');
      alert(`Oops! Something went wrong. ${err.message}`);
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
            <div className="section-title-wrap">
               <User size={20} className="section-icon" />
               <h3>1. Contact Information</h3>
            </div>
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
              <div className="form-group">
                <input type="tel" name="alternatePhone" placeholder="Alternate Phone (Optional)" value={formData.alternatePhone} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <div className="section-title-wrap">
               <MapPin size={20} className="section-icon" />
               <h3>2. Shipping Address</h3>
               <button type="button" className="detect-loc-btn" onClick={handleGetCurrentLocation}>
                  <Navigation size={14} /> Detect My Location
               </button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <input type="text" name="flatNo" placeholder="House / Flat / Office No" value={formData.flatNo} onChange={handleChange} className={errors.flatNo ? 'error-input' : ''} />
                {errors.flatNo && <span className="error-text">{errors.flatNo}</span>}
              </div>
              <div className="form-group flex-2">
                <input type="text" name="address1" placeholder="Street Address / Area" value={formData.address1} onChange={handleChange} className={errors.address1 ? 'error-input' : ''} />
                {errors.address1 && <span className="error-text">{errors.address1}</span>}
              </div>
            </div>
            <div className="form-group">
              <input type="text" name="landmark" placeholder="Landmark (e.g. Near Apollo Hospital)" value={formData.landmark} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className={errors.city ? 'error-input' : ''} />
                {errors.city && <span className="error-text">{errors.city}</span>}
              </div>
              <div className="form-group">
                <select name="state" value={formData.state} onChange={handleChange} className={errors.state ? 'error-input' : ''}>
                  <option value="">Select State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana (Local Shipping)</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Other">Other India</option>
                </select>
                {errors.state && <span className="error-text">{errors.state}</span>}
              </div>
              <div className="form-group">
                <input type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} className={errors.pincode ? 'error-input' : ''} maxLength="6" />
                {errors.pincode && <span className="error-text">{errors.pincode}</span>}
              </div>
            </div>
            
            <div className="address-type-selector">
              <p>Delivery Schedule:</p>
              <div className="type-options">
                <label className={`type-btn ${formData.addressType === 'home' ? 'active' : ''}`}>
                  <input type="radio" name="addressType" value="home" checked={formData.addressType === 'home'} onChange={handleChange} />
                  <span>🏡 Home (9AM - 9PM)</span>
                </label>
                <label className={`type-btn ${formData.addressType === 'work' ? 'active' : ''}`}>
                  <input type="radio" name="addressType" value="work" checked={formData.addressType === 'work'} onChange={handleChange} />
                  <span>💼 Office (10AM - 6PM)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <div className="section-title-wrap">
               <CreditCard size={20} className="section-icon" />
               <h3>3. Payment Method</h3>
            </div>
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
                  <span>Pay when your order arrives (₹10 service fee apply)</span>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" className="pay-button" disabled={loading}>
            {loading ? 'Processing Securely...' : <><ShieldCheck size={20} /> Securely Pay ₹{(cartTotal + shippingFee).toLocaleString('en-IN')}</>}
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
              <span className="ship-label">
                <Truck size={14} /> Shipping {formData.state && `(to ${formData.state})`}
              </span>
              <span>{shippingFee === 0 ? <span className="free-tag">FREE</span> : `₹${shippingFee}`}</span>
            </div>
            <div className="tot-row final">
              <span>Total Payable</span>
              <span className="final-amt">₹{(cartTotal + shippingFee).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="secure-badge-checkout">
             <ShieldCheck size={16} /> 256-bit Secure Transaction
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
