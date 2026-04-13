import React from 'react';
import './Categories.css';

const categoryData = [
  {
    name: 'Face Washes',
    img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Face Serums',
    img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Moisturizers',
    img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Sunscreens',
    img: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca418?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Body Washes',
    img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Day Creams',
    img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Night Creams',
    img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Body Lotions',
    img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=200',
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
