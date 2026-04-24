import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import './Testimonials.css';

const reviews = [
  {
    id: 1,
    name: "Ananya Sharma",
    location: "Mumbai",
    text: "My skin has never felt this hydrated. The Rewind Age Reversing Gel is pure magic! I saw a visible difference in my fine lines within just 10 days.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: 2,
    name: "Rahul Verma",
    location: "New Delhi",
    text: "Luxury in a bottle. Shoraluxe matches international standards. The packaging and the results are both elite. Highly recommend the Vitamin C serum.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: 3,
    name: "Priya Iyer",
    location: "Bangalore",
    text: "Finally found something that truly works for my sensitive skin. No irritation, just a calm, healthy glow. My morning ritual is incomplete without it.",
    rating: 4,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150"
  }
];

const Testimonials = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="testimonials-section">
      <div className="testi-container">
        <div className="testi-header">
          <span className="testi-tag">REVIEWS</span>
          <h2 className="testi-heading">Loved by Thousands</h2>
        </div>

        <div className="testi-slider">
          {reviews.map((review, i) => (
            <div
              key={review.id}
              className={`testi-card ${i === index ? 'active' : ''} ${i === (index - 1 + reviews.length) % reviews.length ? 'prev' : ''}`}
            >
              <div className="testi-quote-icon">
                <Quote size={40} fill="var(--brand-gold)" stroke="none" opacity={0.2} />
              </div>

              <div className="testi-rating">
                {[...Array(5)].map((_, starI) => (
                  <Star
                    key={starI}
                    size={16}
                    fill={starI < review.rating ? "var(--brand-gold)" : "none"}
                    stroke={starI < review.rating ? "var(--brand-gold)" : "#ddd"}
                  />
                ))}
              </div>

              <p className="testi-text">"{review.text}"</p>

              <div className="testi-user">
                <div className="testi-meta">
                  <h4 className="testi-name">{review.name}</h4>
                  <span className="testi-location">{review.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="testi-dots">
          {reviews.map((_, i) => (
            <button
              key={i}
              className={`testi-dot ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
