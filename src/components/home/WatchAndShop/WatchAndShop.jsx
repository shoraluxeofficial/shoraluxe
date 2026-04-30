import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, Send, Eye, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { getOptimizedImageUrl } from '../../../lib/upload';
import './WatchAndShop.css';

const fallbackStories = [
  {
    id: 1,
    productId: 9,
    title: 'Non-Sticky Moisturizer',
    price: 389,
    originalPrice: 489,
    discount: '22% off',
    views: '1.2K',
    video: '/watch&shop/WhatsApp%20Video%202026-04-29%20at%207.44.12%20PM.mp4',
    img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/f_auto,q_auto/v1777291949/pytxmjbmiqabjo9omnjl.png',
    overlayText: 'Deep hydration without the stickiness'
  },
  {
    id: 2,
    productId: 6,
    title: 'Vitamin C & Niacinamide Serum',
    price: 359,
    originalPrice: 399,
    discount: '10% off',
    views: '2.5K',
    video: '/watch&shop/WhatsApp%20Video%202026-04-29%20at%207.44.12%20PM.mp4',
    img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/f_auto,q_auto/v1777291907/shtcmpj4cucedvppiale.jpg',
    overlayText: 'Glow-boosting daily serum'
  },
  {
    id: 3,
    productId: 1,
    title: 'Salicylic Acid Face Wash',
    price: 319,
    originalPrice: 399,
    discount: '20% off',
    views: '3.1K',
    video: '/watch&shop/WhatsApp%20Video%202026-04-29%20at%207.44.12%20PM.mp4',
    img: 'https://res.cloudinary.com/dfr0tlcdb/image/upload/f_auto,q_auto/v1777291865/ozy4pn5a42m3iuixbvvq.jpg',
    overlayText: 'Clear acne and prevent breakouts'
  }
];

const WatchAndShop = () => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [stories, setStories] = React.useState(null);

  // Fetch data and subscribe to realtime changes
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('homepage_sections')
          .select('content')
          .eq('section_name', 'watchAndShop')
          .single();
        if (data && data.content && data.content.length > 0) {
          setStories(data.content);
        } else {
          setStories(fallbackStories);
        }
      } catch (e) {
        console.error(e);
        setStories(fallbackStories);
      }
    };
    fetchData();

    const subscription = supabase
      .channel('public:watchAndShop')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homepage_sections', filter: "section_name=eq.watchAndShop" }, (payload) => {
        if (payload.new && payload.new.content && payload.new.content.length > 0) {
          setStories(payload.new.content);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleProductClick = (productId) => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  const handleShare = (e, story) => {
    e.stopPropagation();
    const productUrl = `${window.location.origin}/product/${story.productId}`;
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: story.overlayText || 'Check out this product!',
        url: productUrl,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(productUrl);
      alert('Link copied to clipboard!');
    }
  };

  if (!stories) {
    return (
      <section className="watch-section">
        <div className="watch-inner" style={{ minHeight: '400px', background: '#f5f5f5', borderRadius: '20px', animation: 'pulse 1.5s infinite' }}></div>
      </section>
    );
  }

  return (
    <section className="watch-section">
      <div className="watch-inner">
        <div className="watch-header">
          <h2 className="watch-main-heading">Watch & Shop</h2>
          <div className="watch-controls">
            <button className="watch-scroll-btn" onClick={() => scroll('left')}><ChevronLeft size={20} /></button>
            <button className="watch-scroll-btn" onClick={() => scroll('right')}><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="watch-grid" ref={scrollRef}>
          {stories.map((story, index) => (
            <div key={index} className="story-card" onClick={() => handleProductClick(story.productId)}>
              <div className="story-media-wrap">
                {story.video ? (
                  <video
                    key={story.video}
                    className="story-video"
                    src={getOptimizedImageUrl(story.video)}
                    poster={getOptimizedImageUrl(story.img, 'w_400,q_auto,f_auto')}
                    muted
                    loop
                    autoPlay
                    playsInline
                    preload="auto"
                  />
                ) : (
                  <img src={getOptimizedImageUrl(story.img, 'w_400,q_auto,f_auto')} alt={story.title} className="story-img" />
                )}

                {/* Top Badge: Discount */}
                {story.discount && <div className="story-discount-badge">{story.discount}</div>}

                {/* Top Right: Views */}
                <div className="story-views-badge">
                  <Eye size={12} />
                  <span>{story.views || (Math.floor(Math.random() * 500) + 500)}</span>
                </div>

                {/* Overlay Text */}
                <div className="story-overlay-content">
                  <p>{story.overlayText}</p>
                </div>

                {/* Interaction Icons */}
                <div className="story-actions">
                  <button className="story-icon-btn" onClick={(e) => handleShare(e, story)}>
                    <Send size={18} />
                  </button>
                </div>
              </div>

              <div className="story-info">
                <h3 className="story-title">{story.title}</h3>
                <div className="story-pricing">
                  <span className="story-current-price">₹ {story.price}</span>
                  {story.originalPrice && <span className="story-original-price">₹ {story.originalPrice}</span>}
                </div>
                <button 
                  className="story-buy-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(story.productId);
                  }}
                >
                  <ShoppingBag size={16} /> Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WatchAndShop;
