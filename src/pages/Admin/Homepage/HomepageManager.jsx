import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Upload, Eye, Pencil, Video, Image as ImageIcon, LayoutDashboard, FileText, ShoppingBag, X, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { uploadFile } from '../../../lib/upload';
import { useNotify } from '../../../components/common/Notification/Notification';
import { useShop } from '../../../context/ShopContext';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';
import imageCompression from 'browser-image-compression';
import './HomepageManager.css';

const HERO_DEFAULTS = [
  { desktopImg: '/Banners/1000000387.jpg.jpeg', mobileImg: '/Banners/1000000387.jpg.jpeg', url: '/shop', alt: 'Premium Care' },
  { desktopImg: '/Banners/1000000389 (1).jpg.jpeg', mobileImg: '/Banners/1000000389 (1).jpg.jpeg', url: '/shop', alt: 'Luxury Serums' },
  { desktopImg: '/Banners/WhatsApp_Image_2026-02-07_at_16.20.17_2 (1).webp', mobileImg: '/Banners/WhatsApp_Image_2026-02-07_at_16.20.17_2 (1).webp', url: '/shop', alt: 'Special Offer' }
];
const CTA_DEFAULTS = { heading: 'Your Journey to Radiant Skin Starts Here', text: 'Discover the perfect blend of science and nature.', tag: 'Limited Edition', buttonText: 'SHOP THE COLLECTION', bgImage: '' };
const QUIZ_DEFAULTS = { heading: 'Build Your Perfect Routine, Instantly.', text: 'Answer a few quick questions.', buttonText: 'Start The Quiz' };
const VIDEO_DEFAULTS = [
  { url: '', title: 'Pure Texture', desc: 'The science of silky hydration.' },
  { url: '', title: 'Radiant Glow', desc: 'Unlock your natural luminosity safely.' },
];
const WATCH_SHOP_DEFAULTS = [
  { title: 'Rewind Age Reversing Gel', price: 1234, originalPrice: 1899, discount: '35% off', views: '904', img: 'https://images.unsplash.com/photo-1590736962386-38703a987679?auto=format&fit=crop&q=80&w=400', video: '', overlayText: 'Reduces wrinkles by 11% in 5 days' },
];

const TABS = [
  { key: 'hero',        label: 'Hero Banners',  icon: ImageIcon,       type: 'array' },
  { key: 'cta',         label: 'CTA Section',   icon: LayoutDashboard, type: 'object' },
  { key: 'quiz',        label: 'Quiz Section',  icon: FileText,        type: 'object' },
  { key: 'videoBanners',label: 'Video Banners', icon: Video,           type: 'array' },
  { key: 'watchAndShop',label: 'Watch & Shop',  icon: ShoppingBag,     type: 'array' },
];

// ── INLINE EDIT MODAL ────────────────────────────────────────────────────────
const EditModal = ({ isOpen, onClose, onSave, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="hm-edit-overlay" onClick={onClose}>
      <div className="hm-edit-modal" onClick={e => e.stopPropagation()}>
        <div className="hm-edit-modal-header">
          <h3><Pencil size={16}/> {title}</h3>
          <button className="hm-modal-close" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="hm-edit-modal-body">{children}</div>
        <div className="hm-edit-modal-footer">
          <button className="hm-btn-cancel" onClick={onClose}><X size={15}/> Cancel</button>
          <button className="hm-btn-save" onClick={onSave}><Check size={15}/> Save & Publish</button>
        </div>
      </div>
    </div>
  );
};

const HomepageManager = () => {
  const [sections, setSections] = useState({
    hero: HERO_DEFAULTS, cta: CTA_DEFAULTS, quiz: QUIZ_DEFAULTS,
    brandPromise: [], videoBanners: VIDEO_DEFAULTS, watchAndShop: WATCH_SHOP_DEFAULTS
  });
  const [loading, setLoading] = useState(true);
  const { products } = useShop();
  const [uploading, setUploading] = useState(null);
  const [activeTab, setActiveTab] = useState('hero');
  const [editModal, setEditModal] = useState({ open: false, index: null, draft: null, title: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const { notify } = useNotify();

  // ── DATA FETCH ────────────────────────────────────────────────────────────
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('homepage_sections').select('*');
      if (error) throw error;
      if (data) {
        const db = {};
        data.forEach(r => { db[r.section_name] = r.content; });
        setSections({
          hero: db.hero ?? HERO_DEFAULTS,
          cta: db.cta ?? CTA_DEFAULTS,
          quiz: db.quiz ?? QUIZ_DEFAULTS,
          videoBanners: db.videoBanners ?? VIDEO_DEFAULTS,
          watchAndShop: db.watchAndShop ?? WATCH_SHOP_DEFAULTS,
          brandPromise: db.brandPromise ?? [],
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── SAVE TO DB ────────────────────────────────────────────────────────────
  const saveSection = async (key, content) => {
    const { error } = await supabase.from('homepage_sections').upsert(
      { section_name: key, content, updated_at: new Date() },
      { onConflict: 'section_name' }
    );
    if (error) { notify('Failed to save. Check your Supabase connection.', 'error'); return false; }
    notify('Changes published successfully! 🎉', 'success');
    return true;
  };

  // ── FILE UPLOAD ───────────────────────────────────────────────────────────
  const handleUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(field);
      let f = file;
      if (file.type.startsWith('image/')) {
        try { f = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true }); } catch(_) {}
      }
      const url = await uploadFile(f, 'brand-assets', activeTab);
      setEditModal(prev => ({ ...prev, draft: { ...prev.draft, [field]: url } }));
      notify('File uploaded!', 'success');
    } catch (err) {
      notify('Upload failed.', 'error');
    } finally { setUploading(null); }
  };

  // ── OPEN EDIT for ARRAY item ──────────────────────────────────────────────
  const openEdit = (index, tabLabel) => {
    const tab = TABS.find(t => t.key === activeTab);
    const data = tab.type === 'array' ? { ...sections[activeTab][index] } : { ...sections[activeTab] };
    setEditModal({ open: true, index, draft: data, title: `Edit ${tabLabel}` });
  };

  // ── SAVE EDIT OR NEW ITEM ─────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    const tab = TABS.find(t => t.key === activeTab);
    let newContent;
    if (tab.type === 'array') {
      if (editModal.index === null) {
        // Appending a new item
        newContent = [...(sections[activeTab] || []), editModal.draft];
      } else {
        // Updating an existing item
        newContent = sections[activeTab].map((item, i) => i === editModal.index ? editModal.draft : item);
      }
    } else {
      newContent = editModal.draft;
    }
    const ok = await saveSection(activeTab, newContent);
    if (ok) {
      setSections(prev => ({ ...prev, [activeTab]: newContent }));
      setEditModal({ open: false, index: null, draft: null, title: '' });
    }
  };

  // ── ADD NEW ITEM ──────────────────────────────────────────────────────────
  const handleAdd = () => {
    const blanks = {
      hero: { desktopImg: '', mobileImg: '', url: '', alt: '' },
      videoBanners: { url: '', title: '', desc: '' },
      watchAndShop: { title: '', price: '', originalPrice: '', discount: '', views: '0', img: '', video: '', overlayText: '' },
    };
    const currentTabObj = TABS.find(t => t.key === activeTab);
    const tabLabel = currentTabObj.label.replace(/s$/, ''); // e.g. "Hero Banner"
    
    setEditModal({
      open: true,
      index: null,
      draft: blanks[activeTab],
      title: `Add ${tabLabel}`
    });
  };

  // ── DELETE ITEM ───────────────────────────────────────────────────────────
  const handleDelete = (index) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete this item?',
      message: 'This will permanently remove the item and update the live site immediately.',
      onConfirm: async () => {
        const newList = sections[activeTab].filter((_, i) => i !== index);
        const ok = await saveSection(activeTab, newList);
        if (ok) setSections(prev => ({ ...prev, [activeTab]: newList }));
        setConfirmModal(p => ({ ...p, isOpen: false }));
      }
    });
  };

  if (loading) return (
    <div className="hm-loader">
      <div className="hm-loader-spinner"/>
      <span>Loading CMS...</span>
    </div>
  );

  const currentTab = TABS.find(t => t.key === activeTab);

  // ── RENDER EDIT FIELDS ────────────────────────────────────────────────────
  const renderEditFields = () => {
    const d = editModal.draft || {};
    const upd = (field, val) => setEditModal(prev => ({ ...prev, draft: { ...prev.draft, [field]: val } }));

    const renderUrlSelector = (currentVal, fieldName) => (
      <select 
        className="hm-url-select"
        onChange={(e) => upd(fieldName, e.target.value)}
        value=""
      >
        <option value="" disabled>Select Link</option>
        <option value="/shop">Shop Page</option>
        <option value="/cart">Cart Page</option>
        <option value="/track-order">Track Order</option>
        <optgroup label="Products">
          {products.map(p => (
            <option key={p.id} value={`/product/${p.id}`}>{p.title}</option>
          ))}
        </optgroup>
      </select>
    );

    const renderVisualUpload = (field, label, isMobile = false) => {
      const isUploading = uploading === field;
      const url = d[field] || '';
      const isVideo = url.toLowerCase().endsWith('.mp4');
      return (
        <div className="hm-visual-upload">
          <label>{label}</label>
          <label className={`hm-visual-preview ${url ? 'has-img' : ''} ${isMobile ? 'hm-mobile-preview' : ''}`}>
            <input type="file" accept="image/*,video/mp4" hidden onChange={e => handleUpload(e, field)} />
            {url ? (
              <>
                {isVideo ? (
                  <video src={url} muted loop playsInline autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src={url} alt="" />
                )}
                <div className="hm-visual-overlay"><Upload size={16}/> Change Media</div>
              </>
            ) : (
              <div className="hm-visual-empty">
                <Upload size={24}/>
                <span>Click to Upload</span>
              </div>
            )}
            {isUploading && (
              <div className="hm-visual-loading">
                <div className="hm-loader-spinner" style={{ width: 24, height: 24 }} />
                <span>Uploading...</span>
              </div>
            )}
          </label>
          <div className="hm-visual-input-group">
             <input type="text" value={url} onChange={e => upd(field, e.target.value)} placeholder="Or paste media URL here..." />
          </div>
        </div>
      );
    };

    if (activeTab === 'hero') return (
      <div className="hm-edit-fields">
        <div className="hm-field-grid">
          {renderVisualUpload('desktopImg', 'Desktop Banner (16:9)')}
          {renderVisualUpload('mobileImg', 'Mobile Banner (9:16 or 4:5)', true)}
        </div>
        <div className="hm-field-grid">
          <div className="hm-field">
            <label>Link URL</label>
            <div className="hm-field-row">
              <input type="text" value={d.url || ''} onChange={e => upd('url', e.target.value)} placeholder="/shop" />
              {renderUrlSelector(d.url, 'url')}
            </div>
          </div>
          <div className="hm-field">
            <label>Alt Text</label>
            <input type="text" value={d.alt || ''} onChange={e => upd('alt', e.target.value)} placeholder="Description..." />
          </div>
        </div>
      </div>
    );

    if (activeTab === 'cta') return (
      <div className="hm-edit-fields">
        <div className="hm-field-grid">
          <div className="hm-field">
            <label>Tagline</label>
            <input type="text" value={d.tag || ''} onChange={e => upd('tag', e.target.value)} />
          </div>
          <div className="hm-field">
            <label>Button Text</label>
            <input type="text" value={d.buttonText || ''} onChange={e => upd('buttonText', e.target.value)} />
          </div>
        </div>
        <div className="hm-field">
          <label>Main Heading</label>
          <input type="text" value={d.heading || ''} onChange={e => upd('heading', e.target.value)} />
        </div>
        <div className="hm-field">
          <label>Description</label>
          <textarea value={d.text || ''} onChange={e => upd('text', e.target.value)} rows={3} />
        </div>
        <div className="hm-field">
          {renderVisualUpload('bgImage', 'Background Image URL')}
        </div>
      </div>
    );

    if (activeTab === 'quiz') return (
      <div className="hm-edit-fields">
        <div className="hm-field">
          <label>Section Heading</label>
          <input type="text" value={d.heading || ''} onChange={e => upd('heading', e.target.value)} />
        </div>
        <div className="hm-field">
          <label>Description</label>
          <textarea value={d.text || ''} onChange={e => upd('text', e.target.value)} rows={3} />
        </div>
        <div className="hm-field">
          <label>Button Text</label>
          <input type="text" value={d.buttonText || ''} onChange={e => upd('buttonText', e.target.value)} />
        </div>
      </div>
    );

    if (activeTab === 'videoBanners') return (
      <div className="hm-edit-fields">
        <div className="hm-field">
          <label>Video File (.mp4)</label>
          <div className="hm-field-row">
            <input type="text" value={d.url || ''} onChange={e => upd('url', e.target.value)} placeholder="https://..." />
            <label className={`hm-upload-btn ${uploading === 'url' ? 'loading' : ''}`}>
              <Upload size={14}/> {uploading === 'url' ? 'Uploading...' : 'Upload'}
              <input type="file" accept="video/mp4,video/quicktime" hidden onChange={e => handleUpload(e, 'url')} />
            </label>
          </div>
        </div>
        <div className="hm-field-grid">
          <div className="hm-field">
            <label>Title</label>
            <input type="text" value={d.title || ''} onChange={e => upd('title', e.target.value)} />
          </div>
          <div className="hm-field">
            <label>Description</label>
            <input type="text" value={d.desc || ''} onChange={e => upd('desc', e.target.value)} />
          </div>
        </div>
      </div>
    );

    if (activeTab === 'watchAndShop') return (
      <div className="hm-edit-fields">
        <div className="hm-field">
          <label>Select Product (Auto-fill)</label>
          <select 
            className="hm-url-select"
            style={{ width: '100%', marginBottom: '0.5rem' }}
            onChange={async (e) => {
              const prodId = e.target.value.split('/').pop();
              // Find product in our context products list
              const p = products.find(prod => String(prod.id) === String(prodId));
              if (p) {
                setEditModal(prev => ({
                  ...prev,
                  draft: {
                    ...prev.draft,
                    title: p.title,
                    price: p.price,
                    originalPrice: p.original_price || p.originalPrice,
                    img: p.img,
                  }
                }));
              }
            }}
            value=""
          >
            <option value="" disabled>Pick a product to fill details...</option>
            {products.map(p => (
              <option key={p.id} value={`/product/${p.id}`}>{p.title}</option>
            ))}
          </select>
        </div>
        <div className="hm-field">
          <label>Product Title</label>
          <input type="text" value={d.title || ''} onChange={e => upd('title', e.target.value)} />
        </div>
        <div className="hm-field-grid">
          <div className="hm-field">
            <label>Price (₹)</label>
            <input type="number" value={d.price || ''} onChange={e => upd('price', e.target.value)} />
          </div>
          <div className="hm-field">
            <label>Original Price (₹)</label>
            <input type="number" value={d.originalPrice || ''} onChange={e => upd('originalPrice', e.target.value)} />
          </div>
          <div className="hm-field">
            <label>Discount Tag</label>
            <input type="text" value={d.discount || ''} onChange={e => upd('discount', e.target.value)} placeholder="e.g. 35% off" />
          </div>
          <div className="hm-field">
            <label>Views Count</label>
            <input type="text" value={d.views || ''} onChange={e => upd('views', e.target.value)} placeholder="e.g. 1.2K" />
          </div>
        </div>
        <div className="hm-field">
          <label>Overlay Text</label>
          <input type="text" value={d.overlayText || ''} onChange={e => upd('overlayText', e.target.value)} placeholder="Tagline shown on video..." />
        </div>
        <div className="hm-field">
          {renderVisualUpload('img', 'Product Image / Thumbnail')}
        </div>
        <div className="hm-field">
          <label>Short Video (.mp4, 10–15 sec)</label>
          <div className="hm-field-row">
            <input type="text" value={d.video || ''} onChange={e => upd('video', e.target.value)} placeholder="https://..." />
            <label className={`hm-upload-btn ${uploading === 'video' ? 'loading' : ''}`}>
              <Upload size={14}/> Upload
              <input type="file" accept="video/mp4,video/quicktime" hidden onChange={e => handleUpload(e, 'video')} />
            </label>
          </div>
        </div>
      </div>
    );
  };

  // ── RENDER ITEM CARD ──────────────────────────────────────────────────────
  const renderCard = (item, index) => {
    if (activeTab === 'hero') return (
      <div className="hm-card" key={index}>
        <div className="hm-card-preview">
          <div className="hm-dual-preview">
            {[ 
              { key: 'desktopImg', label: 'Desktop' }, 
              { key: 'mobileImg', label: 'Mobile', class: 'mobile-v' } 
            ].map(m => {
              const url = item[m.key] || item.img;
              const isVid = url?.toLowerCase().endsWith('.mp4');
              return (
                <div className="hm-preview-item" key={m.key}>
                  <span className="hm-preview-label">{m.label}</span>
                  {url ? (
                    isVid ? (
                      <div className={`hm-card-img ${m.class || ''}`} style={{ overflow: 'hidden' }}>
                        <video src={url} muted playsInline style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      </div>
                    ) : (
                      <img src={url} alt="" className={`hm-card-img ${m.class || ''}`} />
                    )
                  ) : (
                    <div className="hm-card-no-img"><ImageIcon size={14}/></div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="hm-card-info">
            <p className="hm-card-title">{item.alt || 'Untitled Slide'}</p>
            <span className="hm-chip hm-chip-blue">{item.url || '/shop'}</span>
          </div>
        </div>
        <div className="hm-card-actions">
          <button className="hm-action-btn hm-btn-edit" title="Edit" onClick={() => openEdit(index, 'Banner Slide')}><Pencil size={14}/></button>
          <button className="hm-action-btn hm-btn-delete" title="Delete" onClick={() => handleDelete(index)}><Trash2 size={14}/></button>
        </div>
      </div>
    );

    if (activeTab === 'videoBanners') return (
      <div className="hm-card" key={index}>
        <div className="hm-card-preview">
          <div className="hm-card-video-thumb">
            {item.url
              ? <video src={item.url} muted playsInline style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <Video size={22} color="#9ca3af"/>
            }
          </div>
          <div className="hm-card-info">
            <p className="hm-card-title">{item.title || 'Untitled Video'}</p>
            <p className="hm-card-sub">{item.desc || 'No description'}</p>
            <span className={`hm-chip ${item.url ? 'hm-chip-green' : 'hm-chip-red'}`}>
              {item.url ? '✓ Video linked' : '⚠ No video'}
            </span>
          </div>
        </div>
        <div className="hm-card-actions">
          <button className="hm-action-btn hm-btn-edit" title="Edit" onClick={() => openEdit(index, 'Video Banner')}><Pencil size={14}/></button>
          <button className="hm-action-btn hm-btn-delete" title="Delete" onClick={() => handleDelete(index)}><Trash2 size={14}/></button>
        </div>
      </div>
    );

    if (activeTab === 'watchAndShop') return (
      <div className="hm-card" key={index}>
        <div className="hm-card-preview">
          {item.img
            ? <img src={item.img} alt={item.title} className="hm-card-img" onError={e => e.target.style.display='none'} />
            : <div className="hm-card-no-img"><ShoppingBag size={20}/></div>
          }
          <div className="hm-card-info">
            <p className="hm-card-title">{item.title || 'Untitled Product'}</p>
            <div className="hm-card-chips">
              <span className="hm-chip hm-chip-green">₹{item.price}</span>
              {item.discount && <span className="hm-chip hm-chip-orange">{item.discount}</span>}
              <span className={`hm-chip ${item.video ? 'hm-chip-purple' : 'hm-chip-red'}`}>
                {item.video ? '🎥 Video' : '⚠ No video'}
              </span>
            </div>
            {item.overlayText && <p className="hm-card-sub">{item.overlayText}</p>}
          </div>
        </div>
        <div className="hm-card-actions">
          <button className="hm-action-btn hm-btn-edit" title="Edit" onClick={() => openEdit(index, 'Product Story')}><Pencil size={14}/></button>
          <button className="hm-action-btn hm-btn-delete" title="Delete" onClick={() => handleDelete(index)}><Trash2 size={14}/></button>
        </div>
      </div>
    );
  };

  // ── RENDER SINGLE-SECTION VIEW (CTA / QUIZ) ───────────────────────────────
  const renderObjectSection = (sectionKey) => {
    const data = sections[sectionKey];
    return (
      <div className="hm-card hm-card-object">
        <div className="hm-card-object-body">
          {sectionKey === 'cta' && (
            <>
              <div className="hm-detail-row"><span className="hm-detail-label">Tagline</span><span className="hm-tag-chip">{data.tag}</span></div>
              <div className="hm-detail-row"><span className="hm-detail-label">Heading</span><span className="hm-detail-value bold">{data.heading}</span></div>
              <div className="hm-detail-row"><span className="hm-detail-label">Description</span><span className="hm-detail-value">{data.text}</span></div>
              <div className="hm-detail-row"><span className="hm-detail-label">Button</span><span className="hm-cta-preview-btn">{data.buttonText}</span></div>
              <div className="hm-detail-row"><span className="hm-detail-label">Background</span><span className="hm-detail-value url">{data.bgImage || '— None —'}</span></div>
            </>
          )}
          {sectionKey === 'quiz' && (
            <>
              <div className="hm-detail-row"><span className="hm-detail-label">Heading</span><span className="hm-detail-value bold">{data.heading}</span></div>
              <div className="hm-detail-row"><span className="hm-detail-label">Description</span><span className="hm-detail-value">{data.text}</span></div>
              <div className="hm-detail-row"><span className="hm-detail-label">Button</span><span className="hm-cta-preview-btn">{data.buttonText}</span></div>
            </>
          )}
        </div>
        <div className="hm-card-actions hm-card-actions-object">
          <button className="hm-action-btn hm-btn-edit" title="Edit" onClick={() => openEdit(null, currentTab.label)}>
            <Pencil size={14}/> Edit
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-page-wrap">
      {/* ── HEADER ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Homepage CMS</h1>
          <p className="admin-page-subtitle">CRUD control for every storefront section — all changes go live instantly</p>
        </div>
        {currentTab.type === 'array' ? (
          <button className="admin-btn-primary" onClick={handleAdd}>
            <Plus size={16}/> Add {currentTab.label.replace(/s$/, '')}
          </button>
        ) : (
          <button className="admin-btn-primary" onClick={() => openEdit(null, currentTab.label)}>
            <Pencil size={16}/> Edit {currentTab.label}
          </button>
        )}
      </div>

      <div className="hm-layout">
        {/* ── SIDEBAR TABS ── */}
        <aside className="hm-sidebar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                className={`hm-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon size={16}/>
                <div className="hm-tab-text">
                  <span className="hm-tab-label">{tab.label}</span>
                  <span className="hm-tab-count">
                    {tab.type === 'array' ? `${(sections[tab.key] || []).length} items` : '1 section'}
                  </span>
                </div>
              </button>
            );
          })}
        </aside>

        {/* ── CONTENT AREA ── */}
        <main className="hm-main">
          <div className="hm-section-header">
            <div className="hm-section-title-row">
              {React.createElement(currentTab.icon, { size: 20 })}
              <h2>{currentTab.label}</h2>
            </div>
            <span className="hm-live-badge">🔴 Live — changes publish instantly</span>
          </div>

          <div className="hm-cards-grid">
            {currentTab.type === 'array'
              ? (sections[activeTab] || []).map((item, i) => renderCard(item, i))
              : renderObjectSection(activeTab)
            }

            {currentTab.type === 'array' && sections[activeTab]?.length === 0 && (
              <div className="hm-empty">
                <AlertCircle size={32} color="#d1d5db"/>
                <p>No items yet. Click "Add" to create your first entry.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── EDIT MODAL ── */}
      <EditModal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, index: null, draft: null, title: '' })}
        onSave={handleSaveEdit}
        title={editModal.title}
      >
        {editModal.open && renderEditFields()}
      </EditModal>

      {/* ── DELETE CONFIRM ── */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
      />
    </div>
  );
};

export default HomepageManager;
