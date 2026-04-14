import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Phone, User, Eye, EyeOff, ShoppingBag, CheckCircle, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTracking } from '../../components/common/TrackingNotification/TrackingNotification';
import './UserLogin.css';

const UserLogin = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [step, setStep] = useState(1); // 1 = form, 2 = success
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useTracking();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('shoraluxe_user', JSON.stringify(userData));
    setUser(userData);
    
    // If we came from checkout, go back immediately
    if (redirectPath === 'checkout' || redirectPath === '/checkout') {
      navigate('/checkout');
    } else {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone || form.phone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!form.name) { setError('Please enter your name.'); setLoading(false); return; }
        const userData = { name: form.name, phone: form.phone, email: form.email };
        handleLoginSuccess(userData);
      } else {
        // Login: verify against orders
        const { data, error: err } = await supabase
          .from('orders')
          .select('customer_name, customer_phone')
          .eq('customer_phone', form.phone)
          .limit(1)
          .single();

        if (err || !data) {
          setError('No account found with this phone number. Have you placed an order?');
        } else {
          const userData = { name: data.customer_name, phone: data.customer_phone };
          handleLoginSuccess(userData);
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // NOTE: For live environment, you need to configure Google Provider in Supabase Dashboard
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + redirectPath }
      });
      if (error) throw error;
    } catch (err) {
      setError('Google login failed. Please use phone number.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="user-login-page">
        <div className="user-login-success">
          <CheckCircle size={64} className="success-check" />
          <h2>Welcome{form.name ? `, ${form.name.split(' ')[0]}` : ''}! 👋</h2>
          <p>You're now signed in to your Shoraluxe account. You'll receive live order updates directly in your browser.</p>
          <div className="success-actions">
            <Link to="/track-order" className="user-btn-primary">Track My Orders</Link>
            <Link to="/shop" className="user-btn-secondary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-login-page">
      <div className="user-login-split">
        {/* LEFT: Brand Panel */}
        <div className="user-brand-panel">
          <div className="brand-panel-content">
            <ShoppingBag size={48} className="brand-icon" />
            <h1>Your Shoraluxe Account</h1>
            <p>Sign in to track your orders in real-time and get live shipment notifications straight to your device.</p>
            <ul className="brand-perks-list">
              <li><CheckCircle size={16} /> Live order status updates</li>
              <li><CheckCircle size={16} /> Instant shipping notifications</li>
              <li><CheckCircle size={16} /> Full order history</li>
              <li><CheckCircle size={16} /> Priority customer support</li>
            </ul>
          </div>
          <div className="brand-panel-footer">Advanced Skin Science · Since 2024</div>
        </div>

        {/* RIGHT: Form */}
        <div className="user-form-panel">
          <div className="user-form-wrap">
            <div className="mode-toggle">
              <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign In</button>
              <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
            </div>

            <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="form-sub">{mode === 'login' ? 'Enter your phone number used at checkout.' : 'Register to get live tracking notifications.'}</p>

            <div className="social-login-block">
               <button className="google-login-btn" onClick={handleGoogleLogin}>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                  Continue with Google
               </button>
               <div className="or-divider"><span>OR</span></div>
            </div>

            <form onSubmit={handleSubmit} className="user-login-form">
              {mode === 'register' && (
                <div className="ul-field">
                  <label>Your Name</label>
                  <div className="ul-input-wrap">
                    <User size={18} className="ul-icon" />
                    <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
                  </div>
                </div>
              )}

              <div className="ul-field">
                <label>Phone Number</label>
                <div className="ul-input-wrap">
                  <Phone size={18} className="ul-icon" />
                  <input type="tel" name="phone" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange} maxLength={13} />
                </div>
              </div>

              {mode === 'register' && (
                <div className="ul-field">
                  <label>Email <span style={{ opacity: 0.5 }}>(optional)</span></label>
                  <div className="ul-input-wrap">
                    <Mail size={18} className="ul-icon" style={{ left: '1rem' }} />
                    <input type="email" name="email" placeholder="your@email.com" value={form.email} onChange={handleChange} style={{ paddingLeft: '3rem' }} />
                  </div>
                </div>
              )}

              {error && <div className="ul-error">{error}</div>}

              <button type="submit" className="ul-submit" disabled={loading}>
                {loading ? 'Verifying...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="otp-disclaimer">
               By continuing, you agree to receive transactional updates. 
               <br/>
               <small>Standard SMS charges may apply from your carrier. For merchants, OTP services via Supabase/Msg91 typically cost ₹0.20 - ₹1.50 per message.</small>
            </p>

            <div className="ul-footer">
              <Link to="/">← Back to Home</Link>
              <Link to="/track-order">Track without login →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
