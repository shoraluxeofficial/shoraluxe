import React from 'react';
import './VideoBanners.css';

const videos = [
  {
    id: 1,
    url: 'https://cdn.shopify.com/videos/c/o/v/6f0e395447a147e8b8c5e9f89542b5ff.mp4', // Placeholder high-end skincare video
    title: 'Pure Texture',
    desc: 'The science of silky hydration.'
  },
  {
    id: 2,
    url: 'https://cdn.shopify.com/videos/c/o/v/3f294e96dae263bf1528e25c4db17c17.mp4', 
    title: 'Sustainably Sourced',
    desc: 'The best of nature, bottled for you.'
  }
];

const VideoBanners = () => {
  return (
    <section className="video-banners-section">
      <div className="section-intro">
        <h2 className="section-heading">Shoraluxe In Motion</h2>
      </div>
      
      <div className="video-scroll-container">
        {videos.map((v) => (
          <div key={v.id} className="video-banner-item">
            <video 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="banner-video"
            >
              <source src={v.url} type="video/mp4" />
            </video>
            <div className="video-overlay">
              <div className="video-info">
                <h3 className="v-title">{v.title}</h3>
                <p className="v-desc">{v.desc}</p>
                <button className="v-cta">EXPLORE RITUAL</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VideoBanners;
