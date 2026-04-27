import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, Edit2, Check, X, Tag, ToggleLeft, ToggleRight, Percent, IndianRupee, Clock, AlertCircle } from 'lucide-react';
import { useNotify } from '../../../components/common/Notification/Notification';
import './AdminPromoCodes.css';

const EMPTY = {
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order_amount: 0,
  max_uses: '',
  expires_at: '',
  description: '',
  is_active: true,
  promo_type: 'standard',
  min_item_count: 3,
  applicable_category: 'all',
  how_to_redeem: '',        // Step-by-step instructions for customer
  applicable_products: '',  // Which products qualify (text)
};

const AdminPromoCodes = () => {
  const { notify } = useNotify();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) notify('Failed to load promo codes', 'error');
    else setCodes(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (code) => {
    setEditingId(code.id);
    setForm({
      code: code.code,
      discount_type: code.discount_type,
      discount_value: code.discount_value,
      min_order_amount: code.min_order_amount || 0,
      max_uses: code.max_uses || '',
      expires_at: code.expires_at ? code.expires_at.slice(0, 16) : '',
      description: code.description || '',
      is_active: code.is_active,
      promo_type: code.promo_type || 'standard',
      min_item_count: code.min_item_count || 3,
      applicable_category: code.applicable_category || 'all',
      how_to_redeem: code.how_to_redeem || '',
      applicable_products: code.applicable_products || '',
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return notify('Promo code is required', 'error');
    if (!form.discount_value || Number(form.discount_value) <= 0) return notify('Discount value must be > 0', 'error');

    setSaving(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount) || 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
      description: form.description,
      is_active: form.is_active,
      promo_type: form.promo_type || 'standard',
      min_item_count: form.promo_type === 'b2g1' ? Number(form.min_item_count) : null,
      applicable_category: form.promo_type === 'b2g1' ? form.applicable_category : 'all',
      how_to_redeem: form.how_to_redeem || null,
      applicable_products: form.applicable_products || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('promo_codes').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('promo_codes').insert([payload]));
    }

    if (error) {
      notify(error.message.includes('unique') ? 'Code already exists!' : error.message, 'error');
    } else {
      notify(editingId ? 'Promo code updated!' : 'Promo code created!', 'success');
      setShowForm(false);
      fetchCodes();
    }
    setSaving(false);
  };

  const toggleActive = async (id, current) => {
    const { error } = await supabase.from('promo_codes').update({ is_active: !current }).eq('id', id);
    if (error) notify('Failed to update', 'error');
    else {
      notify(!current ? 'Promo code activated' : 'Promo code deactivated', 'success');
      fetchCodes();
    }
  };

  const handleDelete = async (id, code) => {
    notify(`Delete promo code "${code}"?`, 'confirm', {
      onConfirm: async () => {
        const { error } = await supabase.from('promo_codes').delete().eq('id', id);
        if (error) notify('Delete failed', 'error');
        else { notify('Deleted!', 'success'); fetchCodes(); }
      }
    });
  };

  const isExpired = (expires_at) => expires_at && new Date(expires_at) < new Date();

  return (
    <div className="apc-wrap">
      <div className="apc-header">
        <div>
          <h1 className="apc-title">Promo Codes</h1>
          <p className="apc-sub">Create and manage discount coupon codes</p>
        </div>
        <button className="apc-add-btn" onClick={openAdd}>
          <Plus size={18} /> Create New Code
        </button>
      </div>

      {/* CREATE / EDIT FORM */}
      {showForm && (
        <div className="apc-form-card">
          <div className="apc-form-head">
            <h3>{editingId ? 'Edit Promo Code' : 'Create New Promo Code'}</h3>
            <button className="apc-close-btn" onClick={() => setShowForm(false)}><X size={18} /></button>
          </div>
          <form className="apc-form" onSubmit={handleSave}>
            <div className="apc-form-grid">
              <div className="apc-field">
                <label>Code *</label>
                <input name="code" value={form.code} onChange={handleChange} placeholder="e.g. SUMMER20" style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="apc-field">
                <label>Discount Type *</label>
                <select name="discount_type" value={form.discount_type} onChange={handleChange}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="apc-field">
                <label>Discount Value * {form.discount_type === 'percentage' ? '(%)' : '(₹)'}</label>
                <input type="number" name="discount_value" value={form.discount_value} onChange={handleChange} placeholder={form.discount_type === 'percentage' ? '10' : '100'} min="1" />
              </div>
              <div className="apc-field">
                <label>Min Order Amount (₹)</label>
                <input type="number" name="min_order_amount" value={form.min_order_amount} onChange={handleChange} placeholder="0" min="0" />
              </div>
              <div className="apc-field">
                <label>Max Uses (blank = unlimited)</label>
                <input type="number" name="max_uses" value={form.max_uses} onChange={handleChange} placeholder="Unlimited" min="1" />
              </div>
              <div className="apc-field">
                <label>Expiry Date &amp; Time</label>
                <input type="datetime-local" name="expires_at" value={form.expires_at} onChange={handleChange} />
              </div>
              <div className="apc-field apc-field-full">
                <label>Description <span style={{color:'#9ca3af', fontWeight:400}}>(shown on homepage card)</span></label>
                <input name="description" value={form.description} onChange={handleChange} placeholder="e.g. Buy 3 Face Washes – Get 1 FREE (Save ₹349)" />
              </div>

              <div className="apc-field apc-field-full">
                <label>📦 Applicable Products <span style={{color:'#9ca3af', fontWeight:400}}>(which products qualify for this offer)</span></label>
                <textarea
                  name="applicable_products"
                  value={form.applicable_products}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g. Rice Water Face Wash, Vitamin C Ubtan Face Wash, Charcoal Face Wash, Hyaluronic Acid Face Wash, Salicylic Acid Face Wash"
                  className="apc-textarea"
                />
              </div>

              <div className="apc-field apc-field-full">
                <label>📋 How to Redeem <span style={{color:'#9ca3af', fontWeight:400}}>(step-by-step instructions for the customer)</span></label>
                <textarea
                  name="how_to_redeem"
                  value={form.how_to_redeem}
                  onChange={handleChange}
                  rows={4}
                  placeholder={`e.g.\n1. Add 3 Face Washes to your cart\n2. Go to Checkout\n3. Enter code WASH3FREE in the Promo Code box\n4. ₹349 will be deducted automatically`}
                  className="apc-textarea"
                />
              </div>

              {/* ── CONDITION BUILDER ────────────────────────────── */}
              <div className="apc-field apc-field-full apc-condition-box">
                <label style={{fontWeight:700, color:'#1e293b', fontSize:'0.9rem'}}>🎯 Promo Condition</label>
                <p style={{fontSize:'0.75rem', color:'#64748b', margin:'2px 0 12px'}}>Set rules — when is this code valid?</p>
                <div className="apc-form-grid" style={{marginTop:0}}>
                  <div className="apc-field">
                    <label>Condition Type</label>
                    <select name="promo_type" value={form.promo_type} onChange={handleChange}>
                      <option value="standard">Standard (always valid)</option>
                      <option value="b2g1">Buy 2 Get 1 Free (needs min items)</option>
                      <option value="bogo">Buy 1 Get 1 Free (needs 2 items in cart)</option>
                      <option value="new_user">New Customer Only (first order)</option>
                    </select>
                  </div>
                  {form.promo_type === 'b2g1' && (
                    <>
                      <div className="apc-field">
                        <label>Minimum Items in Cart</label>
                        <input
                          type="number" name="min_item_count" min="2" max="20"
                          value={form.min_item_count}
                          onChange={handleChange}
                          placeholder="3"
                        />
                        <span style={{fontSize:'0.72rem', color:'#64748b', marginTop:'4px', display:'block'}}>Customer must add this many items before code works</span>
                      </div>
                      <div className="apc-field">
                        <label>Applies To (Category)</label>
                        <select name="applicable_category" value={form.applicable_category} onChange={handleChange}>
                          <option value="all">All Products</option>
                          <option value="face_wash">Face Washes Only</option>
                          <option value="body_lotion">Body Lotions Only</option>
                          <option value="serum">Serums Only</option>
                          <option value="sunscreen">Sunscreen Only</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="apc-field apc-toggle-field">
                <label>Active</label>
                <label className="apc-toggle">
                  <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                  <span className="apc-toggle-slider"></span>
                </label>
              </div>
            </div>
            <div className="apc-form-actions">
              <button type="button" className="apc-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="apc-save-btn" disabled={saving}>
                {saving ? 'Saving...' : <><Check size={16} /> {editingId ? 'Save Changes' : 'Create Code'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CODES TABLE */}
      <div className="apc-table-wrap">
        {loading ? (
          <div className="apc-loading">Loading promo codes...</div>
        ) : codes.length === 0 ? (
          <div className="apc-empty">
            <Tag size={40} />
            <p>No promo codes yet. Create your first one!</p>
          </div>
        ) : (
          <table className="apc-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Usage</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map(c => {
                const expired = isExpired(c.expires_at);
                return (
                  <tr key={c.id} className={`apc-row ${!c.is_active || expired ? 'inactive' : ''}`}>
                    <td>
                      <div className="apc-code-cell">
                        <span className="apc-code-tag">{c.code}</span>
                        {c.description && <span className="apc-code-desc">{c.description}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="apc-discount-badge">
                        {c.discount_type === 'percentage'
                          ? <><Percent size={12} />{c.discount_value}% OFF</>
                          : <><IndianRupee size={12} />{c.discount_value} OFF</>}
                      </span>
                    </td>
                    <td>₹{c.min_order_amount || 0}</td>
                    <td>
                      {c.uses_count || 0} / {c.max_uses ? c.max_uses : '∞'}
                    </td>
                    <td>
                      {c.expires_at ? (
                        <span className={expired ? 'apc-expired' : 'apc-date'}>
                          {expired && <AlertCircle size={12} />}
                          {new Date(c.expires_at).toLocaleDateString('en-IN')}
                        </span>
                      ) : <span className="apc-no-expiry">Never</span>}
                    </td>
                    <td>
                      <button className={`apc-toggle-btn ${c.is_active && !expired ? 'on' : 'off'}`} onClick={() => toggleActive(c.id, c.is_active)} title="Toggle active">
                        {c.is_active && !expired ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                        <span>{c.is_active && !expired ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td>
                      <div className="apc-actions">
                        <button className="apc-edit-btn" onClick={() => openEdit(c)} title="Edit"><Edit2 size={15} /></button>
                        <button className="apc-delete-btn" onClick={() => handleDelete(c.id, c.code)} title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPromoCodes;
