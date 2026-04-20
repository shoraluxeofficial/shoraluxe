import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useNotify } from '../../../components/common/Notification/Notification';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Image as ImageIcon,
  MessageSquare,
  ClipboardList,
  IndianRupee,
  ShieldCheck,
  Home as HomeIcon
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notify } = useNotify();

  const handleLogout = () => {
    notify('Are you sure you want to sign out?', 'confirm', {
      onConfirm: () => {
        localStorage.removeItem('shoraluxe_admin_auth');
        navigate('/admin-login');
      }
    });
  };

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/products', icon: <ShoppingBag size={20} />, label: 'Products' },
    { path: '/admin/orders', icon: <ClipboardList size={20} />, label: 'Orders' },
    { path: '/admin/revenue', icon: <IndianRupee size={20} />, label: 'Revenue' },
    { path: '/admin/security', icon: <ShieldCheck size={20} />, label: 'Firewall' },
    { path: '/admin/homepage', icon: <HomeIcon size={20} />, label: 'Home Page CMS' },
    { path: '/admin/reviews', icon: <MessageSquare size={20} />, label: 'Testimonials' },
    { path: '/admin/customers', icon: <Users size={20} />, label: 'Customers' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Store Settings' },
  ];

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-logo-box">
          <h2>SHORALUXE <span>ADMIN</span></h2>
        </div>

        <nav className="admin-nav-menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            className="admin-logout-link"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="admin-main-content">
        <header className="admin-top-header">
          <div className="admin-breadcrumb">
            Central Management System
          </div>
          <div className="admin-user-profile">
            <div className="avatar">A</div>
            <div className="user-info">
              <span className="user-name">Admin User</span>
              <span className="user-role">Super Admin</span>
            </div>
          </div>
        </header>

        <div className="admin-content-scroll">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
