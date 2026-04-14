import React, { useState } from 'react';
import { 
  ArrowRight, ArrowLeft, Droplet, Sun, Clock, AlertCircle, Sparkles, 
  ShoppingBag, CloudRain, Flame, Activity, Cloud, Star, Target, Shield, Heart, Moon 
} from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import './QuizSection.css';

const QUIZ_QUESTIONS = [
  {
    step: 1,
    title: "Skin Type Check",
    icon: <Droplet size={20} />,
    questions: [
      {
        id: 'q1',
        text: "How does your skin feel most of the time?",
        options: [
          { label: "Oily & Shiny", value: "Oily", icon: <Flame size={24}/> },
          { label: "Dry or Flaky", value: "Dry", icon: <CloudRain size={24}/> },
          { label: "Combination", value: "Combination", icon: <Activity size={24}/> },
          { label: "Normal & Balanced", value: "Normal", icon: <Sun size={24}/> }
        ]
      },
      {
        id: 'q2',
        text: "How does your skin react after washing?",
        options: [
          { label: "Becomes tight", value: "Dry", icon: <Target size={24}/> },
          { label: "Gets oily quickly", value: "Oily", icon: <Flame size={24}/> },
          { label: "Feels perfectly fine", value: "Normal", icon: <Heart size={24}/> },
          { label: "Dry spots, oily T-zone", value: "Combination", icon: <Activity size={24}/> }
        ]
      }
    ]
  },
  {
    step: 2,
    title: "Skin Concerns",
    icon: <AlertCircle size={20} />,
    questions: [
      {
        id: 'q3',
        text: "What is your biggest skin concern?",
        options: [
          { label: "Acne / Breakouts", value: "Acne", icon: <AlertCircle size={24}/> },
          { label: "Pigmentation / Dark spots", value: "Pigmentation", icon: <Target size={24}/> },
          { label: "Dullness / Uneven tone", value: "Dullness", icon: <Sparkles size={24}/> },
          { label: "Fine lines / Early aging", value: "Aging", icon: <Clock size={24}/> },
          { label: "Sensitivity / Redness", value: "Sensitivity", icon: <Shield size={24}/> }
        ]
      },
      {
        id: 'q4',
        text: "How long have you had this concern?",
        options: [
          { label: "Less than 3 months", value: "Short-term", icon: <AlertCircle size={24}/> },
          { label: "3–12 months", value: "Medium-term", icon: <Clock size={24}/> },
          { label: "Over a year", value: "Long-term", icon: <Target size={24}/> }
        ]
      }
    ]
  },
  {
    step: 3,
    title: "Environment",
    icon: <Sun size={20} />,
    questions: [
      {
        id: 'q5',
        text: "How much time do you spend outdoors?",
        options: [
          { label: "Mostly indoors", value: "Indoors", icon: <Cloud size={24}/> },
          { label: "1–2 hours daily", value: "Moderate", icon: <Sun size={24}/> },
          { label: "3+ hours daily", value: "High exposure", icon: <Flame size={24}/> }
        ]
      },
      {
        id: 'q6',
        text: "What best describes your climate?",
        options: [
          { label: "Hot & humid", value: "Humid", icon: <Droplet size={24}/> },
          { label: "Hot & dry", value: "Dry", icon: <Sun size={24}/> },
          { label: "Cold or mixed", value: "Mixed", icon: <CloudRain size={24}/> }
        ]
      }
    ]
  },
  {
    step: 4,
    title: "Habits",
    icon: <Clock size={20} />,
    questions: [
      {
        id: 'q7',
        text: "How much sleep do you get?",
        options: [
          { label: "Less than 6 hours", value: "Low", icon: <Moon size={24}/> },
          { label: "6–8 hours", value: "Optimal", icon: <Star size={24}/> },
          { label: "More than 8 hours", value: "High", icon: <Heart size={24}/> }
        ]
      },
      {
        id: 'q8',
        text: "How often do you follow a routine?",
        options: [
          { label: "Daily", value: "Consistent", icon: <Sparkles size={24}/> },
          { label: "A few times a week", value: "Occasional", icon: <Clock size={24}/> },
          { label: "Rarely / Never", value: "Rare", icon: <AlertCircle size={24}/> }
        ]
      }
    ]
  }
];

const QuizSection = () => {
  const { products, addToCart, cartItems, updateQuantity, removeFromCart, setIsCartOpen } = useShop();

  const [viewState, setViewState] = useState('start');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const startQuiz = () => setViewState('quiz');

  const activeStep = QUIZ_QUESTIONS[currentStepIndex];
  const activeQuestion = activeStep?.questions[currentQIndex];

  const totalQuestions = QUIZ_QUESTIONS.reduce((acc, step) => acc + step.questions.length, 0);
  const questionsAnswered = Object.keys(answers).length;
  const progressPercent = (questionsAnswered / totalQuestions) * 100;
  const isFinished = questionsAnswered === totalQuestions;

  const handleSelectOption = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQIndex < activeStep.questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else if (currentStepIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setCurrentQIndex(0);
    }
  };

  const goBack = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    } else if (currentStepIndex > 0) {
      const prevStepIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevStepIdx);
      setCurrentQIndex(QUIZ_QUESTIONS[prevStepIdx].questions.length - 1);
    } else {
      setViewState('start');
    }
  };

  // Live calculation based on CURRENT answers
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
      const found = products.find(p => p.title.toLowerCase().includes(keyword.toLowerCase()));
      if (found) recommendedProducts.push(found);
    };

    if (typeDecided || primaryConcern) {
      if (primaryConcern === 'Acne' || finalSkinType === 'Oily') {
        addProduct('Salicylic Acid Face Wash');
      } else if (primaryConcern === 'Dullness') {
        addProduct('Vitamin C Ubtan Face Wash');
      } else if (finalSkinType === 'Dry') {
        addProduct('Hyaluronic Acid Hydrating gel Face wash');
      } else {
        addProduct('Rice Water Face Wash');
      }
    }

    if (primaryConcern === 'Pigmentation' || primaryConcern === 'Dullness') {
      addProduct('Vitamin C & Niacinamide');
    }

    if (typeDecided) {
      if (finalSkinType === 'Oily' || finalSkinType === 'Combination') {
        addProduct('Non-Sticky Moisturizer');
      } else {
        addProduct('Brightening day cream');
      }
    }

    if (answers.q5) {
      addProduct('Sunscreen Cream SPF 50');
    }

    if (primaryConcern === 'Aging' || primaryConcern === 'Pigmentation' || (answers.q8 && answers.q8 !== 'Sensitive')) {
      if (primaryConcern !== 'Sensitivity') {
         addProduct('Retinol Night cream');
      }
    }

    recommendedProducts = [...new Set(recommendedProducts)];

    return { 
      skinType: typeDecided ? finalSkinType : 'Evaluating...', 
      concern: primaryConcern ? primaryConcern : 'Evaluating...', 
      products: recommendedProducts 
    };
  };

  const handleAddAllToCart = (recommendedProds) => {
    recommendedProds.forEach(p => addToCart(p, 1));
    setIsCartOpen(true);
  };

  if (viewState === 'start') {
    return (
      <section className="quiz-landing-sec">
        <div className="ql-container">
          <div className="ql-content">
            <span className="glow-badge"><Sparkles size={14}/> Live AI Analysis</span>
            <h2>Build Your Perfect Routine, Instantly.</h2>
            <p>Answer a few quick questions. Watch your personalized Shoraluxe product stack build itself in real-time as we analyze your unique skin profile.</p>
            <button className="q-start-btn pulse-glow" onClick={startQuiz}>
              Start Matchmaker <ArrowRight size={20} />
            </button>
          </div>
          <div className="ql-image-wrap">
            <div className="ql-glow-circle"></div>
            <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600" alt="Shora Luxe Mode" />
            
            {/* Visual flair floating cards */}
            <div className="floating-flair f1"><Droplet size={20}/> Hydration</div>
            <div className="floating-flair f2"><Sparkles size={20}/> Clarity</div>
          </div>
        </div>
      </section>
    );
  }

  const { skinType, concern, products: liveProducts } = calculateLiveResults();

  return (
    <section className="quiz-split-layout">
      {/* Premium Background Orbs */}
      <div className="quiz-ambient-orb orb-1"></div>
      <div className="quiz-ambient-orb orb-2"></div>
      
      {/* LEFT TIER - THE QUIZ FORM */}
      <div className="quiz-split-left">
        <div className="quiz-top-bar small">
          <button className="q-back-btn" onClick={goBack} disabled={isFinished}><ArrowLeft size={16} /> Back</button>
          <div className="q-progress-wrap">
            <div className="q-progress-text">Step {currentStepIndex + 1} of 4: <span>{activeStep.title}</span></div>
            <div className="q-progress-bar">
              <div className="q-progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        {!isFinished ? (
          <div className="quiz-question-container compact slide-in-top">
            <div className="q-step-indicator">
              <div className="q-step-icon large">{activeStep.icon}</div>
            </div>
            
            <h3 className="q-question-text dynamic-glow">{activeQuestion.text}</h3>
            
            <div className="q-options-grid visual-tiles">
              {activeQuestion.options.map((opt, idx) => {
                const isSelected = answers[activeQuestion.id] === opt.value;
                return (
                  <button 
                    key={idx} 
                    className={`q-visual-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(activeQuestion.id, opt.value)}
                  >
                    <div className="q-visual-icon-wrap">
                      {opt.icon}
                    </div>
                    <span className="q-visual-label">{opt.label}</span>
                    <div className="q-visual-check"></div>
                  </button>
                )
              })}
            </div>

            {answers[activeQuestion.id] && (
              <div className="q-next-action slide-in-top">
                <button className="q-next-btn pulse-glow" onClick={handleNext}>
                  {currentStepIndex === QUIZ_QUESTIONS.length - 1 && currentQIndex === activeStep.questions.length - 1 ? 'Finish' : 'Continue'} <ArrowRight size={18} />
                </button>
              </div>
            )}

          </div>
        ) : (
          <div className="quiz-finished-box slide-in-bottom">
            <Sparkles size={48} color="#907253" className="spin-icon-slow" />
            <h2 className="dynamic-glow">Analysis Complete!</h2>
            <p>Your personalized Indian skin profile has been locked in. Your perfect skincare regimen is waiting in the panel.</p>
            <button className="qr-retake mt-4" onClick={() => {setAnswers({}); setCurrentStepIndex(0); setCurrentQIndex(0);}}>
              Retake Quiz
            </button>
          </div>
        )}
      </div>

      {/* RIGHT TIER - LIVE RECOMMENDATIONS */}
      <div className="quiz-split-right">
        <div className="live-results-panel">
          <div className="lr-header">
            <h3>Your Routine Matches</h3>
            <span className="live-pulse">● Live</span>
          </div>

          <div className="lr-profile-tags">
            <div className="lr-tag">
              <Droplet size={14}/> {skinType}
            </div>
            <div className="lr-tag">
              <AlertCircle size={14}/> {concern.replace('-term', '')} Focus
            </div>
          </div>

          <div className="lr-products-feed">
            {liveProducts.length === 0 ? (
              <div className="lr-empty-state visual-empty">
                <Shield size={40} className="pulse-opacity" color="#cbd5e1" />
                <p>Awaiting data...<br/>Your routine will appear here.</p>
              </div>
            ) : (
              liveProducts.map((prod, idx) => {
                const cartItem = cartItems.find(item => item.id === prod.id);
                const qty = cartItem ? cartItem.quantity : 0;
                
                return (
                  <div className="lr-prod-card slide-in-right visual-card" key={idx} style={{animationDelay: `${idx * 0.1}s`}}>
                    <img src={prod.gallery?.[0] || prod.img} alt={prod.title} />
                    <div className="lr-det">
                      <h4>{prod.title.split('|')[0]}</h4>
                      <span>₹{prod.price}</span>
                    </div>
                    {qty === 0 ? (
                      <button className="lr-add-btn" onClick={() => { addToCart(prod, 1); setIsCartOpen(true); }}>
                        Add
                      </button>
                    ) : (
                      <div className="lr-qty-controls">
                        <button onClick={() => {
                          if (qty === 1) removeFromCart(prod.id);
                          else updateQuantity(prod.id, qty - 1);
                        }}>-</button>
                        <span>{qty}</span>
                        <button onClick={() => updateQuantity(prod.id, qty + 1)}>+</button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {isFinished && liveProducts.length > 0 && (
            <div className="lr-footer slide-in-bottom">
              <button className="qr-cta-btn primary full pulse-glow" onClick={() => handleAddAllToCart(liveProducts)}>
                <ShoppingBag size={18}/> Claim Full Routine
              </button>
            </div>
          )}
        </div>
      </div>

    </section>
  );
};

export default QuizSection;
