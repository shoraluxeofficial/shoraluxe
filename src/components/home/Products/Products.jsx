import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import './Products.css';

const Products = () => {
  const scrollRef = useRef(null);
  const { products, addToCart } = useShop();

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

  return (
    <section className="products-section">
      <div className="products-inner">
        <div className="products-header">
          <h2 className="section-heading">New Arrivals</h2>
          <div className="products-controls">
            <button className="scroll-btn" onClick={() => scroll('left')} aria-label="Scroll left">
              <ChevronLeft size={20} />
            </button>
            <button className="scroll-btn" onClick={() => scroll('right')} aria-label="Scroll right">
              <ChevronRight size={20} />
            </button>
            <a href="#" className="view-all-link">View All</a>
          </div>
        </div>

        <div className="products-row-wrapper">
          <div className="products-row hide-scrollbar" ref={scrollRef}>
            {products.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="product-card-link">
                <div className="product-card">
                  {/* Image */}
                  <div className="product-img-wrap">
                    <img src={product.img} alt={product.title} className="product-img" />

                    {/* Badge */}
                    {product.badge && (
                      <span className={`product-badge ${product.isSale ? 'badge-sale' : product.isBestseller ? 'badge-best' : 'badge-new'}`}>
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <div className="product-info">
                    <h3 className="product-title">{product.title}</h3>
                    
                    <div className="product-desc-row">
                      <span>{product.benefit}</span>
                      <span className="pipe">|</span>
                      <span>{product.size}</span>
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
                      className="add-to-bag-btn" 
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
