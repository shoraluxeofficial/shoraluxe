import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { getOptimizedImageUrl } from '../../../lib/upload';
import './VideoBanners.css';

const defaultVideos = [
  {
    id: 1,
    url: 'https://cdn.shopify.com/videos/c/o/v/6f0e395447a147e8b8c5e9f89542b5ff.mp4',
    title: 'Pure Texture',
    desc: 'The science of silky hydration.'
  },
  {
    id: 3,
    url: 'https://cdn.shopify.com/videos/c/o/v/9f194e96dae263bf1528e25c4db17c18.mp4',
    title: 'Radiant Glow',
    desc: 'Unlock your natural luminosity safely.'
  },
  {
    id: 2,
    url: 'https://cdn.shopify.com/videos/c/o/v/3f294e96dae263bf1528e25c4db17c17.mp4', 
    title: 'Sustainably Sourced',
    desc: 'The best of nature, bottled for you.'
  }
];

const localBanners = [
  {
    id: 1,
    url: '/videos/moisturizer.mp4',
    title: 'Pure Texture',
    desc: 'The science of silky hydration.'
  },
  {
    id: 2,
    url: '/videos/serum.mp4',
    title: 'Radiant Glow',
    desc: 'Unlock your natural luminosity safely.'
  },
  {
    id: 3,
    url: '/videos/face-wash.mp4', 
    title: 'Sustainably Sourced',
    desc: 'The best of nature, bottled for you.'
  },
  {
    id: 4,
    url: '/videos/moisturizer-1.mp4',
    title: 'Deep Hydration',
    desc: 'All-day moisture lock.'
  },
  {
    id: 5,
    url: '/videos/sunscreen-50gm.mp4',
    title: 'Daily Defense',
    desc: 'Broad spectrum protection.'
  },
  {
    id: 6,
    url: '/videos/sunscreen-100gm.mp4',
    title: 'Complete Shield',
    desc: 'Lightweight, non-greasy formula.'
  }
];

const VideoItem = ({ v, navigate }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting) {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Auto-play was prevented by browser
            });
          }
        } else {
          videoRef.current.pause();
        }
      },
      { 
        threshold: 0.5, // Play when 50% visible
        rootMargin: '0px' 
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, []);

  return (
    <div className="video-banner-item">
      <video 
        ref={videoRef}
        muted 
        loop 
        playsInline 
        preload="metadata"
        className="banner-video"
        src={v.url}
      >
      </video>
      <div className="video-overlay">
        <div className="video-info">
          <h3 className="v-title">{v.title}</h3>
          <p className="v-desc">{v.desc}</p>
          <button className="v-cta" onClick={() => navigate('/shop')}>EXPLORE RITUAL</button>
        </div>
      </div>
    </div>
  );
};

const VideoBanners = () => {
  const [banners, setBanners] = React.useState(localBanners);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideoBanners = async () => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('content')
        .eq('section_name', 'videoBanners')
        .single();
      
      if (data && data.content && data.content.length > 0) {
        setBanners(data.content);
      }
    };
    fetchVideoBanners();

    const subscription = supabase
      .channel('public:videoBanners')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homepage_sections', filter: "section_name=eq.videoBanners" }, (payload) => {
        if (payload.new && payload.new.content) {
          setBanners(payload.new.content);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  return (
    <section className="video-banners-section">
      <div className="section-intro">
        <h2 className="section-heading">Explore our Rituals</h2>
      </div>
      
      <div className="video-scroll-container">
        {banners.map((v, index) => (
          <VideoItem key={v.id || index} v={v} navigate={navigate} />
        ))}
      </div>
    </section>
  );
};

export default VideoBanners;
