import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import './PopupAd.css';

const PopupAd = () => {
  const { popupConfig } = useShop();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup 1.5 seconds after page loads if it is active
    if (popupConfig?.active) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [popupConfig?.active]);

  if (!isOpen || !popupConfig?.active) return null;

  return (
    <div className="popup-overlay fade-in">
      <div className="popup-card scale-up">
        {/* Close Button */}
        <button className="popup-close" onClick={() => setIsOpen(false)} aria-label="Close Advertisement">
          <X size={20} />
        </button>

        {/* Content Splitting */}
        <div className="popup-split">
          <div className="popup-img-side">
            <img src={popupConfig.image} alt={popupConfig.title} />
          </div>
          
          <div className="popup-text-side">
            <span className="popup-minitag">Special Offer</span>
            <h2>{popupConfig.title}</h2>
            <p>{popupConfig.subtitle}</p>
            
            <a href={popupConfig.link} className="popup-cta-btn" onClick={() => setIsOpen(false)}>
              {popupConfig.buttonText} <ArrowRight size={16}/>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupAd;
