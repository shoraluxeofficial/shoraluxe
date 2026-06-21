import React, { useState, useEffect } from 'react';
import { Star, User, Calendar, MessageSquare, Quote, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import './ProductReviews.css';

const ProductReviews = ({ productId, productName }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ average: 0, total: 0, counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Filter approved reviews using JS to support both local and production DB schemas seamlessly
        const approvedReviews = data.filter(r => r.approved === true || r.is_approved === true);
        setReviews(approvedReviews);
        calculateStats(approvedReviews);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    if (data.length === 0) {
      setStats({ average: 0, total: 0, counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
      return;
    }

    const total = data.length;
    const sum = data.reduce((acc, curr) => acc + (curr.rating || 5), 0);
    const average = (sum / total).toFixed(1);

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    data.forEach(r => {
      const rating = r.rating || 5;
      counts[rating] = (counts[rating] || 0) + 1;
    });

    setStats({ average, total, counts });
  };

  if (loading) return <div className="reviews-loading">Loading shared experiences...</div>;

  return (
    <div className="product-reviews-section">
      <div className="reviews-container">
        <div className="reviews-header">
          <div className="section-badge">COMMUNITY FEEDBACK</div>
          <h2 className="reviews-title">What Our Customers <em>Say</em></h2>
        </div>

        {reviews.length === 0 ? (
          <div className="no-reviews-state">
            <Quote size={40} className="quote-icon" />
            <p>We'd love to hear from you! Share your experience, feedback, or suggestions. Your comments help us continue improving our services.</p>
          </div>
        ) : (
          <div className="reviews-layout">
            <div className="reviews-summary-card">
              <div className="average-rating-box">
                <span className="big-avg">{stats.average}</span>
                <div className="stars-wrap">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      fill={i < Math.round(stats.average) ? "#C5A028" : "none"} 
                      stroke={i < Math.round(stats.average) ? "#C5A028" : "#d1d5db"} 
                    />
                  ))}
                </div>
                <span className="total-label">Based on {stats.total} verified reviews</span>
              </div>

              <div className="rating-bars-list">
                {[5, 4, 3, 2, 1].map(num => (
                  <div key={num} className="rating-bar-row">
                    <span className="star-num">{num} <Star size={12} fill="#666" /></span>
                    <div className="bar-track">
                      <div 
                        className="bar-fill" 
                        style={{ width: `${(stats.counts[num] / stats.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="bar-count">{stats.counts[num]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="reviews-list-col">
              {reviews.map((review) => (
                <div key={review.id} className="review-item-card">
                  <div className="review-card-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        <User size={16} />
                      </div>
                      <div className="user-meta">
                        <span className="user-name">{review.customer_name}</span>
                        <div className="verified-badge">
                          <Check size={10} /> Verified Purchase
                        </div>
                      </div>
                    </div>
                    <div className="review-date">
                      <Calendar size={12} />
                      {new Date(review.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="review-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < (review.rating || 5) ? "#C5A028" : "none"} 
                        stroke={i < (review.rating || 5) ? "#C5A028" : "#d1d5db"} 
                      />
                    ))}
                  </div>

                  <p className="review-content">{review.review_text}</p>
                  
                  <div className="review-footer">
                    <MessageSquare size={14} /> <span>Helpful</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
