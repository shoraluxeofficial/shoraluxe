import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOptimizedImageUrl } from '../../../lib/upload';
import { supabase } from '../../../lib/supabase';
import './Categories.css';

const DEFAULT_CATEGORIES = [
  { name: 'Face Washes', slug: 'face-wash', img: 'https://zahdxekcwdlcbzfsnaej.supabase.co/storage/v1/object/public/brand-assets/products/1779733593868-5kbw1ob8rfa.jpeg' },
  { name: 'Face Serums', slug: 'serum', img: 'https://zahdxekcwdlcbzfsnaej.supabase.co/storage/v1/object/public/brand-assets/products/1779733614054-n1xsowuict.jpeg' },
  { name: 'Moisturizers', slug: 'moisturizer', img: 'https://zahdxekcwdlcbzfsnaej.supabase.co/storage/v1/object/public/brand-assets/products/1779733651513-w18jdt2vh.jpeg' },
  { name: 'Sunscreens', slug: 'sunscreen', img: 'https://zahdxekcwdlcbzfsnaej.supabase.co/storage/v1/object/public/brand-assets/products/1779733676196-1y498qkxue7.jpeg' },
  { name: 'Body Washes', slug: 'body-wash', img: 'https://zahdxekcwdlcbzfsnaej.supabase.co/storage/v1/object/public/brand-assets/products/1779733571192-5qs6w6d5no5.jpeg' },
  { name: 'Day Creams', slug: 'day-cream', img: 'https://zahdxekcwdlcbzfsnaej.supabase.co/storage/v1/object/public/brand-assets/products/1779733702714-qrbzqj0v5lp.jpeg' },
  { name: 'Night Creams', slug: 'night-cream', img: 'https://zahdxekcwdlcbzfsnaej.supabase.co/storage/v1/object/public/brand-assets/products/1779733726711-hivqsanrda.jpg' },
  { name: 'Body Lotions', slug: 'body-lotion', img: 'https://zahdxekcwdlcbzfsnaej.supabase.co/storage/v1/object/public/brand-assets/products/1779733521199-hp1kj9lq03i.jpeg' },
  { name: 'Combos', slug: 'combo', img: 'https://zahdxekcwdlcbzfsnaej.supabase.co/storage/v1/object/public/brand-assets/products/1779733957148-2xcwjgqj5x3.jpeg' },
];

const Categories = () => {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('homepage_sections')
          .select('content')
          .eq('section_name', 'categories')
          .maybeSingle();
          
        if (data && data.content && data.content.length > 0) {
          setCategories(data.content);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="categories-section">
      <div className="categories-inner">
        <h2 className="categories-heading">Shop by Category</h2>
        <div className="categories-grid">
          {categories.map((cat, index) => (
            <Link to={`/shop?category=${cat.slug}`} key={index} className="category-item">
              <div className="category-img-wrap">
                <img 
                  src={getOptimizedImageUrl(cat.img, 'w_300,q_auto,f_auto')} 
                  alt={cat.name} 
                  className="category-img" 
                  loading="lazy" 
                  decoding="async"
                />
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
