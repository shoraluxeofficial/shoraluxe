import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

const initialBanners = [
  { id: 1, title: 'Summer Glow Collection', subtitle: 'Discover radiant skincare for the season', cta: 'Shop Now', bg: '#f7e9d7', active: true },
  { id: 2, title: 'New Arrivals — Retinol Series', subtitle: 'Science-backed anti-aging formulas', cta: 'Explore', bg: '#e8e8f0', active: false },
];

const AdminBanners = () => {
  const [banners, setBanners] = useState(initialBanners);

  const toggleActive = (id) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b));
  };

  const deleteBanner = (id) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="admin-page-wrap">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Hero Banners</h1>
        <button className="admin-btn-primary"><Plus size={18} /> Add Banner</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {banners.map(banner => (
          <div key={banner.id} className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ width: 180, height: 80, background: banner.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.75rem', color: '#555', fontWeight: 600 }}>{banner.title}</span>
            </div>
            <div style={{ flexGrow: 1 }}>
              <strong style={{ display: 'block', color: '#111' }}>{banner.title}</strong>
              <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{banner.subtitle}</span>
            </div>
            <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: banner.active ? '#d1fae5' : '#f3f4f6', color: banner.active ? '#065f46' : '#6b7280' }}>
              {banner.active ? 'Active' : 'Inactive'}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="t-action-btn edit" title={banner.active ? 'Deactivate' : 'Activate'} onClick={() => toggleActive(banner.id)}>
                {banner.active ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button className="t-action-btn delete" title="Delete" onClick={() => deleteBanner(banner.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBanners;
