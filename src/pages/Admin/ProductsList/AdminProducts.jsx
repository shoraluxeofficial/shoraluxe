import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, X, ImagePlus, PackagePlus, ChevronDown, Upload, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import imageCompression from 'browser-image-compression';
import { useShop } from '../../../context/ShopContext';
import { useNotify } from '../../../components/common/Notification/Notification';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';
import { uploadFile } from '../../../lib/upload';
import './AdminProducts.css';

const EMPTY_FORM = {
  brand: 'SHORALUXE',
  title: '',
  price: '',
  originalPrice: '',
  discountPercent: '',
  discount: '',
  offer: '',
  badge: '',
  size: '',
  benefit: '',
  skinType: '',
  img: '',
  gallery: '',
  description: '',
  howToUse: '',
  ingredients: '',
  bestFor: '',
  rating: '',
  reviewsCount: '',
  isNew: false,
  isBestseller: false,
  isSale: false,
  stock: '',
  status: 'active',
};

const CATEGORIES = ['All Skin Types', 'Oily & Acne-Prone', 'Dry & Dehydrated', 'Dull & Uneven Tone', 'Mature Skin', 'Sensitive Skin', 'Very Dry Skin', 'Combination Skin'];
const BADGES = ['', 'NEW', 'BESTSELLER', 'SALE'];
const STATUSES = ['active', 'draft', 'out-of-stock'];

const AdminProducts = () => {
  const { products, addProduct, deleteProduct, updateProduct, loading, fetchProducts } = useShop();
  const [syncing, setSyncing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveConfirm, setSaveConfirm] = useState(false);
  const { notify } = useNotify();

  const compressImage = async (file) => {
    const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Compression failed, using original file.", error);
      return file;
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const compressedFile = await compressImage(file);
      const url = await uploadFile(compressedFile, 'brand-assets', 'products');
      setForm(prev => ({ ...prev, img: url }));
      notify('Product image uploaded and compressed successfully!', 'success');
    } catch (err) {
      console.error('Upload error:', err);
      notify('Upload failed. Ensure "brand-assets" bucket exists.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (files.length > 20) {
      notify('Maximum 20 images allowed at a time.', 'error');
      return;
    }

    try {
      setUploading(true);
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        const compressedFile = await compressImage(files[i]);
        const url = await uploadFile(compressedFile, 'brand-assets', 'products');
        uploadedUrls.push(url);
      }

      setForm(prev => {
        const existing = prev.gallery ? prev.gallery.split('\n').filter(Boolean) : [];
        const combined = [...existing, ...uploadedUrls];
        return { ...prev, gallery: combined.join('\n') };
      });
      notify(`${files.length} gallery images uploaded & compressed!`, 'success');
    } catch (err) {
      console.error('Gallery upload error:', err);
      notify('Gallery upload failed.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const deleteOutOfStock = async () => {
    notify('This will PERMANENTLY DELETE all products currently showing as "Out of Stock". Continue?', 'confirm', {
      onConfirm: async () => {
        setSyncing(true);
        try {
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('stock', 0);

          if (error) throw error;

          notify('All Out-of-Stock products have been removed.', 'success');
          fetchProducts();
        } catch (err) {
          notify('Error deleting: ' + err.message, 'error');
        } finally {
          setSyncing(false);
        }
      }
    });
  };

  const syncLocalData = async () => {
    notify('WARNING: This will RESET your catalogue and re-import the 16 default products. Any manual changes you made (like price updates) will be overwritten or duplicated. Continue?', 'confirm', {
      onConfirm: async () => {
        setSyncing(true);
        try {
          const { productsData } = await import('../../../data/products');
          for (const product of productsData) {
            const payload = {
              brand: product.brand,
              title: product.title,
              price: product.price,
              original_price: product.originalPrice,
              discount: product.discount,
              offer: product.offer,
              badge: product.badge,
              size: product.size,
              benefit: product.benefit,
              skin_type: product.skinType,
              img: product.img,
              gallery: product.gallery,
              description: product.description,
              how_to_use: product.howToUse,
              ingredients: product.ingredients,
              best_for: product.bestFor,
              rating: product.rating,
              reviews_count: product.reviewsCount,
              is_new: product.isNew || false,
              is_bestseller: product.isBestseller || false,
              is_sale: product.isSale || false,
              stock: 100,
              status: 'active'
            };
            await addProduct(payload);
          }
          notify('Success! 16 products synced to Supabase.', 'success');
          fetchProducts();
        } catch (err) {
          notify('Error syncing data: ' + err.message, 'error');
        } finally {
          setSyncing(false);
        }
      }
    });
  };

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // ── FILTERING ──────────────────────────────────────────────────────────────
  const filtered = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = !categoryFilter || p.skinType === categoryFilter;
    return matchSearch && matchCat;
  });

  // ── OPEN MODAL ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErrors({});
    setActiveTab('basic');
    setShowModal(true);
  };
  const openEdit = (product) => {
    const discPct = product.originalPrice && product.price 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
      : '';

    setForm({
      brand: product.brand || 'SHORALUXE',
      title: product.title || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      discountPercent: discPct,
      discount: product.discount || '',
      offer: product.offer || '',
      badge: product.badge || '',
      size: product.size || '',
      benefit: product.benefit || '',
      skinType: product.skinType || '',
      img: product.img || '',
      gallery: Array.isArray(product.gallery) ? product.gallery.join('\n') : (product.gallery || ''),
      description: product.description || '',
      howToUse: Array.isArray(product.howToUse) ? product.howToUse.join('\n') : (product.howToUse || ''),
      ingredients: product.ingredients || '',
      bestFor: product.bestFor || '',
      rating: product.rating || '',
      reviewsCount: product.reviewsCount || '',
      isNew: product.isNew || false,
      isBestseller: product.isBestseller || false,
      isSale: product.isSale || false,
      stock: product.stock || '',
      status: product.status || 'active',
    });
    setEditingId(product.id);
    setErrors({});
    setActiveTab('basic');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  // ── VALIDATION ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Product name is required.';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Valid selling price is required.';
    if (!form.originalPrice || isNaN(form.originalPrice) || Number(form.originalPrice) <= 0) e.originalPrice = 'Valid MRP is required.';
    if (Number(form.price) > Number(form.originalPrice)) e.price = 'Selling price cannot exceed MRP.';
    if (!form.skinType) e.skinType = 'Please select a category / skin type.';
    if (!form.img.trim()) e.img = 'Main product image URL is required.';
    if (!form.description.trim()) e.description = 'Product description is required.';
    return e;
  };

  // ── SUBMIT ────────────────────────────────────────────────────────────────
  const processSubmit = async () => {
    setSyncing(true);
    try {
      const discountCalc = form.discount || (form.originalPrice && form.price
        ? `${Math.round((1 - form.price / form.originalPrice) * 100)}% off`
        : '');

      const payload = {
        brand: form.brand,
        title: form.title.trim(),
        price: Number(form.price),
        original_price: Number(form.originalPrice),
        discount: discountCalc,
        offer: (form.offer || '').trim(),
        badge: form.badge || null,
        size: (form.size || '').trim(),
        benefit: (form.benefit || '').trim(),
        skin_type: form.skinType,
        img: form.img.trim(),
        gallery: Array.isArray(form.gallery) ? form.gallery : form.gallery?.split('\n').map(g => g.trim()).filter(Boolean) || [],
        description: form.description.trim(),
        how_to_use: Array.isArray(form.howToUse) ? form.howToUse : form.howToUse?.split('\n').map(s => s.trim()).filter(Boolean) || [],
        ingredients: (form.ingredients || '').trim(),
        best_for: (form.bestFor || '').trim(),
        rating: form.rating ? Number(form.rating) : 4.5,
        reviews_count: form.reviewsCount ? Number(form.reviewsCount) : 0,
        is_new: form.badge === 'NEW',
        is_bestseller: form.badge === 'BESTSELLER',
        is_sale: form.badge === 'SALE',
        stock: form.stock !== '' ? Number(form.stock) : 100,
        status: form.status || 'active',
        updated_at: new Date()
      };

      let res;
      if (editingId !== null) {
        res = await updateProduct(editingId, payload);
      } else {
        res = await addProduct({ ...payload, created_at: new Date() });
      }

      if (res.success) {
        notify(`Product ${editingId ? 'updated' : 'added'} successfully!`, 'success');
        closeModal();
      } else {
        notify('Error: ' + res.error, 'error');
      }
    } catch (err) {
      console.error(err);
      notify('Failed to save product.', 'error');
    } finally {
      setSyncing(false);
      setSaveConfirm(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Jump to first tab with error
      if (errs.title || errs.price || errs.originalPrice || errs.skinType) setActiveTab('basic');
      else if (errs.img || errs.description) setActiveTab('media');
      return;
    }
    setSaveConfirm(true);
  };

  // ── FIELD CHANGE ──────────────────────────────────────────────────────────
  const set = (key, val) => {
    setForm(prev => {
      let next = { ...prev, [key]: val };

      // Auto-calculate logic
      if (key === 'originalPrice' || key === 'discountPercent') {
        const mrp = Number(key === 'originalPrice' ? val : prev.originalPrice);
        const pct = Number(key === 'discountPercent' ? val : prev.discountPercent);

        if (mrp && pct) {
          next.price = Math.round(mrp * (1 - pct / 100));
          next.discount = `${pct}% off`;
        }
      } else if (key === 'price') {
        const mrp = Number(prev.originalPrice);
        const sale = Number(val);
        if (mrp && sale && sale < mrp) {
          next.discountPercent = Math.round(((mrp - sale) / mrp) * 100);
          next.discount = `${next.discountPercent}% off`;
        }
      }

      return next;
    });

    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  // ── INVENTORY BADGE ───────────────────────────────────────────────────────
  const stockBadge = (p) => {
    const s = p.stock;
    if (s === undefined || s === null || s === '') return <span className="stock-badge in-stock">Unlimited Stock</span>;
    if (Number(s) === 0) return <span className="stock-badge out">Out of Stock</span>;
    if (Number(s) < 10) return <span className="stock-badge low">{s} left</span>;
    return <span className="stock-badge in-stock">{s} in stock</span>;
  };

  // ── SELECTION ─────────────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(p => p.id));
    }
  };

  const deleteSelected = async () => {
    setSyncing(true);
    try {
      let successCount = 0;
      for (const id of selectedIds) {
        const res = await deleteProduct(id);
        if (res.success) successCount++;
      }
      notify(`Successfully deleted ${successCount} products.`, 'success');
      setSelectedIds([]);
      setBulkDeleteConfirm(false);
    } catch (err) {
      notify('Error during bulk delete: ' + err.message, 'error');
    } finally {
      setSyncing(false);
    }
  };

  // ── TABS CONFIG ───────────────────────────────────────────────────────────
  const tabs = [
    { id: 'basic', label: '1. General Info' },
    { id: 'media', label: '2. Images' },
    { id: 'details', label: '3. Descriptions' },
    { id: 'content', label: '4. Highlights & Badges' },
    { id: 'inventory', label: '5. Inventory' },
  ];

  return (
    <div className="admin-page-wrap">
      {/* ── PAGE HEADER ──────────────────────────────────────────────────── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products Management</h1>
          <p className="admin-page-subtitle">{products.length} total products in catalogue</p>
        </div>
        <div className="admin-page-header-actions" style={{ display: 'flex', gap: '0.8rem' }}>
          {selectedIds.length > 0 ? (
            <button className="admin-btn-danger" onClick={() => setBulkDeleteConfirm(true)}>
              <Trash2 size={18} />
              Delete Selected ({selectedIds.length})
            </button>
          ) : (
            <button className="admin-btn-secondary" onClick={() => fetchProducts()} title="Refresh current list">
              <RefreshCw size={16} />
              Refresh
            </button>
          )}
          <button className="admin-btn-primary" onClick={openAdd}>
            <PackagePlus size={18} />
            New Product
          </button>
        </div>
      </div>

      {/* ── TABLE CARD ───────────────────────────────────────────────────── */}
      <div className="admin-card">
        <div className="admin-table-controls">
          <div className="admin-search-box">
            <Search size={18} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="admin-filters">
            <select className="admin-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th>Product</th>
                <th>Price / MRP</th>
                <th>Category</th>
                <th>Size</th>
                <th>Inventory</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}><div className="loader">Loading...</div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No products found.</td></tr>
              ) : filtered.map(product => {
                const isSelected = selectedIds.includes(product.id);
                return (
                  <tr key={product.id} className={isSelected ? 'row-selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(product.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <div className="table-product-cell">
                        <img src={product.img} alt={product.title} />
                        <div className="t-prod-info">
                          <strong>{product.title.split('|')[0].trim()}</strong>
                          <span>ID: {product.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="price-cell">
                        <span className="sell-price">₹{product.price}</span>
                        <span className="t-original">₹{product.originalPrice}</span>
                      </div>
                    </td>
                    <td>{product.skinType}</td>
                    <td>{product.size || '—'}</td>
                    <td>{stockBadge(product)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="t-action-btn edit" title="Edit" onClick={() => openEdit(product)}><Edit size={16} /></button>
                        <button className="t-action-btn delete" title="Delete" onClick={() => setDeleteConfirm(product.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Delete Product?"
        message="This action cannot be undone. The product will be permanently removed from the catalogue."
        confirmText="Yes, Delete"
        onConfirm={async () => {
          const res = await deleteProduct(deleteConfirm);
          if (res.success) notify('Product permanently deleted.', 'success');
          setDeleteConfirm(null);
        }}
        onCancel={() => setDeleteConfirm(null)}
      />

      <ConfirmModal
        isOpen={bulkDeleteConfirm}
        title={`Delete ${selectedIds.length} Products?`}
        message={`Are you sure you want to permanently delete the ${selectedIds.length} selected products? This action cannot be undone.`}
        confirmText="Yes, Delete All"
        type="danger"
        onConfirm={deleteSelected}
        onCancel={() => setBulkDeleteConfirm(false)}
      />

      <ConfirmModal
        isOpen={saveConfirm}
        title={editingId ? "Update Product?" : "Add New Product?"}
        message={editingId ? "Are you sure you want to save these changes? They will be live on the store immediately." : "This will add the new product to your live catalogue."}
        confirmText="Yes, Save"
        type="warning"
        onConfirm={processSubmit}
        onCancel={() => setSaveConfirm(false)}
      />

      {/* ── ADD / EDIT MODAL ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="pf-overlay" onClick={closeModal}>
          <div className="pf-modal" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="pf-modal-header">
              <div className="pf-modal-title">
                <PackagePlus size={22} />
                <span>{editingId ? 'Edit Product' : 'Add New Product'}</span>
              </div>
              <button className="pf-close-btn" onClick={closeModal}><X size={22} /></button>
            </div>

            {/* 2-Column Layout */}
            <div className="pf-modal-layout">
              {/* Left Sidebar */}
              <div className="pf-sidebar">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    className={`pf-sidebar-tab ${activeTab === t.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(t.id)}
                    type="button"
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Right Content */}
              <form className="pf-form" onSubmit={handleSubmit}>
                <div className="pf-body">

                  {/* ── TAB 1: BASIC INFO ──────────────────────────────────── */}
                  {activeTab === 'basic' && (
                    <div className="pf-section">
                      <div className="pf-section-title">General Information</div>

                      <div className="pf-row">
                        <div className="pf-field">
                          <label>Brand Name <span className="req">*</span></label>
                          <input type="text" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. SHORALUXE" />
                        </div>
                      </div>

                      <div className="pf-field full">
                        <label>Product Name <span className="req">*</span></label>
                        <input
                          type="text"
                          value={form.title}
                          onChange={e => set('title', e.target.value)}
                          placeholder="e.g. Sunscreen SPF 50+++"
                          className={errors.title ? 'input-error' : ''}
                        />
                        {errors.title && <span className="pf-error">{errors.title}</span>}
                        <span className="pf-hint">Optional: Add a | symbol and subtitle for better SEO (e.g. Cleanser | Glowing Skin).</span>
                      </div>

                      <div className="pf-row four">
                        <div className="pf-field">
                          <label>MRP (₹) <span className="req">*</span></label>
                          <input
                            type="number" min="0" step="0.01"
                            value={form.originalPrice}
                            onChange={e => set('originalPrice', e.target.value)}
                            placeholder="599"
                            className={errors.originalPrice ? 'input-error' : ''}
                          />
                          {errors.originalPrice && <span className="pf-error">{errors.originalPrice}</span>}
                        </div>
                        <div className="pf-field">
                          <label>Discount (%)</label>
                          <input
                            type="number" min="0" max="100"
                            value={form.discountPercent}
                            onChange={e => set('discountPercent', e.target.value)}
                            placeholder="20"
                          />
                        </div>
                        <div className="pf-field">
                          <label>Selling Price (₹) <span className="req">*</span></label>
                          <input
                            type="number" min="0" step="0.01"
                            value={form.price}
                            onChange={e => set('price', e.target.value)}
                            placeholder="499"
                            className={errors.price ? 'input-error' : ''}
                          />
                          {errors.price && <span className="pf-error">{errors.price}</span>}
                        </div>
                        <div className="pf-field">
                          <label>Discount Tag</label>
                          <input
                            type="text"
                            value={form.discount}
                            onChange={e => set('discount', e.target.value)}
                            placeholder="Auto-calculated"
                          />
                        </div>
                      </div>

                      <div className="pf-row">
                        <div className="pf-field">
                          <label>Special Offer / Promo Text</label>
                          <input type="text" value={form.offer} onChange={e => set('offer', e.target.value)} placeholder="e.g. Free Hydrating Gel on orders above ₹999" />
                        </div>
                        <div className="pf-field">
                          <label>Product Badge</label>
                          <select value={form.badge} onChange={e => set('badge', e.target.value)}>
                            <option value="">None</option>
                            {BADGES.filter(Boolean).map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="pf-row">
                        <div className="pf-field">
                          <label>Skin Type Category <span className="req">*</span></label>
                          <select
                            value={form.skinType}
                            onChange={e => set('skinType', e.target.value)}
                            className={errors.skinType ? 'input-error' : ''}
                          >
                            <option value="">Choose a category</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          {errors.skinType && <span className="pf-error">{errors.skinType}</span>}
                        </div>
                      </div>

                      <div className="pf-row">
                        <div className="pf-field">
                          <label>Available Sizes & Options</label>
                          <input type="text" value={form.size} onChange={e => set('size', e.target.value)} placeholder="e.g. 50ml, 100ml" />
                          <span className="pf-hint">Use commas (,) for multiple sizes. Use colons (:) for custom pricing (e.g. 100ml:899, Combo:1200).</span>
                        </div>
                        <div className="pf-field">
                          <label>Quick Feature Highlight</label>
                          <input type="text" value={form.benefit} onChange={e => set('benefit', e.target.value)} placeholder="e.g. Instant Glow & Repair" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── TAB 2: MEDIA ──────────────────────────────────────── */}
                  {activeTab === 'media' && (
                    <div className="pf-section">
                      <div className="pf-section-title">Product Imagery</div>

                      <div className="pf-field full">
                        <label>Primary Showcase Image <span className="req">*</span></label>
                        <div className="pf-img-input-wrap">
                          <ImagePlus size={18} color="#6b7280" />
                          <input
                            type="url"
                            value={form.img}
                            onChange={e => set('img', e.target.value)}
                            placeholder="or upload directly..."
                            className={errors.img ? 'input-error' : ''}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            style={{ padding: '0.4rem', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', fontSize: '0.85rem', width: '250px' }}
                          />
                        </div>
                        {errors.img && <span className="pf-error">{errors.img}</span>}
                        {form.img && (
                          <div className="pf-img-preview">
                            <img src={form.img} alt="Preview" onError={e => { e.target.style.display = 'none'; }} />
                            <span className="preview-label">This image will appear on the store grid.</span>
                          </div>
                        )}
                      </div>

                      <div className="pf-field full">
                        <label>Additional Gallery Images (Bulk Upload)</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryUpload}
                          disabled={uploading}
                          style={{ padding: '0.4rem', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', fontSize: '0.85rem', marginBottom: '0.5rem' }}
                        />
                        <textarea
                          rows={3}
                          value={form.gallery}
                          onChange={e => set('gallery', e.target.value)}
                          placeholder={"URLs of uploaded images will automatically appear here..."}
                        />
                        <span className="pf-hint">These images are shown in the sliding carousel on the product's detail page.</span>
                      </div>

                      {form.gallery && (
                        <div className="pf-gallery-previews">
                          {form.gallery.split('\n').filter(Boolean).map((url, i) => (
                            <div key={i} className="gallery-thumb">
                              <img src={url.trim()} alt={`Gallery ${i + 1}`} onError={e => { e.target.style.display = 'none'; }} />
                              <span>Image {i + 1}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── TAB 3: PRODUCT DETAILS ────────────────────────────── */}
                  {activeTab === 'details' && (
                    <div className="pf-section">
                      <div className="pf-section-title">Product Details</div>

                      <div className="pf-field full">
                        <label>Product Story / Full Description <span className="req">*</span></label>
                        <textarea
                          rows={5}
                          value={form.description}
                          onChange={e => set('description', e.target.value)}
                          placeholder="Explain the benefits, texture, and magical results of this product..."
                          className={errors.description ? 'input-error' : ''}
                        />
                        {errors.description && <span className="pf-error">{errors.description}</span>}
                      </div>

                      <div className="pf-field full">
                        <label>How To Use & Routine</label>
                        <textarea
                          rows={4}
                          value={form.howToUse}
                          onChange={e => set('howToUse', e.target.value)}
                          placeholder={"Apply 2-3 drops to clean skin.\nGently pat until absorbed.\nFollow with moisturizer."}
                        />
                        <span className="pf-hint">Write one instruction per line. The store will automatically format it as a beautiful numbered list!</span>
                      </div>

                      <div className="pf-field full">
                        <label>Key Ingredients</label>
                        <textarea
                          rows={3}
                          value={form.ingredients}
                          onChange={e => set('ingredients', e.target.value)}
                          placeholder="e.g. Zinc Oxide, Titanium Dioxide, Vitamin E, Aloe Vera Extract, Hyaluronic Acid."
                        />
                      </div>

                      <div className="pf-field full">
                        <label>Best For (short tagline)</label>
                        <input
                          type="text"
                          value={form.bestFor}
                          onChange={e => set('bestFor', e.target.value)}
                          placeholder="e.g. Daily UV protection and anti-aging benefits for all Indian skin types."
                        />
                      </div>
                    </div>
                  )}

                  {/* ── TAB 4: CONTENT & SEO ─────────────────────────────── */}
                  {activeTab === 'content' && (
                    <div className="pf-section">
                      <div className="pf-section-title">Customer Ratings</div>

                      <div className="pf-row">
                        <div className="pf-field">
                          <label>Storefront Rating (Out of 5)</label>
                          <input
                            type="number" min="0" max="5" step="0.1"
                            value={form.rating}
                            onChange={e => set('rating', e.target.value)}
                            placeholder="e.g. 4.8"
                          />
                          <span className="pf-hint">Set between 0.0 – 5.0 (Defaults to 4.5)</span>
                        </div>
                        <div className="pf-field">
                          <label>Number of Verified Reviews</label>
                          <input
                            type="number" min="0"
                            value={form.reviewsCount}
                            onChange={e => set('reviewsCount', e.target.value)}
                            placeholder="e.g. 124"
                          />
                        </div>
                      </div>

                      <div className="pf-divider" />
                      <div className="pf-section-title">Quick Tags</div>

                      <div className="pf-checkbox-group">
                        <label className="pf-checkbox">
                          <input type="checkbox" checked={form.isNew} onChange={e => set('isNew', e.target.checked)} />
                          <span className="check-mark" />
                          <span>Mark as NEW Launch</span>
                        </label>
                        <label className="pf-checkbox">
                          <input type="checkbox" checked={form.isBestseller} onChange={e => set('isBestseller', e.target.checked)} />
                          <span className="check-mark" />
                          <span>Mark as BESTSELLER</span>
                        </label>
                        <label className="pf-checkbox">
                          <input type="checkbox" checked={form.isSale} onChange={e => set('isSale', e.target.checked)} />
                          <span className="check-mark" />
                          <span>On SALE</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* ── TAB 5: INVENTORY & STATUS ─────────────────────────── */}
                  {activeTab === 'inventory' && (
                    <div className="pf-section">
                      <div className="pf-section-title">Stock & Availability</div>

                      <div className="pf-row">
                        <div className="pf-field">
                          <label>Units in Stock</label>
                          <input
                            type="number" min="0"
                            value={form.stock}
                            onChange={e => set('stock', e.target.value)}
                            placeholder="e.g. 150"
                          />
                          <span className="pf-hint">If set to 0, product will show as 'Out of Stock'.</span>
                        </div>
                        <div className="pf-field">
                          <label>Storefront Visibility</label>
                          <select value={form.status} onChange={e => set('status', e.target.value)}>
                            {STATUSES.map(s => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="pf-info-box">
                        <strong>Status Guide:</strong>
                        <ul>
                          <li><span className="dot active" /> <b>Active</b> — Visible to customers in the storefront.</li>
                          <li><span className="dot draft" /> <b>Draft</b> — Hidden from store, only visible in admin panel.</li>
                          <li><span className="dot out-of-stock" /> <b>Out of Stock</b> — Visible but not purchasable.</li>
                        </ul>
                      </div>

                      <div className="pf-divider" />
                      <div className="pf-section-title">Product Summary Preview</div>
                      <div className="pf-summary-preview">
                        <div className="preview-row"><span>Title</span><strong>{form.title || '—'}</strong></div>
                        <div className="preview-row"><span>Price</span><strong>{form.price ? `₹${form.price}` : '—'} {form.originalPrice ? `(MRP ₹${form.originalPrice})` : ''}</strong></div>
                        <div className="preview-row"><span>Category</span><strong>{form.skinType || '—'}</strong></div>
                        <div className="preview-row"><span>Size</span><strong>{form.size || '—'}</strong></div>
                        <div className="preview-row"><span>Badge</span><strong>{form.badge || 'None'}</strong></div>
                        <div className="preview-row"><span>Status</span><strong>{form.status}</strong></div>
                        <div className="preview-row"><span>Stock</span><strong>{form.stock !== '' ? form.stock : 'Not set'}</strong></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="pf-footer">
                  <div className="pf-tab-nav">
                    {activeTab !== 'basic' && (
                      <button type="button" className="admin-btn-ghost" onClick={() => {
                        const idx = tabs.findIndex(t => t.id === activeTab);
                        if (idx > 0) setActiveTab(tabs[idx - 1].id);
                      }}>← Previous</button>
                    )}
                    {activeTab !== 'inventory' && (
                      <button type="button" className="admin-btn-secondary" onClick={() => {
                        const idx = tabs.findIndex(t => t.id === activeTab);
                        if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
                      }}>Next →</button>
                    )}
                  </div>
                  <div className="pf-footer-actions">
                    <button type="button" className="admin-btn-ghost" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="admin-btn-primary">
                      {editingId ? '✓ Save Changes' : '✓ Add Product'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
