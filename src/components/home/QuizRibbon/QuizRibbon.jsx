import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import './QuizRibbon.css';

const QuizRibbon = () => {
  const navigate = useNavigate();

  return (
    <section className="quiz-ribbon">
      {/* Decorative floating particles */}
      <div className="qr-particle qr-p1">✦</div>
      <div className="qr-particle qr-p2">✦</div>
      <div className="qr-particle qr-p3">✦</div>

      <div className="quiz-ribbon-content">
        {/* Left: Badge + Text */}
        <div className="quiz-ribbon-left">
          <div className="quiz-ribbon-badge">
            <Sparkles size={14} className="badge-icon" />
            <span>FREE SKIN ANALYSIS</span>
          </div>

          <h2 className="quiz-ribbon-heading">
            Not sure , which{' '}
            <span className="highlight-text">skin care routine</span>{' '}
            matches your skin?
          </h2>

          <p className="quiz-ribbon-sub">
            Take our 5-minute quiz and get your personalised routine →
          </p>
        </div>

        {/* Right: Image + CTA */}
        <div className="quiz-ribbon-right">
          <div className="quiz-ribbon-img-wrapper">
            <img src="/images/quiz-hero-girl.png" alt="Skin Care Analysis" className="quiz-ribbon-img" />
            <div className="img-ring"></div>
          </div>
          <button
            className="quiz-ribbon-btn desktop-btn"
            onClick={() => { window.scrollTo(0, 0); navigate('/quiz'); }}
          >
            <Star size={15} className="btn-star" />
            <span>Start Your Quiz</span>
            <ArrowRight size={17} className="quiz-btn-arrow" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default QuizRibbon;
