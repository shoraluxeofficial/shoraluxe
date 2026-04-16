import React, { useState } from 'react';
import { Trash2, Star, Check, X } from 'lucide-react';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';

const initialReviews = [
  { id: 1, name: 'Priya S.', rating: 5, text: 'Absolutely love the Retinol Night Cream! My skin has never felt smoother.', product: 'Retinol Night Cream', approved: true },
  { id: 2, name: 'Meena R.', rating: 4, text: 'The Vitamin C serum is great, saw results within 2 weeks!', product: 'Vitamin C Serum', approved: false },
  { id: 3, name: 'Anjali K.', rating: 5, text: 'The sunscreen is lightweight and great for daily use. No white cast!', product: 'Sunscreen SPF 50+++', approved: true },
];

const AdminReviews = () => {
  const [reviews, setReviews] = useState(initialReviews);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const toggleApproval = (id) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: !r.approved } : r));
  };

  const deleteReview = (id) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="admin-page-wrap">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Testimonials & Reviews</h1>
        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>{reviews.filter(r => !r.approved).length} pending approval</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reviews.map(review => (
          <div key={review.id} className="admin-card" style={{ borderLeft: `4px solid ${review.approved ? '#10b981' : '#f59e0b'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <strong style={{ color: '#111' }}>{review.name}</strong>
                <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>on {review.product}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="#C5A028" stroke="#C5A028" />)}
              </div>
            </div>
            <p style={{ color: '#444', fontSize: '0.95rem', marginBottom: '1rem' }}>{review.text}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: review.approved ? '#d1fae5' : '#fef3c7', color: review.approved ? '#065f46' : '#92400e' }}>
                {review.approved ? 'Approved' : 'Pending'}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="t-action-btn edit" title={review.approved ? 'Unapprove' : 'Approve'} onClick={() => toggleApproval(review.id)}>
                  {review.approved ? <X size={16} /> : <Check size={16} />}
                </button>
                <button className="t-action-btn delete" onClick={() => setDeleteConfirm(review.id)}><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
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
