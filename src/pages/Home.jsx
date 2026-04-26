import React, { Suspense, lazy } from 'react';
import Hero from '../components/home/Hero/Hero';
import Categories from '../components/home/Categories/Categories';
import QuizRibbon from '../components/home/QuizRibbon/QuizRibbon';

// Lazy load below-the-fold components to improve initial homepage load speed
const Products = lazy(() => import('../components/home/Products/Products'));
import PromoCarousel from '../components/home/PromoCarousel/PromoCarousel';
const Bestsellers = lazy(() => import('../components/home/Bestsellers/Bestsellers'));
const ShopByConcern = lazy(() => import('../components/home/ShopByConcern/ShopByConcern'));
const WatchAndShop = lazy(() => import('../components/home/WatchAndShop/WatchAndShop'));
const VideoBanners = lazy(() => import('../components/home/VideoBanners/VideoBanners'));
const BrandPromise = lazy(() => import('../components/home/BrandPromise/BrandPromise'));
const CTASection = lazy(() => import('../components/home/CTASection/CTASection'));
const Testimonials = lazy(() => import('../components/home/Testimonials/Testimonials'));

const SectionSkeleton = ({ height = '400px' }) => (
  <div style={{ 
    width: '100%', 
    height: height, 
    background: '#fcfaf7', 
    margin: '2rem 0',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div className="skeleton-shimmer" style={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
      animation: 'shimmer 1.5s infinite'
    }}></div>
    <div style={{ color: '#ddd', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase' }}>Loading Excellence...</div>
    <style>{`
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `}</style>
  </div>
);

const Home = () => {
  return (
    <>
      {/* Top of page components load immediately */}
      <Hero />
      <Categories />
      <QuizRibbon />

      {/* Below the fold components load asynchronously with reserved space */}
      <Suspense fallback={<SectionSkeleton height="600px" />}>
        <Products />
      </Suspense>

      <PromoCarousel />

      <Suspense fallback={<SectionSkeleton height="700px" />}>
        <Bestsellers />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="500px" />}>
        <ShopByConcern />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="450px" />}>
        <WatchAndShop />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="300px" />}>
        <VideoBanners />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="200px" />}>
        <BrandPromise />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="400px" />}>
        <CTASection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="500px" />}>
        <Testimonials />
      </Suspense>
    </>
  );
};

export default Home;
