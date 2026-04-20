import React, { useState, useEffect } from 'react';
import { Trash2, Star, Check, X, Loader2 } from 'lucide-react';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';
import { supabase } from '../../../lib/supabase';
import { useNotify } from '../../../components/common/Notification/Notification';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { notify } = useNotify();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Fallback: If table is completely missing, this catches the error and shows empty state.
      const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (error) {
        if (error.code === '42P01') {
          console.warn('Reviews table does not exist yet.');
          setReviews([]);
          return;
        }
        throw error;
      }
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id, currentStatus) => {
    try {
      const { error } = await supabase.from('reviews').update({ approved: !currentStatus }).eq('id', id);
      if (error) throw error;
      setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: !currentStatus } : r));
      notify(`Testimonial ${!currentStatus ? 'approved' : 'hidden'}`, 'success');
    } catch (err) {
      notify('Failed to update status', 'error');
    }
  };

  const deleteReview = async (id) => {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== id));
      notify('Testimonial permanently deleted', 'success');
    } catch (err) {
      notify('Failed to delete testimonial', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="admin-page-wrap">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Testimonials & Reviews</h1>
        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>{reviews.filter(r => !r.approved).length} pending approval</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <Loader2 size={24} style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }} />
            <p>Syncing testimonials...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280', background: '#fff', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
            No testimonials mapped.
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="admin-card" style={{ borderLeft: `4px solid ${review.approved ? '#10b981' : '#f59e0b'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <strong style={{ color: '#111' }}>{review.customer_name || review.name}</strong>
                  <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>on {review.product_name || review.product}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[...Array(review.rating || 5)].map((_, i) => <Star key={i} size={14} fill="#C5A028" stroke="#C5A028" />)}
                </div>
              </div>
              <p style={{ color: '#444', fontSize: '0.95rem', marginBottom: '1rem' }}>{review.review_text || review.text}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: review.approved ? '#d1fae5' : '#fef3c7', color: review.approved ? '#065f46' : '#92400e' }}>
                  {review.approved ? 'Approved' : 'Pending'}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="t-action-btn edit" title={review.approved ? 'Unapprove' : 'Approve'} onClick={() => toggleApproval(review.id, review.approved)}>
                    {review.approved ? <X size={16} /> : <Check size={16} />}
                  </button>
                  <button className="t-action-btn delete" onClick={() => setDeleteConfirm(review.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <ConfirmModal 
        isOpen={!!deleteConfirm}
        title="Delete Testimonial?"
        message="This review will be permanently removed from your dashboard."
        onConfirm={() => deleteReview(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};

export default AdminReviews;
