import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Ticket, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PromoCodes.css';

const PromoCodes = () => {
  const [codes, setCodes] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCodes = async () => {
      const { data } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      const now = new Date();
      const validCodes = (data || []).filter(c => !c.expires_at || new Date(c.expires_at) > now);
      setCodes(validCodes);
    };
    fetchCodes();
  }, []);

  useEffect(() => {
    if (codes.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % codes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [codes.length]);

  if (codes.length === 0) return null;

  const currentCode = codes[activeIndex];
  
  const getLabel = (c) => {
    if (c.discount_type === 'percentage') return `${c.discount_value}% OFF`;
    return `₹${c.discount_value} OFF`;
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIndex(prev => (prev + 1) % codes.length);
  };

  return (
    <div className="promo-ribbon-container" onClick={() => navigate('/shop')}>
      <div className="promo-ribbon-content">
        <div className="promo-ribbon-main">
          <Ticket className="promo-ribbon-icon" size={20} />
          <div className="promo-ribbon-text-container" key={activeIndex}>
            <span className="promo-ribbon-label">{getLabel(currentCode)}</span>
            <span className="promo-ribbon-desc">{currentCode.description || 'Premium Luxury Skincare'}</span>
            <span className="promo-ribbon-code-badge">
              Code: <strong>{currentCode.code}</strong>
            </span>
          </div>
        </div>
        
        <button className="promo-ribbon-arrow" onClick={handleNext}>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default PromoCodes;
