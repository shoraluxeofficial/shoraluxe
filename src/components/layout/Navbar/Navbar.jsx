import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Heart, MapPin, User, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../../../context/ShopContext';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartCount, setIsCartOpen, user, setUser } = useShop();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('shoraluxe_user');
    localStorage.removeItem('auth_token');
    setUser(null);
    navigate('/');
  };

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
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop All</Link></li>
              <li className="nav-dropdown-wrapper">
                <a href="#" className="nav-dropdown-trigger">
                  Shop by Concern <ChevronDown size={14} className="dropdown-arrow" />
                </a>
                <ul className="nav-dropdown-menu">
                  <li><Link to="/shop?concern=age-protection">Age-Protection</Link></li>
                  <li><Link to="/shop?concern=acne">Acne & Blemishes</Link></li>
                  <li><Link to="/shop?concern=oily">Oily & Congested Skin</Link></li>
                  <li><Link to="/shop?concern=dry">Dry & Dehydrated</Link></li>
                  <li><Link to="/shop?concern=brightening">Brightening & Depigmentation</Link></li>
                  <li><Link to="/shop?concern=suncare">Suncare</Link></li>
                </ul>
              </li>
              <li><Link to="/track-order">Track Order</Link></li>
              <li><Link to="/quiz">Glow Up Quiz</Link></li>
            </ul>
          </nav>

          {/* Right Actions */}
          <div className="nav-actions">
            <button className="action-icon-btn" onClick={() => setSearchOpen(!searchOpen)}>
              <Search size={22} strokeWidth={1.5} />
            </button>
            <div className="nav-user-area">
              {user ? (
                <div className="nav-profile-dropdown">
                  <div className="nav-profile-trigger">
                    <div className="nav-avatar">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="nav-user-name">Hi, {user?.name ? user.name.split(' ')[0] : 'User'}</span>
                    <ChevronDown size={14} />
                  </div>
                  <ul className="profile-submenu">
                    <li><Link to="/account">My Profile</Link></li>
                    <li><Link to="/track-order">Track Orders</Link></li>
                    <li className="logout-item" onClick={handleLogout}>
                      <LogOut size={14} /> Logout
                    </li>
                  </ul>
                </div>
              ) : (
                <Link to="/account" className="action-icon-btn account-btn">
                  <User size={22} strokeWidth={1.5} />
                </Link>
              )}
            </div>
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
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/shop" onClick={() => setMenuOpen(false)}>Shop All</Link></li>
            <li><Link to="/track-order" onClick={() => setMenuOpen(false)}>Track Order</Link></li>
            <li><Link to="/quiz" onClick={() => setMenuOpen(false)}>Glow Up Quiz</Link></li>
            <li><Link to="/account" onClick={() => setMenuOpen(false)}>My Account</Link></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
