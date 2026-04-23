import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../../../context/ShopContext';
import { ArrowRight, Sparkles, Tag } from 'lucide-react';
import './ComboOffers.css';

const ComboOffers = () => {
  const { products } = useShop();

  // Filter for products that include "Combo" in their title, and sort so the "Trio" (featured) is always first
  const comboProducts = products
    .filter(p => p.title.toLowerCase().includes('combo'))
    .sort((a, b) => {
      const aTrio = a.title.toLowerCase().includes('trio');
      const bTrio = b.title.toLowerCase().includes('trio');
      if (aTrio && !bTrio) return -1;
      if (!aTrio && bTrio) return 1;
      return 0;
    })
    .slice(0, 3);

  if (comboProducts.length === 0) return null;

  return (
    <section className="combo-section">
      <div className="combo-container">
        <div className="combo-header">
          <div className="combo-badge-wrap">
            <span className="combo-badge-main"><Sparkles size={14} /> SUMMER SALE SPECIAL</span>
          </div>
          <h2 className="combo-heading">Exclusive Combo Offers</h2>
          <p className="combo-sub">Unlock maximum radiance with our curated bundles at unbeatable prices.</p>
        </div>

        <div className="combo-grid">
          {comboProducts.map((product) => {
            const isTrio = product.title.toLowerCase().includes('trio');
            return (
              <div key={product.id} className={`combo-card ${isTrio ? 'featured' : ''}`}>
                <div className="combo-card-inner">
                  <div className="combo-img-side">
                    <img src={product.img} alt={product.title} />
                    {product.badge && <span className="combo-item-badge">{product.badge}</span>}
                  </div>
                  <div className="combo-info-side">
                    <h3 className="combo-item-title">{product.title.split('|')[0]}</h3>
                    <p className="combo-item-desc">{product.description?.substring(0, 80)}...</p>
                    
                    <div className="combo-promo-box">
                      <Tag size={14} />
                      <span>{product.offer}</span>
                    </div>

                    <div className="combo-price-wrap">
                      <span className="combo-price-label">Bundle Price</span>
                      <div className="combo-prices">
                        <span className="combo-current-price">₹{product.price}</span>
                        {product.originalPrice && (
                          <span className="combo-mrp">₹{product.originalPrice}</span>
                        )}
                      </div>
                    </div>

                    <Link to={`/product/${product.id}`} className="combo-cta">
                      View Offer <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ComboOffers;
