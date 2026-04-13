import React, { useState } from 'react';
import { Save } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    storeName: 'Shoraluxe',
    tagline: 'Luxury Skincare for Every Skin',
    email: 'care@shoraluxe.com',
    phone: '+91 98765 43210',
    freeShippingThreshold: 999,
    currency: 'INR',
    razorpayKey: '',
    gstNumber: '',
  });

  const handleChange = (e) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    localStorage.setItem('shoraluxe_settings', JSON.stringify(settings));
    alert('Settings saved!');
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
            <Field label="Currency" name="currency" />
            <Field label="Razorpay Key (API)" name="razorpayKey" placeholder="rzp_live_..." />
            <Field label="GST Number" name="gstNumber" placeholder="22AAAAA0000A1Z5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
