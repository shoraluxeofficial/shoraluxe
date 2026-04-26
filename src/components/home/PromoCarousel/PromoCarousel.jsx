import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import './PromoCarousel.css';

const PROMO_SLIDES = [
  {
    id: 1,
    title: "Face Wash Bundle Offer",
    subtitle: "BUY 2 GET 1 FREE",
    description: "Get 3 premium face washes for just ₹698. Mix and match your favorites.",
    image: "/Banners/facewash_b2g1.png",
    link: "/shop?promo=B2G1_FACEWASH",
    color: "#6d0e2c",
    badge: "Limited Time Offer"
  },
  {
    id: 2,
    title: "Body Lotion Bundle Deal",
    subtitle: "BUY 2 GET 1 FREE",
    description: "Experience deep hydration with 3 luxury lotions for ₹1,198.",
    image: "/Banners/lotion_b2g1.png",
    link: "/shop?promo=B2G1_LOTION",
    color: "#2c4a3e",
    badge: "Most Popular"
  }
];

const PromoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);

  return (
    <section className="promo-carousel-section">
      <div className="promo-carousel-container">
        {PROMO_SLIDES.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`promo-slide ${index === currentSlide ? 'active' : ''}`}
          >
            <div className="promo-slide-bg">
              <img src={slide.image} alt={slide.title} />
              <div className="promo-slide-overlay"></div>
            </div>
            
            <div className="promo-slide-content">
              <div className="promo-slide-inner">
                <div className="promo-badge">
                  <Sparkles size={14} /> {slide.badge}
                </div>
                <h3 className="promo-subtitle">{slide.subtitle}</h3>
                <h2 className="promo-title">{slide.title}</h2>
                <p className="promo-description">{slide.description}</p>
                
                <Link to={slide.link} className="promo-cta">
                  Shop the Collection <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        ))}

        <div className="promo-controls">
          <button className="promo-control-btn prev" onClick={prevSlide}>
            <ChevronLeft size={24} />
          </button>
          <button className="promo-control-btn next" onClick={nextSlide}>
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="promo-indicators">
          {PROMO_SLIDES.map((_, index) => (
            <button 
              key={index} 
              className={`promo-indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoCarousel;
