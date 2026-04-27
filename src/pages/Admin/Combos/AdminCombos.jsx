import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import {
  Plus, Trash2, Edit2, Check, X, Tag, ToggleLeft, ToggleRight,
  Package, IndianRupee, Image as ImageIcon, Search, Upload
} from 'lucide-react';
import { useNotify } from '../../../components/common/Notification/Notification';
import { useShop } from '../../../context/ShopContext';
import './AdminCombos.css';

const EMPTY_FORM = {
  name: '',
  description: '',
  img: '',
  listed_price: '',
  combo_price: '',
  promo_code: '',
  product_ids: [],
  badge: 'COMBO DEAL',
  is_active: true,
  stock: 100,
  expiry_date: '',
};

const AdminCombos = () => {
  const { notify } = useNotify();
  const { products, fetchProducts: refreshShopProducts } = useShop();
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    // Fetch combos from Supabase
    const { data: comboData } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'combo')
      .order('created_at', { ascending: false });
    
    setCombos(comboData || []);
    setLoading(false);
  };

  useEffect(() => { 
    fetchAll(); 
    refreshShopProducts(true); // Ensure shop products are fresh
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleProductSelection = (variantKey) => {
    setForm(prev => ({
      ...prev,
      product_ids: prev.product_ids.includes(variantKey)
        ? prev.product_ids.filter(id => id !== variantKey)
        : [...prev.product_ids, variantKey],
    }));
  };

  // Automatically calculate listed price (MRP) based on selected products
  useEffect(() => {
    if (form.product_ids.length === 0) return;
    
    let totalMRP = 0;
    form.product_ids.forEach(key => {
      const [id, label] = typeof key === 'string' && key.includes('-') ? key.split('-') : [key, null];
      const baseProduct = products.find(p => p.id === Number(id));
      if (baseProduct) {
        try {
          const sizes = JSON.parse(baseProduct.size || '[]');
          const variant = label ? sizes.find(s => s.label === label) : null;
          // If variant found, use its price, else use base price
          totalMRP += variant ? (variant.price || baseProduct.price) : baseProduct.price;
        } catch (e) {
          totalMRP += baseProduct.price;
        }
      }
    });

    setForm(prev => ({ ...prev, listed_price: totalMRP }));
  }, [form.product_ids, products]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setProductSearch('');
    setShowForm(true);
  };
  const openEdit = (combo) => {
    setEditingId(combo.id);
    let benefitsData = { product_ids: [], stock: 100, expiry_date: '' };
    try {
      const parsed = JSON.parse(combo.benefits || '{}');
      if (Array.isArray(parsed)) {
        benefitsData.product_ids = parsed;
      } else {
        benefitsData = { ...benefitsData, ...parsed };
      }
    } catch(e) { }

    setForm({
      name: combo.title,
      description: combo.description || '',
      img: combo.img || '',
      listed_price: combo.price,
      combo_price: combo.price - 200, 
      promo_code: combo.promo_group || '', 
      product_ids: benefitsData.product_ids || [],
      badge: combo.badge || 'COMBO DEAL',
      is_active: combo.status === 'active',
      stock: benefitsData.stock || 0,
      expiry_date: benefitsData.expiry_date || '',
    });
    setProductSearch('');
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return notify('Please select an image file', 'error');
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `combos/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setForm(prev => ({ ...prev, img: publicUrl }));
      notify('Image uploaded successfully!', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      notify('Upload failed: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return notify('Combo name is required', 'error');
    if (!form.promo_code.trim()) return notify('Promo code is required', 'error');
    if (!form.listed_price || !form.combo_price) return notify('Both prices are required', 'error');
    
    setSaving(true);
    const discount = Number(form.listed_price) - Number(form.combo_price);

    const productPayload = {
      title: form.name.trim(),
      description: form.description.trim(),
      img: form.img.trim(),
      price: Number(form.combo_price),
      original_price: Number(form.listed_price),
      category: 'combo',
      stock: Number(form.stock),
      badge: form.badge || 'COMBO DEAL',
      status: form.is_active ? 'active' : 'draft',
      benefits: JSON.stringify({
        product_ids: form.product_ids,
        stock: Number(form.stock),
        expiry_date: form.expiry_date
      }), 
      promo_group: form.promo_code.trim().toUpperCase(), 
      brand: 'SHORALUXE',
      rating: 4.9,
      reviews_count: 0
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('products').update(productPayload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('products').insert([productPayload]));
    }

    if (error) {
      notify(error.message, 'error');
      setSaving(false);
      return;
    }

    // Auto-sync promo code to promo_codes table
    const promoPayload = {
      code: form.promo_code.trim().toUpperCase(),
      description: `${form.name} — Combo Deal at ₹${form.combo_price}`,
      discount_type: 'fixed',
      discount_value: discount,
      is_active: form.is_active,
      promo_type: 'standard',
      applicable_category: 'combo',
      min_order_amount: Number(form.combo_price),
      applicable_products: JSON.stringify(form.product_ids)
    };
    
    await supabase.from('promo_codes').upsert([promoPayload], { onConflict: 'code' });

    notify(editingId ? 'Combo updated!' : 'Combo created!', 'success');
    setShowForm(false);
    fetchAll();
    setSaving(false);
  };

  const toggleActive = async (id, current, promoCode) => {
    const newVal = !current;
    const { error } = await supabase.from('products').update({ status: newVal ? 'active' : 'draft' }).eq('id', id);
    if (!error) {
      await supabase.from('promo_codes').update({ is_active: newVal }).eq('code', promoCode);
      notify(newVal ? 'Combo activated' : 'Combo deactivated', 'success');
      fetchAll();
    } else {
      notify('Update failed', 'error');
    }
  };

  const handleDelete = (id, name, promoCode) => {
    notify(`Delete combo "${name}"?`, 'confirm', {
      onConfirm: async () => {
        await supabase.from('products').delete().eq('id', id);
        await supabase.from('promo_codes').delete().eq('code', promoCode);
        notify('Combo deleted', 'success');
        fetchAll();
      }
    });
  };

  const filteredProducts = products.filter(p => {
    const titleLower = (p.title || '').toLowerCase();
    const isNotCombo = p.category !== 'combo' && !titleLower.includes('combo');
    const matchesSearch = titleLower.includes((productSearch || '').toLowerCase());
    return isNotCombo && matchesSearch;
  });

  const getSelectedProducts = () => {
    const selected = [];
    form.product_ids.forEach(key => {
      const [id, label] = typeof key === 'string' && key.includes('-') ? key.split('-') : [key, null];
      const baseProduct = products.find(p => p.id === Number(id));
      if (baseProduct) {
        selected.push({
          ...baseProduct,
          variantKey: key,
          displayTitle: label ? `${baseProduct.title.split('|')[0].trim()} (${label})` : baseProduct.title.split('|')[0].trim()
        });
      }
    });
    return selected;
  };

  return (
    <div className="ac-wrap">
      <div className="ac-header">
        <div>
          <h1 className="ac-title">Combo Deals</h1>
          <p className="ac-sub">Bundle products together with exclusive promo codes</p>
        </div>
        <button className="ac-add-btn" onClick={openAdd} id="create-combo-btn">
          <Plus size={18} /> Create Combo
        </button>
      </div>

      {/* CREATE / EDIT FORM */}
      {showForm && (
        <div className="ac-form-overlay">
          <div className="ac-form-card">
            <div className="ac-form-head">
              <h3>{editingId ? 'Edit Combo Deal' : 'Create Combo Deal'}</h3>
              <button className="ac-close-btn" onClick={() => setShowForm(false)} id="close-combo-form-btn">
                <X size={20} />
              </button>
            </div>

            <form className="ac-form" onSubmit={handleSave} id="combo-form">
              <div className="ac-form-two-col">
                {/* LEFT: Details */}
                <div className="ac-form-left">
                  <h4 className="ac-section-label">📦 Combo Details</h4>

                  <div className="ac-field">
                    <label>Combo Name *</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Every Day Protection Combo"
                      id="combo-name-input"
                    />
                  </div>

                  <div className="ac-field">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="e.g. Sunscreen 100gm + Face Wash 50ml — perfect daily duo"
                      className="ac-textarea"
                    />
                  </div>

                  <div className="ac-field">
                    <label><ImageIcon size={14} /> Combo Image</label>
                    <div className="ac-upload-box">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        id="combo-image-upload"
                        className="ac-file-input"
                      />
                      <label htmlFor="combo-image-upload" className="ac-upload-label">
                        {uploading ? (
                          <span className="ac-loading-spin"></span>
                        ) : (
                          <><Upload size={16} /> Choose Local Image</>
                        )}
                      </label>
                      <input
                        name="img"
                        value={form.img}
                        onChange={handleChange}
                        placeholder="Or paste URL here..."
                        className="ac-url-input"
                      />
                    </div>
                    {form.img && (
                      <div className="ac-preview-wrap">
                        <img src={form.img} alt="preview" className="ac-img-preview" />
                        <button type="button" className="ac-remove-img" onClick={() => setForm(prev => ({ ...prev, img: '' }))}>
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="ac-prices-row">
                    <div className="ac-field">
                      <label><IndianRupee size={13} /> Listed Price (MRP) *</label>
                      <input
                        type="number"
                        name="listed_price"
                        value={form.listed_price}
                        onChange={handleChange}
                        placeholder="899"
                        min="1"
                      />
                      <span className="ac-field-hint">Price shown to customer before code</span>
                    </div>
                    <div className="ac-field">
                      <label><Tag size={13} /> Combo Price (After Code) *</label>
                      <input
                        type="number"
                        name="combo_price"
                        value={form.combo_price}
                        onChange={handleChange}
                        placeholder="699"
                        min="1"
                      />
                      <span className="ac-field-hint">Price after promo code is applied</span>
                    </div>
                  </div>

                  {form.listed_price && form.combo_price && Number(form.listed_price) > Number(form.combo_price) && (
                    <div className="ac-savings-preview">
                      🎉 Customer saves <strong>₹{Number(form.listed_price) - Number(form.combo_price)}</strong> with this combo
                    </div>
                  )}

                  <div className="ac-field">
                    <label>Promo Code * <span className="ac-hint-label">(auto-created in Promo Codes)</span></label>
                    <input
                      name="promo_code"
                      value={form.promo_code}
                      onChange={handleChange}
                      placeholder="e.g. SL-SUMMERGLOW1"
                      style={{ textTransform: 'uppercase' }}
                      id="combo-promo-code-input"
                    />
                  </div>

                  <div className="ac-field">
                    <label>Badge Text</label>
                    <input
                      name="badge"
                      value={form.badge}
                      onChange={handleChange}
                      placeholder="COMBO DEAL"
                    />
                  </div>

                  <div className="ac-toggle-row">
                    <label>Active (visible to customers)</label>
                    <label className="ac-toggle">
                      <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                      <span className="ac-toggle-slider"></span>
                    </label>
                  </div>

                  <div className="ac-prices-row" style={{ marginTop: '1rem', borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }}>
                    <div className="ac-field">
                      <label>Initial Stock Count *</label>
                      <input
                        type="number"
                        name="stock"
                        value={form.stock}
                        onChange={handleChange}
                        placeholder="100"
                        min="0"
                      />
                      <span className="ac-field-hint">Current stock: {form.stock}</span>
                    </div>
                    <div className="ac-field">
                      <label>Offer End Time (Optional)</label>
                      <input
                        type="datetime-local"
                        name="expiry_date"
                        value={form.expiry_date}
                        onChange={handleChange}
                      />
                      <span className="ac-field-hint">Combo will hide after this date</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Product Picker */}
                <div className="ac-form-right">
                  <h4 className="ac-section-label">🛍️ Select Products for this Combo</h4>
                  <p className="ac-picker-hint">Select 2 or more products that make up this combo</p>

                  {/* Selected preview */}
                  {form.product_ids.length > 0 && (
                    <div className="ac-selected-preview">
                      <span className="ac-selected-label">{form.product_ids.length} selected:</span>
                      <div className="ac-selected-chips">
                        {getSelectedProducts().map(p => (
                          <span key={p.variantKey} className="ac-chip">
                            {p.displayTitle.slice(0, 30)}
                            <button type="button" onClick={() => toggleProductSelection(p.variantKey)}>
                              <X size={11} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="ac-search-box">
                    <Search size={15} />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="Search products..."
                      id="combo-product-search"
                    />
                  </div>

                  <div className="ac-product-list">
                    {(() => {
                      const flattened = [];
                      filteredProducts.forEach(p => {
                        try {
                          const sizes = JSON.parse(p.size || '[]');
                          if (Array.isArray(sizes) && sizes.length > 0) {
                            sizes.forEach(s => {
                              flattened.push({
                                ...p,
                                displayTitle: `${p.title.split('|')[0].trim()} (${s.label})`,
                                displayPrice: s.price || p.price,
                                variantKey: `${p.id}-${s.label}`
                              });
                            });
                          } else {
                            flattened.push({
                              ...p,
                              displayTitle: p.title.split('|')[0].trim(),
                              displayPrice: p.price,
                              variantKey: String(p.id)
                            });
                          }
                        } catch (e) {
                          flattened.push({
                            ...p,
                            displayTitle: p.title.split('|')[0].trim(),
                            displayPrice: p.price,
                            variantKey: String(p.id)
                          });
                        }
                      });

                      return flattened.map(p => (
                        <label
                          key={p.variantKey}
                          className={`ac-product-item ${form.product_ids.includes(p.variantKey) ? 'selected' : ''}`}
                          id={`combo-product-${p.variantKey}`}
                        >
                          <input
                            type="checkbox"
                            checked={form.product_ids.includes(p.variantKey)}
                            onChange={() => toggleProductSelection(p.variantKey)}
                          />
                          {p.img && <img src={p.img} alt={p.title} className="ac-product-thumb" />}
                          <div className="ac-product-info">
                            <span className="ac-product-name">{p.displayTitle}</span>
                            <span className="ac-product-price">₹{p.displayPrice}</span>
                          </div>
                          {form.product_ids.includes(p.variantKey) && (
                            <Check size={16} className="ac-product-check" />
                          )}
                        </label>
                      ));
                    })()}
                    {filteredProducts.length === 0 && (
                      <p className="ac-no-products">No products found</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="ac-form-actions">
                <button type="button" className="ac-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="ac-save-btn" disabled={saving} id="combo-save-btn">
                  {saving ? 'Saving...' : <><Check size={16} /> {editingId ? 'Save Changes' : 'Create Combo'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMBOS LIST */}
      {loading ? (
        <div className="ac-loading">Loading combos...</div>
      ) : combos.length === 0 ? (
        <div className="ac-empty">
          <Package size={48} />
          <p>No combo deals yet. Create your first one!</p>
        </div>
      ) : (
        <div className="ac-grid">
          {combos.map(combo => {
            let benefitsData = { product_ids: [], stock: 0, expiry_date: '' };
            try { 
              const parsed = JSON.parse(combo.benefits || '[]'); 
              if (Array.isArray(parsed)) {
                benefitsData.product_ids = parsed;
              } else {
                benefitsData = { ...benefitsData, ...parsed };
              }
            } catch(e) { }

            const comboProducts = products.filter(p => benefitsData.product_ids.includes(p.id));
            const isExpired = benefitsData.expiry_date && new Date(benefitsData.expiry_date) < new Date();
            
            return (
              <div key={combo.id} className={`ac-card ${combo.status !== 'active' || isExpired ? 'inactive' : ''}`} id={`combo-card-${combo.id}`}>
                <div className="ac-card-img-wrap">
                  {combo.img ? (
                    <img src={combo.img} alt={combo.title} className="ac-card-img" />
                  ) : (
                    <div className="ac-card-img-placeholder">
                      <Package size={40} />
                    </div>
                  )}
                  <span className="ac-card-badge">{benefitsData.stock <= 5 && benefitsData.stock > 0 ? 'ONLY FEW LEFT' : combo.badge}</span>
                  {(combo.status !== 'active' || isExpired) && (
                    <span className="ac-card-inactive-label">{isExpired ? 'EXPIRED' : 'INACTIVE'}</span>
                  )}
                </div>

                <div className="ac-card-body">
                  <div className="ac-card-stock-status">
                    <span className={`ac-stock-dot ${benefitsData.stock > 10 ? 'high' : benefitsData.stock > 0 ? 'low' : 'out'}`}></span>
                    {benefitsData.stock > 0 ? `${benefitsData.stock} in stock` : 'Out of stock'}
                  </div>
                  <h3 className="ac-card-name">{combo.title}</h3>
                  {combo.description && <p className="ac-card-desc">{combo.description}</p>}
                  
                  {benefitsData.expiry_date && (
                    <div className="ac-card-expiry">
                      Ends: {new Date(benefitsData.expiry_date).toLocaleString()}
                    </div>
                  )}

                  <div className="ac-card-pricing">
                    <span className="ac-card-combo">₹{combo.price}</span>
                    <span className="ac-card-save">Bundle Deal</span>
                  </div>

                  <div className="ac-card-code">
                    <Tag size={13} />
                    <span>{combo.promo_group}</span>
                  </div>

                  {comboProducts.length > 0 && (
                    <div className="ac-card-products">
                      <span className="ac-card-products-label">Includes:</span>
                      {comboProducts.map(p => (
                        <span key={p.id} className="ac-card-product-chip">
                          {p.title.split('|')[0].trim().slice(0, 24)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="ac-card-actions">
                    <button
                      className={`ac-toggle-btn ${combo.status === 'active' ? 'on' : 'off'}`}
                      onClick={() => toggleActive(combo.id, combo.status === 'active', combo.promo_group)}
                    >
                      {combo.status === 'active' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      {combo.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                    <button className="ac-edit-btn" onClick={() => openEdit(combo)}>
                      <Edit2 size={15} />
                    </button>
                    <button className="ac-delete-btn" onClick={() => handleDelete(combo.id, combo.title, combo.promo_group)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminCombos;
