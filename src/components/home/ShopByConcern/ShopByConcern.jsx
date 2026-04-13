import React, { useState } from 'react';
import './ShopByConcern.css';

const concernData = [
  {
    id: 'anti-ageing',
    title: 'Anti-Ageing',
    desc: 'Minimize fine lines and restore youthful elasticity.',
    img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'brightening',
    title: 'Brightening',
    desc: 'Even out skin tone and reveal a radiant, natural glow.',
    img: 'https://images.unsplash.com/photo-1590736962386-38703a987679?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'dryness',
    title: 'Dryness',
    desc: 'Deeply hydrate and nourish thirsty, parched skin.',
    img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'sun-protection',
    title: 'Sun Protection',
    desc: 'Broad-spectrum defense against harmful UV rays.',
    img: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca418?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'skin-repair',
    title: 'Skin Repair',
    desc: 'Strengthen the skin barrier and heal damage.',
    img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'oily',
    title: 'Oily & Congested',
    desc: 'Balance oil production and clear clogged pores.',
    img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'sensitive',
    title: 'Sensitive Skin',
    desc: 'Gentle, soothing care for easily irritated skin.',
    img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop'
  }
];

const ShopByConcern = () => {
  const [activeConcern, setActiveConcern] = useState(concernData[0]);

  return (
    <section className="concern-section">
      <div className="concern-container">
        {/* LEFT: INTERACTIVE LIST */}
        <div className="concern-list-side">
          <span className="concern-top-tag">Targeted Solutions</span>
          <h2 className="concern-main-heading">Shop by Concern</h2>
          
          <div className="concern-items">
            {concernData.map((item) => (
              <div 
                key={item.id} 
                className={`concern-row ${activeConcern.id === item.id ? 'active' : ''}`}
                onMouseEnter={() => setActiveConcern(item)}
              >
                <div className="concern-row-header">
                  <h3 className="concern-item-title">{item.title}</h3>
                  {activeConcern.id === item.id && (
                    <button className="concern-action-btn">
                      FIND MY SOLUTION
                    </button>
                  )}
                </div>
                {activeConcern.id === item.id && (
                  <p className="concern-item-desc animate-fadeIn">{item.desc}</p>
                )}
                <div className="concern-row-border"></div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: DYNAMIC IMAGE */}
        <div className="concern-image-side">
          <div className="concern-img-frame">
            <img 
              src={activeConcern.img} 
              alt={activeConcern.title} 
              key={activeConcern.id}
              className="concern-dynamic-img animate-scaleIn" 
            />
            <div className="img-overlay-brand">SHORALUXE</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopByConcern;
