import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { SlidersHorizontal, ShoppingBag, Heart, Star, X, ChevronDown, ArrowRight, Search } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import './Shop.css';

const CONCERNS = [
  { id: 'all', label: 'All Products' },
  { id: 'suncare', label: 'Suncare' },
  { id: 'acne', label: 'Acne & Blemishes' },
  { id: 'dry', label: 'Dry & Dehydrated' },
  { id: 'brightening', label: 'Brightening' },
  { id: 'age-protection', label: 'Age Protection' },
  { id: 'oily', label: 'Oily Skin' },
];

const SKIN_TYPES = ['All', 'Dry', 'Oily', 'Normal', 'Acne-Prone', 'Sensitive'];

const Shop = () => {
  const { products, addToCart } = useShop();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialConcern = queryParams.get('concern') || 'all';

  const [activeConcern, setActiveConcern] = useState(initialConcern);
  const [activeType, setActiveType] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [addedToCart, setAddedToCart] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setActiveConcern(queryParams.get('concern') || 'all');
  }, [location.search]);

  // Close sidebar on outside click
  useEffect(() => {
    if (showFilters) {
      const handleKey = (e) => { if (e.key === 'Escape') setShowFilters(false); };
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [showFilters]);

  const filteredProducts = useMemo(() => {
    // Exclude test product (id 999) and cap the base pool to 16 real products
    const baseProducts = products
      .filter(p => p.id !== 999)
      .slice(0, 16);

    let result = [...baseProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.skinType?.toLowerCase().includes(q)
      );
    }

    if (activeConcern !== 'all') {
      result = result.filter(p => {
        const title = p.title.toLowerCase();
        const desc = (p.description || '').toLowerCase();
        if (activeConcern === 'acne') return title.includes('acne') || title.includes('salicylic') || desc.includes('acne');
        if (activeConcern === 'dry') return title.includes('moisturizer') || title.includes('hydrating') || desc.includes('dry');
        if (activeConcern === 'brightening') return title.includes('brightening') || title.includes('vitamin c') || title.includes('ubtan');
        if (activeConcern === 'suncare') return title.includes('sunscreen') || title.includes('spf');
        if (activeConcern === 'age-protection') return title.includes('retinol') || title.includes('night cream');
        if (activeConcern === 'oily') return title.includes('charcoal') || title.includes('exfoliating');
        return true;
      });
    }

    if (activeType !== 'All') {
      result = result.filter(p => p.skinType?.toLowerCase().includes(activeType.toLowerCase()));
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
  }, [products, activeConcern, activeType, sortBy, searchQuery]);

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
    setActiveType('All');
    setSearchQuery('');
  };

  return (
    <main className="shop-page">
      {/* HERO */}
      <header className="shop-hero">
        <div className="shop-hero-inner">
          <p className="shop-hero-eyebrow">Shoraluxe Collection</p>
          <h1 className="shop-hero-title">Luxury Skincare</h1>
          <p className="shop-hero-subtitle">Science-backed formulas crafted for exceptional results</p>
          <div className="shop-hero-search">
            <Search size={16} className="shop-hero-search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              className="shop-hero-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="shop-hero-search-clear" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="shop-hero-scroll-hint">
          <span>Explore</span>
          <div className="scroll-line" />
        </div>
      </header>

      {/* CONCERN PILLS (horizontal scroll on mobile) */}
      <div className="concern-strip-wrap">
        <div className="concern-strip">
          {CONCERNS.map(c => (
            <button
              key={c.id}
              className={`concern-pill ${activeConcern === c.id ? 'active' : ''}`}
              onClick={() => setActiveConcern(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="shop-container">
        {/* BREADCRUMBS */}
        <div className="shop-breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <span className="bc-current">Shop All</span>
          {activeConcern !== 'all' && (
            <>
              <span>/</span>
              <span className="bc-current">{CONCERNS.find(c => c.id === activeConcern)?.label}</span>
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
              <SlidersHorizontal size={16} />
              <span>Filters</span>
              {hasActiveFilters && <span className="filter-dot" />}
            </button>
            <span className="toolbar-count">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>
          <div className="toolbar-right">
            <span className="sort-label">Sort:</span>
            <div className="sort-select-wrap">
              <select
                className="sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Top Rated</option>
                <option value="discount">Best Discount</option>
              </select>
              <ChevronDown size={14} className="sort-chevron" />
            </div>
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
            {searchQuery && (
              <span className="active-chip">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')}><X size={11} /></button>
              </span>
            )}
            <button className="clear-all-btn" onClick={clearAllFilters}>Clear all</button>
          </div>
        )}

        <div className="shop-body">
          {/* SIDEBAR */}
          {showFilters && (
            <div className="sidebar-overlay" onClick={() => setShowFilters(false)} />
          )}
          <aside className={`shop-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="sidebar-header">
              <h2 className="sidebar-title">Filters</h2>
              <button className="sidebar-close" onClick={() => setShowFilters(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Concern Filter */}
            <div className="filter-section">
              <h3 className="filter-section-title">Shop by Concern</h3>
              <ul className="filter-list">
                {CONCERNS.map(c => (
                  <li
                    key={c.id}
                    className={`filter-item ${activeConcern === c.id ? 'active' : ''}`}
                    onClick={() => { setActiveConcern(c.id); if (window.innerWidth < 768) setShowFilters(false); }}
                  >
                    <span className="filter-check">{activeConcern === c.id ? '✓' : ''}</span>
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Skin Type Filter */}
            <div className="filter-section">
              <h3 className="filter-section-title">Skin Type</h3>
              <ul className="filter-list">
                {SKIN_TYPES.map(t => (
                  <li
                    key={t}
                    className={`filter-item ${activeType === t ? 'active' : ''}`}
                    onClick={() => setActiveType(t)}
                  >
                    <span className="filter-check">{activeType === t ? '✓' : ''}</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="sidebar-actions">
              <button className="sidebar-clear-btn" onClick={clearAllFilters}>Clear All Filters</button>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="shop-content">
            {filteredProducts.length > 0 ? (
              <div className="shop-grid">
                {filteredProducts.map(product => {
                  const discount = getDiscount(product.price, product.originalPrice);
                  const isWishlisted = wishlist.includes(product.id);
                  const justAdded = addedToCart === product.id;

                  return (
                    <article key={product.id} className="product-card">
                      {/* Image */}
                      <Link to={`/product/${product.id}`} className="product-card-img-link">
                        <div className="product-card-img-wrap">
                          <img src={product.img} alt={product.title} loading="lazy" />

                          {/* Badges */}
                          <div className="product-badges">
                            {product.isBestseller && <span className="badge best">Bestseller</span>}
                            {product.isNew && !product.isBestseller && <span className="badge new">New</span>}
                            {product.isSale && <span className="badge sale">Sale</span>}
                            {discount && !product.isBestseller && !product.isNew && (
                              <span className="badge discount">{discount}% Off</span>
                            )}
                          </div>

                          {/* Wishlist */}
                          <button
                            className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                            onClick={e => toggleWishlist(e, product.id)}
                            title="Add to wishlist"
                          >
                            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                          </button>

                          {/* Quick-add overlay */}
                          <div className="product-card-overlay">
                            <button
                              className={`quick-add-btn ${justAdded ? 'added' : ''}`}
                              onClick={e => handleAddToCart(e, product)}
                            >
                              {justAdded ? (
                                <>✓ Added to Bag</>
                              ) : (
                                <><ShoppingBag size={14} /> Quick Add</>
                              )}
                            </button>
                            <Link to={`/product/${product.id}`} className="view-product-btn">
                              View Product <ArrowRight size={13} />
                            </Link>
                          </div>
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="product-card-info">
                        <div className="product-card-top">
                          <span className="product-skin-type">{product.skinType}</span>
                          {product.rating && (
                            <div className="product-rating">
                              <Star size={11} fill="#907253" color="#907253" />
                              <span>{product.rating}</span>
                              {product.reviewsCount && (
                                <span className="reviews-count">({product.reviewsCount})</span>
                              )}
                            </div>
                          )}
                        </div>

                        <Link to={`/product/${product.id}`} className="product-name-link">
                          <h3 className="product-name">{product.title.split('|')[0].trim()}</h3>
                          {product.title.includes('|') && (
                            <p className="product-subtitle">{product.title.split('|')[1].trim()}</p>
                          )}
                        </Link>

                        <div className="product-price-row">
                          <span className="product-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <>
                              <span className="product-original-price">₹{Number(product.originalPrice).toLocaleString('en-IN')}</span>
                              {discount && <span className="product-discount-pct">−{discount}%</span>}
                            </>
                          )}
                        </div>

                        {product.size && (
                          <span className="product-size">{product.size}</span>
                        )}

                        <button
                          className={`atc-btn ${justAdded ? 'added' : ''}`}
                          onClick={e => handleAddToCart(e, product)}
                        >
                          {justAdded ? '✓ Added!' : 'Add to Bag'}
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
