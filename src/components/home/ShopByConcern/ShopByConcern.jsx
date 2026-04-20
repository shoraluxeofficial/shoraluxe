import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ShopByConcern.css';

const concernData = [
  {
    id: 'acne-breakouts',
    title: 'Acne & Breakouts',
    emoji: '🧼',
    color: '#e8f4e8',
    accent: '#3a7d44',
    desc: 'Unclogs pores, reduces oil, and treats active breakouts.',
    products: [
      { name: 'Salicylic Acid Face Wash', sizes: '50ml · 100ml', img: 'http://www.shoraluxe.com/cdn/shop/files/poster_1-01.png?v=1768804156&width=600' },
      { name: 'Charcoal Face Wash', sizes: '80ml', img: 'http://www.shoraluxe.com/cdn/shop/files/charcoalfacewash.png?v=1761301942&width=600' },
      { name: 'Vitamin C Ubtan Face Wash', sizes: '80ml', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsApp_Image_2026-03-31_at_22.18.11_4.jpg?v=1774992113&width=600' },
      { name: 'Non Sticky Moisturizer', sizes: '50gm · 100gm', img: 'http://www.shoraluxe.com/cdn/shop/files/001_3.png?v=1768804151&width=600' },
      { name: 'Sunscreen Cream SPF 50+++', sizes: '50gm · 100gm', img: 'http://www.shoraluxe.com/cdn/shop/files/poster_3-01.png?v=1768804184&width=600' },
    ]
  },
  {
    id: 'pigmentation-dark-spots',
    title: 'Pigmentation & Dark Spots',
    emoji: '✨',
    color: '#fef9ec',
    accent: '#c9a226',
    desc: 'Brightens skin, fades marks, and evens out skin tone.',
    products: [
      { name: 'Vitamin C & Niacinamide Face Serum', sizes: '30ml', img: '/Vitamin C & Niacinamide Face Serum/070FCDFF-3614-4A4B-86CA-AF1D83AF3D4D.jpeg' },
      { name: 'Brightening Day Cream with SPF', sizes: '50gm', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsAppImage2026-03-31at21.42.42_1.jpg?v=1774990739&width=600' },
      { name: 'Vitamin C Ubtan Face Wash', sizes: '80ml', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsApp_Image_2026-03-31_at_22.18.11_4.jpg?v=1774992113&width=600' },
      { name: 'Rice Water Face Wash', sizes: '80ml', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsApp_Image_2026-03-31_at_22.18.11_3.jpg?v=1774992113&width=600' },
      { name: 'Sunscreen Cream SPF 50+++', sizes: '50gm · 100gm', img: 'http://www.shoraluxe.com/cdn/shop/files/poster_3-01.png?v=1768804184&width=600' },
    ]
  },
  {
    id: 'dullness-uneven-tone',
    title: 'Dullness & Uneven Tone',
    emoji: '🌟',
    color: '#fff8f0',
    accent: '#e07b39',
    desc: 'Glow-boosting, brightening & radiance-enhancing products.',
    products: [
      { name: 'Vitamin C & Niacinamide Face Serum', sizes: '30ml', img: '/Vitamin C & Niacinamide Face Serum/070FCDFF-3614-4A4B-86CA-AF1D83AF3D4D.jpeg' },
      { name: 'Brightening Day Cream with SPF', sizes: '50gm', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsAppImage2026-03-31at21.42.42_1.jpg?v=1774990739&width=600' },
      { name: 'Vitamin C Ubtan Face Wash', sizes: '80ml', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsApp_Image_2026-03-31_at_22.18.11_4.jpg?v=1774992113&width=600' },
      { name: 'Rice Water Face Wash', sizes: '80ml', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsApp_Image_2026-03-31_at_22.18.11_3.jpg?v=1774992113&width=600' },
      { name: 'Hyaluronic Acid Hydrating Gel Face Wash', sizes: '80ml', img: 'http://www.shoraluxe.com/cdn/shop/files/HydratingGelCleanser-FaceWash.png?v=1761303017&width=600' },
      { name: 'Daily Hydrating Body Lotion', sizes: '100gm', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsApp_Image_2025-11-28_at_13.14.19.jpg?v=1764316619&width=600' },
      { name: 'Lavender Body Wash', sizes: '200ml', img: 'http://www.shoraluxe.com/cdn/shop/files/LavenderBodyWash.png?v=1761305931&width=600' },
    ]
  },
  {
    id: 'anti-aging-fine-lines',
    title: 'Anti‑Aging & Fine Lines',
    emoji: '⏳',
    color: '#f3f0ff',
    accent: '#7c5cbf',
    desc: 'Supports collagen, smooths texture & reduces early aging.',
    products: [
      { name: 'Retinol Night Cream', sizes: '50gm', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsApp_Image_2026-03-31_at_22.18.11_1.jpg?v=1774992113&width=600' },
      { name: 'Vitamin C & Niacinamide Face Serum', sizes: '30ml', img: '/Vitamin C & Niacinamide Face Serum/070FCDFF-3614-4A4B-86CA-AF1D83AF3D4D.jpeg' },
      { name: 'Brightening Day Cream with SPF', sizes: '50gm', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsAppImage2026-03-31at21.42.42_1.jpg?v=1774990739&width=600' },
      { name: 'Hyaluronic Acid Hydrating Gel Face Wash', sizes: '80ml', img: 'http://www.shoraluxe.com/cdn/shop/files/HydratingGelCleanser-FaceWash.png?v=1761303017&width=600' },
      { name: 'Sunscreen Cream SPF 50+++', sizes: '50gm · 100gm', img: 'http://www.shoraluxe.com/cdn/shop/files/poster_3-01.png?v=1768804184&width=600' },
    ]
  },
  {
    id: 'sensitivity-redness',
    title: 'Sensitivity & Redness',
    emoji: '🌿',
    color: '#edf7f3',
    accent: '#2e8b6a',
    desc: 'Gentle, soothing & barrier-supporting formulas.',
    products: [
      { name: 'Rice Water Face Wash', sizes: '80ml', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsApp_Image_2026-03-31_at_22.18.11_3.jpg?v=1774992113&width=600' },
      { name: 'Hyaluronic Acid Hydrating Gel Face Wash', sizes: '80ml', img: 'http://www.shoraluxe.com/cdn/shop/files/HydratingGelCleanser-FaceWash.png?v=1761303017&width=600' },
      { name: 'Non Sticky Moisturizer', sizes: '50gm · 100gm', img: 'http://www.shoraluxe.com/cdn/shop/files/001_3.png?v=1768804151&width=600' },
      { name: 'Daily Hydrating Body Lotion', sizes: '100gm', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsApp_Image_2025-11-28_at_13.14.19.jpg?v=1764316619&width=600' },
      { name: 'Shea Butter Body Lotion', sizes: '100gm', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsApp_Image_2026-03-31_at_22.18.11.jpg?v=1774992113&width=600' },
      { name: 'Lavender Body Wash', sizes: '200ml', img: 'http://www.shoraluxe.com/cdn/shop/files/LavenderBodyWash.png?v=1761305931&width=600' },
    ]
  },
  {
    id: 'dryness-dehydration',
    title: 'Dryness & Dehydration',
    emoji: '💧',
    color: '#eaf4fb',
    accent: '#1a7abf',
    desc: 'Deep hydration, nourishment & moisture-locking care.',
    products: [
      { name: 'Non Sticky Moisturizer', sizes: '50gm · 100gm', img: 'http://www.shoraluxe.com/cdn/shop/files/001_3.png?v=1768804151&width=600' },
      { name: 'Daily Hydrating Body Lotion', sizes: '100gm', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsApp_Image_2025-11-28_at_13.14.19.jpg?v=1764316619&width=600' },
      { name: 'Shea Butter Body Lotion', sizes: '100gm', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsApp_Image_2026-03-31_at_22.18.11.jpg?v=1774992113&width=600' },
      { name: 'Hyaluronic Acid Hydrating Gel Face Wash', sizes: '80ml', img: 'http://www.shoraluxe.com/cdn/shop/files/HydratingGelCleanser-FaceWash.png?v=1761303017&width=600' },
      { name: 'Rice Water Face Wash', sizes: '80ml', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsApp_Image_2026-03-31_at_22.18.11_3.jpg?v=1774992113&width=600' },
      { name: 'Retinol Night Cream', sizes: '50gm', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsApp_Image_2026-03-31_at_22.18.11_1.jpg?v=1774992113&width=600' },
    ]
  },
  {
    id: 'oily-skin-pore-control',
    title: 'Oily Skin & Pore Control',
    emoji: '🫧',
    color: '#f0f7ff',
    accent: '#2563b8',
    desc: 'Oil-balancing, pore-clearing & mattifying products.',
    products: [
      { name: 'Salicylic Acid Face Wash', sizes: '50ml · 100ml', img: 'http://www.shoraluxe.com/cdn/shop/files/poster_1-01.png?v=1768804156&width=600' },
      { name: 'Charcoal Face Wash', sizes: '80ml', img: 'http://www.shoraluxe.com/cdn/shop/files/charcoalfacewash.png?v=1761301942&width=600' },
      { name: 'Non Sticky Moisturizer', sizes: '50gm · 100gm', img: 'http://www.shoraluxe.com/cdn/shop/files/001_3.png?v=1768804151&width=600' },
      { name: 'Sunscreen Cream SPF 50+++', sizes: '50gm · 100gm', img: 'http://www.shoraluxe.com/cdn/shop/files/poster_3-01.png?v=1768804184&width=600' },
    ]
  },
  {
    id: 'sun-protection',
    title: 'Sun Protection',
    emoji: '☀️',
    color: '#fff4e0',
    accent: '#d97706',
    desc: 'Protect from UV damage, tanning & premature aging.',
    products: [
      { name: 'Sunscreen Cream SPF 50+++', sizes: '50gm · 100gm', img: 'http://www.shoraluxe.com/cdn/shop/files/poster_3-01.png?v=1768804184&width=600' },
      { name: 'Brightening Day Cream with SPF', sizes: '50gm', img: 'http://www.shoraluxe.com/cdn/shop/files/WhatsAppImage2026-03-31at21.42.42_1.jpg?v=1774990739&width=600' },
    ]
  }
];

const ShopByConcern = () => {
  const [active, setActive] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const navigate = useNavigate();
  const current = concernData[active];

  // Show hovered product image, else show first 4 stacked
  const featuredImg = hoveredProduct !== null
    ? current.products[hoveredProduct]?.img
    : current.products[0]?.img;

  return (
    <section className="sbc-section">
      {/* HEADING */}
      <div className="sbc-heading-block">
        <span className="sbc-eyebrow">Targeted Solutions</span>
        <h2 className="sbc-heading">Shop by Concern</h2>
        <p className="sbc-subheading">Select your skin concern to discover the right products for you.</p>
      </div>

      {/* CONCERN PILL TABS — wrapped for mobile horizontal scroll */}
      <div className="sbc-tabs-wrapper">
        <div className="sbc-tabs">
          {concernData.map((c, idx) => (
            <button
              key={c.id}
              className={`sbc-tab ${active === idx ? 'sbc-tab--active' : ''}`}
              style={active === idx ? { '--tab-accent': c.accent, '--tab-bg': c.color } : {}}
              onClick={() => { setActive(idx); setHoveredProduct(null); }}
            >
              <span className="sbc-tab-emoji">{c.emoji}</span>
              <span className="sbc-tab-label">{c.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT CARD */}
      <div className="sbc-card" key={current.id} style={{ '--accent': current.accent, '--bg': current.color }}>

        {/* LEFT: product list */}
        <div className="sbc-card-left">
          <div className="sbc-card-icon">{current.emoji}</div>
          <h3 className="sbc-card-title">{current.title}</h3>
          <p className="sbc-card-desc">{current.desc}</p>
          <div className="sbc-divider" />
          <p className="sbc-products-label">Recommended Products</p>

          <ul className="sbc-product-list">
            {current.products.map((p, i) => (
              <li
                key={i}
                className={`sbc-product-row ${hoveredProduct === i ? 'sbc-product-row--active' : ''}`}
                style={{ animationDelay: `${i * 0.06}s` }}
                onMouseEnter={() => setHoveredProduct(i)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => navigate('/shop')}
              >
                {/* tiny thumbnail */}
                <div className="sbc-row-thumb">
                  <img src={p.img} alt={p.name} />
                </div>
                <div className="sbc-product-text">
                  <span className="sbc-product-name">{p.name}</span>
                  <span className="sbc-product-size">{p.sizes}</span>
                </div>
                <span className="sbc-product-cta">Shop →</span>
              </li>
            ))}
          </ul>

          <button className="sbc-main-cta" onClick={() => navigate('/shop')}>
            Explore All Products
          </button>
        </div>

        {/* RIGHT: product image showcase */}
        <div className="sbc-card-right">
          {/* Background tint */}
          <div className="sbc-right-bg" />

          {/* Large featured image */}
          <div className="sbc-featured-img-wrap">
            <img
              key={featuredImg}
              src={featuredImg}
              alt={current.title}
              className="sbc-featured-img"
            />
            {/* count badge */}
            <div className="sbc-img-badge">
              <span className="sbc-img-badge-num">{current.products.length}</span>
              <span className="sbc-img-badge-label">Products</span>
            </div>
          </div>

          {/* Stacked mini thumbnails */}
          <div className="sbc-thumb-row">
            {current.products.slice(0, 4).map((p, i) => (
              <div
                key={i}
                className={`sbc-thumb ${hoveredProduct === i ? 'sbc-thumb--active' : ''}`}
                onMouseEnter={() => setHoveredProduct(i)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => navigate('/shop')}
                title={p.name}
              >
                <img src={p.img} alt={p.name} />
              </div>
            ))}
            {current.products.length > 4 && (
              <div className="sbc-thumb sbc-thumb-more" onClick={() => navigate('/shop')}>
                +{current.products.length - 4}
              </div>
            )}
          </div>

          {/* concern label */}
          <p className="sbc-right-label">{current.emoji} {current.title}</p>
        </div>

      </div>
    </section>
  );
};

export default ShopByConcern;
