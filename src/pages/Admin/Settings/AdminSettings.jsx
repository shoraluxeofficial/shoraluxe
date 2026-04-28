import React, { useState } from 'react';
import { Save, Lock, Eye, EyeOff } from 'lucide-react';
import { useNotify } from '../../../components/common/Notification/Notification';

const AdminSettings = () => {
  const { notify } = useNotify();
  const [showNewPass, setShowNewPass] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('shoraluxe_settings');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      storeName: 'Shoraluxe',
      tagline: 'Luxury Skincare for Every Skin',
      email: 'care@shoraluxe.com',
      phone: '+91 98765 43210',
      freeShippingThreshold: 999,
      chargeDelivery: true, // Default to true
      currency: 'INR',
      razorpayKey: '',
      gstNumber: '',
      ...parsed
    };
  });

  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleChange = (e) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    localStorage.setItem('shoraluxe_settings', JSON.stringify(settings));
    showToast('Store settings saved successfully! ⚙️');
  };

  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      <input
        type={type}
        name={name}
        value={settings[name]}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.95rem', outline: 'none' }}
      />
    </div>
  );

  return (
    <div className="admin-page-wrap">
      {toast && <div className="admin-toast">{toast}</div>}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Store Settings</h1>
        <button className="admin-btn-primary" onClick={handleSave}><Save size={18} /> Save Changes</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="admin-card">
          <h3 style={{ marginBottom: '1.5rem', color: '#111827' }}>Brand Identity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <Field label="Store Name" name="storeName" />
            <Field label="Brand Tagline" name="tagline" />
            <Field label="Contact Email" name="email" type="email" />
            <Field label="Phone Number" name="phone" />
          </div>
        </div>

        <div className="admin-card">
          <h3 style={{ marginBottom: '1.5rem', color: '#111827' }}>Commerce Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <Field label="Free Shipping Above (₹)" name="freeShippingThreshold" type="number" />
            
            {/* Delivery Charge Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: 8, background: settings.chargeDelivery ? '#f9fafb' : '#ecfdf5' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'block' }}>Charge Delivery Fees</label>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>If off, all orders get free shipping regardless of total.</span>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                <input 
                  type="checkbox" 
                  checked={settings.chargeDelivery} 
                  onChange={(e) => {
                    const newVal = e.target.checked;
                    setSettings(p => ({...p, chargeDelivery: newVal}));
                    localStorage.setItem('shoraluxe_settings', JSON.stringify({...settings, chargeDelivery: newVal}));
                  }} 
                  style={{ opacity: 0, width: 0, height: 0 }} 
                />
                <span style={{
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                  backgroundColor: settings.chargeDelivery ? '#111827' : '#d1d5db', 
                  transition: '.4s', borderRadius: 24
                }}>
                  <span style={{
                    position: 'absolute', content: '""', height: 18, width: 18, left: 3, bottom: 3,
                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                    transform: settings.chargeDelivery ? 'translateX(20px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>

            <Field label="Currency" name="currency" />
            <Field label="Razorpay Key (API)" name="razorpayKey" placeholder="rzp_live_..." />
            <Field label="GST Number" name="gstNumber" placeholder="22AAAAA0000A1Z5" />
          </div>
        </div>

        <div className="admin-card">
          <h3 style={{ marginBottom: '1.5rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} /> Master Access Security
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>New Master Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showNewPass ? "text" : "password"}
                  placeholder="Enter new master password"
                  id="new-pass"
                  style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', border: '1px solid #e5e7eb', borderRadius: 8 }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPass(!showNewPass)}
                  style={{ position: 'absolute', right: '0.75rem', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex' }}
                >
                  {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button 
              className="admin-btn-secondary" 
              onClick={() => {
                const pass = document.getElementById('new-pass').value;
                if(pass.length < 6) { notify('Password must be at least 6 characters.', 'error'); return; }
                localStorage.setItem('shoraluxe_master_pass', pass);
                notify('Master password updated successfully! 🔒', 'success');
                document.getElementById('new-pass').value = '';
              }}
            >
              Update Security Key
            </button>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
              Note: Changing your password will not log you out currently, but it will be required for your next session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
