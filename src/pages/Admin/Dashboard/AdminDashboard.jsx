import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, Users, Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShop } from '../../../context/ShopContext';
import { supabase } from '../../../lib/supabase';

const AdminDashboard = () => {
  const { products } = useShop();
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, total_amount, payment_status, customer_name, customer_phone, order_status, placed_at')
          .order('placed_at', { ascending: false });

        if (!ordersError && ordersData) {
          const totalRevenue = ordersData
            .filter(o => o.payment_status === 'paid')
            .reduce((sum, o) => sum + (o.total_amount || 0), 0);
          
          const uniqueCustomers = new Set(ordersData.map(o => o.customer_phone)).size;

          setStats({
            revenue: totalRevenue,
            orders: ordersData.length,
            customers: uniqueCustomers
          });
          
          setRecentOrders(ordersData.slice(0, 5)); // Just the 5 most recent
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="admin-page-wrap">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Store Overview</h1>
      </div>

      <div className="admin-dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Revenue', value: loading ? '...' : `₹${stats.revenue.toLocaleString('en-IN')}`, icon: <TrendingUp color="#10b981" />, bg: '#ecfdf5' },
          { label: 'Total Orders', value: loading ? '...' : stats.orders, icon: <ShoppingCart color="#3b82f6" />, bg: '#eff6ff' },
          { label: 'Total Customers', value: loading ? '...' : stats.customers, icon: <Users color="#8b5cf6" />, bg: '#f5f3ff' },
          { label: 'Active Products', value: products.length || '...', icon: <Package color="#f59e0b" />, bg: '#fffbeb' }
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Quick Actions</h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/admin/products" className="admin-btn-primary" style={{ textDecoration: 'none' }}>Manage Inventory <ArrowRight size={16}/></Link>
            <Link to="/admin/orders" className="admin-btn-primary" style={{ textDecoration: 'none', background: '#333' }}>Fulfill Orders <ArrowRight size={16}/></Link>
            <Link to="/admin/banners" className="admin-btn-primary" style={{ textDecoration: 'none', background: '#f59e0b' }}>Deploy Popup Ad <ArrowRight size={16}/></Link>
          </div>
        </div>

        <div className="admin-card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>System Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#666' }}>Supabase Database</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>● Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#666' }}>Razorpay Gateway</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>● Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#666' }}>Shiprocket API</span>
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>● Pending</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Recent Orders</h2>
          <Link to="/admin/orders" style={{ fontSize: '0.85rem', color: '#907253', fontWeight: 600, textDecoration: 'none' }}>View All Orders</Link>
        </div>
        <div className="admin-table-wrap" style={{ margin: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4}>Loading live orders...</td></tr>
              ) : recentOrders.length === 0 ? (
                <tr><td colSpan={4}>No recent orders found.</td></tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id}>
                    <td><span style={{ fontWeight: 600, color: '#3b82f6' }}>#{order.id.slice(0, 8).toUpperCase()}</span></td>
                    <td>{order.customer_name}</td>
                    <td><strong>₹{order.total_amount.toLocaleString('en-IN')}</strong></td>
                    <td style={{ textTransform: 'capitalize' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                        background: order.order_status === 'delivered' ? '#d1fae5' : '#fef3c7',
                        color: order.order_status === 'delivered' ? '#065f46' : '#92400e'
                      }}>
                        {order.order_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
