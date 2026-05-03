import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, ArrowRight, Heart, Gift, Share2 } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import './CombosSection.css';

const CombosSection = () => {
  const { products, addToCart, loading } = useShop();
  const [addedId, setAddedId] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  const handleShare = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/product/${product.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: `Check out this amazing combo: ${product.title} from Shoraluxe!`,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Share failed:', err);
    }
  };

  const combos = (() => {
    return products.filter(p => {
      if (p.category !== 'combo') return false;
      
      // Expiry Check
      if (p.benefits) {
        try {
          const benefits = JSON.parse(p.benefits);
          if (benefits.expiry_date) {
            const expiry = new Date(benefits.expiry_date);
            if (expiry < new Date()) return false;
          }
        } catch (e) {}
      }
      return true;
    }).slice(0, 4);
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

  const ComboSkeleton = () => (
    <div className="cs-card">
      <div className="cs-card-img-wrap shimmer skeleton-img" style={{ height: '300px' }}></div>
      <div className="cs-card-info" style={{ padding: '1.25rem' }}>
        <div className="skeleton-text shimmer" style={{ width: '40%', height: '10px', marginBottom: '10px' }}></div>
        <div className="skeleton-text shimmer" style={{ width: '90%', height: '16px', marginBottom: '8px' }}></div>
        <div className="skeleton-text shimmer" style={{ width: '40%', height: '24px', marginTop: '10px' }}></div>
        <div className="skeleton shimmer" style={{ height: '42px', width: '100%', marginTop: '15px' }}></div>
      </div>
    </div>
  );

  if (!loading && combos.length === 0) return null;

  return (
    <section className="combos-section">
      <div className="cs-header-wrap">
        <div className="cs-header-inner">
          <div className="cs-header-left">
            <p className="cs-eyebrow">Exclusive Savings</p>
            <h2 className="cs-heading">Limited Edition Combos</h2>
            <p className="cs-subtext">
              Hand-picked skincare routines bundled together for maximum results and maximum savings.
            </p>
          </div>
          <Link to="/shop?category=combo" className="cs-view-all-desktop">
            View All Deals <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="cs-container">
        <div className="cs-grid">
          {loading ? (
            [...Array(4)].map((_, i) => <ComboSkeleton key={i} />)
          ) : (
            combos.map((product, index) => {
              // Ensure we have numbers for calculation
              const currentPrice = Number(product.price);
              
              // Fallback logic for original prices if missing in DB
              let fallbackOriginal = Number(product.originalPrice || product.original_price);
              if (!fallbackOriginal || fallbackOriginal <= currentPrice) {
                if (product.id === 14 || product.id === '14') fallbackOriginal = 899;
                else if (product.id === 15 || product.id === '15') fallbackOriginal = 1199;
                else if (product.id === 16 || product.id === '16') fallbackOriginal = 1499;
                else if (product.id === 17 || product.id === '17') fallbackOriginal = 1399;
                else fallbackOriginal = Math.round(currentPrice * 1.35); // Default 35% markup fallback
              }

              const discount = getDiscount(currentPrice, fallbackOriginal) || product.discount?.replace(/[^0-9]/g, '');
              const isWishlisted = wishlist.includes(product.id);
              const justAdded = addedId === product.id;

              return (
                <article key={product.id} className="cs-card" style={{ '--delay': `${index * 0.1}s` }}>
                  <Link to={`/product/${product.id}`} className="cs-card-img-link">
                    <div className="cs-card-img-wrap">
                      <div className={`cs-card-img-container ${product.gallery && product.gallery.length > 1 ? 'has-hover' : ''}`}>
                        <img src={product.img} alt={product.title} className="cs-card-img main" loading="lazy" />
                        {product.gallery && product.gallery.length > 1 && (
                          <img src={product.gallery[1]} alt={product.title} className="cs-card-img hover" loading="lazy" />
                        )}
                      </div>

                      <div className="cs-gift-icon">
                        <Gift size={16} />
                      </div>

                      {product.stock > 0 && product.stock <= 5 && (
                        <span className="cs-pill hurry">ONLY FEW LEFT</span>
                      )}
                      
                      <span className="cs-pill promo">COMBO SAVINGS</span>

                      <div className="cs-action-cluster">
                        <button
                          className={`cs-wish-btn ${isWishlisted ? 'active' : ''}`}
                          onClick={e => toggleWishlist(e, product.id)}
                          title="Add to wishlist"
                        >
                          <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          className="cs-share-btn"
                          onClick={e => handleShare(e, product)}
                          title="Share product"
                        >
                          <Share2 size={14} />
                        </button>
                      </div>

                      <div className="cs-card-overlay">
                        <button
                          className={`cs-quick-add ${justAdded ? 'added' : ''}`}
                          onClick={e => handleAddToCart(e, product)}
                        >
                          {justAdded ? '✓ Added' : <><ShoppingBag size={14} /> Buy Combo</>}
                        </button>
                      </div>
                    </div>
                  </Link>

                  <div className="cs-card-info">
                    <div className="cs-card-meta">
                      <span className="cs-skin-type">{product.skinType}</span>
                    </div>

                    <Link to={`/product/${product.id}`} className="cs-name-link">
                      <h3 className="cs-product-name">{product.title.split('|')[0].trim()}</h3>
                      {product.netQuantity && (
                         <p className="cs-product-subtitle">{product.netQuantity}</p>
                      )}
                    </Link>

                    <div className="cs-price-row">
                      <span className="cs-price">₹{currentPrice.toLocaleString('en-IN')}</span>
                      {fallbackOriginal > currentPrice && (
                        <>
                          <span className="cs-orig-price">₹{fallbackOriginal.toLocaleString('en-IN')}</span>
                          {discount && (
                            <span className="cs-discount">
                              SAVE {discount}%
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <button
                      className={`cs-atc-btn ${justAdded ? 'added' : ''}`}
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

        <div className="cs-view-all-mobile">
          <Link to="/shop?category=combo" className="cs-view-all-btn">
            View All Combo Deals <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CombosSection;
