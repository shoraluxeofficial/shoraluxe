import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { getOptimizedImageUrl } from '../../../lib/upload';
import './WatchAndShop.css';

const fallbackStories = [
  {
    id: 1,
    video: '/watch&shop/WhatsApp%20Video%202026-04-29%20at%207.44.12%20PM.mp4',
  },
  {
    id: 2,
    video: '/watch&shop/WhatsApp%20Video%202026-04-29%20at%207.44.12%20PM.mp4',
  },
  {
    id: 3,
    video: '/watch&shop/WhatsApp%20Video%202026-04-29%20at%207.44.12%20PM.mp4',
  }
];

const WatchAndShop = () => {
  const scrollRef = useRef(null);
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
          // Only update if content has changed to prevent blinking/re-renders
          setStories(prev => {
            if (JSON.stringify(prev) === JSON.stringify(payload.new.content)) return prev;
            return payload.new.content;
          });
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
          <h2 className="watch-main-heading">Video Stories</h2>
          <div className="watch-controls">
            <button className="watch-scroll-btn" onClick={() => scroll('left')}><ChevronLeft size={20} /></button>
            <button className="watch-scroll-btn" onClick={() => scroll('right')}><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="watch-grid" ref={scrollRef}>
          {stories.map((story, index) => (
            <div key={index} className="story-card">
              <div className="story-media-wrap">
                {story.video ? (
                  <video
                    key={story.video}
                    className="story-video"
                    src={getOptimizedImageUrl(story.video, 'q_auto,w_500,vc_h264')}
                    poster={getOptimizedImageUrl(story.video, 'f_jpg,so_auto,w_500,q_auto')}
                    muted
                    loop
                    autoPlay
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <div className="no-video-placeholder">No Video</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WatchAndShop;
