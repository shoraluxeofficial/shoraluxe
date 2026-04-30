import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Sparkles, Sun, Hourglass, Leaf, Waves, Wind, Shield } from 'lucide-react';
import { getOptimizedImageUrl } from '../../../lib/upload';
import './ShopByConcern.css';

const concernData = [
  {
    id: 'acne-breakouts',
    title: 'Acne & Breakouts',
    icon: Droplets,
    desc: 'Unclogs pores, reduces oil, and treats active breakouts.',
    products: [
      { name: 'Salicylic Acid Face Wash', sizes: '50ml · 100ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291865/ozy4pn5a42m3iuixbvvq.jpg' },
      { name: 'Charcoal Face Wash', sizes: '80ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291884/dmfsfzcf1ohz3jbz6oo6.jpg' },
      { name: 'Vitamin C Ubtan Face Wash', sizes: '80ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291894/ymnkwiizm3yy8c1bkmdx.jpg' },
      { name: 'Non Sticky Moisturizer', sizes: '50gm · 100gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291949/pytxmjbmiqabjo9omnjl.png' },
      { name: 'Sunscreen Cream SPF 50+++', sizes: '50gm · 100gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291977/fzfjpmt0lstbg4ruvny4.png' },
    ]
  },
  {
    id: 'pigmentation-dark-spots',
    title: 'Pigmentation & Dark Spots',
    icon: Sparkles,
    desc: 'Brightens skin, fades marks, and evens out skin tone.',
    products: [
      { name: 'Vitamin C & Niacinamide Face Serum', sizes: '30ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777292031/yja05pf25ue7xhxwqnxz.jpg' },
      { name: 'Brightening Day Cream with SPF', sizes: '50gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291938/mjhqto4tbzvlgy3u9puu.png' },
      { name: 'Vitamin C Ubtan Face Wash', sizes: '80ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291894/ymnkwiizm3yy8c1bkmdx.jpg' },
      { name: 'Rice Water Face Wash', sizes: '80ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291893/peh6ewngoo2nkl6rv2au.jpg' },
      { name: 'Sunscreen Cream SPF 50+++', sizes: '50gm · 100gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291977/fzfjpmt0lstbg4ruvny4.png' },
    ]
  },
  {
    id: 'dullness-uneven-tone',
    title: 'Dullness & Uneven Tone',
    icon: Sun,
    desc: 'Glow-boosting, brightening & radiance-enhancing products.',
    products: [
      { name: 'Vitamin C & Niacinamide Face Serum', sizes: '30ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777292031/yja05pf25ue7xhxwqnxz.jpg' },
      { name: 'Brightening Day Cream with SPF', sizes: '50gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291938/mjhqto4tbzvlgy3u9puu.png' },
      { name: 'Vitamin C Ubtan Face Wash', sizes: '80ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291894/ymnkwiizm3yy8c1bkmdx.jpg' },
      { name: 'Rice Water Face Wash', sizes: '80ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291893/peh6ewngoo2nkl6rv2au.jpg' },
      { name: 'Hyaluronic Acid Hydrating Gel Face Wash', sizes: '80ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291899/bcwssh2xvdfr8twcotor.jpg' },
      { name: 'Daily Hydrating Body Lotion', sizes: '100gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777292010/e6nailc3g5iegngqbpuw.jpg' },
      { name: 'Lavender Body Wash', sizes: '200ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777292004/euvgyuciha81uc0vfphk.jpg' },
    ]
  },
  {
    id: 'anti-aging-fine-lines',
    title: 'Anti‑Aging & Fine Lines',
    icon: Hourglass,
    desc: 'Supports collagen, smooths texture & reduces early aging.',
    products: [
      { name: 'Retinol Night Cream', sizes: '50gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291946/aqjhfpko6sqpwbighl0s.jpg' },
      { name: 'Vitamin C & Niacinamide Face Serum', sizes: '30ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777292031/yja05pf25ue7xhxwqnxz.jpg' },
      { name: 'Brightening Day Cream with SPF', sizes: '50gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291938/mjhqto4tbzvlgy3u9puu.png' },
      { name: 'Hyaluronic Acid Hydrating Gel Face Wash', sizes: '80ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291899/bcwssh2xvdfr8twcotor.jpg' },
      { name: 'Sunscreen Cream SPF 50+++', sizes: '50gm · 100gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291977/fzfjpmt0lstbg4ruvny4.png' },
    ]
  },
  {
    id: 'sensitivity-redness',
    title: 'Sensitivity & Redness',
    icon: Leaf,
    desc: 'Gentle, soothing & barrier-supporting formulas.',
    products: [
      { name: 'Rice Water Face Wash', sizes: '80ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291893/peh6ewngoo2nkl6rv2au.jpg' },
      { name: 'Hyaluronic Acid Hydrating Gel Face Wash', sizes: '80ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291899/bcwssh2xvdfr8twcotor.jpg' },
      { name: 'Non Sticky Moisturizer', sizes: '50gm · 100gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291949/pytxmjbmiqabjo9omnjl.png' },
      { name: 'Daily Hydrating Body Lotion', sizes: '100gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777292010/e6nailc3g5iegngqbpuw.jpg' },
      { name: 'Shea Butter Body Lotion', sizes: '100gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777292018/lfusckv6o5dg477fehuu.jpg' },
      { name: 'Lavender Body Wash', sizes: '200ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777292004/euvgyuciha81uc0vfphk.jpg' },
    ]
  },
  {
    id: 'dryness-dehydration',
    title: 'Dryness & Dehydration',
    icon: Waves,
    desc: 'Deep hydration, nourishment & moisture-locking care.',
    products: [
      { name: 'Non Sticky Moisturizer', sizes: '50gm · 100gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291949/pytxmjbmiqabjo9omnjl.png' },
      { name: 'Daily Hydrating Body Lotion', sizes: '100gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777292010/e6nailc3g5iegngqbpuw.jpg' },
      { name: 'Shea Butter Body Lotion', sizes: '100gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777292018/lfusckv6o5dg477fehuu.jpg' },
      { name: 'Hyaluronic Acid Hydrating Gel Face Wash', sizes: '80ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291899/bcwssh2xvdfr8twcotor.jpg' },
      { name: 'Rice Water Face Wash', sizes: '80ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291893/peh6ewngoo2nkl6rv2au.jpg' },
      { name: 'Retinol Night Cream', sizes: '50gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291946/aqjhfpko6sqpwbighl0s.jpg' },
    ]
  },
  {
    id: 'oily-skin-pore-control',
    title: 'Oily Skin & Pore Control',
    icon: Wind,
    desc: 'Oil-balancing, pore-clearing & mattifying products.',
    products: [
      { name: 'Salicylic Acid Face Wash', sizes: '50ml · 100ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291865/ozy4pn5a42m3iuixbvvq.jpg' },
      { name: 'Charcoal Face Wash', sizes: '80ml', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291884/dmfsfzcf1ohz3jbz6oo6.jpg' },
      { name: 'Non Sticky Moisturizer', sizes: '50gm · 100gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291949/pytxmjbmiqabjo9omnjl.png' },
      { name: 'Sunscreen Cream SPF 50+++', sizes: '50gm · 100gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291977/fzfjpmt0lstbg4ruvny4.png' },
    ]
  },
  {
    id: 'sun-protection',
    title: 'Sun Protection',
    icon: Shield,
    desc: 'Protect from UV damage, tanning & premature aging.',
    products: [
      { name: 'Sunscreen Cream SPF 50+++', sizes: '50gm · 100gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291977/fzfjpmt0lstbg4ruvny4.png' },
      { name: 'Brightening Day Cream with SPF', sizes: '50gm', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/v1777291938/mjhqto4tbzvlgy3u9puu.png' },
    ]
  }
];

const ShopByConcern = () => {
  const [active, setActive] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const navigate = useNavigate();
  const current = concernData[active];

  // Show hovered product image, else show first
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

      {/* CONCERN PILL TABS */}
      <div className="sbc-tabs-wrapper">
        <div className="sbc-tabs">
          {concernData.map((c, idx) => (
            <button
              key={c.id}
              className={`sbc-tab ${active === idx ? 'sbc-tab--active' : ''}`}
              onClick={() => { setActive(idx); setHoveredProduct(null); }}
            >
              <span className="sbc-tab-icon">
                <c.icon size={16} strokeWidth={2.5} />
              </span>
              <span className="sbc-tab-label">{c.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT CARD */}
      <div className="sbc-card" key={current.id}>

        {/* LEFT: product list */}
        <div className="sbc-card-left">
          <div className="sbc-card-header">
            <div className="sbc-card-icon">
              <current.icon size={32} strokeWidth={2} />
            </div>
            <h3 className="sbc-card-title">{current.title}</h3>
          </div>
          <p className="sbc-card-desc">{current.desc}</p>
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
                  <img src={getOptimizedImageUrl(p.img, 'w_100,q_auto,f_auto')} alt={p.name} />
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
              src={getOptimizedImageUrl(featuredImg, 'w_800,q_auto,f_auto')}
              alt={current.title}
              className="sbc-featured-img"
              loading="lazy"
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
                <img src={getOptimizedImageUrl(p.img, 'w_100,q_auto,f_auto')} alt={p.name} />
              </div>
            ))}
            {current.products.length > 4 && (
              <div className="sbc-thumb sbc-thumb-more" onClick={() => navigate('/shop')}>
                +{current.products.length - 4}
              </div>
            )}
          </div>

          {/* concern label */}
          <p className="sbc-right-label">
            <current.icon size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {current.title}
          </p>
        </div>

      </div>
    </section>
  );
};

export default ShopByConcern;
