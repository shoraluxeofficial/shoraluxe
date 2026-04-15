import React from 'react';
import Hero from '../components/home/Hero/Hero';
import Categories from '../components/home/Categories/Categories';
import QuizSection from '../components/home/QuizSection/QuizSection';
import Products from '../components/home/Products/Products';
import Bestsellers from '../components/home/Bestsellers/Bestsellers';
import ShopByConcern from '../components/home/ShopByConcern/ShopByConcern';
import WatchAndShop from '../components/home/WatchAndShop/WatchAndShop';
import VideoBanners from '../components/home/VideoBanners/VideoBanners';
import BrandPromise from '../components/home/BrandPromise/BrandPromise';
import CTASection from '../components/home/CTASection/CTASection';
import Testimonials from '../components/home/Testimonials/Testimonials';

const Home = () => {
  return (
    <>
      <Hero />
      <Categories />
      <QuizSection />
      <Products />
      <Bestsellers />
      <ShopByConcern />
      <WatchAndShop />
      <VideoBanners />
      <BrandPromise />
      <CTASection />
      <Testimonials />
    </>
  );
};

export default Home;
