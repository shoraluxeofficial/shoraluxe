import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { supabase } from '../../lib/supabase';
import { CheckCircle, Truck, ShieldCheck, MapPin, CreditCard, User, Navigation, Tag, X } from 'lucide-react';
import { useNotify } from '../../components/common/Notification/Notification';
import SEO from '../../components/SEO/SEO';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, cartTotal, cartSubtotal, cartDiscount, qtyDiscountPct, cartQty, b2g1Discount, tierDiscountAmt, setIsCartOpen, user, clearCart } = useShop();
  const navigate = useNavigate();
  const { notify } = useNotify();
  const API_URL = import.meta.env.PROD ? '/api/payment' : 'http://localhost:5000/api/payment';

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [shippingFee, setShippingFee] = useState(60);
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');
  const [upiPolling, setUpiPolling] = useState(null); // { secondsLeft, paymentId }

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discount_type, discount_value, id }
  const [promoError, setPromoError] = useState('');
  const [availablePromos, setAvailablePromos] = useState([]);

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
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Compute promo code discount amount
  const calculatePromoDiscount = () => {
    if (!appliedPromo) return 0;

    if (appliedPromo.promo_type === 'b2g1') {
      const category = appliedPromo.applicable_category || 'all';

      // Filter items that belong to this category
      let eligiblePrices = [];
      cartItems.forEach(item => {
        if (category === 'all' || item.title.toLowerCase().includes(category.toLowerCase())) {
          for (let i = 0; i < item.quantity; i++) eligiblePrices.push(item.price);
        }
      });

      eligiblePrices.sort((a, b) => b - a);

      let b2g1Discount = 0;

      // Special Logic for Lotions: Bundle price ₹1,198 for 3
      if (appliedPromo.code === 'SL-B2G1-LOTION') {
        const bundleCount = Math.floor(eligiblePrices.length / 3);
        // Current price for 3 lotions is usually 3 * ~799 = 2,397.
        // We want to make it 1,198.
        // So for each bundle of 3, we subtract the difference.
        for (let i = 0; i < bundleCount; i++) {
          const currentBundleTotal = eligiblePrices[i * 3] + eligiblePrices[i * 3 + 1] + eligiblePrices[i * 3 + 2];
          b2g1Discount += (currentBundleTotal - 1198);
        }
        return b2g1Discount;
      }

      // Standard B2G1: 3rd item free
      for (let i = 2; i < eligiblePrices.length; i += 3) {
        b2g1Discount += eligiblePrices[i];
      }
      return b2g1Discount;
    }

    if (appliedPromo.discount_type === 'percentage') {
      return Math.round(cartSubtotal * appliedPromo.discount_value / 100);
    } else {
      return Math.min(appliedPromo.discount_value, cartSubtotal);
    }
  };

  const discountAmount = calculatePromoDiscount();

  useEffect(() => {
    // Make sure cart sidebar is closed when entering checkout
    setIsCartOpen(false);

    // Redirect if not logged in
    if (!user) {
      navigate('/account?redirect=checkout');
      return;
    }

    // Redirect if cart is empty
    if (cartItems.length === 0 && !success) {
      navigate('/');
    }
    // Fetch available promos
    const fetchPromos = async () => {
      const { data } = await supabase.from('promo_codes').select('*').eq('is_active', true);
      setAvailablePromos(data || []);
    };
    fetchPromos();

    // Fetch saved addresses
    const fetchSavedAddresses = async () => {
      let query = supabase.from('orders').select('shipping_address');
      if (user.email) query = query.eq('customer_email', user.email);
      else if (user.mobile) query = query.eq('customer_phone', user.mobile.replace('+91', ''));

      const { data } = await query.order('placed_at', { ascending: false });

      if (data) {
        const uniqueAddresses = [];
        const seen = new Set();
        data.forEach(order => {
          if (order.shipping_address) {
            const key = `${order.shipping_address.flat_no}-${order.shipping_address.pincode}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueAddresses.push(order.shipping_address);
            }
          }
        });
        setSavedAddresses(uniqueAddresses.slice(0, 3)); // Keep top 3 recent unique
      }
    };
    if (user) fetchSavedAddresses();
  }, [cartItems, setIsCartOpen, navigate, success, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Dynamic Shipping Logic
    if (name === 'state' || name === 'city' || name === 'pincode') {
      calculateShipping(value, name);
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSelectAddress = (addr, isEdit = false) => {
    setFormData(prev => ({
      ...prev,
      flatNo: addr.flat_no || '',
      address1: addr.address_line1 || '',
      landmark: addr.landmark || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      addressType: addr.address_type || 'home'
    }));
    calculateShipping(addr.pincode, 'pincode');

    if (isEdit) {
      // Scroll smoothly to the flatNo input
      setTimeout(() => {
        const flatNoInput = document.querySelector('input[name="flatNo"]');
        if (flatNoInput) {
          flatNoInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          flatNoInput.focus();
        }
      }, 100);
    } else {
      notify('Address applied successfully!', 'success');
    }
  };

  const calculateShipping = async (value, name) => {
    // Check Admin Settings
    let chargeDelivery = true;
    let freeShippingThreshold = 999;
    try {
      const saved = localStorage.getItem('shoraluxe_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.chargeDelivery === false) chargeDelivery = false;
        if (parsed.freeShippingThreshold) freeShippingThreshold = Number(parsed.freeShippingThreshold);
      }
    } catch (e) { }

    // If global delivery is off or cart total exceeds free shipping threshold
    if (!chargeDelivery || cartTotal >= freeShippingThreshold) {
      setShippingFee(0);
      return;
    }

    const state = name === 'state' ? (value || formData.state) : formData.state;
    const city = name === 'city' ? (value || formData.city) : formData.city;
    const pincode = name === 'pincode' ? (value || formData.pincode) : formData.pincode;

    // Check live rate if pincode is available and exactly 6 digits
    if (pincode && pincode.length === 6) {
      try {
        const shippingApiUrl = API_URL.replace('/payment', '/shipping');
        const res = await fetch(`${shippingApiUrl}/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pincode })
        });
        const data = await res.json();
        if (data.success && data.rate) {
          setShippingFee(data.rate);
          return;
        }
      } catch (err) {
        console.error("Live shipping calculation failed:", err);
      }
    }

    // Fallback static shipping
    if (state && (state.toLowerCase().includes('telangana') || city.toLowerCase().includes('hyderabad'))) {
      setShippingFee(45);
    } else {
      setShippingFee(60);
    }
  };

  useEffect(() => {
    calculateShipping(null, null);
  }, [cartTotal, discountAmount]);

  const applyPromoCode = async (overrideCode) => {
    const code = (overrideCode || promoInput).trim().toUpperCase();
    if (!code) return;
    setPromoError('');
    setPromoLoading(true);
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      setPromoError('Invalid or expired promo code.');
      setAppliedPromo(null);
      setPromoLoading(false);
      return;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setPromoError('This promo code has expired.');
      setAppliedPromo(null);
      setPromoLoading(false);
      return;
    }

    if (data.max_uses && data.uses_count >= data.max_uses) {
      setPromoError('This promo code has reached its usage limit.');
      setAppliedPromo(null);
      setPromoLoading(false);
      return;
    }

    if (data.min_order_amount && cartTotal < data.min_order_amount) {
      setPromoError(`Minimum order of ₹${data.min_order_amount} required for this code.`);
      setAppliedPromo(null);
      setPromoLoading(false);
      return;
    }

    // B2G1: Buy 2 Get 1 — need at least 3 total items of the applicable category
    if (data.promo_type === 'b2g1') {
      const category = data.applicable_category || 'all';
      const eligibleItems = category === 'all'
        ? cartItems
        : cartItems.filter(item => item.title.toLowerCase().includes(category.toLowerCase()));

      const eligibleQty = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);

      if (eligibleQty < 3) {
        setPromoError(`Add at least 3 ${category} items to use this offer.`);
        setPromoLoading(false);
        return;
      }
    }

    // BOGO: Buy 1 Get 1 — need at least 2 total items
    if (data.promo_type === 'bogo') {
      if (cartQty < 2) {
        setPromoError('Add at least 2 items to use this Buy 1 Get 1 offer.');
        setAppliedPromo(null); setPromoLoading(false); return;
      }
    }

    // NEW USER: check they have no prior orders
    if (data.promo_type === 'new_user') {
      if (!user?.id) {
        setPromoError('Please log in to use this new user offer.');
        setAppliedPromo(null); setPromoLoading(false); return;
      }
      const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('customer_email', user.email);
      if (count > 0) {
        setPromoError('This offer is only valid for first-time customers.');
        setAppliedPromo(null); setPromoLoading(false); return;
      }
    }

    setAppliedPromo(data);
    notify(`🎉 Promo code "${code}" applied!`, 'success');
    setPromoLoading(false);
  };


  const removePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
  };

  // If a promo code is applied, it overrides the automated tier discount
  const effectiveTierDiscount = appliedPromo ? 0 : tierDiscountAmt;
  const effectiveCartTotal = cartSubtotal - effectiveTierDiscount;

  // finalTotal = (cartTotal without tier discount if promo is applied) - (promo discount) + shipping
  const finalTotal = Math.max(0, effectiveCartTotal - discountAmount + shippingFee);

  // Total savings
  const totalOriginalPrice = cartItems.reduce((acc, item) => acc + ((item.originalPrice || item.price) * item.quantity), 0);
  const itemSavings = totalOriginalPrice > cartSubtotal ? totalOriginalPrice - cartSubtotal : 0;
  const totalSavings = itemSavings + effectiveTierDiscount + discountAmount;

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
        calculateShipping(pin, 'pincode');
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
        amount: finalTotal,
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
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [
                  {
                    method: "upi",
                    flows: ["collect", "intent", "qr"]
                  }
                ]
              }
            },
            sequence: ["block.upi"],
            preferences: {
              show_default_blocks: true
            }
          }
        },
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
      console.log("Starting FINAL Audited Checkout Process...");
      if (formData.paymentMethod !== 'razorpay') {
        throw new Error("Invalid payment method selected");
      }

      // 1. Initiate Razorpay FIRST
      console.log("Initiating Razorpay Payment Modal...");
      let paymentId;
      try {
        paymentId = await processRazorpay();
      } catch (payErr) {
        console.warn("Payment modal closed or failed:", payErr.message);
        throw payErr; // Stop here, nothing is saved to DB
      }

      if (!paymentId) throw new Error("Payment incomplete");

      // 2. Construct Main Order Payload (NOW WITH PAID STATUS)
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
        subtotal: cartTotal,
        shipping_charge: shippingFee, 
        discount_amount: discountAmount, 
        total_amount: finalTotal,
        payment_status: 'paid', // Saved directly as paid
        payment_method: formData.paymentMethod,
        order_status: 'placed',
        razorpay_order_id: null, // Will be filled if needed, or left null
        razorpay_payment_id: paymentId,
      };

      // 3. Create Order record in Supabase (ONLY ON SUCCESS)
      console.log("Payment Success! Saving Order to Supabase...");
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select();

      if (orderError) {
        console.error("CRITICAL: Payment successful but DB save failed:", orderError);
        throw new Error(`Database Error: ${orderError.message}. Please contact support with Payment ID: ${paymentId}`);
      }

      const dbOrderId = orderData[0].id;
      setOrderId(dbOrderId);

      // 4. Insert Items into order_items table
      console.log("Saving Order Items...");
      try {
        const orderItemsPayload = cartItems.map(item => ({
          order_id: dbOrderId,
          product_id: typeof item.id === 'string' ? parseInt(item.id.split('-')[0]) : item.id,
          product_title: item.title,
          product_img: item.img || item.image,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItemsPayload);

        if (itemsError) console.error("Order Items Error:", itemsError.message);
      } catch (itemErr) {
        console.error("Failed to map/save items:", itemErr);
      }

      console.log("Order SUCCESS! ID:", dbOrderId);

      // 5. Deduct Stock from Supabase
      console.log("Deducting inventory counts...");
      for (const item of cartItems) {
        const baseProductId = typeof item.id === 'string' ? item.id.split('-')[0] : item.id;
        const { data: pData } = await supabase.from('products').select('stock, category, benefits').eq('id', baseProductId).single();
        if (pData) {
          const currentStock = pData.stock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          await supabase.from('products').update({ stock: newStock }).eq('id', baseProductId);

          if (pData.category === 'combo' && pData.benefits) {
            try {
              let benefitsObj = typeof pData.benefits === 'string' ? JSON.parse(pData.benefits) : pData.benefits;
              if (benefitsObj && benefitsObj.product_ids && Array.isArray(benefitsObj.product_ids)) {
                for (const bundledId of benefitsObj.product_ids) {
                  const bundledBaseId = typeof bundledId === 'string' ? bundledId.split('-')[0] : bundledId;
                  const { data: bData } = await supabase.from('products').select('stock').eq('id', bundledBaseId).single();
                  if (bData) {
                    const bCurrentStock = bData.stock || 0;
                    const bNewStock = Math.max(0, bCurrentStock - item.quantity);
                    await supabase.from('products').update({ stock: bNewStock }).eq('id', bundledBaseId);
                  }
                }
              }
            } catch (e) {
              console.error("Failed to decrement bundled items for combo", e);
            }
          }
        }
      }

      // 6. Sync Order to Shiprocket
      console.log("Syncing Order to Shiprocket...");
      try {
        const shippingApiUrl = API_URL.replace('/payment', '/shipping');
        const syncResponse = await fetch(`${shippingApiUrl}/sync-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              ...orderPayload, 
              orderId: dbOrderId, 
              items: cartItems,
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              address1: formData.address1,
              flatNo: formData.flatNo,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              amount: finalTotal,
              paymentMethod: formData.paymentMethod
          })
        });
        
        const syncData = await syncResponse.json();
        
        if (syncData.success) {
            console.log("Updating Supabase with Shiprocket tracking...");
            const updates = { shiprocket_order_id: String(syncData.shiprocket_order_id) };
            if (syncData.awb_code) {
                updates.shiprocket_awb = syncData.awb_code;
                updates.tracking_url = `https://shiprocket.co/tracking/${syncData.awb_code}`;
            }
            await supabase.from('orders').update(updates).eq('id', dbOrderId);
        }
      } catch (err) {
        console.error("Shiprocket sync failed (but order was placed successfully):", err);
      }

      setSuccess(true);
      clearCart();

      // Increment promo code usage count
      if (appliedPromo?.id) {
        await supabase
          .from('promo_codes')
          .update({ uses_count: (appliedPromo.uses_count || 0) + 1 })
          .eq('id', appliedPromo.id);
      }

      // Optional: don't auto-redirect immediately so they can click tracking.
      // Removed the 5 second redirect.

    } catch (err) {
      console.error("CRITICAL Checkout Error:", err);
      notify(`Checkout Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-success-container">
        <CheckCircle size={80} className="success-icon" />
        <h2>Thank You!</h2>
        <p>Your order <strong>#{orderId?.slice(0, 8).toUpperCase()}</strong> is confirmed.</p>
        <p>We've sent a receipt and order details to your email.</p>
        
        <div className="success-actions">
          <Link to="/track-order" className="btn-track">Track Package</Link>
          <Link to="/shop" className="btn-home">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      <SEO
        title="Secure Checkout"
        description="Finalize your purchase securely at Shoraluxe. Fast Pan India delivery and secure payment options."
      />
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

            {savedAddresses.length > 0 && (
              <div className="saved-addresses-container">
                <p className="saved-addr-title">Saved Addresses</p>
                <div className="saved-addresses-grid">
                  {savedAddresses.map((addr, idx) => (
                    <div key={idx} className="saved-addr-card" onClick={() => handleSelectAddress(addr)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div className="addr-type-badge" style={{ margin: 0 }}>{addr.address_type || 'Home'}</div>
                        <button
                          className="addr-edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAddress(addr, true);
                          }}
                        >
                          Edit
                        </button>
                      </div>
                      <p className="addr-line"><strong>{addr.flat_no}</strong>, {addr.address_line1}</p>
                      <p className="addr-line">{addr.city}, {addr.state} - {addr.pincode}</p>
                      {addr.landmark && <p className="addr-landmark">Near {addr.landmark}</p>}
                      <button type="button" className="use-addr-btn">Deliver Here</button>
                    </div>
                  ))}
                </div>
                <div className="addr-separator"><span>OR ADD NEW ADDRESS</span></div>
              </div>
            )}

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

          {/* PROMO CODE SECTION */}
          <div className="checkout-section">
            <div className="section-title-wrap">
              <Tag size={20} className="section-icon" />
              <h3>3. Promo Code</h3>
            </div>
            {appliedPromo ? (
              <div className="promo-applied-box">
                <div className="promo-applied-info">
                  <span className="promo-applied-tag">{appliedPromo.code}</span>
                  <span className="promo-applied-save">
                    You save ₹{discountAmount.toLocaleString('en-IN')}!
                  </span>
                </div>
                <button type="button" className="promo-remove-btn" onClick={removePromo}>
                  <X size={16} /> Remove
                </button>
              </div>
            ) : (
              <div className="promo-input-row">
                <input
                  type="text"
                  value={promoInput}
                  onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                  placeholder="Enter promo / coupon code"
                  className={`promo-input ${promoError ? 'error-input' : ''}`}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyPromoCode())}
                />
                <button type="button" className="promo-apply-btn" onClick={applyPromoCode} disabled={promoLoading}>
                  {promoLoading ? 'Checking...' : 'Apply'}
                </button>
              </div>
            )}
            {promoError && <p className="promo-error">{promoError}</p>}

            {/* Suggested Promos */}
            {!appliedPromo && availablePromos.length > 0 && (
              <div className="suggested-promos-wrap">
                <p className="suggested-title">SUGGESTED FOR YOU</p>
                <div className="suggested-tags">
                  {availablePromos.map(p => (
                    <button key={p.id} type="button" className="promo-tag-btn" onClick={() => {
                      setPromoInput(p.code);
                      // Trigger apply automatically after a small delay
                      setTimeout(() => applyPromoCode(p.code), 100);
                    }}>
                      <div className="tag-code">{p.code}</div>
                      <div className="tag-save">Save {p.discount_type === 'percentage' ? `${p.discount_value}%` : `₹${p.discount_value}`}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="checkout-section">
            <div className="section-title-wrap">
              <CreditCard size={20} className="section-icon" />
              <h3>4. Payment Method</h3>
            </div>
            <div className="payment-options">
              <label className="pay-option selected">
                <input type="radio" name="paymentMethod" value="razorpay" checked={true} readOnly />
                <div className="pay-details">
                  <strong>Online Payment (Razorpay)</strong>
                  <span>Cards, Wallets, NetBanking, UPI QR, UPI ID</span>
                </div>
              </label>
            </div>

          </div>

          <button type="submit" className="pay-button" disabled={loading}>
            {loading ? 'Processing Securely...' : <><ShieldCheck size={20} /> Securely Pay ₹{finalTotal.toLocaleString('en-IN')}</>}
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
                  <h4>{item.title}</h4>
                  <p>{formatSize(item.size)} <span style={{ opacity: 0.7, margin: '0 4px' }}>|</span> Qty: {item.quantity}</p>
                </div>
                <div className="s-price">
                  {item.originalPrice > item.price && (
                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.75rem', display: 'block', textAlign: 'right' }}>
                      ₹{(item.originalPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  )}
                  <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="tot-row">
              <span>Subtotal ({cartQty} items)</span>
              <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
            </div>
            {b2g1Discount > 0 && (
              <div className="tot-row" style={{ color: '#16a34a' }}>
                <span>✨ B2G1 Free Offer Applied!</span>
                <span>−₹{b2g1Discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {!appliedPromo && tierDiscountAmt > 0 && (
              <div className="tot-row" style={{ color: '#15803d', fontWeight: 600, background: '#f0fdf4', padding: '4px 8px', borderRadius: '4px', margin: '4px 0' }}>
                <span>🎉 Extra {qtyDiscountPct}% OFF!</span>
                <span style={{ fontWeight: 800 }}>−₹{tierDiscountAmt.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="tot-row">
              <span className="ship-label">
                <Truck size={14} /> Shipping {formData.state && `(to ${formData.state})`}
              </span>
              <span>{shippingFee === 0 ? <span className="free-tag">FREE</span> : `₹${shippingFee}`}</span>
            </div>
            {appliedPromo && (
              <div className="tot-row promo-saving-row">
                <span><Tag size={14} /> Promo ({appliedPromo.code})</span>
                <span className="saving-amt">−₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {totalSavings > 0 && (
              <div className="tot-row promo-saving-row" style={{ color: '#10b981', fontWeight: '600' }}>
                <span>Total Savings</span>
                <span className="saving-amt">₹{totalSavings.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="tot-row final">
              <span>Total Payable</span>
              <span className="final-amt">₹{finalTotal.toLocaleString('en-IN')}</span>
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
