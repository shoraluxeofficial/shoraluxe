import React from 'react';
import { TrendingUp, ShoppingCart, Users, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="admin-page-wrap">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Store Overview</h1>
      </div>

      <div className="admin-dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Revenue', value: '₹4,32,000', icon: <TrendingUp color="#10b981" />, bg: '#ecfdf5' },
          { label: 'Total Orders', value: '184', icon: <ShoppingCart color="#3b82f6" />, bg: '#eff6ff' },
          { label: 'Total Customers', value: '1,209', icon: <Users color="#8b5cf6" />, bg: '#f5f3ff' },
          { label: 'Active Products', value: '8', icon: <Package color="#f59e0b" />, bg: '#fffbeb' }
        ].map((stat, i) => (
          <div key={i} className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: '12px', background: stat.bg }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>{stat.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Quick Actions</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/admin/products" className="admin-btn-primary" style={{ textDecoration: 'none' }}>Manage Products Datatable</Link>
          <button className="admin-btn-primary" style={{ background: '#f3f4f6', color: '#111' }}>Launch Marketing Email</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
