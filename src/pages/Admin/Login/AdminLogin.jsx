import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Hardcoded simple auth for prototype purposes
    if (email === 'admin@shoraluxe.com' && password === 'admin123') {
      localStorage.setItem('shoraluxe_admin_auth', 'true');
      navigate('/admin');
    } else {
      setError('Invalid admin credentials. (Hint: use admin@shoraluxe.com / admin123)');
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-lock-icon">
            <Lock size={24} />
          </div>
          <h2>Shoraluxe Admin</h2>
          <p>Restricted access. Please sign in to manage the store.</p>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="admin@shoraluxe.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label>Master Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="admin-error-msg">{error}</div>}

          <button type="submit" className="admin-login-btn">
            Secure Login
          </button>
        </form>

        <div className="admin-login-footer">
          <a href="/">← Return to Storefront</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
