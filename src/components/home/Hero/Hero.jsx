import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Hero.css';

const bannerData = [
  { id: 1, url: '/shop', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1600&auto=format&fit=crop', alt: 'Premium Care' },
  { id: 2, url: '/shop', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1600&auto=format&fit=crop', alt: 'Luxury Serums' },
  { id: 3, url: '/shop', img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1600&auto=format&fit=crop', alt: 'Radiance Boost' },
  { id: 4, url: '/shop', img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1600&auto=format&fit=crop', alt: 'Natural Essence' }
];

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(
      () => setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerData.length),
      6000
    );

    return () => resetTimeout();
  }, [currentIndex]);

  const goToPrev = (e) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? bannerData.length - 1 : prev - 1));
  };

  const goToNext = (e) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % bannerData.length);
  };

  return (
    <section className="hero-section">
      <div className="hero-slider-wrap">
        <div 
          className="hero-slider" 
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {bannerData.map((banner) => (
            <a key={banner.id} href={banner.url} className="hero-slide-link">
              <div className="hero-slide-item">
                <img src={banner.img} alt={banner.alt} className="hero-slide-img" />
                <div className="hero-hover-overlay"></div>
              </div>
            </a>
          ))}
        </div>

        {/* Manual Navigation Arrows */}
        <button className="slider-arrow prev" onClick={goToPrev} aria-label="Previous slide">
          <ChevronLeft size={28} />
        </button>
        <button className="slider-arrow next" onClick={goToNext} aria-label="Next slide">
          <ChevronRight size={28} />
        </button>

        {/* Navigation Dots */}
        <div className="hero-pagination">
          {bannerData.map((_, index) => (
            <button
              key={index}
              className={`pagination-dot ${currentIndex === index ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setCurrentIndex(index); }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
