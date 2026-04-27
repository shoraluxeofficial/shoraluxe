import React from 'react';
import { Link } from 'react-router-dom';
import './Categories.css';

const categoryData = [
  { name: 'Face Washes',   slug: 'face-wash',   img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/f_auto,q_auto/v1777291808/xy5kaacehvnqb239cr5f.jpg' },
  { name: 'Face Serums',   slug: 'serum',       img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/f_auto,q_auto/v1777291809/uneg1od3vx5vg0yefgx7.png' },
  { name: 'Moisturizers',  slug: 'moisturizer', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/f_auto,q_auto/v1777291810/qs6s904ntxkmvvpdaife.jpg' },
  { name: 'Sunscreens',    slug: 'sunscreen',   img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/f_auto,q_auto/v1777291811/tsa4j57bhrcmhvypztnw.png' },
  { name: 'Body Washes',   slug: 'body-wash',   img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/f_auto,q_auto/v1777291813/wo65bumhqty40zffhcpb.png' },
  { name: 'Day Creams',    slug: 'day-cream',   img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/f_auto,q_auto/v1777291813/e8xvygltdxw2dlhzybel.png' },
  { name: 'Night Creams',  slug: 'night-cream', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/f_auto,q_auto/v1777291814/f3ktzl7tlgowlua2ghkw.png' },
  { name: 'Body Lotions',  slug: 'body-lotion', img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/f_auto,q_auto/v1777291815/mybmliwa7ysfwsjci2ov.png' },
  { name: 'Combos',        slug: 'combo',       img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/f_auto,q_auto/v1777291816/hjbdu4qn8fzts6kn7qmg.jpg' },
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
