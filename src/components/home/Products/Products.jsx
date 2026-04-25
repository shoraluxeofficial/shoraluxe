import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, ArrowRight } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import './Products.css';

const Products = () => {
  const scrollRef = useRef(null);
  const { products, addToCart, loading } = useShop();

  // Exclude test product (id 999) and cap to 16 real products
  const displayProducts = products.filter(p => p.id !== 999).slice(0, 16);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const ProductSkeleton = () => (
    <div className="product-card-link">
      <div className="product-card">
        <div className="product-img-wrap shimmer skeleton-img" style={{ height: '240px' }}></div>
        <div className="product-info" style={{ padding: '1.2rem' }}>
          <div className="skeleton-text shimmer" style={{ width: '80%' }}></div>
          <div className="skeleton-text shimmer" style={{ width: '40%', height: '10px' }}></div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
            <div className="skeleton-text shimmer" style={{ width: '40%', height: '20px' }}></div>
            <div className="skeleton-text shimmer" style={{ width: '20%', height: '20px' }}></div>
          </div>
          <div className="skeleton shimmer" style={{ height: '38px', width: '100%', marginTop: '15px', borderRadius: '4px' }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="products-section">
      <div className="products-inner">
        <div className="products-header">
          <h2 className="section-heading">New Arrivals</h2>
          <Link to="/shop" className="view-all-link">
            View All Products <ArrowRight size={16} />
          </Link>
        </div>

        <div className="products-row-wrapper">
          <div className="products-row hide-scrollbar" ref={scrollRef}>
            {loading ? (
              [...Array(6)].map((_, i) => <ProductSkeleton key={i} />)
            ) : (
              displayProducts.map((product) => (
                <div key={product.id} className="product-card-link">
                  <div className="product-card">
                    {/* Image */}
                    <Link to={`/product/${product.id}`} className="product-img-wrap" style={{ display: 'block' }}>
                      <img src={product.img} alt={product.title} className="product-img" loading="lazy" />

                      {/* Badge */}
                      {product.badge && (
                        <span className={`product-badge ${product.isSale ? 'badge-sale' : product.isBestseller ? 'badge-best' : 'badge-new'}`}>
                          {product.badge}
                        </span>
                      )}

                      {/* Stock Special Badges */}
                      {product.stock === 0 && (
                        <div className="stock-overlay-badge out">Out of Stock</div>
                      )}
                      {product.stock > 0 && product.stock <= 5 && (
                        <div className="stock-overlay-badge hurry">Hurry! Only {product.stock} Left</div>
                      )}

                      {/* Image Bottom Stats (Rating & Quantity) */}
                      <div className="product-image-stats">
                        <div className="product-stat-pill">
                          <Star size={10} fill="var(--brand-gold)" color="var(--brand-gold)" />
                          <span>{(product.id % 5) + 4.2}</span>
                          <span className="product-stat-sep">|</span>
                          <span className="product-stat-reviews">{(product.id * 7) % 200 + 50}</span>
                        </div>
                        {product.size && (
                          <div className="product-stat-pill size-pill">
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
                    </Link>

                    <div className="product-info">
                      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                        <h3 className="product-title">{product.title}</h3>
                      </Link>
                      
                      <div className="product-desc-row">
                        <span>{product.benefit}</span>
                      </div>

                      <div className="product-offer-text">{product.offer}</div>

                      <div className="product-pricing-row">
                        <span className="current-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
                        {product.originalPrice && (
                          <>
                            <span className="original-price">₹{Number(product.originalPrice).toLocaleString('en-IN')}</span>
                            <span className="discount-pill">{product.discount}</span>
                          </>
                        )}
                      </div>

                      <button 
                        className={`add-to-bag-btn ${product.stock === 0 ? 'disabled' : ''}`} 
                        disabled={product.stock === 0}
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        {product.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
