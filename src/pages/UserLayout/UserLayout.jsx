import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';
import CartSidebar from '../../components/cart/CartSidebar';
import PopupAd from '../../components/common/PopupAd/PopupAd';
import { useShop } from '../../context/ShopContext';

const UserLayout = () => {
  const { pathname } = useLocation();
  const { isCartOpen, setIsCartOpen } = useShop();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="storefront-app">
      <PopupAd />
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <main>
        <Outlet />
      </main>
      <CartSidebar />
      <Footer />
    </div>
  );
};

export default UserLayout;
