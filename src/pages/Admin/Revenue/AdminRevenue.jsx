import React, { useState, useEffect } from 'react';
import { IndianRupee, CreditCard, Banknote, Download, TrendingUp } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useNotify } from '../../../components/common/Notification/Notification';
import '../Orders/AdminOrders.css';

const AdminRevenue = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotify();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('placed_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching revenue data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const paidOrders = orders.filter(o => o.payment_status === 'paid');
  const totalRevenue = paidOrders.reduce((acc, curr) => acc + curr.total_amount, 0);

  const razorpayOrders = paidOrders.filter(o => o.payment_method === 'razorpay');
  const codOrders = orders.filter(o => o.payment_method === 'cod');
  
  const razorpayRevenue = razorpayOrders.reduce((acc, curr) => acc + curr.total_amount, 0);
  const codRevenue = codOrders.filter(o => o.payment_status === 'paid').reduce((acc, curr) => acc + curr.total_amount, 0);
  const pendingCodRevenue = codOrders.filter(o => o.payment_status === 'pending').reduce((acc, curr) => acc + curr.total_amount, 0);

  const downloadRevenueCSV = () => {
    if (orders.length === 0) return notify('No revenue data to download.', 'error');
    
    const headers = ['Order ID', 'Date', 'Customer', 'Amount', 'Payment Method', 'Payment Status', 'Gateway Transaction ID'];
    
    const csvRows = orders.map(o => {
      return [
        o.id,
        new Date(o.placed_at).toLocaleDateString('en-IN'),
        `"${o.customer_name}"`,
        o.total_amount,
        o.payment_method.toUpperCase(),
        o.payment_status.toUpperCase(),
        o.razorpay_payment_id || 'N/A'
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Shoraluxe_Revenue_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page-wrap">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Revenue & Finance Analytics</h1>
          <p className="admin-page-subtitle">Track your income by payment gateways securely.</p>
        </div>
        <button className="admin-btn-primary" onClick={downloadRevenueCSV} style={{ background: '#000' }}>
          <Download size={18} /> Download Finance CSV
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#ecfdf5', borderColor: '#a7f3d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: 600 }}>
            <IndianRupee size={18} /> Net Realized Revenue
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#064e3b' }}>
            {loading ? '...' : `₹${totalRevenue.toLocaleString('en-IN')}`}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#047857' }}>Total money successfully captured.</span>
        </div>

        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#eff6ff', borderColor: '#bfdbfe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1d4ed8', fontWeight: 600 }}>
            <CreditCard size={18} /> Razorpay (Prepaid)
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e3a8a' }}>
            {loading ? '...' : `₹${razorpayRevenue.toLocaleString('en-IN')}`}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#2563eb' }}>{razorpayOrders.length} Paid Online Orders</span>
        </div>

        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#fef3c7', borderColor: '#fde68a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontWeight: 600 }}>
            <Banknote size={18} /> Cash on Delivery (COD)
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#78350f' }}>
            {loading ? '...' : `₹${codRevenue.toLocaleString('en-IN')}`}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#d97706' }}>
            {codOrders.filter(o => o.payment_status === 'paid').length} Paid | ₹{pendingCodRevenue.toLocaleString('en-IN')} Uncollected
          </span>
        </div>
      </div>

      <div className="admin-card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20}/> Payment Ledger
        </h2>
        
        <div className="admin-table-wrap" style={{ margin: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Gateway / Method</th>
                <th>Status</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}>Loading ledger...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6}>No finance entries found.</td></tr>
              ) : orders.map(order => (
                <tr key={order.id}>
                  <td>{new Date(order.placed_at).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric'})}</td>
                  <td style={{ color: '#6b7280', fontFamily: 'monospace' }}>{order.id.slice(0, 10).toUpperCase()}</td>
                  <td>{order.customer_name}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: order.payment_method === 'razorpay' ? '#3b82f6' : '#d97706' }}>
                      {order.payment_method === 'razorpay' ? <CreditCard size={14}/> : <Banknote size={14}/>}
                      {order.payment_method.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                      background: order.payment_status === 'paid' ? '#d1fae5' : '#fef3c7',
                      color: order.payment_status === 'paid' ? '#065f46' : '#92400e'
                    }}>
                      {order.payment_status.toUpperCase()}
                    </span>
                  </td>
                  <td><strong style={{ fontSize: '1.1rem' }}>₹{order.total_amount.toLocaleString('en-IN')}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;
