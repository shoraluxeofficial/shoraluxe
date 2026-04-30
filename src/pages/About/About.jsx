import React from 'react';
import { Star, Truck, Headset, ShieldCheck, Heart, Tag, Zap, Leaf, FlaskConical, CheckCircle2 } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* PREMIUM HERO */}
      <section className="about-hero-v2">
        <div className="hero-v2-overlay"></div>
        <div className="hero-v2-content">
          <span className="hero-subtitle">THE SHORALUXE STORY</span>
          <h1 className="hero-title-v2">Shora Luxe - A skincare made especially for Indian skin conditions.</h1>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="about-story-v2">
        <div className="story-v2-container">
          <div className="story-v2-text">
            <h2 className="story-v2-heading">Science Meets Ancient Rituals</h2>
            <p>At Shora Luxe, we believe skincare should do more than look good on a label—it should deliver results you can see and feel. While much of the global skincare industry formulates for broader, often different skin needs, Indian skin requires a more thoughtful approach.</p>
            <p>From intense heat and humidity to pigmentation, sensitivity, and daily environmental stress, these are not occasional concerns—they're part of everyday life. That's where Shora Luxe is different.</p>
            <p>We create skincare that is intentionally formulated for Indian skin types combining advanced scientific research with carefully selected, high performance ingredients. Every product is designed to address real concerns with precision, effectiveness, and consistency.</p>
            
            <div className="ritual-highlights">
              <div className="ritual-item">
                <CheckCircle2 className="ritual-icon" size={20} />
                <span>No unnecessary fillers</span>
              </div>
              <div className="ritual-item">
                <CheckCircle2 className="ritual-icon" size={20} />
                <span>No complicated routines</span>
              </div>
              <div className="ritual-item">
                <CheckCircle2 className="ritual-icon" size={20} />
                <span>No empty promises</span>
              </div>
            </div>

            <p className="story-highlight">Only purposeful formulations that support your skin in the climate and conditions you actually live in. Because when skincare is created with your skin in mind, it doesn't just promise results, it delivers them.</p>
            
            <div className="feature-badges">
              <div className="badge-item">Dermatologist Tested</div>
              <div className="badge-item">Cruelty-Free</div>
              <div className="badge-item">Made for India</div>
            </div>

            <p className="philosophy-quote">
              "Glow effortlessly, live luxuriously, and love your skin unconditionally."
            </p>
          </div>
          <div className="story-v2-gallery">
            <div className="gallery-main">
              <img src="https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1000" alt="Shoraluxe Core Collection" />
            </div>
            <div className="gallery-sub">
              <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=500" alt="Pure Serums" />
              <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=500" alt="Botanical Extracts" />
            </div>
          </div>
        </div>
      </section>

      {/* RITUAL COMBOS SECTION - USING USER IMAGES THEME */}
      <section className="about-combos">
        <div className="combos-header">
          <h2 className="section-title">Our Signature Rituals</h2>
          <p>Experience the power of our curated combos, designed for total skin transformation.</p>
        </div>
        <div className="combos-grid">
          <div className="combo-card">
            <div className="combo-img-box">
              {/* Image from user: COMPLETE SKINCARE TRIO COMBO */}
              <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800" alt="Glow Trio" />
              <div className="combo-badge">BESTSELLER</div>
            </div>
            <div className="combo-info">
              <h3>Daily Glow Trio</h3>
              <p>Your complete routine for a radiant, healthy glow every single day.</p>
              <span className="promo-code">CODE: SL-GLOWTRIO</span>
            </div>
          </div>
          <div className="combo-card">
            <div className="combo-img-box">
              {/* Image from user: Sunset Skincare Routine */}
              <img src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800" alt="Sunset Routine" />
              <div className="combo-price">₹999</div>
            </div>
            <div className="combo-info">
              <h3>Sunset Skincare</h3>
              <p>The perfect evening ritual to repair and nourish after a long day.</p>
            </div>
          </div>
          <div className="combo-card">
            <div className="combo-img-box">
              {/* Image from user: Your Complete Skincare Routine */}
              <img src="https://images.unsplash.com/photo-1594125356682-3b0d3e0f9b6b?q=80&w=800" alt="Total Routine" />
              <div className="combo-badge">PREMIUM</div>
            </div>
            <div className="combo-info">
              <h3>Total Transformation</h3>
              <p>Five steps to luxury skincare, covering every need from AM to PM.</p>
              <span className="promo-code">CODE: SL-TRIOLUXE</span>
            </div>
          </div>
          <div className="combo-card">
            <div className="combo-img-box">
              {/* Image from user: Everyday Protection Combo */}
              <img src="https://images.unsplash.com/photo-1598440441974-9842a2295551?q=80&w=800" alt="Protection Combo" />
              <div className="combo-price">₹699</div>
            </div>
            <div className="combo-info">
              <h3>Everyday Protection</h3>
              <p>Essential defense against UV rays and urban pollution for all skin types.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US - LUXE GRID */}
      <section className="about-trust">
        <div className="trust-container">
          <h2 className="section-title">Why Trust Shoraluxe?</h2>
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon-wrap"><Star /></div>
              <h4>Premium Quality</h4>
              <p>Finest materials, exceptional results.</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon-wrap"><Truck /></div>
              <h4>Fast Shipping</h4>
              <p>Reliable delivery across India.</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon-wrap"><Headset /></div>
              <h4>Expert Support</h4>
              <p>24/7 dedicated assistance.</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon-wrap"><ShieldCheck /></div>
              <h4>Secure Payments</h4>
              <p>100% encrypted transactions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONSTANTS */}
      <section className="about-constants-v2">
        <div className="constants-overlay"></div>
        <div className="constants-v2-content">
          <h2>Our Core Values</h2>
          <div className="v2-constants-grid">
            <div className="v2-constant-card">
              <Zap size={40} />
              <h3>Cruelty-Free</h3>
            </div>
            <div className="v2-constant-card">
              <FlaskConical size={40} />
              <h3>100% Clean</h3>
            </div>
            <div className="v2-constant-card">
              <Leaf size={40} />
              <h3>Nature Inspired</h3>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
