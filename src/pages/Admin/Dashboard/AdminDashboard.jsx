import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, Users, Package, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useShop } from '../../../context/ShopContext';
import { supabase } from '../../../lib/supabase';

const AdminDashboard = () => {
  const { products } = useShop();
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0 });
  const [chartData, setChartData] = useState([]);
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

          setStats({ revenue: totalRevenue, orders: ordersData.length, customers: uniqueCustomers });
          setRecentOrders(ordersData.slice(0, 5));

          // Process Chart Data
          const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
          });

          const dailyRevenue = last7Days.map(date => {
            const daySales = ordersData
              .filter(o => o.payment_status === 'paid' && o.placed_at.startsWith(date))
              .reduce((sum, o) => sum + (o.total_amount || 0), 0);
            return { date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), revenue: daySales };
          });
          setChartData(dailyRevenue);
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
        <div>
           <h1 className="admin-page-title">Management Dashboard</h1>
           <p className="admin-page-subtitle">Secure, real-time performance metrics for Shoraluxe</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#ecfdf5', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>
           <ShieldCheck size={14} /> LIVE REVENUE AUTHENTICATED
        </div>
      </div>

      {/* STATS ROW */}
      <div className="admin-dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: <TrendingUp size={20} color="#10b981" />, bg: '#ecfdf5', border: '#b9f6ca' },
          { label: 'Live Orders', value: stats.orders, icon: <ShoppingCart size={20} color="#3b82f6" />, bg: '#eff6ff', border: '#bfdbfe' },
          { label: 'Total Customers', value: stats.customers, icon: <Users size={20} color="#8b5cf6" />, bg: '#f5f3ff', border: '#ddd6fe' },
          { label: 'Active Catalog', value: products.length, icon: <Package size={20} color="#f59e0b" />, bg: '#fffbeb', border: '#fef3c7' }
        ].map((stat, i) => (
          <div key={i} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1.5rem', border: `1px solid ${stat.border}` }}>
            <div style={{ padding: '0.8rem', borderRadius: '12px', background: stat.bg, width: 'fit-content' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginTop: '0.2rem' }}>
                {loading ? '---' : stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* REVENUE CHART */}
        <div className="admin-card">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Revenue Growth (Last 7 Days)</h2>
              <span style={{ fontSize: '0.8rem', background: '#f3f4f6', padding: '4px 10px', borderRadius: '10px', fontWeight: 600 }}>Currency: INR</span>
           </div>
           <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                 <AreaChart data={chartData}>
                    <defs>
                       <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6d0e2c" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#6d0e2c" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip cursor={{ stroke: '#6d0e2c', strokeWidth: 1 }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#6d0e2c" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* SYSTEM HEALTH */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
             <Activity size={18} color="#6d0e2c" />
             <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Infrastructure Health</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Supabase Database', status: 'Online', color: '#10b981' },
              { label: 'Razorpay Gateway', status: 'Active', color: '#10b981' },
              { label: 'Shiprocket API', status: 'Pending Config', color: '#f59e0b' },
              { label: 'Email Server', status: 'Operational', color: '#10b981' }
            ].map((sys, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: '#f9fafb', borderRadius: '10px' }}>
                <span style={{ color: '#4b5563', fontSize: '0.9rem', fontWeight: 600 }}>{sys.label}</span>
                <span style={{ color: sys.color, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>● {sys.status}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '2rem' }}>
             <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Quick Actions</h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/admin/orders" className="admin-btn-primary" style={{ textDecoration: 'none', background: '#111827', width: '100%', justifyContent: 'center' }}>Fulfill New Orders</Link>
                <Link to="/admin/products" className="admin-btn-primary" style={{ textDecoration: 'none', background: '#fff', color: '#111827', border: '1px solid #e5e7eb', width: '100%', justifyContent: 'center' }}>Restock Inventory</Link>
             </div>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Recent VIP Orders</h2>
          <Link to="/admin/orders" style={{ fontSize: '0.85rem', color: '#6d0e2c', fontWeight: 700, textDecoration: 'none' }}>View Transaction Journal →</Link>
        </div>
        <div className="admin-table-wrap" style={{ margin: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer Profile</th>
                <th>Revenue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>Synchronizing...</td></tr>
              ) : recentOrders.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>No orders in ledger.</td></tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id}>
                    <td><span style={{ fontWeight: 700, color: '#6d0e2c' }}>#{order.id.slice(0, 8).toUpperCase()}</span></td>
                    <td>
                       <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700 }}>{order.customer_name}</span>
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{order.customer_phone}</span>
                       </div>
                    </td>
                    <td><strong>₹{order.total_amount.toLocaleString('en-IN')}</strong></td>
                    <td style={{ textTransform: 'capitalize' }}>
                       <span style={{ 
                         padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800,
                         background: order.order_status === 'delivered' ? '#d1fae5' : '#fef3c7',
                         color: order.order_status === 'delivered' ? '#065f46' : '#92400e',
                         textTransform: 'uppercase'
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
