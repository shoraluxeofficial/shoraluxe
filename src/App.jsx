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

// Guard component preventing unauthorized access to the admin panel
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('shoraluxe_admin_auth') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }
  return children;
};

// Simple loading skeleton for fast page transitions
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#fafaf8' }}>
    <div style={{ width: '40px', height: '40px', border: '3px solid #f0f0f0', borderTopColor: '#6d0e2c', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  return (
    <Router>
        <div className="app-container">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* USER STOREFRONT ROUTES */}
              <Route path="/" element={<UserLayout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="quiz" element={<QuizSection />} />
                <Route path="track-order" element={<OrderTracking />} />
                <Route path="account" element={<UserLogin />} />
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
              </Route>
            </Routes>
          </Suspense>
        </div>
      </Router>
  );
}

export default App;
