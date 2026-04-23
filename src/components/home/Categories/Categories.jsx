import React from 'react';
import { Link } from 'react-router-dom';
import './Categories.css';

const categoryData = [
  { name: 'Face Washes',   slug: 'face-wash',   img: '/Prodcuts/WhatsApp Image 2026-04-13 at 6.26.32 PM (1).jpeg' },
  { name: 'Face Serums',   slug: 'serum',       img: '/Prodcuts/Face serums.jpg' },
  { name: 'Moisturizers',  slug: 'moisturizer', img: '/Prodcuts/WhatsApp Image 2026-04-13 at 6.26.31 PM (1).jpeg' },
  { name: 'Sunscreens',    slug: 'sunscreen',   img: '/Prodcuts/Sunscreens.jpg' },
  { name: 'Body Washes',   slug: 'body-wash',   img: '/Prodcuts/Body Washs.jpg' },
  { name: 'Day Creams',    slug: 'day-cream',   img: '/Prodcuts/Day Creams.jpg' },
  { name: 'Night Creams',  slug: 'night-cream', img: '/Prodcuts/Night Creams.jpg' },
  { name: 'Body Lotions',  slug: 'body-lotion', img: '/Prodcuts/Body Lotions.jpg' },
  { name: 'Combos',        slug: 'combo',       img: '/Prodcuts/Combo.jpeg' },
];

const Categories = () => {
  return (
    <section className="categories-section">
      <div className="categories-inner">
        <h2 className="categories-heading">Shop by Category</h2>
        <div className="categories-grid">
          {categoryData.map((cat, index) => (
            <Link to={`/shop?category=${cat.slug}`} key={index} className="category-item">
              <div className="category-img-wrap">
                <img src={cat.img} alt={cat.name} className="category-img" loading="lazy" />
                <div className="category-overlay" />
              </div>
              <span className="category-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
