import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, ArrowRight, Heart } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import './Bestsellers.css';

const Bestsellers = () => {
  const { products, addToCart, loading } = useShop();
  const [addedId, setAddedId] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  // Pick the 4 bestseller products (filter isBestseller, fallback to first 4 real products)
  // Preferred Sequence from user image
  const preferredSequence = [
    "Sunscreen Cream SPF 50+++",
    "Charcoal Face wash/Cleanser",
    "Non-Sticky Moisturizer",
    "Brightening day cream with spf",
    "Lavender Body wash",
    "Salicylic Acid Face Wash",
    "Rice Water Face Wash/Cleaner",
    "Vitamin C Ubtan Face Wash",
    "Hyaluronic Acid hydrating gel cleanser/face wash",
    "Shea Butter Body lotion",
    "Daily Hydrating Body lotion",
    "Night cream",
    "Vitamin C & Niacinamide Face Serum"
  ];

  const bestsellers = (() => {
    // 1. Filter out placeholder id 999 and combos
    const real = products.filter(p => p.id !== 999 && p.category !== 'combo');
    
    // 2. Map real products to their index in the preferred sequence (using partial matching)
    const sorted = [...real].sort((a, b) => {
      const getIndex = (title) => {
        const lowerTitle = title.toLowerCase();
        return preferredSequence.findIndex(item => 
          lowerTitle.includes(item.toLowerCase().split('|')[0].trim()) || 
          item.toLowerCase().includes(lowerTitle.split('|')[0].trim())
        );
      };

      const indexA = getIndex(a.title);
      const indexB = getIndex(b.title);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });

    // 3. Return the top 4
    return sorted.slice(0, 4);
  })();

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
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

  const BestsellerSkeleton = () => (
    <div className="bs-card">
      <div className="bs-card-img-wrap shimmer skeleton-img" style={{ height: '320px' }}></div>
      <div className="bs-card-info" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div className="skeleton-text shimmer" style={{ width: '40%', height: '10px' }}></div>
          <div className="skeleton-text shimmer" style={{ width: '20%', height: '10px' }}></div>
        </div>
        <div className="skeleton-text shimmer" style={{ width: '90%', height: '16px' }}></div>
        <div className="skeleton-text shimmer" style={{ width: '60%', height: '12px' }}></div>
        <div className="skeleton-text shimmer" style={{ width: '40%', height: '24px', marginTop: '10px' }}></div>
        <div className="skeleton shimmer" style={{ height: '42px', width: '100%', marginTop: '15px' }}></div>
      </div>
    </div>
  );

  return (
    <section className="bestsellers-section">
      {/* Section Header */}
      <div className="bs-header-wrap">
        <div className="bs-header-inner">
          <div className="bs-header-left">
            <p className="bs-eyebrow">Customer Favourites</p>
            <h2 className="bs-heading">Bestsellers</h2>
            <p className="bs-subtext">
              Loved by thousands — our most-repurchased formulas for radiant, healthy skin.
            </p>
          </div>
          <Link to="/shop" className="bs-view-all-desktop">
            View All Products <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Product Grid */}
      <div className="bs-container">
        <div className="bs-grid">
          {loading ? (
            [...Array(4)].map((_, i) => <BestsellerSkeleton key={i} />)
          ) : (
            bestsellers.map((product, index) => {
              const discount = getDiscount(product.price, product.originalPrice);
              const isWishlisted = wishlist.includes(product.id);
              const justAdded = addedId === product.id;

              return (
                <article key={product.id} className="bs-card" style={{ '--delay': `${index * 0.08}s` }}>
                  {/* Image */}
                  <Link to={`/product/${product.id}`} className="bs-card-img-link">
                    <div className="bs-card-img-wrap">
                      <div className={`bs-card-img-container ${product.gallery && product.gallery.length > 1 ? 'has-hover' : ''}`}>
                        <img src={product.img} alt={product.title} className="bs-card-img main" loading="lazy" />
                        {product.gallery && product.gallery.length > 1 && (
                          <img src={product.gallery[1]} alt={product.title} className="bs-card-img hover" loading="lazy" />
                        )}
                      </div>

                      {/* Rank Badge */}
                      <div className="bs-rank-badge">#{index + 1}</div>

                      {/* Sale / New pill */}
                      {product.promoGroup && <span className="bs-pill promo">B2G1 OFFER</span>}
                      {product.isBestseller && !product.promoGroup && <span className="bs-pill best">Bestseller</span>}
                      {product.isSale && !product.promoGroup && <span className="bs-pill sale">Sale</span>}
                      {product.isNew && !product.isBestseller && !product.promoGroup && <span className="bs-pill new">New</span>}

                      {/* Wishlist */}
                      <button
                        className={`bs-wish-btn ${isWishlisted ? 'active' : ''}`}
                        onClick={e => toggleWishlist(e, product.id)}
                        title="Add to wishlist"
                      >
                        <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
                      </button>

                      {/* Hover overlay */}
                      <div className="bs-card-overlay">
                        <button
                          className={`bs-quick-add ${justAdded ? 'added' : ''}`}
                          onClick={e => handleAddToCart(e, product)}
                        >
                          {justAdded ? '✓ Added to Bag' : <><ShoppingBag size={14} /> Quick Add</>}
                        </button>
                      </div>

                      {/* Image Bottom Stats (Rating & Quantity) */}
                      <div className="bs-image-stats">
                        {product.rating && (
                          <div className="bs-stat-pill">
                            <Star size={10} fill="var(--brand-gold)" color="var(--brand-gold)" />
                            <span>{product.rating}</span>
                            {product.reviewsCount && <span className="bs-stat-sep">|</span>}
                            {product.reviewsCount && <span className="bs-stat-reviews">{product.reviewsCount}</span>}
                          </div>
                        )}
                        {product.size && (
                          <div className="bs-stat-pill size-pill">
                            {(() => {
                              try {
                                const parsed = JSON.parse(product.size);
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                  return parsed[0].label;
                                }
                              } catch (e) {}
                              return product.size.split(',')[0].split(':')[0].trim();
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="bs-card-info">
                    <div className="bs-card-meta">
                      <span className="bs-skin-type">{product.skinType}</span>
                    </div>

                    <Link to={`/product/${product.id}`} className="bs-name-link">
                      <h3 className="bs-product-name">{product.title.split('|')[0].trim()}</h3>
                      {product.title.includes('|') && (
                        <p className="bs-product-subtitle">{product.title.split('|')[1].trim()}</p>
                      )}
                    </Link>

                    <div className="bs-price-row">
                      <span className="bs-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <>
                          <span className="bs-orig-price">₹{Number(product.originalPrice).toLocaleString('en-IN')}</span>
                          {discount && <span className="bs-discount">−{discount}%</span>}
                        </>
                      )}
                    </div>

                    <button
                      className={`bs-atc-btn ${justAdded ? 'added' : ''}`}
                      onClick={e => handleAddToCart(e, product)}
                    >
                      {justAdded ? '✓ Added!' : 'Add to Bag'}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Mobile View All */}
        <div className="bs-view-all-mobile">
          <Link to="/shop" className="bs-view-all-btn">
            View All Products <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Bestsellers;
