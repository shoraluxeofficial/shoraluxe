import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Phone, User, ShoppingBag, CheckCircle, Mail, RotateCcw, Lock, ArrowRight, X, AlertCircle, Truck, Eye, EyeOff, Fingerprint } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useShop } from '../../context/ShopContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import './UserLogin.css';
// Firebase removed per request: no client-side Firebase usage

const API_URL = import.meta.env.PROD ? '/api/auth' : 'http://localhost:5000/api/auth';

const UserLogin = () => {
  // We switched to email-based login + Google OAuth. Phone OTP flow is commented out below.
  const [isSignup, setIsSignup] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', passcode: '', confirmPasscode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null); // { message: '', type: 'success' }
  const [userId, setUserId] = useState(null);

  const { user, setUser } = useShop();
  const navigate = useNavigate();
  const location = useLocation();

  const [promoCodes, setPromoCodes] = useState([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isSignup ? '/register' : '/email-login';
      const body = isSignup ? {
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        initialPasscode: form.passcode
      } : {
        email: form.email,
        passcode: form.passcode,
        deviceId: 'browser'
      };

      if (isSignup && form.passcode !== form.confirmPasscode) {
        throw new Error('PINs do not match');
      }

      const response = await fetch(API_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Operation failed');
      
      if (isSignup) {
        showToast('Account created successfully! Please sign in.');
        setIsSignup(false);
        setForm({ ...form, passcode: '', confirmPasscode: '' });
      } else {
        localStorage.setItem('shoraluxe_user', JSON.stringify(data.user));
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        showToast('Welcome back to Shoraluxe!');
        
        const redirect = new URLSearchParams(location.search).get('redirect');
        setTimeout(() => navigate(redirect ? `/${redirect}` : '/'), 1500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!form.email) {
      setError('Please enter your email first to use biometrics.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const optionsRes = await fetch(API_URL + '/bio-auth-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const options = await optionsRes.json();
      if (!optionsRes.ok) throw new Error(options.error);

      const authResponse = await startAuthentication(options);

      const verifyRes = await fetch(API_URL + '/bio-auth-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, authResponse, deviceId: 'browser' }),
      });
      const data = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(data.error);

      localStorage.setItem('shoraluxe_user', JSON.stringify(data.user));
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      showToast('Login successful with Biometrics!');
      
      const redirect = new URLSearchParams(location.search).get('redirect');
      setTimeout(() => navigate(redirect ? `/${redirect}` : '/'), 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Biometric login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterBiometric = async () => {
    setLoading(true);
    try {
      const optionsRes = await fetch(API_URL + '/bio-register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const options = await optionsRes.json();
      if (!optionsRes.ok) throw new Error(options.error);

      const registrationResponse = await startRegistration(options);

      const verifyRes = await fetch(API_URL + '/bio-register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, registrationResponse }),
      });
      const data = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(data.error);

      showToast('Fingerprint registered successfully!');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API_URL + '/oauth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          credential: credentialResponse.credential,
          deviceId: 'browser'
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Google verification failed');

      localStorage.setItem('shoraluxe_user', JSON.stringify(data.user));
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      showToast(`Welcome, ${data.user.name}!`);
      
      const redirect = new URLSearchParams(location.search).get('redirect');
      setTimeout(() => navigate(redirect ? `/${redirect}` : '/'), 1500);
    } catch (err) {
      console.error('Google Auth Error:', err);
      setError('Google Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Logout logic
  const handleLogout = () => {
    localStorage.removeItem('shoraluxe_user');
    localStorage.removeItem('auth_token');
    setUser(null);
    showToast('Successfully logged out!');
    setTimeout(() => navigate('/'), 1000);
  };

  // ... (rest of the component logic)

  return (
    <div className="user-login-page">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="shora-toast anim-fade-in shadow-lg">
          <div className="toast-content">
            <div className="toast-icon-bg">
              <CheckCircle size={18} color="#fff" />
            </div>
            <span>{toast.message}</span>
          </div>
          <button className="toast-close" onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      <div className="user-login-split">
        <div className="user-brand-panel">
          <div className="brand-panel-content">
            <Link to="/" className="brand-panel-logo-link">
              <img src="/Logo.png" alt="Shoraluxe" className="brand-panel-logo" />
            </Link>
            <div className="brand-badge">SHORALUXE SECURE</div>
            <h1>Premium beauty verified in seconds.</h1>
            <p>Your account is protected by industry-leading 256-bit encryption for safe &amp; fast shopping.</p>
          </div>
        </div>

        <div className="user-form-panel">
          <div className="user-form-wrap">
            {user ? (
              <div className="anim-slide-in profile-view">
                <h2>Welcome, {user.name.split(' ')[0]}!</h2>
                <p className="form-sub">Manage your account and view your orders.</p>
                
                <div className="profile-details-card">
                  <div className="profile-info-item">
                    <User size={18} className="info-icon" />
                    <div className="info-text">
                      <label>Full Name</label>
                      <span>{user.name}</span>
                    </div>
                  </div>
                  <div className="profile-info-item">
                    <Mail size={18} className="info-icon" />
                    <div className="info-text">
                      <label>Email Address</label>
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-actions-grid">
                  <Link to="/my-orders" className="profile-action-btn">
                    <ShoppingBag size={20} />
                    <span>My Orders</span>
                  </Link>
                  <Link to="/track-order" className="profile-action-btn">
                    <Truck size={20} />
                    <span>Track Order</span>
                  </Link>
                </div>

                <button onClick={handleRegisterBiometric} className="ul-bio-btn register-bio" disabled={loading}>
                  <Fingerprint size={18} /> {loading ? 'Registering...' : 'Link Fingerprint / PIN'}
                </button>

                <button onClick={handleLogout} className="ul-submit logout-btn">
                  Logout
                </button>

                <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
                  <Link to="/" style={{ color: '#000', textDecoration: 'none', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <RotateCcw size={14} /> Continue Shopping
                  </Link>
                </div>
              </div>
            ) : (
              /* EMAIL LOGIN - Primary flow */
              <div className="anim-slide-in">
                <h2>{isSignup ? 'Create Account' : 'Sign in'}</h2>
                <p className="form-sub">
                  {isSignup ? 'Join Shoraluxe for a premium shopping experience.' : 'Sign in using your email or Google account.'}
                </p>
                
                <form onSubmit={handleEmailLogin} className="user-login-form">
                  {isSignup && (
                    <>
                      <div className="ul-field">
                        <label>Full Name</label>
                        <div className="ul-input-wrap">
                          <User size={18} className="ul-icon" />
                          <input type="text" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        </div>
                      </div>
                      <div className="ul-field">
                        <label>Mobile Number</label>
                        <div className="ul-input-wrap">
                          <Phone size={18} className="ul-icon" />
                          <input type="tel" placeholder="+91 99999 99999" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="ul-field">
                    <label>Email Address</label>
                    <div className="ul-input-wrap">
                      <Mail size={18} className="ul-icon" />
                      <input type="email" name="email" placeholder="john@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                  </div>

                  <div className="ul-field">
                    <label>{isSignup ? 'Create 6-Digit PIN' : 'Enter 6-Digit PIN'}</label>
                    <div className="ul-input-wrap">
                      <Lock size={18} className="ul-icon" />
                      <input 
                        type={showPasscode ? "text" : "password"} 
                        placeholder="••••••" 
                        value={form.passcode} 
                        onChange={(e) => setForm({ ...form, passcode: e.target.value })} 
                        maxLength={6} 
                        required 
                      />
                      <button type="button" className="ul-eye-btn" onClick={() => setShowPasscode(!showPasscode)}>
                        {showPasscode ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {isSignup && (
                    <div className="ul-field anim-fade-in">
                      <label>Confirm 6-Digit PIN</label>
                      <div className="ul-input-wrap">
                        <Lock size={18} className="ul-icon" />
                        <input 
                          type={showPasscode ? "text" : "password"} 
                          placeholder="••••••" 
                          value={form.confirmPasscode} 
                          onChange={(e) => setForm({ ...form, confirmPasscode: e.target.value })} 
                          maxLength={6} 
                          required 
                        />
                      </div>
                    </div>
                  )}

                  {error && <div className="ul-error"><AlertCircle size={16} /> {error}</div>}
                  
                  <button type="submit" className="ul-submit" disabled={loading || form.passcode.length !== 6}>
                    {loading ? 'Processing...' : (isSignup ? 'Create My Account' : 'Sign in with PIN')}
                  </button>

                  {!isSignup && (
                    <button type="button" onClick={handleBiometricLogin} className="ul-bio-btn">
                      <Fingerprint size={18} /> Use Fingerprint / Phone PIN
                    </button>
                  )}
                </form>

                <div className="ul-toggle-mode">
                  {isSignup ? (
                    <p>Already have an account? <button onClick={() => setIsSignup(false)}>Sign In</button></p>
                  ) : (
                    <p>New to Shoraluxe? <button onClick={() => setIsSignup(true)}>Create Account</button></p>
                  )}
                </div>

                <div style={{ textAlign: 'center', margin: '1.5rem 0', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#e0e0e0', zIndex: 1 }}></div>
                  <span style={{ position: 'relative', zIndex: 2, background: '#fff', padding: '0 10px', color: '#666', fontSize: '0.9rem' }}>or continue with</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      console.log('Login Failed');
                      setError('Google Login popup closed or failed. (Check console for origin errors)');
                    }}
                    useOneTap
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                  />
                </div>

                <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
                  <Link to="/" style={{ color: '#000', textDecoration: 'none', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <RotateCcw size={14} /> Back to Store
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
