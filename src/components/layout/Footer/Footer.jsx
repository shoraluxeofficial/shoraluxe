import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { SiThreads } from 'react-icons/si';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-v2">
      {/* BACKGROUND VIDEO */}
      <div className="footer-video-bg">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="f-bg-video"
        >
          <source src="https://cdn.shopify.com/videos/c/o/v/6f0e395447a147e8b8c5e9f89542b5ff.mp4" type="video/mp4" />
        </video>
        <div className="f-video-overlay"></div>
      </div>

      <div className="footer-content-wrap">
        {/* TOP BRAND SIGNATURE */}
        <div className="footer-top-signature">
          <Link to="/" className="footer-logo-link">
            <img src="/Logo.png" alt="Shoraluxe" className="footer-logo-img" />
          </Link>
          <p className="footer-mission-text">Elevating your daily ritual through the science of luxury skincare.</p>
        </div>

        {/* MIDDLE LINKS GRID */}
        <div className="footer-grid-v2">
          <div className="f-col main-branding">
            <h4 className="f-col-title">About the Brand</h4>
            <p className="f-brand-desc">Shoraluxe is a tribute to timeless beauty, blending ancient rituals with modern dermatology. Our formulations are crafted for results, designed for luxury.</p>
            <div className="f-social-aura">
              <a href="https://www.instagram.com/shora_luxe?igsh=MXhnNW82ZG0zbHVoaQ==" target="_blank" rel="noopener noreferrer" className="f-social-link instagram"><FaInstagram size={28} /></a>
              <a href="https://www.facebook.com/profile.php?id=61580485915665&sk=directory_links" target="_blank" rel="noopener noreferrer" className="f-social-link facebook"><FaFacebook size={28} /></a>
              <a href="https://youtube.com/@shoraluxe?si=nWwGVUSLCTnNGWyz" target="_blank" rel="noopener noreferrer" className="f-social-link youtube"><FaYoutube size={28} /></a>
              <a href="https://www.threads.net/@shora_luxe" target="_blank" rel="noopener noreferrer" className="f-social-link threads"><SiThreads size={28} /></a>
            </div>
            <div className="f-contact-info">
              <a href="mailto:contact@shoraluxe.com" className="f-contact-link">contact@shoraluxe.com</a>
            </div>
          </div>

          <div className="f-col">
            <h4 className="f-col-title">Shop Collections</h4>
            <nav className="f-nav">
              <Link to="/shop" className="f-nav-item">All Products</Link>
              <Link to="/shop" className="f-nav-item">New Arrivals</Link>
              <Link to="/shop" className="f-nav-item">Bestsellers</Link>
              <Link to="/shop?category=combo" className="f-nav-item">Combos & Kits</Link>
            </nav>
          </div>

          <div className="f-col">
            <h4 className="f-col-title">Guest Services</h4>
            <nav className="f-nav">
              <Link to="/about" className="f-nav-item">About Us / Blog</Link>
              <Link to="/contact" className="f-nav-item">Contact Us</Link>
              <Link to="/policies" className="f-nav-item">Our Policies</Link>
              <Link to="/terms-conditions" className="f-nav-item">Terms and Conditions</Link>
              <Link to="/terms-service" className="f-nav-item">Terms of Service</Link>
            </nav>
          </div>
        </div>

        {/* BOTTOM METADATA */}
        <div className="footer-bottom-v2">
          <div className="f-bottom-left">
            <span>© 2026 SHORALUXE PRIVATE LIMITED.</span>
          </div>
          <div className="f-payments-aura">
            <img src="/Visa.png" className="payment-logo" alt="Visa" />
            <img src="/Master Card.png" className="payment-logo" alt="Mastercard" />
            <img src="/american express.png" className="payment-logo" alt="American Express" />
            <img src="/rupay.png" className="payment-logo" alt="RuPay" />
            <img src="/Google_Pay_Logo.svg.png" className="payment-logo" alt="Google Pay" />
            <img src="/Phonepe.png" className="payment-logo" alt="PhonePe" />
            <img src="/Paytm.jfif" className="payment-logo" alt="Paytm" />
            <img src="/Upi.png" className="payment-logo" alt="UPI" />
            <img src="/Razorpay.png" className="payment-logo" alt="Razorpay" />
          </div>
          <div className="f-bottom-right">
            <span>Delivering Luxury Across India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
