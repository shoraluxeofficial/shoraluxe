import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { SlidersHorizontal, ShoppingBag, Heart, Star, X, ChevronDown, ArrowRight, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { supabase } from '../../lib/supabase';
import { getOptimizedImageUrl } from '../../lib/upload';
import SEO from '../../components/SEO/SEO';
import './Shop.css';

const CONCERNS = [
  { id: 'all', label: 'All Products', emoji: '🛍️' },
  { id: 'combo', label: 'Combo Deals', emoji: '🎁' },
  { id: 'acne-breakouts', label: 'Acne & Breakouts', emoji: '🧼' },
  { id: 'pigmentation-dark-spots', label: 'Pigmentation & Dark Spots', emoji: '✨' },
  { id: 'dullness-uneven-tone', label: 'Dullness & Uneven Tone', emoji: '🌟' },
  { id: 'anti-aging-fine-lines', label: 'Anti-Aging & Fine Lines', emoji: '⏳' },
  { id: 'sensitivity-redness', label: 'Sensitivity & Redness', emoji: '🌿' },
  { id: 'dryness-dehydration', label: 'Dryness & Dehydration', emoji: '💧' },
  { id: 'oily-skin-pore-control', label: 'Oily Skin & Pore Control', emoji: '🫧' },
  { id: 'sun-protection', label: 'Sun Protection', emoji: '☀️' },
];

// Exact product title keywords per concern (matches ShopByConcern section)
const CONCERN_KEYWORDS = {
  'acne-breakouts': ['salicylic', 'charcoal', 'ubtan', 'non sticky moisturizer', 'non-sticky moisturizer', 'sunscreen'],
  'pigmentation-dark-spots': ['vitamin c & niacinamide', 'niacinamide face serum', 'brightening day cream', 'ubtan', 'rice water', 'sunscreen'],
  'dullness-uneven-tone': ['vitamin c & niacinamide', 'niacinamide face serum', 'brightening day cream', 'ubtan', 'rice water', 'hyaluronic acid hydrating', 'body lotion', 'lavender body wash'],
  'anti-aging-fine-lines': ['retinol', 'vitamin c & niacinamide', 'niacinamide face serum', 'brightening day cream', 'hyaluronic acid hydrating', 'sunscreen'],
  'sensitivity-redness': ['rice water', 'hyaluronic acid hydrating', 'non sticky moisturizer', 'non-sticky moisturizer', 'body lotion', 'shea butter', 'lavender body wash'],
  'dryness-dehydration': ['non sticky moisturizer', 'non-sticky moisturizer', 'body lotion', 'shea butter', 'hyaluronic acid hydrating', 'rice water', 'retinol'],
  'oily-skin-pore-control': ['salicylic', 'charcoal', 'non sticky moisturizer', 'non-sticky moisturizer', 'sunscreen'],
  'sun-protection': ['sunscreen', 'brightening day cream'],
};

const CATEGORY_LABELS = {
  'face-wash': 'Face Washes',
  'serum': 'Face Serums',
  'moisturizer': 'Moisturizers',
  'sunscreen': 'Sunscreens',
  'body-wash': 'Body Washes',
  'day-cream': 'Day Creams',
  'night-cream': 'Night Creams',
  'body-lotion': 'Body Lotions',
  'combo': 'Combos'
};

const SKIN_TYPES = ['All', 'Dry', 'Oily', 'Normal', 'Acne-Prone', 'Sensitive'];

const HERO_BANNERS_FALLBACK = [
  'https://res.cloudinary.com/dfr0tlcdb/image/upload/f_auto,q_auto/v1777266810/zm9bdbhcu1bvqevfs5pb.webp',
  'https://res.cloudinary.com/dfr0tlcdb/image/upload/f_auto,q_auto/v1777266873/q2fmnltpi60n9jxbonq1.webp',
  'https://res.cloudinary.com/dfr0tlcdb/image/upload/f_auto,q_auto/v1777266920/pwwuztofe8wnpp7zv41j.webp'
];

const Shop = () => {
  const { products, addToCart, loading } = useShop();
  const shopGridRef = useRef(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialConcern = queryParams.get('concern') || 'all';
  const initialCategory = queryParams.get('category') || '';
  const initialPromo = queryParams.get('promo') || '';

  const [activeConcern, setActiveConcern] = useState(initialConcern);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activePromo, setActivePromo] = useState(initialPromo);
  const [activeType, setActiveType] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [addedToCart, setAddedToCart] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [heroBanners, setHeroBanners] = useState(HERO_BANNERS_FALLBACK);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await supabase
          .from('homepage_sections')
          .select('content')
          .eq('section_name', 'hero')
          .single();
        
        if (data && data.content && data.content.length > 0) {
          // Extract just the image URLs
          const urls = data.content.map(b => b.desktopImg || b.img);
          setHeroBanners(urls);
        }
      } catch (err) {
        console.error("Failed to fetch shop banners:", err);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [heroBanners.length]);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % heroBanners.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);

  useEffect(() => {
    setActiveConcern(queryParams.get('concern') || 'all');
    setActiveCategory(queryParams.get('category') || '');
    setActivePromo(queryParams.get('promo') || '');

    // Scroll to products if we have a filter applied from URL
    if (queryParams.get('concern') || queryParams.get('category')) {
      setTimeout(() => {
        shopGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [location.search]);

  // Scroll to products when filters change manually
  useEffect(() => {
    if ((activeConcern !== 'all' || activeCategory) && !loading) {
      shopGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeConcern, activeCategory]);

  // Close sidebar on outside click
  useEffect(() => {
    if (showFilters) {
      const handleKey = (e) => { if (e.key === 'Escape') setShowFilters(false); };
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [showFilters]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      if (p.id === 999) return false;
      
      // Expiry Check for Combos
      if (p.category === 'combo' && p.benefits) {
        try {
          const benefits = JSON.parse(p.benefits);
          if (benefits.expiry_date) {
            const expiry = new Date(benefits.expiry_date);
            if (expiry < new Date()) return false; // Hide if expired
          }
        } catch (e) {
          // If JSON parse fails, it might be the old array format, which is fine
        }
      }
      
      return true;
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.skinType?.toLowerCase().includes(q)
      );
    }

    if (activeConcern !== 'all') {
      if (activeConcern === 'combo') {
        result = result.filter(p => p.category === 'combo');
      } else {
        const keywords = CONCERN_KEYWORDS[activeConcern] || [];
        if (keywords.length > 0) {
          result = result.filter(p => {
            const title = p.title.toLowerCase();
            return keywords.some(kw => title.includes(kw.toLowerCase()));
          });
        }
      }
    }

    if (activePromo) {
      result = result.filter(p => p.promoGroup === activePromo);
    }

    if (activeType !== 'All') {
      result = result.filter(p => p.skinType?.toLowerCase().includes(activeType.toLowerCase()));
    }

    if (activeCategory) {
      const cat = activeCategory.toLowerCase();
      result = result.filter(p => {
        const title = p.title.toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const type = (p.skinType || '').toLowerCase();
        const category = (p.category || '').toLowerCase();

        if (cat === 'face-wash') return title.includes('wash') || title.includes('cleanser') || category.includes('wash');
        if (cat === 'serum') return title.includes('serum') || category.includes('serum');
        if (cat === 'moisturizer') return title.includes('moisturizer') || title.includes('gel') || category.includes('moisturizer');
        if (cat === 'sunscreen') return title.includes('sunscreen') || title.includes('spf') || category.includes('sunscreen');
        if (cat === 'body-wash') return title.includes('body wash') || category.includes('body-wash');
        if (cat === 'day-cream') return title.includes('day cream') || category.includes('day-cream');
        if (cat === 'night-cream') return title.includes('night cream') || category.includes('night-cream');
        if (cat === 'body-lotion') return title.includes('body lotion') || category.includes('body-lotion');
        if (cat === 'combo') return title.includes('combo') || title.includes('bundle') || title.includes('trio') || category.includes('combo');

        return title.includes(cat) || desc.includes(cat) || type.includes(cat) || category.includes(cat);
      });
    }

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sortBy === 'discount') result.sort((a, b) => {
      const da = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) : 0;
      const db = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) : 0;
      return db - da;
    });

    return result;
  }, [products, activeConcern, activeType, activePromo, activeCategory, sortBy, searchQuery]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 1800);
  };

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const getDiscount = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const hasActiveFilters = activeConcern !== 'all' || activeType !== 'All' || searchQuery.trim();

  const clearAllFilters = () => {
    setActiveConcern('all');
    setActiveCategory('');
    setActiveType('All');
    setSearchQuery('');
  };

  const SkinSkeleton = () => (
    <div className="product-card">
      <div className="product-card-img-container shimmer skeleton-img" style={{ height: '320px' }}></div>
      <div className="product-card-info" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div className="skeleton-text shimmer" style={{ width: '30%', height: '10px' }}></div>
          <div className="skeleton-text shimmer" style={{ width: '20%', height: '10px' }}></div>
        </div>
        <div className="skeleton-text shimmer" style={{ width: '85%', height: '18px' }}></div>
        <div className="skeleton-text shimmer" style={{ width: '50%', height: '12px' }}></div>
        <div className="skeleton-text shimmer" style={{ width: '40%', height: '24px', marginTop: '10px' }}></div>
        <div className="skeleton shimmer" style={{ height: '42px', width: '100%', marginTop: '15px' }}></div>
      </div>
    </div>
  );

  return (
    <main className="shop-page">
      <SEO 
        title="Shop Luxury Skincare" 
        description="Browse our exclusive collection of Shoraluxe skincare. Face washes, serums, and moisturizers for all skin types."
        keywords="buy skincare online, face wash india, best face serum, skincare for acne, pigmentation cream, shoraluxe products"
      />
      {/* HERO */}
      <header className="shop-hero">
        {/* Slider Backgrounds */}
        {heroBanners.map((banner, index) => (
          <div 
            key={index}
            className={`hero-slide ${index === activeSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url("${getOptimizedImageUrl(banner, 'w_1920,q_auto,f_auto')}")` }}
          />
        ))}

        {/* Slider Controls */}
        <button className="hero-slide-btn prev" onClick={prevSlide}>
          <ChevronLeft size={28} />
        </button>
        <button className="hero-slide-btn next" onClick={nextSlide}>
          <ChevronRight size={28} />
        </button>

        {/* Slider Indicators */}
        <div className="hero-slide-indicators">
          {heroBanners.map((_, index) => (
            <button
              key={index}
              className={`indicator-dot ${index === activeSlide ? 'active' : ''}`}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>


      </header>
      {/* CONCERN PILLS (horizontal scroll on mobile) */}
      <div className="concern-strip-wrap">
        <div className="concern-strip">
          {CONCERNS.map(c => (
            <button
              key={c.id}
              className={`concern-pill ${activeConcern === c.id && !activeCategory ? 'active' : ''}`}
              onClick={() => { setActiveConcern(c.id); setActiveCategory(''); }}
            >
              {c.emoji && <span style={{ marginRight: '0.35rem' }}>{c.emoji}</span>}{c.label}
            </button>
          ))}
          {activeCategory && CATEGORY_LABELS[activeCategory] && (
            <button
              className="concern-pill active"
              onClick={() => setActiveCategory('')}
            >
              {CATEGORY_LABELS[activeCategory]}
            </button>
          )}
        </div>
      </div>

      <div className="shop-container" ref={shopGridRef}>
        {/* BREADCRUMBS */}
        <div className="shop-breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <span className="bc-current">Shop All</span>
          {activeConcern !== 'all' && (
            <>
              <span>/</span>
              <span className="bc-current">
                {CONCERNS.find(c => c.id === activeConcern)?.label}
              </span>
            </>
          )}
        </div>

        {/* TOOLBAR */}
        <div className="shop-toolbar">
          <div className="toolbar-left">
            <button
              className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
            </button>
            <span className="toolbar-count">
              {filteredProducts.length} Exclusive Items
            </span>
          </div>
          <div className="toolbar-right">
            <span className="sort-label">Sort By:</span>
            <select
              className="sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="featured">Featured Selection</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highly Rated</option>
              <option value="discount">Special Offers</option>
            </select>
          </div>
        </div>

        {/* ACTIVE FILTER CHIPS */}
        {hasActiveFilters && (
          <div className="active-filters">
            {activeConcern !== 'all' && (
              <span className="active-chip">
                {CONCERNS.find(c => c.id === activeConcern)?.label}
                <button onClick={() => setActiveConcern('all')}><X size={11} /></button>
              </span>
            )}
            {activeType !== 'All' && (
              <span className="active-chip">
                {activeType}
                <button onClick={() => setActiveType('All')}><X size={11} /></button>
              </span>
            )}
            <button className="clear-all-btn" onClick={clearAllFilters}>Clear All Selection</button>
          </div>
        )}

        <div className="shop-body">
          {/* SIDEBAR */}
          <aside className={`shop-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="sidebar-header">
              <h2 className="sidebar-title">Collections</h2>
              <button className="sidebar-close" onClick={() => setShowFilters(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Concern Filter */}
            <div className="filter-section">
              <h3 className="filter-section-title">Shop by Concern</h3>
              <div className="filter-list">
                {CONCERNS.map(c => (
                  <div
                    key={c.id}
                    className={`filter-item ${activeConcern === c.id ? 'active' : ''}`}
                    onClick={() => { setActiveConcern(c.id); if (window.innerWidth < 768) setShowFilters(false); }}
                  >
                    {c.emoji && <span className="filter-emoji">{c.emoji}</span>}
                    {c.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Skin Type Filter */}
            <div className="filter-section">
              <h3 className="filter-section-title">Skin Type</h3>
              <div className="filter-list">
                {SKIN_TYPES.map(t => (
                  <div
                    key={t}
                    className={`filter-item ${activeType === t ? 'active' : ''}`}
                    onClick={() => setActiveType(t)}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-actions">
              <button className="sidebar-clear-btn" onClick={clearAllFilters}>Reset Filters</button>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="shop-content">
            {loading ? (
              <div className="shop-grid">
                {[...Array(6)].map((_, i) => <SkinSkeleton key={i} />)}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="shop-grid">
                {filteredProducts.map(product => {
                  const discount = getDiscount(product.price, product.originalPrice);
                  const isWishlisted = wishlist.includes(product.id);
                  const justAdded = addedToCart === product.id;

                  return (
                    <article key={product.id} className="product-card">
                      {/* 1. TOP SECTION: HERO IMAGE */}
                      <div className="product-card-img-container">
                        <Link to={`/product/${product.id}`} className="product-card-img-link">
                          <img 
                            src={getOptimizedImageUrl(product.img, 'w_600,q_auto,f_auto')} 
                            alt={product.title} 
                            className="shop-product-img" 
                            loading="lazy" 
                          />
                        </Link>

                        {/* Floating Glass Badge */}
                        <div className="badge-luxe">
                          {product.category === 'combo' ? 'Limited Edition' : 
                           product.isBestseller ? 'Bestseller' : 
                           product.isNew ? 'New Arrival' : 'Premium Care'}
                        </div>

                        {/* Glass Wishlist */}
                        <button
                          className={`wishlist-btn-luxe ${isWishlisted ? 'active' : ''}`}
                          onClick={e => toggleWishlist(e, product.id)}
                        >
                          <Heart size={18} fill={isWishlisted ? '#ff4757' : 'none'} />
                        </button>

                        {/* Quick-Add Overlay on Hover */}
                        <div className="product-card-overlay">
                          <button
                            className={`add-to-bag-btn-luxe ${justAdded ? 'added' : ''}`}
                            onClick={e => handleAddToCart(e, product)}
                          >
                            {justAdded ? '✓ Added' : 'Quick Add'}
                          </button>
                        </div>
                      </div>

                      {/* 2 & 3. MIDDLE SECTION & RATING */}
                      <div className="product-card-info">
                        <span className="product-category">
                          {CATEGORY_LABELS[product.category] || 'Luxury Skincare'}
                        </span>
                        
                        <Link to={`/product/${product.id}`} className="product-name-link">
                          <h3 className="product-name">{product.title.split('|')[0].trim()}</h3>
                        </Link>

                        <p className="product-short-desc">
                          {product.description ? product.description.substring(0, 70) + '...' : 'Scientifically formulated for visible radiance and luxury care.'}
                        </p>

                        <div className="product-rating-row">
                          <div className="stars-luxe">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} fill={i < Math.floor(product.rating || 5) ? '#ffb800' : 'none'} stroke={i < Math.floor(product.rating || 5) ? '#ffb800' : '#ddd'} />
                            ))}
                          </div>
                          <span className="review-count-luxe">({product.reviewsCount || 48} reviews)</span>
                        </div>

                        {/* 4. PRICE SECTION */}
                        <div className="product-price-container">
                          <span className="price-main-luxe">₹{Number(product.price).toLocaleString('en-IN')}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <>
                              <span className="price-old-luxe">₹{Number(product.originalPrice).toLocaleString('en-IN')}</span>
                              <span className="discount-pill-luxe">{discount}% OFF</span>
                            </>
                          )}
                        </div>

                        {/* 5. MAIN CTA */}
                        <button
                          className={`add-to-bag-btn-luxe ${justAdded ? 'added' : ''} ${product.stock === 0 ? 'disabled' : ''}`}
                          disabled={product.stock === 0}
                          onClick={e => handleAddToCart(e, product)}
                        >
                          {product.stock === 0 ? 'Out of Stock' : justAdded ? '✓ Added to Bag' : 'Add to Bag'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term.</p>
                <button className="reset-btn" onClick={clearAllFilters}>
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Shop;
