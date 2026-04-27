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
  Beaker,
  Tag
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { getOptimizedImageUrl } from '../../lib/upload';
import SEO from '../../components/SEO/SEO';
import { useNotify } from '../../components/common/Notification/Notification';
import { supabase } from '../../lib/supabase';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { products, addToCart, isCartOpen, setIsCartOpen } = useShop();
  const { notify } = useNotify();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [promoCodes, setPromoCodes] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [showSticky, setShowSticky] = useState(false);
  const addToCartRef = useRef(null);
  const footerRef = useRef(null);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [bundledProducts, setBundledProducts] = useState([]);

  useEffect(() => {
    const foundProduct = products.find(p => p.id === parseInt(id));
    if (foundProduct) {
      // Expiry Check for Combos
      if (foundProduct.category === 'combo' && foundProduct.benefits) {
        try {
          const benefits = JSON.parse(foundProduct.benefits);
          if (benefits.expiry_date) {
            const expiry = new Date(benefits.expiry_date);
            if (expiry < new Date()) {
              setProduct(null); // Treat as not found if expired
              return;
            }
          }
        } catch (e) { }
      }

      setProduct(foundProduct);
      const galleryArray = Array.isArray(foundProduct.gallery) ? foundProduct.gallery : (foundProduct.gallery ? foundProduct.gallery.split('\n').filter(Boolean) : []);
      setActiveImg(galleryArray[0] || foundProduct.img);

      const sizeChoices = foundProduct.size ? foundProduct.size.split(',').map(s => s.trim()).filter(Boolean) : [];
      setSelectedSize(sizeChoices[0] || '');
      window.scrollTo(0, 0);
    }
  }, [id, products]);

  useEffect(() => {
    if (product && product.benefits) {
      try {
        let benefitsData = null;
        if (typeof product.benefits === 'string') {
          if (product.benefits.includes('product_ids')) {
            benefitsData = JSON.parse(product.benefits);
          }
        } else if (product.benefits.product_ids) {
          benefitsData = product.benefits;
        }

        if (benefitsData && benefitsData.product_ids && Array.isArray(benefitsData.product_ids)) {
          const bundle = benefitsData.product_ids.map(key => {
            const [baseId, label] = typeof key === 'string' && key.includes('-') ? key.split('-') : [key, null];
            const p = products.find(prod => prod.id === Number(baseId));
            if (p) {
              return { ...p, variantLabel: label };
            }
            return null;
          }).filter(Boolean);
          setBundledProducts(bundle);
        } else {
          setBundledProducts([]);
        }
      } catch (e) { 
        setBundledProducts([]);
      }
    } else {
      setBundledProducts([]);
    }
  }, [product, products]);

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
    
    const fetchData = async () => {
      // Fetch promo codes
      const { data: pCodes } = await supabase.from('promo_codes').select('*').eq('is_active', true);
      setPromoCodes(pCodes || []);

      // Routine-Based Related Products Logic
      let related = [];
      const title = product.title.toLowerCase();
      const benefit = (product.benefit || '').toLowerCase();
      
      // 1. Find by Benefit (e.g., Acne, Hydration, Brightening)
      if (benefit) {
        const { data: benefitData } = await supabase
          .from('products')
          .select('*')
          .ilike('benefit', `%${benefit.split(' ')[0]}%`)
          .neq('id', product.id)
          .limit(4);
        if (benefitData?.length) related = [...benefitData];
      }

      // 2. Find Next Steps in Routine
      if (related.length < 4) {
        let nextStepKeywords = [];
        if (title.includes('face wash')) nextStepKeywords = ['serum', 'moisturizer', 'sunscreen'];
        else if (title.includes('serum')) nextStepKeywords = ['moisturizer', 'face wash', 'sunscreen'];
        else if (title.includes('moisturizer')) nextStepKeywords = ['serum', 'face wash', 'sunscreen'];

        for (const kw of nextStepKeywords) {
          if (related.length >= 4) break;
          const { data: stepData } = await supabase
            .from('products')
            .select('*')
            .ilike('title', `%${kw}%`)
            .neq('id', product.id)
            .limit(2);
          
          if (stepData?.length) {
            const newIds = new Set(related.map(r => r.id));
            stepData.forEach(p => { 
              if (!newIds.has(p.id) && related.length < 4) related.push(p); 
            });
          }
        }
      }

      // 3. Filter out Combos if viewing single product (and vice versa)
      const isCombo = title.includes('combo') || title.includes('kit');
      related = related.filter(r => {
        const rTitle = r.title.toLowerCase();
        const rIsCombo = rTitle.includes('combo') || rTitle.includes('kit');
        return rIsCombo === isCombo;
      });

      // 4. Final Fallback if empty
      if (related.length === 0) {
        const { data: fallback } = await supabase.from('products').select('*').neq('id', product.id).limit(4);
        related = fallback || [];
      }
      
      setRelatedProducts(related.slice(0, 4));
    };
    fetchData();

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

  const parsedVariants = (() => {
    if (!product?.size) return [];
    try {
      const arr = JSON.parse(product.size);
      if (Array.isArray(arr) && arr.length > 0 && arr[0].label) return arr;
    } catch (e) {}
    
    // Fallback old comma format
    return product.size.split(',').map(s => {
       const str = s.trim();
       if(!str) return null;
       const [lbl, p] = str.split(':');
       return { 
         label: lbl.trim(), 
         price: p ? Number(p) : product.price, 
         mrp: product.originalPrice, 
         discount: product.discount, 
         usp: '', 
         badge: '' 
       };
    }).filter(Boolean);
  })();

  const selectedVariantData = parsedVariants.find(v => v.label === selectedSize) || parsedVariants[0] || {};
  const currentPrice = Number(selectedVariantData.price || product.price);
  const currentSizeLabel = selectedVariantData.label || product.size;

  // Inventory Logic
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="product-page-wrap">
      <SEO 
        title={product.title} 
        description={truncatedDesc} 
        image={getOptimizedImageUrl(activeImg, 'w_1200,q_auto,f_auto')} 
        type="product"
        jsonLd={{
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": product.title,
          "image": getOptimizedImageUrl(activeImg, 'w_1200,q_auto,f_auto'),
          "description": truncatedDesc,
          "sku": product.id,
          "brand": {
            "@type": "Brand",
            "name": "Shoraluxe"
          },
          "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "INR",
            "price": currentPrice,
            "availability": isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"
          }
        }}
      />
      <nav className="breadcrumbs">
        <Link to="/">Home</Link>
        <ChevronRight size={12} strokeWidth={3} />
        <span>Products</span>
        <ChevronRight size={12} strokeWidth={3} />
        <span className="current-crumb">{product.title}</span>
      </nav>

      <div className="pd-grid">
        <div className="pd-gallery-container">
          {/* Promo Cards Section - MOVED TO TOP OF HTML FOR COLUMN-REVERSE BOTTOM PLACEMENT */}
          {promoCodes.length > 0 && (
            <div className="pd-promo-section gallery-promo">
              <span className="pd-promo-title"><Tag size={14} /> EXCLUSIVE OFFERS FOR YOU</span>
              <div className="pd-promo-cards">
                {promoCodes.slice(0, 3).map(code => (
                  <div className="pd-promo-card" key={code.id} onClick={() => {
                    navigator.clipboard.writeText(code.code);
                    notify(`Code ${code.code} copied!`, 'success');
                  }}>
                    <div className="pd-promo-badge">
                      {code.discount_type === 'percentage' ? `${code.discount_value}% OFF` : `₹${code.discount_value} OFF`}
                    </div>
                    <div className="pd-promo-info">
                      <span className="pd-promo-name">{code.code}</span>
                      <span className="pd-promo-text">{code.description || 'Applicable on this order'}</span>
                    </div>
                    <div className="pd-promo-copy">TAP TO COPY</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pd-thumbs-vertical">
            {galleryArray.map((img, i) => (
              <div
                key={i}
                className={`pd-thumb-v ${activeImg === img ? 'active' : ''}`}
                onClick={() => setActiveImg(img)}
              >
                <img src={getOptimizedImageUrl(img, 'w_150,c_thumb,q_auto,f_auto')} alt={`${product.title} thumb ${i}`} />
              </div>
            ))}
          </div>
          <div className="pd-main-img-wrap">
            <img 
              key={activeImg} 
              src={getOptimizedImageUrl(activeImg, 'w_1000,q_auto,f_auto')} 
              alt={product.title} 
              className="pd-main-img" 
              style={{ animation: 'fadeIn 0.4s ease-out' }} 
            />
            {product.badge && <span className="pd-badge">{product.badge}</span>}
          </div>

        </div>

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
            {!product.promoCode && (selectedVariantData.mrp || product.originalPrice) && (
              <>
                <span className="pd-original-luxe">₹{Number(selectedVariantData.mrp || product.originalPrice).toLocaleString('en-IN')}</span>
                <span className="pd-discount-badge">{selectedVariantData.discount || product.discount}</span>
              </>
            )}
            <span className="pd-tax-note">Inclusive of all taxes</span>
          </div>

          {/* Promo Code Hint — shown for combo/promo products */}
          {product.promoCode && product.promoPrice && (
            <div className="pd-promo-hint-banner" onClick={() => {
              navigator.clipboard.writeText(product.promoCode);
              notify(`Code ${product.promoCode} copied! Apply at checkout.`, 'success');
            }}>
              <div className="pd-promo-hint-left">
                <Tag size={18} className="pd-promo-hint-icon" />
                <div>
                  <span className="pd-promo-hint-label">EXCLUSIVE DEAL PRICE</span>
                  <span className="pd-promo-hint-text">
                    Use code <strong>{product.promoCode}</strong> at checkout
                  </span>
                  <span className="pd-promo-hint-text">and get this for only</span>
                </div>
              </div>
              <div className="pd-promo-hint-right">
                <span className="pd-promo-hint-price">₹{product.promoPrice.toLocaleString('en-IN')}</span>
                <span className="pd-promo-hint-copy">TAP TO COPY CODE</span>
              </div>
            </div>
          )}

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

          {parsedVariants.length > 0 ? (
            <div className="pd-size-selector">
              <span className="meta-label" style={{fontWeight: 600, color: '#333'}}>Select Size</span>
              <div className="variant-cards-wrapper">
                {parsedVariants.map((v, i) => {
                  const isSelected = selectedSize === v.label || (!selectedSize && i === 0);
                  return (
                    <div 
                      key={i} 
                      className={`variant-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(v.label)}
                    >
                      {isSelected && <div className="v-check-icon">✔</div>}
                      {v.badge && <div className="v-badge">{v.badge}</div>}
                      
                      <div className="v-title">{v.label}</div>
                      <div className="v-price-block">
                         <span className="v-sell-price">₹{v.price}</span>
                         {v.mrp && <span className="v-mrp">₹{v.mrp}</span>}
                         {v.discount && <span className="v-discount">{v.discount}</span>}
                      </div>
                      {v.usp && <div className="v-usp-line">USP: {v.usp}</div>}
                    </div>
                  );
                })}
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
                const cartIdOverride = parsedVariants.length > 1 ? `${product.id}-${btoa(selectedSize).substring(0, 8)}` : product.id;
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
                  {bundledProducts.length > 0 && (
                    <div className="pd-bundle-section">
                      <h4 className="pd-bundle-title">🎁 What's Included in this Combo:</h4>
                      <div className="pd-bundle-list">
                        {bundledProducts.map((p, idx) => (
                          <div key={idx} className="pd-bundle-item">
                            <div className="pd-bundle-img-box">
                              <img src={getOptimizedImageUrl(p.img, 'w_100,c_thumb,q_auto,f_auto')} alt={p.title} />
                            </div>
                            <div className="pd-bundle-info">
                              <span className="pd-bundle-name">{p.title.split('|')[0]} {p.variantLabel && <small>({p.variantLabel})</small>}</span>
                              <p className="pd-bundle-desc">{p.description?.slice(0, 100)}...</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.benefits && bundledProducts.length === 0 && (
                    <div className="best-for-luxe" style={{marginTop: '12px'}}>
                      <strong>Key Benefits:</strong> {product.benefits}
                    </div>
                  )}
                  {product.idealFor && product.idealFor.length > 0 && (
                    <div style={{marginTop: '14px'}}>
                      <strong style={{fontSize: '0.85rem', color: '#611C28', display: 'block', marginBottom: '8px'}}>Ideal For:</strong>
                      <div className="ideal-for-tags">
                        {product.idealFor.map((tag, i) => (
                          <span key={i} className="ideal-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.netQuantity && (
                    <div className="best-for-luxe" style={{marginTop: '10px'}}>
                      <strong>Net Quantity:</strong> {product.netQuantity}
                    </div>
                  )}
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
                  {product.cautions && (
                    <div className="best-for-luxe" style={{marginTop: '14px', borderLeft: '3px solid #C5A028', paddingLeft: '10px'}}>
                      <strong>⚠️ Cautions:</strong> {product.cautions}
                    </div>
                  )}
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

          {/* PAYMENT LOGOS */}
          <div className="pd-payment-methods-wrap">
            <span className="payment-title">SECURE PAYMENT OPTIONS</span>
            <div className="pd-payment-logos-grid">
              <img src="/Visa.png" alt="Visa" />
              <img src="/Master Card.png" alt="Mastercard" />
              <img src="/american express.png" alt="American Express" />
              <img src="/rupay.png" alt="RuPay" />
              <img src="/Google_Pay_Logo.svg.png" alt="Google Pay" />
              <img src="/Phonepe.png" alt="PhonePe" />
              <img src="/Paytm.jfif" alt="Paytm" />
              <img src="/Upi.png" alt="UPI" />
              <img src="/Razorpay.png" alt="Razorpay" />
            </div>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM BAR (Neudeskin Style) */}
      <div className={`pd-sticky-cart ${showSticky ? 'visible' : ''}`}>
        <div className="sticky-cart-inner">
          <div className="sticky-prod-info">
            <img src={getOptimizedImageUrl(activeImg, 'w_100,c_thumb,q_auto,f_auto')} alt="" className="sticky-img" />
            <div>
              <span className="sticky-title">{product.title.split('|')[0]} {parsedVariants.length > 1 && `(${currentSizeLabel})`}</span>
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
              const cartIdOverride = parsedVariants.length > 1 ? `${product.id}-${btoa(selectedSize).substring(0, 8)}` : product.id;
              const cartProduct = { ...product, id: cartIdOverride, price: currentPrice, size: currentSizeLabel };
              addToCart(cartProduct, quantity);
            }}>
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
      {/* RELATED PRODUCTS SECTION */}
      {relatedProducts.length > 0 && (
        <div className="pd-related-section">
          <h3 className="related-title">Complete Your <em>Routine</em></h3>
          <div className="related-grid">
            {relatedProducts.map(rp => (
              <div key={rp.id} className="related-card" onClick={() => navigate(`/product/${rp.id}`)}>
                <div className="related-img-wrap">
                  <img src={getOptimizedImageUrl(rp.img, 'w_400,q_auto,f_auto')} alt={rp.title} />
                </div>
                <div className="related-info">
                  <h4>{rp.title.split('|')[0]}</h4>
                  <p className="related-price">₹{rp.price.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div ref={footerRef} className="footer-sensor"></div>
    </div>
  );
};

export default ProductDetail;
