import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import './CTASection.css';

const CTASection = () => {
  const [data, setData] = useState({
    tag: 'Limited Edition',
    heading: 'Your Journey to Radiant Skin Starts Here',
    text: 'Discover the perfect blend of science and nature. Hand-crafted rituals for your unique skin needs.',
    buttonText: 'SHOP THE COLLECTION',
    bgImage: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: sectionData } = await supabase
        .from('homepage_sections')
        .select('content')
        .eq('section_name', 'cta')
        .single();
      
      if (sectionData && sectionData.content) {
        setData(sectionData.content);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="cta-section" style={data.bgImage ? { backgroundImage: `url(${data.bgImage})` } : {}}>
      <div className="cta-overlay"></div>
      <div className="cta-content">
        <span className="cta-tag">{data.tag}</span>
        <h2 className="cta-heading" dangerouslySetInnerHTML={{ __html: data.heading }}></h2>
        <p className="cta-text">{data.text}</p>
        <button className="cta-button">
          {data.buttonText}
          <div className="btn-mirror"></div>
        </button>
      </div>
    </section>
  );
};

export default CTASection;
