import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, Send, Eye } from 'lucide-react';
import './WatchAndShop.css';

const storiesData = [
  {
    id: 1,
    title: 'Rewind Age Reversing Gel...',
    price: 1234,
    originalPrice: 1899,
    discount: '35% off',
    views: '904',
    img: 'https://images.unsplash.com/photo-1590736962386-38703a987679?auto=format&fit=crop&q=80&w=400',
    overlayText: 'To reduce wrinkles by 11% in 5 days'
  },
  {
    id: 2,
    title: 'Legend 13 Multiactive Super...',
    price: 551,
    originalPrice: 849,
    discount: '35% off',
    views: '1.0K',
    img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
    overlayText: 'Repairs Skin Barrier'
  },
  {
    id: 3,
    title: 'C-Bionic 20% Vitamin C Face...',
    price: 551,
    originalPrice: 849,
    discount: '35% off',
    views: '718',
    img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400',
    overlayText: 'Dark spot reducing Niacinamide'
  },
  {
    id: 4,
    title: 'Lay Bare Profoliator...',
    price: 454,
    originalPrice: 699,
    discount: '35% off',
    views: '2.4K',
    img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=400',
    overlayText: 'LAY BARE POFOLIATOR'
  },
  {
    id: 5,
    title: 'SUNSTOPPABLE SPF45 PA++...',
    price: 389,
    originalPrice: 599,
    discount: '35% off',
    views: '2.3K',
    img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=400',
    overlayText: '4 steps for Hi-Glaze glow ✨'
  }
];

const WatchAndShop = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="watch-section">
      <div className="watch-inner">
        <div className="watch-header">
          <h2 className="watch-main-heading">Watch & Shop</h2>
          <div className="watch-controls">
            <button className="watch-scroll-btn" onClick={() => scroll('left')}><ChevronLeft size={20} /></button>
            <button className="watch-scroll-btn" onClick={() => scroll('right')}><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="watch-grid" ref={scrollRef}>
          {storiesData.map((story) => (
            <div key={story.id} className="story-card">
              <div className="story-media-wrap">
                <img src={story.img} alt={story.title} className="story-img" />
                
                {/* Top Badge: Discount */}
                <div className="story-discount-badge">{story.discount}</div>
                
                {/* Top Right: Views */}
                <div className="story-views-badge">
                  <Eye size={12} />
                  <span>{story.views}</span>
                </div>

                {/* Overlay Text */}
                <div className="story-overlay-content">
                  <p>{story.overlayText}</p>
                </div>

                {/* Interaction Icons */}
                <div className="story-actions">
                  <button className="story-icon-btn"><Heart size={18} /></button>
                  <button className="story-icon-btn"><Send size={18} /></button>
                </div>
              </div>

              <div className="story-info">
                <h3 className="story-title">{story.title}</h3>
                <div className="story-pricing">
                  <span className="story-current-price">₹ {story.price}</span>
                  <span className="story-original-price">₹ {story.originalPrice}</span>
                </div>
                <button className="story-buy-btn">Buy Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WatchAndShop;
