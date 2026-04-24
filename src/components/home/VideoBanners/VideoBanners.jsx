import React from 'react';
import { supabase } from '../../../lib/supabase';
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

const VideoBanners = () => {
  const [banners, setBanners] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchBanners();

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

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('content')
        .eq('section_name', 'videoBanners')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.content) {
        setBanners(data.content);
      } else {
        setBanners(defaultVideos);
      }
    } catch (error) {
      console.error('Error fetching video banners:', error);
      setBanners(defaultVideos);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <section className="video-banners-section">
      <div className="section-intro">
        <h2 className="section-heading">Shoraluxe In Motion</h2>
      </div>
      
      <div className="video-scroll-container">
        {banners.map((v, index) => (
          <div key={v.id || index} className="video-banner-item">
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
