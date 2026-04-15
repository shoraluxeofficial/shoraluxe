import React from 'react';
import { ArrowRight } from 'lucide-react';
import { FaInstagram, FaFacebook, FaYoutube, FaTwitter, FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcApplePay, FaGooglePay } from 'react-icons/fa';
import { SiRazorpay } from 'react-icons/si';
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
          <h2 className="footer-grand-logo">SHORALUXE</h2>
          <p className="footer-mission-text">Elevating your daily ritual through the science of luxury skincare.</p>
        </div>

        {/* MIDDLE LINKS GRID */}
        <div className="footer-grid-v2">
          <div className="f-col main-branding">
            <h4 className="f-col-title">About the Brand</h4>
            <p className="f-brand-desc">Shoraluxe is a tribute to timeless beauty, blending ancient rituals with modern dermatology. Our formulations are crafted for results, designed for luxury.</p>
            <div className="f-social-aura">
              <a href="#" className="f-social-link"><FaInstagram size={18} /></a>
              <a href="#" className="f-social-link"><FaFacebook size={18} /></a>
              <a href="#" className="f-social-link"><FaYoutube size={18} /></a>
              <a href="#" className="f-social-link"><FaTwitter size={18} /></a>
            </div>
          </div>

          <div className="f-col">
            <h4 className="f-col-title">Shop Collections</h4>
            <nav className="f-nav">
              <a href="#" className="f-nav-item">New Arrivals</a>
              <a href="#" className="f-nav-item">Bestsellers</a>
              <a href="#" className="f-nav-item">Skin Concerns</a>
              <a href="#" className="f-nav-item">Gifting Suite</a>
              <a href="#" className="f-nav-item">Limited Editions</a>
            </nav>
          </div>

          <div className="f-col">
            <h4 className="f-col-title">Guest Services</h4>
            <nav className="f-nav">
              <a href="#" className="f-nav-item">Concierge (Support)</a>
              <a href="/track-order" className="f-nav-item">Track Order</a>
              <a href="#" className="f-nav-item">Shipping & Returns</a>
              <a href="#" className="f-nav-item">Skin Consultations</a>
              <a href="#" className="f-nav-item">Store Registry</a>
              <a href="#" className="f-nav-item">Privacy & Terms</a>
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
            <span>All Over India Delivery avilable </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
