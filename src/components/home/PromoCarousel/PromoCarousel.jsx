import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import './PromoCarousel.css';

const PromoCarousel = () => {
  const [ribbons, setRibbons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRibbons();
  }, []);

  const fetchRibbons = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_ribbons')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setRibbons(data);
      } else {
        // Fallback if no data in DB yet
        setRibbons([
          {
            id: 0,
            text: "UPTO 20% OFF + Luxury Free Gifts",
            link: "/shop",
            design_type: "design-royal-cyan",
            image_url: "/favicon.png"
          }
        ]);
      }
    } catch (err) {
      console.error("Error fetching promo ribbons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ribbons.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ribbons.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [ribbons]);

  if (loading || ribbons.length === 0) return null;

  const currentRibbon = ribbons[currentIndex];

  return (
    <section className="promo-ribbon-wrapper">
      <Link 
        to={currentRibbon.link} 
        className={`promo-ribbon-container ${currentRibbon.design_type}`}
      >
        <div className="promo-ribbon-content">
          {currentRibbon.image_url && (
            <img 
              src={currentRibbon.image_url} 
              alt="Promo" 
              className="promo-small-img" 
            />
          )}
          
          <h2 className="promo-ribbon-text">
            {currentRibbon.text}
          </h2>
          
          <ChevronRight className="promo-ribbon-arrow" size={20} />
        </div>
      </Link>
    </section>
  );
};

export default PromoCarousel;
