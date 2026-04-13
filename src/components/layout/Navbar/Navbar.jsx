import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, MapPin, User, Menu, X, ChevronDown } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useShop();

  return (
    <div className="navbar-wrapper">
      {/* Top Banner 1 - Plain Text */}
      <div className="top-banner-utility">
        FREE SHIPPING ON ORDERS OVER ₹999
      </div>

      {/* Announcement Bar - Brand Burgundy */}
      <div className="announcement-bar">
        <span>✦ LUXURY BEAUTY FOR EVERY SKIN ✦</span>
      </div>

      {/* Main Navbar */}
      <header className="navbar-main">
        <div className="navbar-inner">
          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-btn mobile-only" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo - Adjusted for SHORA (Gold) and LUXE (Silver) */}
          <div className="logo-wrap">
            <a href="/" className="logo">
              <span className="logo-shora">SHORA</span>
              <span className="logo-luxe">LUXE</span>
            </a>
          </div>

          {/* Center Navigation - RESTORED LINKS */}
          <nav className="desktop-main-nav desktop-only">
            <ul className="main-nav-list">
              <li><a href="/">Home</a></li>
              <li className="nav-dropdown-wrapper">
                <a href="#" className="nav-dropdown-trigger">
                  Shop by Concern <ChevronDown size={14} className="dropdown-arrow" />
                </a>
                <ul className="nav-dropdown-menu">
                  <li><a href="#">Age-Protection</a></li>
                  <li><a href="#">Acne & Blemishes</a></li>
                  <li><a href="#">Oily & Congested Skin</a></li>
                  <li><a href="#">Dry & Dehydrated</a></li>
                  <li><a href="#">Brightening & Depigmentation</a></li>
                  <li><a href="#">Suncare</a></li>
                  <li><a href="#">Skin Barrier Repair</a></li>
                </ul>
              </li>
              <li><a href="#">Order Tracking</a></li>
              <li><a href="#">Glow Up Quiz</a></li>
            </ul>
          </nav>

          {/* Right Actions */}
          <div className="nav-actions">
            <button className="action-icon-btn" onClick={() => setSearchOpen(!searchOpen)}>
              <Search size={22} strokeWidth={1.5} />
            </button>
            <a href="#" className="action-icon-btn account-btn desktop-only">
              <User size={22} strokeWidth={1.5} />
            </a>
            <button className="action-icon-btn" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* Search Layer - NOW BELOW NAV-INNER */}
        {searchOpen && (
          <div className="search-layer">
            <div className="search-layer-inner">
              <div className="search-input-wrap">
                <Search size={18} className="search-icon-inside" />
                <input type="text" placeholder="Search for products, brands..." autoFocus />
              </div>
              <button className="nav-search-submit-btn">SEARCH</button>
              <button className="close-search-btn" onClick={() => setSearchOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="mobile-drawer">
          <ul className="mobile-links">
            <li><a href="/">Home</a></li>
            <li><a href="#">Shop by Concern</a></li>
            <li><a href="#">Order Tracking</a></li>
            <li><a href="#">Glow Up Quiz</a></li>
            <li><a href="#">My Account</a></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
