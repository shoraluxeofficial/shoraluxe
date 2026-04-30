import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { getOptimizedImageUrl } from '../../../lib/upload';
import './WatchAndShop.css';

// Optimized sub-component to handle video playback performance
const StoryCard = ({ story }) => {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
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

  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isVisible) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented by browser
        });
      }
    } else {
      videoRef.current.pause();
    }
  }, [isVisible]);

  return (
    <div className="story-card">
      <div className="story-media-wrap">
        {story.video ? (
          <video
            ref={videoRef}
            className="story-video"
            src={getOptimizedImageUrl(story.video, 'q_auto:eco,w_400,vc_h264:baseline,br_1m')}
            poster={getOptimizedImageUrl(story.video, 'f_jpg,so_auto,w_400,q_auto:eco')}
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="no-video-placeholder">No Video</div>
        )}
      </div>
    </div>
  );
};

const WatchAndShop = () => {
  const scrollRef = useRef(null);
  const [stories, setStories] = useState(null);

  useEffect(() => {
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
          setStories([]); // No videos found
        }
      } catch (e) {
        console.error('WatchAndShop fetch error:', e);
        setStories([]);
      }
    };
    fetchData();

    const subscription = supabase
      .channel('public:watchAndShop')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homepage_sections', filter: "section_name=eq.watchAndShop" }, (payload) => {
        if (payload.new && payload.new.content) {
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

  // If loading or no stories, don't render the section at all
  if (!stories || stories.length === 0) return null;

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
            <StoryCard key={story.video || index} story={story} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WatchAndShop;
