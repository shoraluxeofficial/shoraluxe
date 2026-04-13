import React from 'react';
import './CTASection.css';

const CTASection = () => {
  return (
    <section className="cta-section">
      <div className="cta-overlay"></div>
      <div className="cta-content">
        <span className="cta-tag">Limited Edition</span>
        <h2 className="cta-heading">Your Journey to Radiant <br/> Skin Starts Here</h2>
        <p className="cta-text">Discover the perfect blend of science and nature. Hand-crafted rituals for your unique skin needs.</p>
        <button className="cta-button">
          SHOP THE COLLECTION
          <div className="btn-mirror"></div>
        </button>
      </div>
    </section>
  );
};

export default CTASection;
