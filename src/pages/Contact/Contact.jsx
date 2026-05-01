import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from 'lucide-react';
import './Contact.css';

// WhatsApp business number from the contact page
const WHATSAPP_NUMBER = '916304546107';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.message.trim()) return;

    // Build a clean WhatsApp message
    const text = 
      `👋 *New Contact Form Message — Shoraluxe*\n\n` +
      `*Name:* ${form.name}\n` +
      `*Email:* ${form.email || 'Not provided'}\n\n` +
      `*Message:*\n${form.message}`;

    const encodedText = encodeURIComponent(text);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;

    // Open WhatsApp in a new tab
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    setSent(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

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
                <p>For order inquiries &amp; support:</p>
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
                <address>Residential Apartments, Road no 21, Vivekananda Nagar colony, Hyderabad, 500072</address>
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
              <p>Fill out the form below and we'll reply on WhatsApp instantly.</p>

              <form className="shora-contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Your Message *</label>
                  <textarea
                    name="message"
                    rows="5"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                  />
                </div>

                {sent && (
                  <div className="contact-success-msg">
                    ✅ Opening WhatsApp... We'll reply shortly!
                  </div>
                )}

                <button type="submit" className="contact-submit-btn">
                  <MessageSquare size={18} /> Send via WhatsApp
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