import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { firewall } from '../../../lib/firewall';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      img: 'http://www.shoraluxe.com/cdn/shop/files/poster_4-01.png?v=1768804165&width=1000',
      title: 'Advanced Serum Science',
      desc: 'Formulated with high-potency Vitamin C & Niacinamide.'
    },
    {
      img: 'http://www.shoraluxe.com/cdn/shop/files/poster_3-01.png?v=1768804184&width=1000',
      title: 'Ultimate UV Defense',
      desc: 'Broad-spectrum SPF 50+++ for daily protection.'
    },
    {
      img: 'http://www.shoraluxe.com/cdn/shop/files/001_3.png?v=1768804151&width=1000',
      title: 'Waitless Hydration',
      desc: 'Non-sticky hyaluronic acid moisturizer for glowing skin.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    // 1. FIREWALL RATE LIMITING
    const rateLimit = firewall.checkRateLimit('admin_login');
    if (rateLimit.limited) {
      firewall.LogSecurityEvent('RATE_LIMIT_EXCEEDED', { email });
      setError(`Access Locked. Please wait ${rateLimit.retryAfter}s.`);
      return;
    }

    // 2. FIREWALL THREAT DETECTION (XSS/SQLi Pattern Check)
    if (firewall.isMalicious(email) || firewall.isMalicious(password)) {
      firewall.LogSecurityEvent('INJECTION_THREAT', { email });
      setError('Security Alert: Suspicious input pattern detected.');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      // DYNAMIC PASSWORD CHECK
      const storedPass = localStorage.getItem('shoraluxe_master_pass') || 'admin123';
      
      if (email === 'admin@shoraluxe.com' && password === storedPass) {
        sessionStorage.setItem('shoraluxe_admin_auth', 'true');
        navigate('/admin');
      } else {
        setError('Verification failed. Check credentials.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="login-split-page">
      {/* Decorative Orbs behind splits */}
      <div className="v3-orb orb-red"></div>
      <div className="v3-orb orb-gold"></div>

      <div className="login-split-container">
        {/* LEFT SIDE: AUTO SLIDER */}
        <div className="login-slider-side">
          {slides.map((slide, index) => (
            <div 
              key={index} 
              className={`slide-item ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `linear-gradient(rgba(109, 14, 44, 0.4), rgba(0, 0, 0, 0.8)), url(${slide.img})` }}
            >
              <div className="slide-content">
                <span className="slide-brand">SHORALUXE CMS</span>
                <h2>{slide.title}</h2>
                <p>{slide.desc}</p>
                <div className="slide-indicators">
                  {slides.map((_, i) => (
                    <div key={i} className={`indicator ${i === currentSlide ? 'active' : ''}`}></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE: GLASS FORM */}
        <div className="login-form-side-v3">
          <div className="form-glass-wrap">
            <div className="v3-logo-group">
              <div className="v3-shora">SHORA</div>
              <div className="v3-luxe">LUXE</div>
              <p className="v3-tag">AUTHENTICATED ACCESS ONLY</p>
            </div>

            <form onSubmit={handleLogin} className="v3-form-actual">
              <div className="v3-field">
                <label>Admin ID</label>
                <div className="v3-input-box">
                  <Mail className="v3-icon" size={18} />
                  <input 
                    type="email" 
                    placeholder="admin@shoraluxe.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="v3-field">
                <label>Access Pin</label>
                <div className="v3-input-box">
                  <Lock className="v3-icon" size={18} />
                  <input 
                    type={showPass ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="v3-eye-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <div className="v3-error-pill">{error}</div>}

              <button type="submit" className={`v3-btn-submit ${loading ? 'waiting' : ''}`} disabled={loading}>
                {loading ? 'Initializing...' : 'ENTER DASHBOARD'}
              </button>
            </form>

            <div className="v3-footer-links">
              <Link to="/">← EXIT TO STOREFRONT</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
