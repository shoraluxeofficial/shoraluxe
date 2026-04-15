import React from 'react';
import './Categories.css';

const categoryData = [
  {
    name: 'Face Washes',
    img: '/Prodcuts/WhatsApp Image 2026-04-13 at 6.26.32 PM (1).jpeg',
  },
  {
    name: 'Face Serums',
    img: '/Prodcuts/Face serums.jpg',
  },
  {
    name: 'Moisturizers',
    img: '/Prodcuts/WhatsApp Image 2026-04-13 at 6.26.31 PM (1).jpeg',
  },
  {
    name: 'Sunscreens',
    img: '/Prodcuts/Sunscreens.jpg',
  },
  {
    name: 'Body Washes',
    img: '/Prodcuts/Body Washs.jpg',
  },
  {
    name: 'Day Creams',
    img: '/Prodcuts/Day Creams.jpg',
  },
  {
    name: 'Night Creams',
    img: '/Prodcuts/Night Creams.jpg',
  },
  {
    name: 'Body Lotions',
    img: '/Prodcuts/Body Lotions.jpg',
  },
];

const Categories = () => {
  return (
    <section className="categories-section">
      <div className="categories-inner">
        <h2 className="categories-heading">Shop by Category</h2>
        <div className="categories-grid">
          {categoryData.map((cat, index) => (
            <a href="#" key={index} className="category-item">
              <div className="category-img-wrap">
                <img src={cat.img} alt={cat.name} className="category-img" />
                <div className="category-overlay" />
              </div>
              <span className="category-name">{cat.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
