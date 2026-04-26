import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, ChevronRight, Zap } from 'lucide-react';
import './PromoCarousel.css';

const PROMO_OFFERS = [
  {
    id: 1,
    text: "UPTO 20% OFF + Luxury Free Gifts",
    link: "/shop",
  },
  {
    id: 2,
    text: "BUY 2 GET 1 FREE - Premium Collection",
    link: "/shop?promo=B2G1_FACEWASH",
  },
  {
    id: 3,
    text: "EXCLUSIVE FLAT ₹500 OFF TODAY",
    link: "/shop",
  }
];

const PromoCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMO_OFFERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const offer = PROMO_OFFERS[currentIndex];

  return (
    <section className="promo-ribbon-wrapper">
      <Link 
        to={offer.link} 
        className="promo-ribbon-container"
      >
        <div className="promo-ribbon-content">
          <div className="promo-icon-wrapper">
            <Ticket className="promo-ribbon-icon" size={28} strokeWidth={1.5} />
          </div>
          
          <h2 className="promo-ribbon-text">
            {offer.text}
          </h2>
          
          <div className="promo-arrow-wrapper">
            <ChevronRight className="promo-ribbon-arrow" size={24} />
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="royal-shimmer"></div>
      </Link>
    </section>
  );
};

export default PromoCarousel;
