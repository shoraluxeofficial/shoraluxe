  import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, X, ChevronDown, LogOut, Droplets, Sparkles, Sun, Hourglass, Leaf, Waves, Wind, Shield, Truck } from 'lucide-react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useShop } from '../../../context/ShopContext';
import { supabase } from '../../../lib/supabase';
import './Navbar.css';

// DUMMY CODES FOR TESTING SLIDER
const dummyCodes = [
  { id: 'd1', code: "SL-SUMMERGLOW1", discount_type: "percentage", discount_value: 15, is_active: true, description: "Get 15% off Summer Essentials!" },
  { id: 'd2', code: "SL-GLOWTRIO", discount_type: "percentage", discount_value: 20, is_active: true, description: "Get 20% off the Glow Trio Bundle" },
  { id: 'd3', code: "SL-TRIOLUXE", discount_type: "fixed", discount_value: 500, is_active: true, description: "Flat ₹500 off on Trio Luxe" },
  { id: 'd4', code: "SL-PMROUTINE", discount_type: "percentage", discount_value: 10, is_active: true, description: "10% off your Night Routine" }
];

const CONCERNS = [
  { icon: Droplets, label: 'Acne & Breakouts', slug: 'acne-breakouts' },
  { icon: Sparkles, label: 'Pigmentation & Dark Spots', slug: 'pigmentation-dark-spots' },
  { icon: Sun, label: 'Dullness & Uneven Tone', slug: 'dullness-uneven-tone' },
  { icon: Hourglass, label: 'Anti‑Aging & Fine Lines', slug: 'anti-aging-fine-lines' },
  { icon: Leaf, label: 'Sensitivity & Redness', slug: 'sensitivity-redness' },
  { icon: Waves, label: 'Dryness & Dehydration', slug: 'dryness-dehydration' },
  { icon: Wind, label: 'Oily Skin & Pore Control', slug: 'oily-skin-pore-control' },
  { icon: Shield, label: 'Sun Protection', slug: 'sun-protection' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [concernOpen, setConcernOpen] = useState(false);
  const { cartCount, setIsCartOpen, user, setUser } = useShop();
  const navigate = useNavigate();

  const [promoCodes, setPromoCodes] = useState([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  useEffect(() => {
    const fetchPromoCodes = async () => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('is_active', true);

      if (!error && data && data.length > 0) {
        // Filter out expired codes
        const validCodes = data.filter(c => !c.expires_at || new Date(c.expires_at) > new Date());
        setPromoCodes(validCodes.length > 0 ? validCodes : dummyCodes);
      } else {
        // Fallback to dummy codes for slider checking
        setPromoCodes(dummyCodes);
      }
    };
    fetchPromoCodes();
  }, []);

  useEffect(() => {
    if (promoCodes.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoCodes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [promoCodes]);

  const handleLogout = () => {
    localStorage.removeItem('shoraluxe_user');
    localStorage.removeItem('auth_token');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="navbar-wrapper">
      {/* Top Banner 1 - Promo Slider */}
      <div className="top-banner-utility">
        {promoCodes.length > 0 ? (
          <div className="promo-slider">
            {promoCodes.map((promo, index) => (
              <span
                key={promo.id}
                className={`promo-slide ${index === currentPromoIndex ? 'active' : ''}`}
              >
                Use Code <strong className="promo-highlight">{promo.code}</strong> 
                {promo.description ? ` : ${promo.description}` : ` for ${promo.discount_type === 'percentage' ? promo.discount_value + '% OFF' : '₹' + promo.discount_value + ' OFF'}`}
              </span>
            ))}
          </div>
        ) : (
          <span>FREE SHIPPING ON ORDERS OVER ₹999</span>
        )}
      </div>

      {/* Main Navbar */}
      <header className="navbar-main">
        {/* Top Tier */}
        <div className="navbar-top">
          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-btn mobile-only" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <div className="logo-wrap">
            <Link to="/" className="logo">
              <img src="/Logo.png" alt="Shoraluxe" className="logo-img" />
            </Link>
          </div>

          {/* Center Area: Navigation Links */}
          <nav className="nav-center-area desktop-only">
            <ul className="main-nav-list">
              <li><NavLink to="/" end>Home</NavLink></li>
              <li><NavLink to="/shop" end>Shop All</NavLink></li>
              <li className="nav-dropdown-wrapper">
                <a href="#concern" className="nav-dropdown-trigger" onClick={e => e.preventDefault()}>
                  Shop by Concern <ChevronDown size={14} className="dropdown-arrow" />
                </a>
                <div className="nav-dropdown-menu nav-dropdown-concern">
                  <p className="dropdown-section-label">Choose your skin concern</p>
                  <ul className="concern-dropdown-grid">
                    {CONCERNS.map(c => (
                      <li key={c.slug}>
                        <Link to={`/shop?concern=${c.slug}`}>
                          <span className="concern-dd-icon">
                            <c.icon size={16} strokeWidth={2} />
                          </span>
                          <span className="concern-dd-label">{c.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
              <li><NavLink to="/track-order">Track Order</NavLink></li>
              <li><NavLink to="/quiz">Glow Up Quiz</NavLink></li>
            </ul>
          </nav>

          {/* Right Area: Search + Actions */}
          <div className="nav-right-area">
            {/* Search Icon (Now on Desktop & Mobile) */}
            <button className="action-icon-btn" onClick={() => setSearchOpen(!searchOpen)}>
              <Search size={22} strokeWidth={1.5} />
            </button>

            {/* Actions */}
            <div className="nav-actions">
              {/* Removed redundant mobile search button as the shared one is now above */}
              
              {/* Track Order Icon (Now on Mobile too) */}
              <Link to="/track-order" className="action-icon-btn">
                <Truck size={22} strokeWidth={1.5} />
              </Link>

              {/* Cart Icon */}
              <button className="action-icon-btn" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag size={22} strokeWidth={1.5} />
                {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
              </button>

              {/* User Area */}
              <div className="nav-user-area">
                {user ? (
                  <div className="nav-profile-dropdown">
                    <div className="nav-profile-trigger">
                      <div className="nav-avatar">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="nav-user-name desktop-only">
                        {user?.name ? user.name.split(' ')[0] : 'User'}
                      </span>
                    </div>
                    <ul className="profile-submenu">
                      <li><Link to="/account">My Profile</Link></li>
                      <li><Link to="/my-orders">My Orders</Link></li>
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
            </div>
          </div>
        </div>        {/* Search Dropdown (Shared for Desktop and Mobile) */}
        {searchOpen && (
          <div className="search-layer">
            <div className="search-layer-inner">
              <div className="search-input-wrap">
                <Search size={18} className="search-icon-inside" />
                <input type="text" placeholder="Search for products..." autoFocus />
              </div>
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

            {/* Shop by Concern accordion */}
            <li className="mobile-concern-accordion">
              <button
                className="mobile-concern-trigger"
                onClick={() => setConcernOpen(!concernOpen)}
              >
                Shop by Concern
                <ChevronDown size={16} className={`mobile-chevron ${concernOpen ? 'open' : ''}`} />
              </button>
              {concernOpen && (
                <ul className="mobile-concern-list">
                  {CONCERNS.map(c => (
                    <li key={c.slug}>
                      <Link
                        to={`/shop?concern=${c.slug}`}
                        onClick={() => { setMenuOpen(false); setConcernOpen(false); }}
                      >
                        <span className="mobile-concern-icon">
                          <c.icon size={16} strokeWidth={2} />
                        </span> {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

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
