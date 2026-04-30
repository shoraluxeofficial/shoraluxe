import React from 'react';
import { Star, Truck, Headset, ShieldCheck, Heart, Tag, Zap, Leaf, FlaskConical } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="hero-title">About us</h1>
        </div>
      </section>

      {/* MAIN STORY SECTION */}
      <section className="about-story">
        <div className="about-story-container">
          <div className="story-image">
            <img src="https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?q=80&w=1000" alt="Shoraluxe Products" />
          </div>
          <div className="story-text">
            <h2 className="story-heading">Shora Luxe - A skincare that made especially for Indian skin conditions.</h2>
            <p>At Shora Luxe, we believe skincare should do more than look good on a label—it should deliver results you can see and feel. While much of the global skincare industry formulates for broader, often different skin needs, Indian skin requires a more thoughtful approach.</p>
            <p>From intense heat and humidity to pigmentation, sensitivity, and daily environmental stress, these are not occasional concerns—they're part of everyday life. That's where Shora Luxe is different.</p>
            <p>We create skincare that is intentionally formulated for Indian skin types combining advanced scientific research with carefully selected, high performance ingredients. Every product is designed to address real concerns with precision, effectiveness, and consistency.</p>
            
            <div className="approach-box">
              <h3>Our approach is simple:</h3>
              <ul>
                <li>No unnecessary fillers</li>
                <li>No complicated routines</li>
                <li>No empty promises</li>
              </ul>
            </div>

            <p>Only purposeful formulations that support your skin in the climate and conditions you actually live in. Because when skincare is created with your skin in mind, it doesn't just promise results, it delivers them.</p>
            
            <div className="feature-checkmarks">
              <div className="check-item">✔️ Dermatologist Tested & Approved</div>
              <div className="check-item">✔️ Cruelty-Free & Clean Formulations</div>
              <div className="check-item">✔️ Made for Indian Skin Types</div>
            </div>

            <p className="story-closing">At Shora Luxe, our philosophy is simple — <strong>Glow effortlessly, live luxuriously, and love your skin unconditionally.</strong></p>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="why-choose-us">
        <h2 className="section-title">Why Choose Us</h2>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon"><Star size={32} /></div>
            <h3>Premium Quality</h3>
            <p>We source only the finest materials to ensure exceptional quality in every product.</p>
          </div>
          <div className="why-card">
            <div className="why-icon"><Truck size={32} /></div>
            <h3>Fast Shipping</h3>
            <p>Quick and reliable delivery to get your orders to you as fast as possible.</p>
          </div>
          <div className="why-card">
            <div className="why-icon"><Headset size={32} /></div>
            <h3>24/7 Support</h3>
            <p>Our dedicated team is always here to help you with any questions or concerns.</p>
          </div>
          <div className="why-card">
            <div className="why-icon"><ShieldCheck size={32} /></div>
            <h3>Secure Payment</h3>
            <p>Shop with confidence knowing your payment information is always protected.</p>
          </div>
          <div className="why-card">
            <div className="why-icon"><Heart size={32} /></div>
            <h3>Customer Satisfaction Promise</h3>
            <p>Your satisfaction is our priority, with seamless service and dedicated support.</p>
          </div>
          <div className="why-card">
            <div className="why-icon"><Tag size={32} /></div>
            <h3>Best Prices</h3>
            <p>Competitive pricing without compromising on quality or service excellence.</p>
          </div>
        </div>
      </section>

      {/* OUR CONSTANTS */}
      <section className="our-constants">
        <h2 className="constants-title">Our Constants</h2>
        <div className="constants-grid">
          <div className="constant-item">
            <Zap size={48} strokeWidth={1} />
            <span>Cruelty-Free</span>
          </div>
          <div className="constant-item">
            <FlaskConical size={48} strokeWidth={1} />
            <span>Clean</span>
          </div>
          <div className="constant-item">
            <Leaf size={48} strokeWidth={1} />
            <span>Blend of Natural</span>
          </div>
        </div>
      </section>

      {/* BLOG POSTS */}
      <section className="about-blog">
        <h2 className="section-title">Blog posts</h2>
        <div className="blog-grid">
          <div className="blog-card">
            <div className="blog-img-wrap">
              <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=500" alt="Vitamin C Serum" />
            </div>
            <div className="blog-info">
              <h3>Vitamin C & Niacinamide Face Serum: The Brightening Duo Your Skin Has Been Waiting For</h3>
              <p className="blog-meta">January 20, 2025 • By Shora Luxe</p>
            </div>
          </div>
          <div className="blog-card">
            <div className="blog-img-wrap">
              <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=500" alt="Sun Protection" />
            </div>
            <div className="blog-info">
              <h3>Thank Your Future Skin Using Our Sunscreen Cream SPF 50+: Your Everyday Defense Against Invisible Skin Damage</h3>
              <p className="blog-meta">January 20, 2025 • By Shora Luxe</p>
            </div>
          </div>
          <div className="blog-card">
            <div className="blog-img-wrap">
              <img src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=500" alt="Hydrating Moisturizer" />
            </div>
            <div className="blog-info">
              <h3>The Beauty of Lightweight Hydration: Why a Non-Sticky Moisturizer Changes Everything</h3>
              <p className="blog-meta">January 20, 2025 • By Shora Luxe</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
