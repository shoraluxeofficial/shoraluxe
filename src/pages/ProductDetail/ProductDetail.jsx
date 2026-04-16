import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ChevronRight,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Plus,
  Minus,
  Check,
  Info,
  Sparkles,
  Beaker
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { products, addToCart } = useShop();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showSticky, setShowSticky] = useState(false);
  const addToCartRef = useRef(null);
  const footerRef = useRef(null);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const foundProduct = products.find(p => p.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);
      const galleryArray = Array.isArray(foundProduct.gallery) ? foundProduct.gallery : (foundProduct.gallery ? foundProduct.gallery.split('\n').filter(Boolean) : []);
      setActiveImg(galleryArray[0] || foundProduct.img);

      const sizeChoices = foundProduct.size ? foundProduct.size.split(',').map(s => s.trim()).filter(Boolean) : [];
      setSelectedSize(sizeChoices[0] || '');
      window.scrollTo(0, 0);
    }
  }, [id, products]);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar when original button scrolls past top
      let shouldShow = false;
      if (addToCartRef.current) {
        const rect = addToCartRef.current.getBoundingClientRect();
        shouldShow = rect.top < 0;
      }

      // Hide if footer is in view
      if (footerRef.current) {
        const footerRect = footerRef.current.getBoundingClientRect();
        if (footerRect.top < window.innerHeight) {
          shouldShow = false;
        }
      }

      setShowSticky(shouldShow);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll product gallery
  useEffect(() => {
    if (!product) return;
    const images = Array.isArray(product.gallery) ? product.gallery : (product.gallery ? product.gallery.split('\n').filter(Boolean) : []);
    if (!images || images.length <= 1) return;

    const autoPlayId = setInterval(() => {
      setActiveImg(prev => {
        const currentIndex = images.indexOf(prev);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % images.length;
        return images[nextIndex];
      });
    }, 5000);

    return () => clearInterval(autoPlayId);
  }, [product]);

  if (!product) return <div className="loading-state">Loading product details...</div>;

  const toggleDescription = () => setIsExpanded(!isExpanded);
  const truncatedDesc = product.description.length > 200
    ? product.description.slice(0, 200) + '...'
    : product.description;

  const galleryArray = Array.isArray(product.gallery) ? product.gallery : (product.gallery ? product.gallery.split('\n').filter(Boolean) : []);
  const howToUseArray = Array.isArray(product.howToUse) ? product.howToUse : (product.howToUse ? product.howToUse.split('\n').filter(Boolean) : []);

  const sizeChoices = product.size ? product.size.split(',').map(s => s.trim()).filter(Boolean) : [];

  const getSelectedPrice = () => {
    if (!selectedSize) return product.price;
    if (!selectedSize.includes(':')) return product.price;
    return Number(selectedSize.split(':')[1]);
  };

  const getSelectedSizeLabel = () => {
    if (!selectedSize) return product.size;
    return selectedSize.split(':')[0];
  };

  const currentPrice = getSelectedPrice();
  const currentSizeLabel = getSelectedSizeLabel();

  // Inventory Logic
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="product-page-wrap">
      {/* ... (rest of the Nav) ... */}
      <nav className="breadcrumbs">
        <Link to="/">Home</Link>
        <ChevronRight size={12} strokeWidth={3} />
        <span>Products</span>
        <ChevronRight size={12} strokeWidth={3} />
        <span className="current-crumb">{product.title}</span>
      </nav>

      <div className="pd-grid">
        {/* LEFT: VERTICAL GALLERY (Neudeskin Style) */}
        <div className="pd-gallery-container">
          <div className="pd-thumbs-vertical">
            {galleryArray.map((img, i) => (
              <div
                key={i}
                className={`pd-thumb-v ${activeImg === img ? 'active' : ''}`}
                onClick={() => setActiveImg(img)}
              >
                <img src={img} alt={`${product.title} thumb ${i}`} />
              </div>
            ))}
          </div>
          <div className="pd-main-img-wrap">
            <img key={activeImg} src={activeImg} alt={product.title} className="pd-main-img" style={{ animation: 'fadeIn 0.4s ease-out' }} />
            {product.badge && <span className="pd-badge">{product.badge}</span>}
          </div>
        </div>

        {/* RIGHT: CONTENT */}
        <div className="pd-info-container">
          <div className="pd-header-block">
            <div className="pd-rating-inline">
              <Star size={16} fill="#C5A028" stroke="#C5A028" />
              <span className="rating-val">{product.rating}</span>
              <span className="rating-count">({product.reviewsCount} reviews)</span>
            </div>

            {isOutOfStock && <div className="pd-stock-badge out">OUT OF STOCK</div>}
            {isLowStock && <div className="pd-stock-badge hurry">HURRY UP! ONLY {product.stock} LEFT</div>}

            <h1 className="pd-title-luxe">{product.title}</h1>
            <p className="pd-subtitle">{product.benefit}</p>
          </div>

          <div className="pd-pricing-block">
            <span className="pd-price-luxe">₹{currentPrice.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <>
                <span className="pd-original-luxe">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                <span className="pd-discount-badge">{product.discount}</span>
              </>
            )}
            <span className="pd-tax-note">Inclusive of all taxes</span>
          </div>

          <div className="pd-desc-luxe-wrap">
            <p className="pd-short-desc-luxe">
              {isExpanded ? product.description : truncatedDesc}
            </p>
            {product.description.length > 200 && (
              <button
                className="btn-read-more"
                onClick={toggleDescription}
              >
                {isExpanded ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>

          {sizeChoices.length > 0 ? (
            <div className="pd-size-selector">
              <span className="meta-label">Select Size / Combo</span>
              <div className="size-options">
                {sizeChoices.map(sz => (
                  <button
                    key={sz}
                    className={`size-btn ${selectedSize === sz ? 'active' : ''}`}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz.split(':')[0]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pd-meta-cards">
              <div className="meta-card">
                <span className="meta-label">Size</span>
                <span className="meta-val">{currentSizeLabel}</span>
              </div>
              <div className="meta-card">
                <span className="meta-label">Skin Type</span>
                <span className="meta-val">{product.skinType}</span>
              </div>
            </div>
          )}

          <div className="pd-luxe-offers">
            <Check size={18} color="#611C28" />
            <span>{product.offer}</span>
          </div>

          {/* MAIN ACTIONS */}
          <div className="pd-action-panel">
            <div className="pd-qty-box">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={isOutOfStock}><Minus size={16} /></button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} disabled={isOutOfStock}><Plus size={16} /></button>
            </div>
            <button
              className={`btn-luxe-primary ${isOutOfStock ? 'disabled' : ''}`}
              ref={addToCartRef}
              disabled={isOutOfStock}
              onClick={() => {
                const cartIdOverride = sizeChoices.length > 1 ? `${product.id}-${btoa(selectedSize).substring(0, 8)}` : product.id;
                const cartProduct = { ...product, id: cartIdOverride, price: currentPrice, size: currentSizeLabel };
                addToCart(cartProduct, quantity);
              }}
            >
              {isOutOfStock ? 'OUT OF STOCK' : `ADD TO CART - ₹${(currentPrice * quantity).toLocaleString('en-IN')}`}
            </button>
            <button className="btn-wishlist-luxe">
              <Heart size={20} />
            </button>
          </div>

          {/* ICON-LED TABS (Neudeskin Style) */}
          <div className="pd-icon-tabs">
            <div className="icon-tab-headers">
              <button className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}>
                <div className="icon-circle"><Info size={20} /></div>
                <span>Benefits</span>
              </button>
              <button className={activeTab === 'use' ? 'active' : ''} onClick={() => setActiveTab('use')}>
                <div className="icon-circle"><Sparkles size={20} /></div>
                <span>Routine</span>
              </button>
              <button className={activeTab === 'ingredients' ? 'active' : ''} onClick={() => setActiveTab('ingredients')}>
                <div className="icon-circle"><Beaker size={20} /></div>
                <span>Ingredients</span>
              </button>
            </div>
            <div className="icon-tab-content">
              {activeTab === 'description' && (
                <div className="tab-fade-in">
                  <p>{product.description}</p>
                  <div className="best-for-luxe"><strong>Recommended for:</strong> {product.bestFor}</div>
                </div>
              )}
              {activeTab === 'use' && (
                <div className="tab-fade-in">
                  <ul className="luxe-step-list">
                    {howToUseArray.map((step, i) => (
                      <li key={i}>
                        <span className="step-num">{i + 1}</span>
                        <p>{step}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {activeTab === 'ingredients' && (
                <div className="tab-fade-in">
                  <ul className="ing-points-list">
                    {product.ingredients?.split(',').map((item, i) => (
                      <li key={i}>{item.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* TRUST BADGES */}
          <div className="pd-trust-luxe">
            <div className="trust-col"><Truck strokeWidth={1.5} size={24} /> <span>Pan India Delivery</span></div>
            <div className="trust-col"><ShieldCheck strokeWidth={1.5} size={24} /> <span>Dermatologist Approved</span></div>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM BAR (Neudeskin Style) */}
      <div className={`pd-sticky-cart ${showSticky ? 'visible' : ''}`}>
        <div className="sticky-cart-inner">
          <div className="sticky-prod-info">
            <img src={activeImg} alt="" className="sticky-img" />
            <div>
              <span className="sticky-title">{product.title.split('|')[0]} {sizeChoices.length > 1 && `(${currentSizeLabel})`}</span>
              <span className="sticky-price">₹{currentPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="sticky-actions">
            <div className="pd-qty-box sticky-qty">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={14} /></button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}><Plus size={14} /></button>
            </div>
            <button className="btn-luxe-primary sticky-btn" onClick={() => {
              const cartIdOverride = sizeChoices.length > 1 ? `${product.id}-${btoa(selectedSize).substring(0, 8)}` : product.id;
              const cartProduct = { ...product, id: cartIdOverride, price: currentPrice, size: currentSizeLabel };
              addToCart(cartProduct, quantity);
            }}>
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
      <div ref={footerRef} className="footer-sensor"></div>
    </div>
  );
};

export default ProductDetail;
