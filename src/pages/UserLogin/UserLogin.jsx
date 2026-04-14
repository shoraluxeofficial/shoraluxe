import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Phone, User, ShoppingBag, CheckCircle, Mail, RotateCcw, Lock, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useShop } from '../../context/ShopContext';
import './UserLogin.css';

const API_URL = 'http://localhost:5000/api/auth';

const UserLogin = () => {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Register Details, 4: Returning Login
  const [form, setForm] = useState({ name: '', phone: '', email: '', otp: '', passcode: '', confirmPasscode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [verificationId, setVerificationId] = useState(null);
  const [toast, setToast] = useState(null); // { message: '', type: 'success' }
  const [userId, setUserId] = useState(null);
  
  const { setUser } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const recaptchaContainerRef = useRef(null);

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

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        size: 'invisible'
      });
    }
  };

  // STEP 1: START (Check user first)
  const handleStart = async (e) => {
    e.preventDefault();
    if (form.phone.length < 10) {
      setError('Enter a valid 10-digit number.');
      return;
    }
    setLoading(true);
    
    try {
      const phoneWithCode = `+91${form.phone}`;
      
      // Check if user exists on backend before sending OTP
      const checkRes = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phoneWithCode, deviceId: 'browser_id', checkOnly: true })
      });
      const checkData = await checkRes.json();

      if (checkRes.status === 200 || checkRes.status === 206) {
          // Returning user -> Go to Passcode Step
          setStep(4);
          setLoading(false);
          return;
      }

      // If 404/Not Found -> Proceed with OTP for Registration
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneWithCode, appVerifier);
      setVerificationId(confirmationResult);
      setStep(2); // Move to OTP
      setTimer(60);
    } catch (err) {
      setError('Connection failed. Please check number or connection.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY OTP
  const verifyOtp = async () => {
    if (form.otp.length < 6) return;
    setLoading(true);
    try {
      await verificationId.confirm(form.otp);
      const phoneWithCode = `+91${form.phone}`;
      
      // Check if user exists on backend
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phoneWithCode, deviceId: 'browser_id', checkOnly: true })
      });
      const data = await res.json();

      if (res.status === 404 || (data && data.error === 'User not found')) {
          setStep(3); // New User -> Ask for Name/Email/PIN
      } else {
          // Returning User -> Success or Ask for PIN?
          // Since we just did OTP, we can log them in directly or ask for PIN.
          // User asked for "after registeration need to appeare mobile and passcode"
          // Let's assume OTP-based login for simplicity now.
          handleFinalSuccess(data.user || { name: 'User', mobile: phoneWithCode }, 'success_login');
      }
    } catch (err) {
      setError('Invalid OTP code.');
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
            <div className="brand-badge">SHORALUXE SECURE</div>
            <h1>Premium beauty verified in seconds.</h1>
            <p>Your account is protected by industry-leading 256-bit encryption for safe & fast shopping.</p>
          </div>
        </div>

        <div className="user-form-panel">
          <div className="user-form-wrap">
            <div id="recaptcha-container" ref={recaptchaContainerRef}></div>

            {/* STEP 1: PHONE */}
            {step === 1 && (
              <div className="anim-slide-in">
                <h2>Welcome</h2>
                <p className="form-sub">Enter your mobile number to get started.</p>
                <form onSubmit={handleStart} className="user-login-form">
                  <div className="ul-field">
                    <label>Mobile Number</label>
                    <div className="ul-input-wrap">
                      <div className="country-code">+91</div>
                      <Phone size={18} className="ul-icon" style={{ left: '3.5rem' }} />
                      <input type="tel" name="phone" placeholder="98765 43210" value={form.phone} onChange={handleChange} maxLength={10} style={{ paddingLeft: '5.5rem' }} required />
                    </div>
                  </div>
                  {error && <div className="ul-error">{error}</div>}
                  <button type="submit" className="ul-submit" disabled={loading}>
                    {loading ? 'Thinking...' : 'Continue'}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
              <div className="anim-slide-in">
                <h2>Enter OTP</h2>
                <p className="form-sub">We've sent a code to +91 {form.phone}</p>
                <div className="otp-container">
                    <input type="text" name="otp" className="otp-macro-input" maxLength={6} value={form.otp} onChange={(e) => setForm({...form, otp: e.target.value.replace(/\D/g, '')})} placeholder="••••••" autoFocus />
                </div>
                {error && <div className="ul-error">{error}</div>}
                <button onClick={verifyOtp} className="ul-submit" disabled={loading || form.otp.length < 6}>
                   {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <div className="resend-block">
                    {timer > 0 ? `Resend in ${timer}s` : <button className="resend-btn" onClick={handleStart}>Resend SMS</button>}
                </div>
              </div>
            )}

            {/* STEP 3: REGISTER DETAILS */}
            {step === 3 && (
              <div className="anim-slide-in">
                <h2>Almost There</h2>
                <p className="form-sub">Just a few details to protect your account.</p>
                <form onSubmit={handleRegisterDetails} className="user-login-form">
                  <div className="ul-field">
                    <label>Full Name</label>
                    <div className="ul-input-wrap">
                      <User size={18} className="ul-icon" />
                      <input type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="ul-field">
                    <label>Email Address</label>
                    <div className="ul-input-wrap">
                      <Mail size={18} className="ul-icon" />
                      <input type="email" name="email" placeholder="john@example.com" value={form.email} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="ul-field">
                    <label>Set 6-Digit PIN</label>
                    <div className="ul-input-wrap">
                      <Lock size={18} className="ul-icon" />
                      <input type="password" name="passcode" placeholder="Create PIN" value={form.passcode} onChange={handleChange} maxLength={6} required />
                    </div>
                  </div>
                  <div className="ul-field">
                    <label>Confirm PIN</label>
                    <div className="ul-input-wrap">
                      <Lock size={18} className="ul-icon" />
                      <input type="password" name="confirmPasscode" placeholder="Repeat PIN" value={form.confirmPasscode} onChange={handleChange} maxLength={6} required />
                    </div>
                  </div>
                  {error && <div className="ul-error">{error}</div>}
                  <button type="submit" className="ul-submit" disabled={loading}>
                    Create Account
                  </button>
                </form>
              </div>
            )}

            {/* STEP 4: PASSCODE LOGIN (Returning) */}
            {step === 4 && (
              <div className="anim-slide-in">
                <h2>Welcome Back</h2>
                <p className="form-sub">Welcome back! Please enter your 6-digit PIN to log in.</p>
                <form onSubmit={handleReturningLogin} className="user-login-form">
                  <div className="ul-field">
                    <label>Enter 6-Digit PIN</label>
                    <div className="ul-input-wrap">
                        <Lock size={18} className="ul-icon" />
                        <input type="password" name="passcode" placeholder="••••••" value={form.passcode} onChange={handleChange} maxLength={6} required style={{ letterSpacing: '8px', fontSize: '1.2rem' }} autoFocus />
                    </div>
                  </div>
                  {error && <div className="ul-error">{error}</div>}
                  <button type="submit" className="ul-submit" disabled={loading || form.passcode.length !== 6}>
                     {loading ? 'Authenticating...' : 'Sign In'}
                  </button>
                  <div className="resend-block">
                    <button type="button" className="resend-btn" onClick={() => setStep(2)}>Forgot PIN? Use OTP</button>
                  </div>
                </form>
              </div>
            )}

            <div className="ul-footer" style={{ marginTop: '2rem' }}>
              <Link to="/">← Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
