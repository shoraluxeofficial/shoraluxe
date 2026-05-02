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
          <img src="/Logo.png" alt="Shoraluxe Logo" className="hero-logo-v2" />
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
              {/* Sunscreen SPF 50+++ — top bestseller */}
              <img src="https://res.cloudinary.com/dfr0tlcdb/image/upload/w_800,q_90,f_auto/v1777485162/i79vwhurlkuvlrshykra.webp" alt="Shoraluxe Sunscreen SPF 50+++" />
            </div>
            <div className="gallery-sub">
              {/* Non-Sticky Moisturizer */}
              <img src="https://res.cloudinary.com/dfr0tlcdb/image/upload/w_500,q_90,f_auto/v1777485081/xtlfci5xezy4yjuf172l.webp" alt="Non-Sticky Moisturizer" />
              {/* Charcoal Face Wash */}
              <img src="https://res.cloudinary.com/dfr0tlcdb/image/upload/w_500,q_90,f_auto/v1777232225/shoraluxe/products/0_fvberx.jpg" alt="Charcoal Face Wash" />
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
              {/* Complete Skincare Trio (Small) */}
              <img src="https://zahdxekcwdlcbzfsnaej.supabase.co/storage/v1/object/public/products/combos/1777414313317-58zuln.jpeg" alt="Complete Skincare Trio" />
              <div className="combo-badge">BESTSELLER</div>
            </div>
            <div className="combo-info">
              <h3>Complete Skincare Trio</h3>
              <p>Your complete routine for a radiant, healthy glow every single day.</p>
            </div>
          </div>
          <div className="combo-card">
            <div className="combo-img-box">
              {/* Glow Combo */}
              <img src="https://zahdxekcwdlcbzfsnaej.supabase.co/storage/v1/object/public/products/combos/1777418006678-s14943.jpeg" alt="Glow Combo" />
              <div className="combo-badge">GLOW</div>
            </div>
            <div className="combo-info">
              <h3>Glow Combo</h3>
              <p>The perfect ritual to brighten and nourish your skin every day.</p>
            </div>
          </div>
          <div className="combo-card">
            <div className="combo-img-box">
              {/* Day + Night Duo */}
              <img src="https://zahdxekcwdlcbzfsnaej.supabase.co/storage/v1/object/public/products/combos/1777417936532-woedrc.jpeg" alt="Day + Night Duo" />
              <div className="combo-badge">PREMIUM</div>
            </div>
            <div className="combo-info">
              <h3>Day + Night Duo</h3>
              <p>AM to PM care covering every skin need for total transformation.</p>
            </div>
          </div>
          <div className="combo-card">
            <div className="combo-img-box">
              {/* Every Day Protection Combo */}
              <img src="https://zahdxekcwdlcbzfsnaej.supabase.co/storage/v1/object/public/products/combos/1777417584348-f1t17e.png" alt="Every Day Protection Combo" />
              <div className="combo-badge">PROTECT</div>
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
