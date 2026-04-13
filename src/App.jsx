import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './pages/UserLayout/UserLayout';
import AdminLayout from './pages/Admin/AdminLayout/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard';
import AdminProducts from './pages/Admin/ProductsList/AdminProducts';
import AdminOrders from './pages/Admin/Orders/AdminOrders';
import AdminBanners from './pages/Admin/Banners/AdminBanners';
import AdminReviews from './pages/Admin/Reviews/AdminReviews';
import AdminCustomers from './pages/Admin/Customers/AdminCustomers';
import AdminSettings from './pages/Admin/Settings/AdminSettings';
import AdminHomepage from './pages/Admin/Homepage/HomepageManager';
import AdminLogin from './pages/Admin/Login/AdminLogin';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import { ShopProvider } from './context/ShopContext';
import './styles/App.css';

// Guard component preventing unauthorized access to the admin panel
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('shoraluxe_admin_auth') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }
  return children;
};

function App() {
  return (
    <ShopProvider>
      <Router>
        <div className="app-container">
          <Routes>
            {/* USER STOREFRONT ROUTES */}
            <Route path="/" element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="product/:id" element={<ProductDetail />} />
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
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="homepage" element={<AdminHomepage />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </ShopProvider>
  );
}

export default App;
