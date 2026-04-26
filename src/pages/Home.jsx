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

const SectionLoader = () => (
  <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
    <div style={{ width: '30px', height: '30px', border: '2px solid #eee', borderTopColor: '#6d0e2c', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
  </div>
);

const Home = () => {
  return (
    <>
      {/* Top of page components load immediately */}
      <Hero />
      <Categories />
      <QuizRibbon />

      {/* Below the fold components load asynchronously */}
      <Suspense fallback={<SectionLoader />}>
        <Products />
        <PromoCarousel />
        <Bestsellers />
        <ShopByConcern />
        <WatchAndShop />
        <VideoBanners />
        <BrandPromise />
        <CTASection />
        <Testimonials />
      </Suspense>
    </>
  );
};

export default Home;
