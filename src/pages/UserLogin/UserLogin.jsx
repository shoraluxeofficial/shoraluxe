import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Phone, User, ShoppingBag, CheckCircle, Mail, RotateCcw, Lock, ArrowRight, X, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useShop } from '../../context/ShopContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './UserLogin.css';
// Firebase removed per request: no client-side Firebase usage

const API_URL = import.meta.env.PROD ? '/api/auth' : 'http://localhost:5000/api/auth';

const UserLogin = () => {
  // We switched to email-based login + Google OAuth. Phone OTP flow is commented out below.
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', passcode: '', confirmPasscode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [verificationId, setVerificationId] = useState(null);
  const [toast, setToast] = useState(null); // { message: '', type: 'success' }
  const [userId, setUserId] = useState(null);

  const { setUser } = useShop();
  const navigate = useNavigate();
  const location = useLocation();


  // Lock body scroll on login page
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Toast Timer
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (message) => {
    setToast({ message });
    if (message.includes('Success')) {
      confetti({ particleCount: 100, spread: 70, origin: { x: 0.9, y: 0.1 } });
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };


  // EMAIL LOGIN
  const handleEmailLogin = async (e) => {
    if (e) e.preventDefault();
    if (!form.email) { setError('Enter a valid email'); return; }
    if (!form.passcode || form.passcode.length !== 6) { setError('Enter your 6-digit PIN'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/email-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, passcode: form.passcode, deviceId: 'browser_id' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      handleFinalSuccess(data.user, 'success_login');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  // Google OAuth Client-side Success
  const handleGoogleSuccess = async (credentialResponse) => {
    if (credentialResponse.credential) {
      const decodedUser = jwtDecode(credentialResponse.credential);
      console.log("Decoded Google User:", decodedUser);
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/oauth-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credential: credentialResponse.credential, // Send the token to the backend for secure validation
            deviceId: 'browser_id'
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Google Login failed on server');
        handleFinalSuccess(data.user, 'success_login');
      } catch (err) {
        setError(err.message || 'Backend connection failed. Is the server running?');
      } finally {
        setLoading(false);
      }
    }
  };

  // STEP 2: VERIFY OTP
  const verifyOtp = async () => {
    if (form.otp.length < 6) return;
    setLoading(true);
    try {
      const phoneWithCode = `+91${form.phone}`;

      // 1. Verify OTP with backend
      const verifyRes = await fetch(`${API_URL}/verify-backend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phoneWithCode, otp: form.otp })
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) throw new Error(verifyData.error || 'Invalid OTP');

      // 2. Check if user exists to decide next step
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phoneWithCode, deviceId: 'browser_id', checkOnly: true })
      });
      const data = await res.json();

      if (res.status === 404 || (data && data.error === 'User not found')) {
        setStep(3); // New User -> Ask for Details
      } else {
        handleFinalSuccess(data.user || { name: 'User', mobile: phoneWithCode }, 'success_login');
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: REGISTER DETAILS
  const handleRegisterDetails = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || form.passcode.length !== 6) {
      setError('Please fill all fields and 6-digit PIN.');
      return;
    }
    if (form.passcode !== form.confirmPasscode) {
      setError('PIN and Confirm PIN do not match.');
      return;
    }

    setLoading(true);
    try {
      const phoneWithCode = `+91${form.phone}`;
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, mobile: phoneWithCode, email: form.email, initialPasscode: form.passcode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      handleFinalSuccess({ name: form.name, mobile: phoneWithCode }, 'success_reg');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 4: RETURNING USER LOGIN (Passcode Only)
  const handleReturningLogin = async (e) => {
    e.preventDefault();
    if (form.passcode.length !== 6) {
      setError('Please enter your 6-digit PIN.');
      return;
    }
    setLoading(true);
    try {
      const phoneWithCode = `+91${form.phone}`;
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phoneWithCode, passcode: form.passcode, deviceId: 'browser_id' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      handleFinalSuccess(data.user, 'success_login');
    } catch (err) {
      setError(err.message || 'Incorrect PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSuccess = (userData, type) => {
    if (!userData || !userData.name) {
      console.warn('Login success but user data missing name. Using form data as fallback.');
      userData = { ...userData, name: form.name || 'User', mobile: `+91${form.phone}` };
    }

    console.log('Final Login Success. Setting user:', userData);
    localStorage.setItem('shoraluxe_user', JSON.stringify(userData));
    setUser(userData);

    showToast(type === 'success_reg' ? 'Successfully Registered! 🎉' : 'Successfully login! 🎉');

    setTimeout(() => {
      const redirect = new URLSearchParams(location.search).get('redirect');
      window.location.href = redirect || '/';
    }, 1500);
  };

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


            {/* EMAIL LOGIN - Primary flow */}
            <div className="anim-slide-in">
              <h2>Sign in</h2>
              <p className="form-sub">Sign in using your email or Google account.</p>
              <form onSubmit={handleEmailLogin} className="user-login-form">
                <div className="ul-field">
                  <label>Email Address</label>
                  <div className="ul-input-wrap">
                    <Mail size={18} className="ul-icon" />
                    <input type="email" name="email" placeholder="john@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>
                <div className="ul-field">
                  <label>6-Digit PIN</label>
                  <div className="ul-input-wrap">
                    <Lock size={18} className="ul-icon" />
                    <input type="password" name="passcode" placeholder="••••••" value={form.passcode} onChange={(e) => setForm({ ...form, passcode: e.target.value })} maxLength={6} required />
                  </div>
                </div>
                {error && <div className="ul-error"><AlertCircle size={16} /> {error}</div>}
                <button type="submit" className="ul-submit" disabled={loading || form.passcode.length !== 6}>
                  {loading ? 'Signing in...' : 'Sign in with Email'}
                </button>
              </form>

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
