import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Save } from 'lucide-react';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';
import imageCompression from 'browser-image-compression';
import { useShop } from '../../../context/ShopContext';
import { uploadFile } from '../../../lib/upload';

const initialBanners = [
  { id: 1, title: 'Summer Glow Collection', subtitle: 'Discover radiant skincare for the season', cta: 'Shop Now', bg: '#f7e9d7', active: true },
  { id: 2, title: 'New Arrivals — Retinol Series', subtitle: 'Science-backed anti-aging formulas', cta: 'Explore', bg: '#e8e8f0', active: false },
];

const AdminBanners = () => {
  const { popupConfig, updatePopupConfig } = useShop();
  const [banners, setBanners] = useState(initialBanners);
  const [localPopup, setLocalPopup] = useState(popupConfig);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState('');
  const [uploading, setUploading] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleActive = (id) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b));
  };

  const deleteBanner = (id) => {
    setBanners(prev => prev.filter(b => b.id !== id));
    setDeleteConfirm(null);
  };

  const handlePopupChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setLocalPopup(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      const url = await uploadFile(compressedFile, 'brand-assets', 'banners');
      setLocalPopup(prev => ({ ...prev, image: url }));
      showToast('Image uploaded and compressed successfully!');
    } catch (err) {
      console.error(err);
      showToast('Image upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const savePopupConfig = () => {
    setConfirmModal({
      isOpen: true,
      title: "Deploy Popup Ad?",
      message: "This will update the global promotional popup for all users immediately.",
      confirmText: "Yes, Deploy",
      onConfirm: () => {
        updatePopupConfig(localPopup);
        showToast('Popup config successfully deployed! 🎉');
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="admin-page-wrap">
      {toast && <div className="admin-toast">{toast}</div>}
      
      {/* POPUP ADVERT MANAGER */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Global Popup Advertisement</h1>
        <button className="admin-btn-primary" onClick={savePopupConfig}><Save size={18} /> Publish Popup Event</button>
      </div>

      <div className="admin-card" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <input type="checkbox" name="active" checked={localPopup.active} onChange={handlePopupChange} style={{ transform: 'scale(1.2)' }} />
              Enable Popup Overlay Across Store
            </label>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Heading Text</label>
              <input type="text" name="title" value={localPopup.title} onChange={handlePopupChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Subtitle / Offer Description</label>
              <input type="text" name="subtitle" value={localPopup.subtitle} onChange={handlePopupChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Image Source (URL or Local Upload)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="text" name="image" placeholder="Paste image URL..." value={localPopup.image} onChange={handlePopupChange} style={{ flex: 1, padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none' }} />
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: '0.9rem', maxWidth: '250px' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Button Text</label>
              <input type="text" name="buttonText" value={localPopup.buttonText} onChange={handlePopupChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Link Target</label>
              <input type="text" name="link" value={localPopup.link} onChange={handlePopupChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none' }} />
            </div>
          </div>

        </div>
      </div>


      {/* HERO BANNERS */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Hero Banners</h1>
        <button className="admin-btn-primary" style={{ background: '#333' }}><Plus size={18} /> Add Banner</button>
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
              <button className="t-action-btn delete" title="Delete" onClick={() => setDeleteConfirm(banner.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal 
        isOpen={!!deleteConfirm}
        title="Delete Banner?"
        message="This will remove the banner from your local configuration."
        onConfirm={() => deleteBanner(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};

export default AdminBanners;
