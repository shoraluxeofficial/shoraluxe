import React from 'react';
import { Star, BadgeCheck } from 'lucide-react';
import './Testimonials.css';

const reviews = [
  {
    id: 1,
    name: "Ananya Sharma",
    location: "Mumbai",
    product: "Sunscreen SPF 50+++",
    text: "My skin has never felt this protected and light! The Sunscreen doesn't leave a white cast at all — perfect for Indian skin. I use it every single morning.",
    rating: 5,
    initials: "AS",
    color: "#6d0e2c",
    date: "2 weeks ago"
  },
  {
    id: 2,
    name: "Rahul Verma",
    location: "New Delhi",
    product: "Complete Skincare Trio",
    text: "Luxury in a bottle. Shoraluxe matches international standards. The packaging and results are both elite. The trio combo is worth every rupee — visible glow in 7 days.",
    rating: 5,
    initials: "RV",
    color: "#907253",
    date: "1 month ago"
  },
  {
    id: 3,
    name: "Priya Iyer",
    location: "Bangalore",
    product: "Non-Sticky Moisturizer",
    text: "Finally found something that works for my sensitive skin. No irritation, just calm, healthy glow. My morning routine is incomplete without this moisturizer now.",
    rating: 5,
    initials: "PI",
    color: "#2c4a3e",
    date: "3 weeks ago"
  },
  {
    id: 4,
    name: "Divya Nair",
    location: "Chennai",
    product: "Charcoal Face Wash",
    text: "I was skeptical at first but this charcoal face wash cleared my pores in just 2 weeks. My skin feels so clean and fresh. Will definitely reorder!",
    rating: 5,
    initials: "DN",
    color: "#3a4a6b",
    date: "1 week ago"
  },
  {
    id: 5,
    name: "Karthik Reddy",
    location: "Hyderabad",
    product: "Day + Night Duo",
    text: "The Day + Night Duo combo is a game changer. Daytime brightening and nighttime repair — my skin looks visibly younger. Highly recommend to everyone.",
    rating: 5,
    initials: "KR",
    color: "#5a3a6e",
    date: "2 months ago"
  },
  {
    id: 6,
    name: "Sneha Kulkarni",
    location: "Pune",
    product: "Rice Water Face Wash",
    text: "Gentle, effective, and smells amazing. The Rice Water Face Wash is perfect for daily use. My skin tone has evened out noticeably after a month of use.",
    rating: 4,
    initials: "SK",
    color: "#4a6d4a",
    date: "3 weeks ago"
  }
];

const StarRating = ({ rating }) => (
  <div className="trev-stars">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < rating ? "#c5a020" : "none"}
        stroke={i < rating ? "#c5a020" : "#ddd"}
      />
    ))}
  </div>
);

const Testimonials = () => {
  return (
    <section className="trev-section">
      <div className="trev-container">

        {/* Header */}
        <div className="trev-header">
          <span className="trev-eyebrow">CUSTOMER REVIEWS</span>
          <h2 className="trev-title">Loved by Thousands Across India</h2>
          <div className="trev-aggregate">
            <div className="trev-agg-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="#c5a020" stroke="#c5a020" />
              ))}
            </div>
            <span className="trev-agg-score">4.9</span>
            <span className="trev-agg-count">from 2,400+ verified buyers</span>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="trev-grid">
          {reviews.map((review) => (
            <div key={review.id} className="trev-card">
              {/* Quote mark */}
              <div className="trev-quote">"</div>

              {/* Stars + date */}
              <div className="trev-card-top">
                <StarRating rating={review.rating} />
                <span className="trev-date">{review.date}</span>
              </div>

              {/* Review text */}
              <p className="trev-text">{review.text}</p>

              {/* Product tag */}
              <div className="trev-product-tag">
                <span className="trev-product-dot" style={{ background: review.color }} />
                {review.product}
              </div>

              {/* Reviewer */}
              <div className="trev-reviewer">
                <div className="trev-avatar" style={{ background: review.color }}>
                  {review.initials}
                </div>
                <div className="trev-reviewer-info">
                  <div className="trev-name-row">
                    <span className="trev-name">{review.name}</span>
                    <BadgeCheck size={15} className="trev-verified-icon" />
                  </div>
                  <span className="trev-location">{review.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="trev-trust-row">
          <div className="trev-trust-item">
            <span className="trev-trust-num">12,000+</span>
            <span className="trev-trust-label">Happy Customers</span>
          </div>
          <div className="trev-trust-divider" />
          <div className="trev-trust-item">
            <span className="trev-trust-num">4.9★</span>
            <span className="trev-trust-label">Average Rating</span>
          </div>
          <div className="trev-trust-divider" />
          <div className="trev-trust-item">
            <span className="trev-trust-num">98%</span>
            <span className="trev-trust-label">Would Recommend</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
