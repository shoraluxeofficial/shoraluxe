import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, Edit2, Save, X, ExternalLink, Image as ImageIcon } from 'lucide-react';
import './AdminPromoRibbons.css';

const AdminPromoRibbons = () => {
  const [ribbons, setRibbons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRibbon, setCurrentRibbon] = useState({
    text: '',
    link: '',
    design_type: 'design-royal-cyan',
    image_url: '',
    is_active: true
  });

  const DESIGN_PRESETS = [
    { id: 'design-royal-cyan', name: 'Royal Cyan', color: '#3a7bd5' },
    { id: 'design-midnight-gold', name: 'Midnight Gold', color: '#1a1a1a' },
    { id: 'design-emerald-silk', name: 'Emerald Silk', color: '#134e5e' },
    { id: 'design-burgundy-velvet', name: 'Burgundy Velvet', color: '#6d0e2c' },
    { id: 'design-amethyst-glass', name: 'Amethyst Glass', color: '#4b0082' }
  ];

  useEffect(() => {
    fetchRibbons();
  }, []);

  const fetchRibbons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('promo_ribbons')
      .select('*')
      .order('id', { ascending: true });

    if (!error && data) setRibbons(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (currentRibbon.id) {
      // Update
      const { error } = await supabase
        .from('promo_ribbons')
        .update(currentRibbon)
        .eq('id', currentRibbon.id);
      if (error) alert(error.message);
    } else {
      // Create
      const { error } = await supabase
        .from('promo_ribbons')
        .insert([currentRibbon]);
      if (error) alert(error.message);
    }

    setIsEditing(false);
    setCurrentRibbon({ text: '', link: '', design_type: 'design-royal-cyan', image_url: '', is_active: true });
    fetchRibbons();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this promo ribbon?')) {
      const { error } = await supabase.from('promo_ribbons').delete().eq('id', id);
      if (!error) fetchRibbons();
    }
  };

  const handleEdit = (ribbon) => {
    setCurrentRibbon(ribbon);
    setIsEditing(true);
  };

  return (
    <div className="admin-ribbons-page">
      <div className="admin-header-flex">
        <div>
          <h1>Promo Ribbon Management</h1>
          <p>Manage full-width animated promo banners for the homepage.</p>
        </div>
        <button className="add-btn" onClick={() => setIsEditing(true)}>
          <Plus size={18} /> New Ribbon
        </button>
      </div>

      {isEditing && (
        <div className="ribbon-modal-overlay">
          <div className="ribbon-modal">
            <h2>{currentRibbon.id ? 'Edit Ribbon' : 'Create New Ribbon'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Ribbon Text</label>
                <input 
                  type="text" 
                  value={currentRibbon.text} 
                  onChange={(e) => setCurrentRibbon({...currentRibbon, text: e.target.value})}
                  placeholder="e.g. BUY 2 GET 1 FREE"
                  required
                />
              </div>

              <div className="form-group">
                <label>Redirect Link</label>
                <input 
                  type="text" 
                  value={currentRibbon.link} 
                  onChange={(e) => setCurrentRibbon({...currentRibbon, link: e.target.value})}
                  placeholder="/shop"
                  required
                />
              </div>

              <div className="form-group">
                <label>Small Image URL</label>
                <div className="url-input-flex">
                  <input 
                    type="text" 
                    value={currentRibbon.image_url} 
                    onChange={(e) => setCurrentRibbon({...currentRibbon, image_url: e.target.value})}
                    placeholder="https://... / image.png"
                  />
                  {currentRibbon.image_url && <img src={currentRibbon.image_url} alt="Preview" className="mini-preview" />}
                </div>
              </div>

              <div className="form-group">
                <label>Design Style (Premium Presets)</label>
                <div className="design-grid">
                  {DESIGN_PRESETS.map((p) => (
                    <div 
                      key={p.id}
                      className={`design-swatch ${currentRibbon.design_type === p.id ? 'active' : ''}`}
                      onClick={() => setCurrentRibbon({...currentRibbon, design_type: p.id})}
                      style={{ backgroundColor: p.color }}
                    >
                      <span>{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-checkbox">
                <input 
                  type="checkbox" 
                  id="is_active"
                  checked={currentRibbon.is_active} 
                  onChange={(e) => setCurrentRibbon({...currentRibbon, is_active: e.target.checked})}
                />
                <label htmlFor="is_active">Set as Active</label>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="save-btn">
                  <Save size={18} /> {currentRibbon.id ? 'Update Ribbon' : 'Save Ribbon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="ribbon-grid">
        {ribbons.map((ribbon) => (
          <div key={ribbon.id} className={`ribbon-card ${ribbon.is_active ? '' : 'inactive'}`}>
            <div className={`ribbon-preview-small ${ribbon.design_type}`}>
              {ribbon.image_url && <img src={ribbon.image_url} alt="Icon" />}
              <span>{ribbon.text}</span>
            </div>
            
            <div className="ribbon-details">
              <h3>{ribbon.text}</h3>
              <p>Link: {ribbon.link}</p>
              <div className="ribbon-actions">
                <button onClick={() => handleEdit(ribbon)} className="edit-icon-btn"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(ribbon.id)} className="delete-icon-btn"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
        {ribbons.length === 0 && !loading && (
          <div className="empty-state">No ribbons created yet. Add one to get started!</div>
        )}
      </div>
    </div>
  );
};

export default AdminPromoRibbons;
