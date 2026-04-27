import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, Send, Eye, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { getOptimizedImageUrl } from '../../../lib/upload';
import './WatchAndShop.css';

const fallbackStories = [
  {
    id: 1,
    productId: 9, // Moisturizer
    title: 'Non-Sticky Moisturizer',
    price: 389,
    originalPrice: 489,
    discount: '20% off',
    views: '1.2K',
    video: '/Watch&shop/1_Tube Moisturiser.mp4',
    img: '',
    overlayText: 'Deep hydration without the stickiness'
  },
  {
    id: 2,
    productId: 6, // Serum
    title: 'Vitamin C & Niacinamide Serum',
    price: 359,
    originalPrice: 399,
    discount: '10% off',
    views: '2.5K',
    video: '/Watch&shop/2_Serum.mp4',
    img: '',
    overlayText: 'Glow-boosting daily serum'
  },
  {
    id: 3,
    productId: 1, // Face Wash
    title: 'Salicylic Acid Face Wash',
    price: 319,
    originalPrice: 399,
    discount: '20% off',
    views: '3.1K',
    video: '/Watch&shop/3_Face Wash.mp4',
    img: '',
    overlayText: 'Clear acne and prevent breakouts'
  },
  {
    id: 4,
    productId: 7, // Day Cream / Moisturizer 2
    title: 'Brightening Day Cream SPF',
    price: 559,
    originalPrice: 659,
    discount: '15% off',
    views: '840',
    video: '/Watch&shop/4_Moisturiser.mp4',
    img: '',
    overlayText: 'UV protection & brightening'
  },
  {
    id: 5,
    productId: 10, // Sunscreen Tube
    title: 'Sunscreen Cream SPF 50+++',
    price: 359,
    originalPrice: 449,
    discount: '20% off',
    views: '4.2K',
    video: '/Watch&shop/5_Tube Sunscreen_1.mp4',
    img: '',
    overlayText: 'No white cast daily defense'
  },
  {
    id: 6,
    productId: 10, // Sunscreen Pump/Other
    title: 'Sunscreen SPF 50 Broad Spectrum',
    price: 359,
    originalPrice: 449,
    discount: '20% off',
    views: '1.9K',
    video: '/Watch&shop/6_Sunscreen.mp4',
    img: '',
    overlayText: 'Ultimate sun protection'
  },
  {
    id: 7,
    productId: 142, // Combo Pack
    title: 'Complete Skincare Trio Combo',
    price: 899,
    originalPrice: 1299,
    discount: '30% off',
    views: '5.5K',
    video: '/Watch&shop/7_Combo Pack.mp4',
    img: '',
    overlayText: 'Your full skincare routine'
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
                    className="story-video"
                    src={getOptimizedImageUrl(story.video)}
                    poster={getOptimizedImageUrl(story.img, 'w_400,q_auto,f_auto')}
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                ) : (
                  <img src={getOptimizedImageUrl(story.img, 'w_400,q_auto,f_auto')} alt={story.title} className="story-img" />
                )}

                {/* Top Badge: Discount */}
                <div className="story-discount-badge">{story.discount}</div>

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
                  <button className="story-icon-btn" onClick={(e) => { e.stopPropagation(); }}><Heart size={18} /></button>
                  <button className="story-icon-btn" onClick={(e) => { e.stopPropagation(); }}><Send size={18} /></button>
                </div>
              </div>

              <div className="story-info">
                <h3 className="story-title">{story.title}</h3>
                <div className="story-pricing">
                  <span className="story-current-price">₹ {story.price}</span>
                  {story.originalPrice && <span className="story-original-price">₹ {story.originalPrice}</span>}
                </div>
                <button className="story-buy-btn">
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
