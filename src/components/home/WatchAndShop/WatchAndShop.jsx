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
            src={story.video}
            poster=""
            muted
            loop
            playsInline
            preload="none"
          />
        ) : (
          <div className="no-video-placeholder">No Video</div>
        )}
      </div>
    </div>
  );
};

const localStories = [
  { video: '/videos/moisturizer.mp4' },
  { video: '/videos/serum.mp4' },
  { video: '/videos/face-wash.mp4' },
  { video: '/videos/sunscreen-50gm.mp4' },
  { video: '/videos/sunscreen-100gm.mp4' },
  { video: '/videos/moisturizer-1.mp4' }
];

const WatchAndShop = () => {
  const scrollRef = useRef(null);
  const [stories, setStories] = useState(localStories);

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
