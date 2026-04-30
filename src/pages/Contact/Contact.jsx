import React from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="contact-hero-content">
          <span className="contact-subtitle">GET IN TOUCH</span>
          <h1>We're here to help you glow.</h1>
          <p>Whether you have a question about our products, your order, or just want to say hi, our concierge team is ready to assist you.</p>
        </div>
      </div>

      <div className="contact-container">
        <div className="contact-grid">
          {/* Contact Info Cards */}
          <div className="contact-info-col">
            <div className="info-card">
              <div className="info-icon-box">
                <Mail size={24} />
              </div>
              <div className="info-text">
                <h3>Email Us</h3>
                <p>For order inquiries & support:</p>
                <a href="mailto:contact@shoraluxe.com">contact@shoraluxe.com</a>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon-box">
                <Phone size={24} />
              </div>
              <div className="info-text">
                <h3>Call Us</h3>
                <p>Mon-Sat: 10:00 AM - 7:00 PM</p>
                <a href="tel:+916304546107">+91 6304546107</a>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon-box">
                <MapPin size={24} />
              </div>
              <div className="info-text">
                <h3>Visit Us</h3>
                <p>Shoraluxe Private Limited</p>
                <address>Plot No. 42, Luxury Lane, Financial District, Hyderabad, India</address>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon-box">
                <MessageSquare size={24} />
              </div>
              <div className="info-text">
                <h3>WhatsApp</h3>
                <p>Instant support via chat</p>
                <a href="https://wa.me/916304546107" target="_blank" rel="noopener noreferrer">Chat with us</a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-col">
            <div className="form-card">
              <h2>Send us a Message</h2>
              <p>Fill out the form below and we'll get back to you within 24 hours.</p>
              
              <form className="shora-contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="Enter your name" required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="your@email.com" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Feedback/Suggestion</label>
                  <textarea rows="5" placeholder="How can we help?"></textarea>
                </div>

                <button type="submit" className="contact-submit-btn">
                  Send Message <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
