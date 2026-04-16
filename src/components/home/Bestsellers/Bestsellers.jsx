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
  const bestsellers = (() => {
    const real = products.filter(p => p.id !== 999);
    const best = real.filter(p => p.isBestseller);
    return (best.length >= 4 ? best : real).slice(0, 4);
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
                      <img src={product.img} alt={product.title} loading="lazy" />

                      {/* Rank Badge */}
                      <div className="bs-rank-badge">#{index + 1}</div>

                      {/* Sale / New pill */}
                      {product.isBestseller && <span className="bs-pill best">Bestseller</span>}
                      {product.isSale && <span className="bs-pill sale">Sale</span>}
                      {product.isNew && !product.isBestseller && <span className="bs-pill new">New</span>}

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
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="bs-card-info">
                    <div className="bs-card-meta">
                      <span className="bs-skin-type">{product.skinType}</span>
                      {product.rating && (
                        <div className="bs-rating">
                          <Star size={11} fill="#907253" color="#907253" />
                          <span>{product.rating}</span>
                          {product.reviewsCount && (
                            <span className="bs-reviews">({product.reviewsCount})</span>
                          )}
                        </div>
                      )}
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
