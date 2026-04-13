import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './QuizSection.css';

const quizSteps = [
  {
    id: 1,
    tag: 'Step 01: Analysis',
    title: 'Analyze Your Skin Profile',
    text: 'Our advanced algorithm identifies your unique skin type and concerns through a series of targeted questions.',
    btnText: 'START ANALYSIS',
    img: 'https://images.unsplash.com/photo-1590736962386-38703a987679?q=80&w=400'
  },
  {
    id: 2,
    tag: 'Step 02: Formulation',
    title: 'Curated Recommendations',
    text: 'Receive a hand-picked selection of Shoraluxe products formulated specifically for your skin goals.',
    btnText: 'VIEW MY ROUTINE',
    img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400'
  },
  {
    id: 3,
    tag: 'Step 03: Results',
    title: 'Achieve Your Glow Up',
    text: 'Follow your personalized ritual and track your journey towards radiant, healthier-looking skin.',
    btnText: 'JOIN THE CLUB',
    img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400'
  }
];

const QuizSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if(e.isIntersecting) setIsVisible(true) }, {threshold: 0.2});
    if(sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % quizSteps.length);
  const goToPrev = () => setCurrentIndex((prev) => (prev === 0 ? quizSteps.length - 1 : prev - 1));

  return (
    <section className={`quiz-section ${isVisible ? 'is-visible' : ''}`} ref={sectionRef}>
      <div className="quiz-container">
        <div className="quiz-slider-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {quizSteps.map((step) => (
            <div key={step.id} className="quiz-slide">
              {/* LEFT: TEXT */}
              <div className="quiz-text-content">
                <span className="quiz-tag slide-in-top">{step.tag}</span>
                <h2 className="quiz-title slide-in-left">{step.title}</h2>
                <p className="quiz-text slide-in-left-delayed">{step.text}</p>
              </div>

              {/* RIGHT: IMAGE + BUTTON */}
              <div className="quiz-media-action">
                <div className="quiz-small-img-wrap slide-in-bottom">
                  <img src={step.img} alt={step.title} className="quiz-small-img" />
                </div>
                <div className="quiz-btn-wrap slide-in-bottom-delayed">
                  <button className="quiz-btn">
                    {step.btnText}
                    <div className="btn-shimmer"></div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MANUAL CONTROLS */}
        <button className="q-arrow prev" onClick={goToPrev}><ChevronLeft size={24} /></button>
        <button className="q-arrow next" onClick={goToNext}><ChevronRight size={24} /></button>
        
        <div className="q-dots">
          {quizSteps.map((_, i) => (
            <div key={i} className={`q-dot ${currentIndex === i ? 'active' : ''}`} onClick={() => setCurrentIndex(i)}></div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuizSection;
