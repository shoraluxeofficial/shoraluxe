import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, ArrowLeft, Droplet, Sun, Clock, AlertCircle, Sparkles,
  ShoppingBag, CloudRain, Flame, Activity, Cloud, Star, Target, Shield, Heart, Moon, CheckCircle2, Zap
} from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import { supabase } from '../../../lib/supabase';
import './QuizSection.css';

const QUIZ_QUESTIONS = [
  {
    step: 1, title: "Baseline", icon: <Droplet size={20} />,
    questions: [{
      id: 'q1', text: "How does your skin feel most of the time?",
      options: [
        { label: "Oily & Shiny", value: "Oily", icon: <Flame size={22} />, desc: "Visible shine throughout the day" },
        { label: "Dry or Flaky", value: "Dry", icon: <CloudRain size={22} />, desc: "Feels tight and rough" },
        { label: "Combination", value: "Combination", icon: <Activity size={22} />, desc: "Oily T-zone, dry cheeks" },
        { label: "Normal & Balanced", value: "Normal", icon: <Sun size={22} />, desc: "Comfortable and even" }
      ]
    }]
  },
  {
    step: 2, title: "Post-Cleansing", icon: <Droplet size={20} />,
    questions: [{
      id: 'q2', text: "How does your skin react after washing?",
      options: [
        { label: "Becomes tight", value: "Dry", icon: <Target size={22} />, desc: "Feels stripped and dry" },
        { label: "Gets oily quickly", value: "Oily", icon: <Flame size={22} />, desc: "Shine returns in minutes" },
        { label: "Feels perfectly fine", value: "Normal", icon: <Heart size={22} />, desc: "No discomfort at all" },
        { label: "Dry spots, oily T-zone", value: "Combination", icon: <Activity size={22} />, desc: "Mixed feeling across face" }
      ]
    }]
  },
  {
    step: 3, title: "Primary Focus", icon: <AlertCircle size={20} />,
    questions: [{
      id: 'q3', text: "What is your biggest skin concern?",
      options: [
        { label: "Acne / Breakouts", value: "Acne", icon: <AlertCircle size={22} />, desc: "Pimples, cysts, blackheads" },
        { label: "Pigmentation", value: "Pigmentation", icon: <Target size={22} />, desc: "Dark spots, uneven tone" },
        { label: "Dullness", value: "Dullness", icon: <Sparkles size={22} />, desc: "Lack of radiance & glow" },
        { label: "Fine lines / Aging", value: "Aging", icon: <Clock size={22} />, desc: "Early signs of aging" },
        { label: "Sensitivity", value: "Sensitivity", icon: <Shield size={22} />, desc: "Redness, irritation" }
      ]
    }]
  },
  {
    step: 4, title: "History", icon: <AlertCircle size={20} />,
    questions: [{
      id: 'q4', text: "How long have you had this concern?",
      options: [
        { label: "Less than 3 months", value: "Short-term", icon: <AlertCircle size={22} />, desc: "Recently developed" },
        { label: "3–12 months", value: "Medium-term", icon: <Clock size={22} />, desc: "Persisting for a while" },
        { label: "Over a year", value: "Long-term", icon: <Target size={22} />, desc: "Long-standing issue" }
      ]
    }]
  },
  {
    step: 5, title: "Exposure", icon: <Sun size={20} />,
    questions: [{
      id: 'q5', text: "How much time do you spend outdoors?",
      options: [
        { label: "Mostly indoors", value: "Indoors", icon: <Cloud size={22} />, desc: "Work from home / indoors" },
        { label: "1–2 hours daily", value: "Moderate", icon: <Sun size={22} />, desc: "Moderate sun exposure" },
        { label: "3+ hours daily", value: "High exposure", icon: <Flame size={22} />, desc: "Heavy sun exposure" }
      ]
    }]
  },
  {
    step: 6, title: "Environment", icon: <Sun size={20} />,
    questions: [{
      id: 'q6', text: "What best describes your climate?",
      options: [
        { label: "Hot & humid", value: "Humid", icon: <Droplet size={22} />, desc: "Mumbai, Chennai, Kolkata" },
        { label: "Hot & dry", value: "Dry", icon: <Sun size={22} />, desc: "Delhi, Rajasthan, Gujarat" },
        { label: "Cold or mixed", value: "Mixed", icon: <CloudRain size={22} />, desc: "Hills, Bangalore, Pune" }
      ]
    }]
  },
  {
    step: 7, title: "Regeneration", icon: <Clock size={20} />,
    questions: [{
      id: 'q7', text: "How much sleep do you get?",
      options: [
        { label: "Less than 6 hours", value: "Low", icon: <Moon size={22} />, desc: "Sleep deprived" },
        { label: "6–8 hours", value: "Optimal", icon: <Star size={22} />, desc: "Well rested" },
        { label: "More than 8 hours", value: "High", icon: <Heart size={22} />, desc: "Plenty of rest" }
      ]
    }]
  },
  {
    step: 8, title: "Consistency", icon: <Clock size={20} />,
    questions: [{
      id: 'q8', text: "How often do you follow a skincare routine?",
      options: [
        { label: "Daily", value: "Consistent", icon: <Sparkles size={22} />, desc: "Never miss a day" },
        { label: "A few times a week", value: "Occasional", icon: <Clock size={22} />, desc: "Try to stay consistent" },
        { label: "Rarely / Never", value: "Rare", icon: <AlertCircle size={22} />, desc: "Just starting out" }
      ]
    }]
  }
];

const STEP_TITLES = ['Identifying Type', 'Analyzing Barrier', 'Defining Focus', 'Concern Depth', 'UV Exposure', 'Climatic Impact', 'Cellular Repair', 'Routine Habit'];

const QuizSection = () => {
  const { products, addToCart, cartItems, updateQuantity, removeFromCart, setIsCartOpen } = useShop();
  const [viewState, setViewState] = useState('start');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [viewState, currentStepIndex]);

  const startQuiz = () => setViewState('quiz');

  const activeStep = QUIZ_QUESTIONS[currentStepIndex];

  const handleSelectOption = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));

    // Auto-advance after a short delay so the user sees their selection
    setTimeout(() => {
      if (currentStepIndex < QUIZ_QUESTIONS.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        setViewState('analyzing');
        runAnalyzeSequence();
      }
    }, 450);
  };

  const handleNext = () => {
    if (currentStepIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setViewState('analyzing');
      runAnalyzeSequence();
    }
  };

  const runAnalyzeSequence = () => {
    setAnalyzeStep(0);
    const steps = [0, 1, 2, 3, 4];
    steps.forEach((s, i) => {
      setTimeout(() => {
        setAnalyzeStep(i + 1);
        if (i === steps.length - 1) {
          setTimeout(() => setViewState('results'), 700);
        }
      }, 600 + i * 700);
    });
  };

  const goBack = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
    else setViewState('start');
  };

  const calculateLiveResults = () => {
    const typeAnswers = [answers.q1, answers.q2];
    let finalSkinType = 'Normal';
    if (typeAnswers.includes('Oily') && !typeAnswers.includes('Dry')) finalSkinType = 'Oily';
    if (typeAnswers.includes('Dry') && !typeAnswers.includes('Oily')) finalSkinType = 'Dry';
    if (answers.q1 === 'Combination' || answers.q2 === 'Combination') finalSkinType = 'Combination';
    const typeDecided = answers.q1 || answers.q2;
    const primaryConcern = answers.q3;
    let recommendedProducts = [];
    const addProduct = (keyword) => {
      if (!products || products.length === 0) return;
      const found = products.find(p => p.title.toLowerCase().includes(keyword.toLowerCase()));
      if (found) recommendedProducts.push(found);
    };
    if (typeDecided || primaryConcern) {
      if (primaryConcern === 'Acne' || finalSkinType === 'Oily') addProduct('Salicylic Acid Face Wash');
      else if (primaryConcern === 'Dullness') addProduct('Vitamin C Ubtan Face Wash');
      else if (finalSkinType === 'Dry') addProduct('Hyaluronic Acid Hydrating gel Face wash');
      else addProduct('Rice Water Face Wash');
    }
    if (primaryConcern === 'Pigmentation' || primaryConcern === 'Dullness') addProduct('Vitamin C & Niacinamide');
    if (typeDecided) {
      if (finalSkinType === 'Oily' || finalSkinType === 'Combination') addProduct('Non-Sticky Moisturizer');
      else addProduct('Brightening day cream');
    }
    if (answers.q5) addProduct('Sunscreen Cream SPF 50');
    if (primaryConcern === 'Aging' || primaryConcern === 'Pigmentation' || (answers.q8 && answers.q8 !== 'Sensitive')) {
      if (primaryConcern !== 'Sensitivity') addProduct('Retinol Night cream');
    }
    recommendedProducts = [...new Set(recommendedProducts)];
    return {
      skinType: typeDecided ? finalSkinType : 'Evaluating...',
      concern: primaryConcern ? primaryConcern : 'Evaluating...',
      products: recommendedProducts
    };
  };

  const handleAddAllToCart = (prods) => {
    prods.forEach(p => addToCart(p, 1));
    setIsCartOpen(true);
  };

  const toggleProductSelection = (prodId) => {
    setSelectedProductIds(prev =>
      prev.includes(prodId) ? prev.filter(id => id !== prodId) : [...prev, prodId]
    );
  };

  const handleAddSelectedToCart = (prods) => {
    const selected = prods.filter(p => selectedProductIds.includes(p.id));
    if (selected.length === 0) return;
    selected.forEach(p => addToCart(p, 1));
    setIsCartOpen(true);
  };
  const { skinType, concern, products: liveProducts } = calculateLiveResults();

  // Init all selected when results first render
  useEffect(() => {
    if (viewState === 'results' && liveProducts.length > 0) {
      setSelectedProductIds(liveProducts.map(p => p.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewState]);

  /* ─── START ─── */
  if (viewState === 'start') {
    return (
      <section className="qs-start">
        {/* Background orbs */}
        <div className="qs-orb qs-orb--1" />
        <div className="qs-orb qs-orb--2" />
        <div className="qs-orb qs-orb--3" />

        <div className="qs-start-inner">
          {/* Left content */}
          <div className="qs-start-left">
            <span className="qs-eyebrow">
              <Zap size={12} /> INTRODUCING THE RADIANCE ANALYST
            </span>
            <h1 className="qs-start-h1">
              <span style={{ color: 'var(--brand-burgundy, #900b3b)' }}>Discover Your Glow:</span><br />
              <em>The Personalized Skin Quiz For Gen Z Indian Skin</em>
            </h1>
            <p className="qs-start-desc">
              Answer 8 quick questions. Our algorithm analyzes your skin type, environment, lifestyle &amp; concerns to build a bespoke ritual — in under 3 minutes.
            </p>

            <button className="qs-cta-btn" onClick={startQuiz}>
              <span>Start The Quiz</span>
              <ArrowRight size={18} />
            </button>

            <div className="qs-social-row">
              <div className="qs-avatars">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=face" alt="u1" />
                <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=60&h=60&fit=crop&crop=face" alt="u2" />
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face" alt="u3" />
                <div className="qs-avatar-more">+12k</div>
              </div>
              <span>Glowing faces already matched</span>
            </div>

            {/* Stat cards */}
            <div className="qs-stat-row">
              {[
                { icon: <Zap size={16} />, val: '3 Min', label: 'Analysis' },
                { icon: <Shield size={16} />, val: 'Derm', label: 'Validated' },
                { icon: <Star size={16} />, val: '98%', label: 'Satisfaction' },
              ].map((s, i) => (
                <div className="qs-stat-card" key={i} style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
                  <div className="qs-stat-icon">{s.icon}</div>
                  <div>
                    <strong>{s.val}</strong>
                    <span>{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right image + floating cards */}
          <div className="qs-start-right">
            <div className="qs-hero-img-wrap">
              <img
                src="/images/quiz-hero-girl.png"
                alt="Skin Analysis"
                className="qs-hero-img"
              />
              <div className="qs-img-glow" />

              {/* Floating card 1 — bottom left */}
              <div className="qs-float-card qs-float-card--bl">
                <div className="qs-float-dot" />
                <div>
                  <strong>Heritage × Science</strong>
                  <span>Ancestral remedies meet modern actives</span>
                </div>
              </div>

              {/* Floating card 2 — top right */}
              <div className="qs-float-card qs-float-card--tr">
                <Sparkles size={14} className="qs-float-sparkle" />
                <div>
                  <strong>Live Results</strong>
                  <span>Profile builds as you answer</span>
                </div>
              </div>
            </div>

            {/* Feature cards below image */}
            <div className="qs-feat-cards">
              <div className="qs-feat-card qs-feat-card--dark">
                <Sparkles size={24} />
                <h4>3-Min Quiz</h4>
                <p>Fast & precise</p>
              </div>
              <div className="qs-feat-card qs-feat-card--cream">
                <Shield size={24} />
                <h4>Derm Backed</h4>
                <p>Expert validated</p>
              </div>
              <div className="qs-feat-card qs-feat-card--light">
                <Target size={24} />
                <h4>Indian Climate</h4>
                <p>Built for your city</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ─── QUIZ ─── */
  if (viewState === 'quiz') {
    const discoverImg = (keywords, fallback) => {
      const found = products?.find(p => keywords.some(k => p.title.toLowerCase().includes(k.toLowerCase())));
      return found?.img || found?.gallery?.[0] || fallback;
    };
    const RIGHT_IMGS = [
      discoverImg(['wash', 'cleanser'], "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600"),
      discoverImg(['essence', 'water', 'toner'], "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=600"),
      discoverImg(['vitamin c', 'niacinamide', 'serum'], "https://images.unsplash.com/photo-1620916566398-39f1143af7be?q=80&w=600"),
      discoverImg(['retinol', 'night'], "https://images.unsplash.com/photo-1594125355955-388e633f576c?q=80&w=600"),
      discoverImg(['sunscreen', 'spf'], "https://images.unsplash.com/photo-1552046122-03184de85e08?q=80&w=600"),
      discoverImg(['day cream', 'moisturizer'], "https://images.unsplash.com/photo-1570191047585-e24635293482?q=80&w=600"),
      discoverImg(['night cream', 'repair'], "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=600"),
      products?.[0]?.img || "https://images.unsplash.com/photo-1616671285410-0937a3424168?q=80&w=600",
    ];
    const RIGHT_QUOTES = [
      '"The foundation of great skin is a clean canvas."',
      '"Post-wash behavior reveals your barrier health."',
      '"We target the cellular root of your concerns."',
      '"Long-term issues need deep, sustained repair."',
      '"Protection from UV is non-negotiable."',
      '"Your climate defines your moisturizer texture."',
      '"Sleep is when skin regeneration peaks."',
      '"The best routine is one you actually follow."',
    ];

    const progress = ((currentStepIndex + 1) / QUIZ_QUESTIONS.length) * 100;
    const canContinue = activeStep.questions.every(q => answers[q.id]);

    return (
      <section className="qs-quiz">
        {/* Top progress bar */}
        <div className="qs-top-bar">
          <div className="qs-top-progress" style={{ width: `${progress}%` }} />
        </div>

        <div className="qs-quiz-inner">
          {/* LEFT — questions */}
          <div className="qs-quiz-left">
            <div className="qs-quiz-header">
              <button className="qs-back-btn" onClick={goBack}>
                <ArrowLeft size={16} /> Back
              </button>
              <div className="qs-step-pill">
                Step {currentStepIndex + 1} of {QUIZ_QUESTIONS.length}
              </div>
              <div className="qs-pct">{Math.round(progress)}%</div>
            </div>

            <div className="qs-q-content qs-slide-in" key={currentStepIndex}>
              <div className="qs-q-eyebrow">{activeStep.title.toUpperCase()}</div>
              <h2 className="qs-q-title">{STEP_TITLES[currentStepIndex]}</h2>
              <p className="qs-q-text">{activeStep.questions[0].text}</p>

              <div className={`qs-opts-grid ${activeStep.questions[0].options.length > 3 ? 'qs-opts-grid--4' : 'qs-opts-grid--3'}`}>
                {activeStep.questions[0].options.map((opt, i) => {
                  const sel = answers[activeStep.questions[0].id] === opt.value;
                  return (
                    <button
                      key={i}
                      className={`qs-opt ${sel ? 'qs-opt--active' : ''}`}
                      onClick={() => handleSelectOption(activeStep.questions[0].id, opt.value)}
                      style={{ animationDelay: `${i * 0.07}s` }}
                    >
                      <div className="qs-opt-icon-wrap">{opt.icon}</div>
                      <strong className="qs-opt-label">{opt.label}</strong>
                      <span className="qs-opt-desc">{opt.desc}</span>
                      {sel && (
                        <span className="qs-opt-check">
                          <CheckCircle2 size={13} />
                        </span>
                      )}
                      {sel && <span className="qs-opt-ripple" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="qs-quiz-footer">
              <div className="qs-steps-dots">
                {QUIZ_QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`qs-dot ${i < currentStepIndex ? 'qs-dot--done' : i === currentStepIndex ? 'qs-dot--active' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — editorial + step tracker */}
          <div className="qs-quiz-right">
            {/* Step tracker */}
            <div className="qs-right-progress-block">
              <div className="qs-right-progress-label">
                <span className="qs-live-dot" />
                Your Progress
              </div>
              <div className="qs-right-prog-bar">
                <div className="qs-right-prog-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="qs-right-step-list">
                {STEP_TITLES.map((title, i) => {
                  const isDone = i < currentStepIndex;
                  const isActive = i === currentStepIndex;
                  return (
                    <div
                      key={i}
                      className={`qs-right-step-item ${isDone ? 'qs-right-step-item--done' : isActive ? 'qs-right-step-item--active' : ''}`}
                    >
                      <span className="qs-right-step-icon">
                        {isDone ? <CheckCircle2 size={11} /> : i + 1}
                      </span>
                      {title}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Editorial image */}
            <div className="qs-editorial-img-wrap" key={currentStepIndex}>
              <img src={RIGHT_IMGS[currentStepIndex]} alt="editorial" className="qs-editorial-img" />
              <div className="qs-editorial-overlay">
                <p className="qs-editorial-quote">{RIGHT_QUOTES[currentStepIndex]}</p>
                <span className="qs-editorial-author">— SHORALUXE LABS</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ─── ANALYZING ─── */
  if (viewState === 'analyzing') {
    const ANALYZE_LINES = [
      'Reading skin type signals...',
      'Mapping environmental stressors...',
      'Matching active ingredients...',
      'Building your bespoke ritual...',
      'Finalizing prescription...',
    ];
    return (
      <section className="qs-analyzing">
        <div className="qs-orb qs-orb--1" />
        <div className="qs-orb qs-orb--2" />
        <div className="qs-analyzing-box">
          {/* Pulsing ring */}
          <div className="qs-pulse-ring">
            <div className="qs-pulse-inner">
              <svg className="qs-checkmark-svg" viewBox="0 0 52 52">
                <circle className="qs-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="qs-checkmark-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
          </div>

          <h2 className="qs-analyzing-title">Analysis Complete!</h2>
          <p className="qs-analyzing-sub">
            We've matched your unique profile with powerful regimens tailored specifically for you.
          </p>

          {/* Progress lines */}
          <div className="qs-analyze-lines">
            {ANALYZE_LINES.map((line, i) => (
              <div
                key={i}
                className={`qs-analyze-line ${analyzeStep > i ? 'qs-analyze-line--done' : analyzeStep === i ? 'qs-analyze-line--active' : ''}`}
              >
                <span className="qs-analyze-icon">
                  {analyzeStep > i ? <CheckCircle2 size={14} /> : <div className="qs-analyze-spinner" />}
                </span>
                <span>{line}</span>
              </div>
            ))}
          </div>

          <button className="qs-view-results-btn" onClick={() => setViewState('results')}>
            View Your Results <ArrowRight size={18} />
          </button>
        </div>
      </section>
    );
  }
  /* ─── RESULTS ─── */
  const STEP_LABELS = ["Cleanse", "Treat", "Hydrate", "Protect", "Repair"];
  const CARD_COLORS = ['#900b3b', '#6d3bb5', '#1a6fa0', '#0f7a5a', '#c07000'];

  const selectedCount = selectedProductIds.length;
  const selectedValue = liveProducts
    .filter(p => selectedProductIds.includes(p.id))
    .reduce((a, p) => a + (p.price || 0), 0);

  return (
    <section className="qs-results">
      <div className="qs-orb qs-orb--1" />
      <div className="qs-orb qs-orb--2" />

      <div className="qs-results-inner">
        {/* Header */}
        <div className="qs-results-header">
          <span className="qs-eyebrow"><Sparkles size={12} /> PRESCRIPTION READY</span>
          <h2 className="qs-results-title">Your Bespoke<br /><em>Treatment Plan</em></h2>
          <p className="qs-results-sub">
            Based on your <strong>{skinType.toLowerCase()}</strong> skin and <strong>{concern.toLowerCase()}</strong> concern —
            a {liveProducts.length}-step ritual curated for you.
          </p>

          <div className="qs-profile-tags">
            <div className="qs-profile-tag"><Droplet size={13} /> {skinType} Skin</div>
            <div className="qs-profile-tag"><Target size={13} /> {concern.replace('-term', '')} Focus</div>
            <div className="qs-profile-tag"><Activity size={13} /> {liveProducts.length} Steps</div>
          </div>
        </div>

        {/* Selection hint */}
        <div className="qs-select-hint">
          <CheckCircle2 size={15} />
          <span>Tap cards to select / deselect products, then add to cart individually or all at once.</span>
        </div>

        {/* Product cards */}
        <div className="qs-prod-grid">
          {liveProducts.map((prod, idx) => {
            const cartItem = cartItems.find(item => item.id === prod.id);
            const qty = cartItem ? cartItem.quantity : 0;
            const color = CARD_COLORS[idx] || '#900b3b';
            const isSelected = selectedProductIds.includes(prod.id);
            return (
              <div
                key={idx}
                className={`qs-prod-card qs-slide-in-up ${isSelected ? 'qs-prod-card--selected' : ''}`}
                style={{ '--c': color, animationDelay: `${idx * 0.1}s` }}
                onClick={() => toggleProductSelection(prod.id)}
              >
                {/* Selection overlay check */}
                <span className={`qs-prod-select-badge ${isSelected ? 'qs-prod-select-badge--on' : ''}`}>
                  <CheckCircle2 size={15} />
                </span>

                {/* Top accent bar */}
                <div className="qs-prod-bar" style={{ background: color }} />
                {/* Step badge */}
                <div className="qs-prod-badge" style={{ background: color }}>
                  Step 0{idx + 1} · {STEP_LABELS[idx] || 'Ritual'}
                </div>
                {/* Large ghost number */}
                <div className="qs-prod-ghost-num" style={{ color }}>0{idx + 1}</div>

                {/* Image */}
                <div className="qs-prod-img-wrap">
                  <img src={prod.gallery?.[0] || prod.img} alt={prod.title} />
                  <div className="qs-prod-shimmer" />
                </div>

                {/* Details */}
                <div className="qs-prod-body">
                  <p className="qs-prod-category" style={{ color }}>{prod.category || 'Scientifically Formulated'}</p>
                  <h4 className="qs-prod-name">{prod.title.split('|')[0]}</h4>
                  <p className="qs-prod-price">₹{prod.price}</p>

                  {/* Stop card click from propagating on action buttons */}
                  <div className="qs-prod-actions" onClick={e => e.stopPropagation()}>
                    {qty === 0 ? (
                      <button
                        className="qs-add-btn"
                        style={{ '--c': color }}
                        onClick={() => { addToCart(prod, 1); setIsCartOpen(true); }}
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <div className="qs-qty-ctrl">
                        <button onClick={() => { if (qty === 1) removeFromCart(prod.id); else updateQuantity(prod.id, qty - 1); }}>−</button>
                        <span>{qty}</span>
                        <button onClick={() => updateQuantity(prod.id, qty + 1)}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="qs-results-footer">
          {/* Value summary */}
          <div className="qs-footer-values">
            <div className="qs-total-block">
              <span>Selected ({selectedCount} of {liveProducts.length})</span>
              <strong>₹{selectedValue}</strong>
            </div>
            <div className="qs-total-block qs-total-block--muted">
              <span>Full Ritual Value</span>
              <strong>₹{liveProducts.reduce((a, p) => a + (p.price || 0), 0)}</strong>
            </div>
          </div>

          {/* Action buttons */}
          <div className="qs-footer-actions">
            <button
              className={`qs-adopt-btn qs-adopt-btn--selected ${selectedCount === 0 ? 'qs-adopt-btn--disabled' : ''}`}
              onClick={() => handleAddSelectedToCart(liveProducts)}
              disabled={selectedCount === 0}
            >
              <ShoppingBag size={18} />
              Add {selectedCount > 0 ? `${selectedCount} Selected` : 'Selected'} to Cart
            </button>
            <button className="qs-adopt-btn qs-adopt-btn--all" onClick={() => handleAddAllToCart(liveProducts)}>
              <Sparkles size={18} /> Add Full Ritual
            </button>
          </div>

          {/* Select helpers */}
          <div className="qs-footer-links">
            <button className="qs-text-link" onClick={() => setSelectedProductIds(liveProducts.map(p => p.id))}>Select All</button>
            <span className="qs-footer-sep">·</span>
            <button className="qs-text-link" onClick={() => setSelectedProductIds([])}>Deselect All</button>
            <span className="qs-footer-sep">·</span>
            <button className="qs-retake-btn" onClick={() => { setAnswers({}); setCurrentStepIndex(0); setViewState('quiz'); }}>
              <Activity size={14} /> Re-Calculate
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuizSection;
