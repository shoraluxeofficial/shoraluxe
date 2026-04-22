import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import './Hero.css';

const defaultBanners = [
  { id: 1, url: '/shop', desktopImg: '/Banners/1000000387.jpg.jpeg', mobileImg: '/Banners/1000000387.jpg.jpeg', alt: 'Premium Care' },
  { id: 2, url: '/shop', desktopImg: '/Banners/1000000389 (1).jpg.jpeg', mobileImg: '/Banners/1000000389 (1).jpg.jpeg', alt: 'Luxury Serums' },
  { id: 3, url: '/shop', desktopImg: '/Banners/WhatsApp_Image_2026-02-07_at_16.20.17_2 (1).webp', mobileImg: '/Banners/WhatsApp_Image_2026-02-07_at_16.20.17_2 (1).webp', alt: 'Special Offer' }
];

const Hero = () => {
  const [bannerData, setBannerData] = useState(defaultBanners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    const fetchBanners = async () => {
        const { data, error } = await supabase
            .from('homepage_sections')
            .select('content')
            .eq('section_name', 'hero')
            .single();
        
        if (data && data.content) {
            setBannerData(data.content);
        }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(
      () => setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerData.length),
      6000
    );

    return () => resetTimeout();
  }, [currentIndex, bannerData.length]);

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
                {/* Desktop Media */}
                <div className="hero-media-desktop">
                  {(banner.desktopImg || banner.img)?.toLowerCase().endsWith('.mp4') ? (
                    <video 
                      src={banner.desktopImg || banner.img} 
                      autoPlay muted loop playsInline 
                      className="hero-slide-img" 
                    />
                  ) : (
                    <img 
                      src={banner.desktopImg || banner.img} 
                      alt={banner.alt} 
                      className="hero-slide-img" 
                    />
                  )}
                </div>

                {/* Mobile Media */}
                <div className="hero-media-mobile">
                  {(banner.mobileImg || banner.img)?.toLowerCase().endsWith('.mp4') ? (
                    <video 
                      src={banner.mobileImg || banner.img} 
                      autoPlay muted loop playsInline 
                      className="hero-slide-img" 
                    />
                  ) : (
                    <img 
                      src={banner.mobileImg || banner.img} 
                      alt={banner.alt} 
                      className="hero-slide-img" 
                    />
                  )}
                </div>
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
