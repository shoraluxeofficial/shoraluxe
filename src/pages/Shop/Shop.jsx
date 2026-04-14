import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Filter, ChevronDown, ShoppingBag } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import './Shop.css';

const Shop = () => {
  const { products, addToCart } = useShop();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialConcern = queryParams.get('concern') || 'all';

  const [activeConcern, setActiveConcern] = useState(initialConcern);
  const [activeType, setActiveType] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setActiveConcern(queryParams.get('concern') || 'all');
  }, [location.search]);

  // Derived filtered products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Concern
    if (activeConcern !== 'all') {
      result = result.filter(p => {
        const title = p.title.toLowerCase();
        const desc = p.description.toLowerCase();
        if (activeConcern === 'acne') return title.includes('acne') || title.includes('salicylic') || desc.includes('acne');
        if (activeConcern === 'dry') return title.includes('moisturizer') || title.includes('hydrating') || desc.includes('dry');
        if (activeConcern === 'brightening') return title.includes('brightening') || title.includes('vitamin c') || title.includes('ubtan');
        if (activeConcern === 'suncare') return title.includes('sunscreen') || title.includes('spf');
        if (activeConcern === 'age-protection') return title.includes('retinol') || title.includes('night cream');
        if (activeConcern === 'oily') return title.includes('charcoal') || title.includes('exfoliating');
        return true;
      });
    }

    // Filter by Skin Type (from metadata)
    if (activeType !== 'all') {
      result = result.filter(p => p.skinType?.toLowerCase().includes(activeType.toLowerCase()));
    }

    // Sorting
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [products, activeConcern, activeType, sortBy]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <main className="shop-page">
      {/* SHOP HEADER */}
      <header className="shop-hero">
        <div className="shop-hero-content">
          <h1 className="shop-hero-title">Our Collections</h1>
          <p className="shop-hero-subtitle">Premium skincare tailored for every concern and skin type.</p>
        </div>
      </header>

      <div className="shop-container">
        {/* MOBILE FILTER TOGGLE */}
        <button className="mobile-filter-bar mobile-only" onClick={() => setShowFilters(!showFilters)}>
          <Filter size={18} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        <div className="shop-layout">
          {/* SIDEBAR FILTERS */}
          <aside className={`shop-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filter-group">
              <h3 className="filter-title">Shop by Concern</h3>
              <ul className="filter-list">
                {['all', 'acne', 'dry', 'brightening', 'suncare', 'age-protection', 'oily'].map(c => (
                  <li key={c} 
                      className={`filter-item ${activeConcern === c ? 'active' : ''}`}
                      onClick={() => setActiveConcern(c)}>
                    {c.replace('-', ' ')}
                  </li>
                ))}
              </ul>
            </div>

            <div className="filter-group">
              <h3 className="filter-title">Skin Type</h3>
              <ul className="filter-list">
                {['all', 'Dry', 'Oily', 'Normal', 'Acne-Prone', 'Sensitive'].map(t => (
                  <li key={t} 
                      className={`filter-item ${activeType === t ? 'active' : ''}`}
                      onClick={() => setActiveType(t)}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* PRODUCT GRID AREA */}
          <div className="shop-content-area">
            {/* GRID CONTROLS */}
            <div className="grid-controls">
              <span className="results-count">{filteredProducts.length} PRODUCTS</span>
              <div className="sort-wrap">
                <span className="sort-label">Sort by:</span>
                <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* THE GRID */}
            <div className="shop-grid">
              {filteredProducts.map(product => (
                <Link to={`/product/${product.id}`} key={product.id} className="shop-card-link">
                  <div className="shop-card">
                    <div className="shop-card-img-wrap">
                      <img src={product.img} alt={product.title} />
                      {product.badge && (
                        <span className={`shop-card-badge ${product.isSale ? 'sale' : product.isBestseller ? 'best' : 'new'}`}>
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <div className="shop-card-info">
                      <span className="shop-card-category">{product.skinType}</span>
                      <h4 className="shop-card-title">{product.title}</h4>
                      <div className="shop-card-price-row">
                        <span className="shop-curr-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
                        {product.originalPrice && (
                          <span className="shop-orig-price">₹{Number(product.originalPrice).toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      <button className="shop-atc-btn" onClick={(e) => handleAddToCart(e, product)}>
                        <ShoppingBag size={16} /> ADD TO CART
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="no-results">
                <h3>No products found for this selection.</h3>
                <button className="reset-btn" onClick={() => { setActiveConcern('all'); setActiveType('all'); }}>Clear All Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Shop;
