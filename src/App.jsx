import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

// Lazy loading all pages to dramatically reduce initial bundle size & speed up load time
const UserLayout = lazy(() => import('./pages/UserLayout/UserLayout'));
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail/ProductDetail'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const QuizSection = lazy(() => import('./components/home/QuizSection/QuizSection'));
const OrderTracking = lazy(() => import('./pages/OrderTracking/OrderTracking'));
const UserLogin = lazy(() => import('./pages/UserLogin/UserLogin'));
const MyOrders = lazy(() => import('./pages/MyOrders/MyOrders'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const About = lazy(() => import('./pages/About/About'));
const Policies = lazy(() => import('./pages/Legal/Policies'));
const TermsConditions = lazy(() => import('./pages/Legal/TermsConditions'));
const TermsService = lazy(() => import('./pages/Legal/TermsService'));
const Blogs = lazy(() => import('./pages/Blogs/Blogs'));

const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/Admin/ProductsList/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/Admin/Orders/AdminOrders'));
const AdminBanners = lazy(() => import('./pages/Admin/Banners/AdminBanners'));
const AdminReviews = lazy(() => import('./pages/Admin/Reviews/AdminReviews'));
const AdminUsers = lazy(() => import('./pages/Admin/Users/AdminUsers'));
const AdminSettings = lazy(() => import('./pages/Admin/Settings/AdminSettings'));
const AdminHomepage = lazy(() => import('./pages/Admin/Homepage/HomepageManager'));
const AdminRevenue = lazy(() => import('./pages/Admin/Revenue/AdminRevenue'));
const AdminSecurity = lazy(() => import('./pages/Admin/Security/AdminSecurity'));
const AdminLogin = lazy(() => import('./pages/Admin/Login/AdminLogin'));
const AdminPromoCodes = lazy(() => import('./pages/Admin/PromoCodes/AdminPromoCodes'));
const AdminCombos = lazy(() => import('./pages/Admin/Combos/AdminCombos'));
const AdminNewsletter = lazy(() => import('./pages/Admin/Newsletter/AdminNewsletter'));


// Guard component preventing unauthorized access to the admin panel
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('shoraluxe_admin_auth') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }
  return children;
};

// Premium Page Loader for Shoraluxe
const PageLoader = () => (
  <div className="premium-loader-container">
    <div className="loader-content">
      <div className="logo-pulse-wrap">
        <img src="/Logo.png" alt="Shoraluxe Logo" className="loader-logo" />
        <div className="loader-ring"></div>
      </div>
      <div className="loader-text">
        <span className="shimmer-text">SHORALUXE</span>
      </div>
    </div>
    <style>{`
      .premium-loader-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #ffffff;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }
      .loader-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px;
      }
      .logo-pulse-wrap {
        position: relative;
        width: 120px;
        height: 120px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .loader-logo {
        width: 80px;
        height: auto;
        z-index: 2;
        animation: logoPulse 2s ease-in-out infinite;
      }
      .loader-ring {
        position: absolute;
        width: 100%;
        height: 100%;
        border: 2px solid transparent;
        border-top-color: #731930; /* Burgundy */
        border-right-color: #c5a028; /* Gold */
        border-radius: 50%;
        animation: spinRing 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        box-shadow: 0 0 15px rgba(115, 25, 48, 0.1);
      }
      .loader-text {
        font-family: 'Playfair Display', serif;
        font-size: 14px;
        letter-spacing: 6px;
        color: #731930;
        font-weight: 700;
        opacity: 0.8;
      }
      .shimmer-text {
        background: linear-gradient(
          to right, 
          #731930 20%, 
          #c5a028 40%, 
          #c5a028 60%, 
          #731930 80%
        );
        background-size: 200% auto;
        color: transparent;
        -webkit-background-clip: text;
        background-clip: text;
        animation: textShimmer 3s linear infinite;
      }
      @keyframes logoPulse {
        0%, 100% { transform: scale(0.95); opacity: 0.8; }
        50% { transform: scale(1.05); opacity: 1; }
      }
      @keyframes spinRing {
        to { transform: rotate(360deg); }
      }
      @keyframes textShimmer {
        to { background-position: 200% center; }
      }
    `}</style>
  </div>
);

import SEO from './components/SEO/SEO';

function App() {
  return (
    <Router>
      <SEO />
      <div className="app-container">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* USER STOREFRONT ROUTES */}
            <Route path="/" element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="campaign" element={<Shop />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="account" element={<UserLogin />} />
              <Route path="my-orders" element={<MyOrders />} />
              <Route path="track-order" element={<OrderTracking />} />
              <Route path="quiz" element={<QuizSection />} />
              <Route path="contact" element={<Contact />} />
              <Route path="about" element={<About />} />
              <Route path="policies" element={<Policies />} />
              <Route path="terms-conditions" element={<TermsConditions />} />
              <Route path="terms-service" element={<TermsService />} />
              <Route path="blogs" element={<Blogs />} />
            </Route>

            {/* SECURE ADMIN LOGIN */}
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* PROTECTED ADMIN MANAGEMENT ROUTES */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="revenue" element={<AdminRevenue />} />
              <Route path="security" element={<AdminSecurity />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="homepage" element={<AdminHomepage />} />
              <Route path="promo-codes" element={<AdminPromoCodes />} />
              <Route path="combos" element={<AdminCombos />} />
              <Route path="newsletter" element={<AdminNewsletter />} />

            </Route>
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
