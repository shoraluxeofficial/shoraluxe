import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, Send, Loader2, CheckCircle2, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNotify } from '../../components/common/Notification/Notification';
import SEO from '../../components/SEO/SEO';
import './SubmitReview.css';

const SubmitReview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notify } = useNotify();
  const orderId = searchParams.get('order_id');

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Feedback state for each item
  const [feedbacks, setFeedbacks] = useState({});

  useEffect(() => {
    if (!orderId) {
      navigate('/shop');
      return;
    }
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

      // Initialize feedback state
      const initialFeedbacks = {};
      itemsData.forEach(item => {
        initialFeedbacks[item.product_id] = {
          rating: 5,
          comment: '',
          product_name: item.product_title,
          product_id: item.product_id
        };
      });
      setFeedbacks(initialFeedbacks);

    } catch (err) {
      console.error('Error fetching order:', err);
      notify('Invalid order reference', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (productId, rating) => {
    setFeedbacks(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating }
    }));
  };

  const handleCommentChange = (productId, comment) => {
    setFeedbacks(prev => ({
      ...prev,
      [productId]: { ...prev[productId], comment }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const reviewsToSubmit = Object.values(feedbacks).map(f => ({
        product_id: f.product_id,
        product_name: f.product_name,
        customer_name: order.customer_name,
        rating: f.rating,
        review_text: f.comment,
        approved: false, // Admin needs to approve
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('reviews').insert(reviewsToSubmit);
      
      if (error) throw error;

      setSubmitted(true);
      notify('Thank you! Your feedback is under review.', 'success');
      
      setTimeout(() => {
        navigate('/shop');
      }, 5000);

    } catch (err) {
      console.error('Error submitting reviews:', err);
      notify('Failed to submit feedback', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="sr-loading">
      <Loader2 className="spin" size={40} />
      <p>Fetching your order details...</p>
    </div>
  );

  if (submitted) return (
    <div className="sr-success">
      <CheckCircle2 size={80} color="#059669" />
      <h1>Experience Shared!</h1>
      <p>Thank you, {order?.customer_name}. Your feedback helps our community and helps us improve.</p>
      <p className="redirect-note">Redirecting you to the shop in 5 seconds...</p>
      <button className="sr-btn-primary" onClick={() => navigate('/shop')}>Back to Shop</button>
    </div>
  );

  return (
    <div className="submit-review-page">
      <SEO title="Share Your Experience - Shoraluxe" />
      <div className="sr-container">
        <header className="sr-header">
          <div className="sr-badge">VALUED CUSTOMER</div>
          <h1>How was your <em>Shoraluxe</em> experience?</h1>
          <p>Order #{orderId.slice(0, 8).toUpperCase()} • Delivered on {new Date(order.updated_at).toLocaleDateString()}</p>
        </header>

        <form onSubmit={handleSubmit} className="sr-form">
          <div className="sr-items-grid">
            {items.map((item) => (
              <div key={item.id} className="sr-item-card">
                <div className="sr-item-top">
                  <div className="sr-item-img">
                    <img src={item.product_img} alt={item.product_title} />
                  </div>
                  <div className="sr-item-info">
                    <h3>{item.product_title}</h3>
                    <p>Rate this product</p>
                    <div className="sr-stars-input">
                      {[1, 2, 3, 4, 5].map(num => (
                        <Star 
                          key={num}
                          size={28}
                          className="star-icon"
                          fill={num <= feedbacks[item.product_id]?.rating ? "#C5A028" : "none"}
                          stroke={num <= feedbacks[item.product_id]?.rating ? "#C5A028" : "#d1d5db"}
                          onClick={() => handleRatingChange(item.product_id, num)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="sr-item-comment">
                  <label>Share your thoughts (Optional)</label>
                  <textarea 
                    placeholder="What did you like about this product? How did it feel on your skin?"
                    value={feedbacks[item.product_id]?.comment}
                    onChange={(e) => handleCommentChange(item.product_id, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="sr-footer">
            <div className="sr-trust-note">
              Your review will be shared with the Shoraluxe community after moderation.
            </div>
            <button type="submit" className="sr-submit-btn" disabled={submitting}>
              {submitting ? <><Loader2 className="spin" size={20} /> SUBMITTING...</> : <><Send size={18} /> SUBMIT FEEDBACK</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitReview;
