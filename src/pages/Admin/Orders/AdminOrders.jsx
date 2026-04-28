import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Truck, CheckCircle, XCircle, Clock, CreditCard, ExternalLink, Download } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useNotify } from '../../../components/common/Notification/Notification';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const { notify } = useNotify();

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select('*')
        .order('placed_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('order_status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updates = { 
        order_status: newStatus, 
        updated_at: new Date() 
      };

      // Add timestamp based on status
      if (newStatus === 'confirmed') updates.confirmed_at = new Date();
      if (newStatus === 'shipped') updates.shipped_at = new Date();
      if (newStatus === 'delivered') updates.delivered_at = new Date();

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;
      
      notify(`Order marked as ${newStatus}`, 'success');
      fetchOrders(); // Refresh list
    } catch (err) {
      notify('Failed to update status: ' + err.message, 'error');
    }
  };

  const syncShiprocket = async (order) => {
    try {
      notify('Syncing with Shiprocket...', 'info');
      const SHIPPING_API_URL = import.meta.env.PROD ? '/api/shipping' : 'http://localhost:5000/api/shipping';
      
      const response = await fetch(`${SHIPPING_API_URL}/sync-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          firstName: order.customer_name.split(' ')[0],
          lastName: order.customer_name.split(' ')[1] || '',
          email: order.customer_email,
          phone: order.customer_phone,
          address1: order.shipping_address.address_line1,
          flatNo: order.shipping_address.flat_no,
          city: order.shipping_address.city,
          state: order.shipping_address.state,
          pincode: order.shipping_address.pincode,
          amount: order.total_amount,
          paymentMethod: order.payment_method,
          // We'll need to fetch items if we want a perfect sync, 
          // but for now, we pass a dummy item to create the order record.
          items: [{ title: 'Order Fulfillment', price: order.total_amount, quantity: 1 }]
        })
      });

      const data = await response.json();
      if (data.success) {
        await supabase.from('orders').update({
          shiprocket_order_id: String(data.shiprocket_order_id),
          order_status: 'confirmed'
        }).eq('id', order.id);
        notify('Successfully synced with Shiprocket!', 'success');
        fetchOrders();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      notify('Shiprocket Sync Failed: ' + err.message, 'error');
    }
  };

  const downloadCSV = () => {
    if (orders.length === 0) return notify('No orders to download.', 'error');
    
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Email', 'Payment Method', 'Payment Status', 'Order Status', 'Total Amount (INR)', 'Tracking AWB'];
    
    const csvRows = orders.map(o => {
      return [
        o.id,
        new Date(o.placed_at).toLocaleDateString('en-IN'),
        `"${o.customer_name}"`,
        o.customer_phone,
        o.customer_email || 'N/A',
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.total_amount,
        o.shiprocket_awb || 'N/A'
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Shoraluxe_Orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredOrders = orders.filter(o => 
    o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer_phone.includes(searchQuery)
  );

  const getStatusBadge = (status) => {
    const badges = {
      placed: { icon: <Clock size={14}/>, className: 'status-placed', label: 'Order Placed' },
      confirmed: { icon: <CheckCircle size={14}/>, className: 'status-confirmed', label: 'Confirmed' },
      processing: { icon: <Filter size={14}/>, className: 'status-processing', label: 'Processing' },
      packed: { icon: <Filter size={14}/>, className: 'status-packed', label: 'Packed' },
      shipped: { icon: <Truck size={14}/>, className: 'status-shipped', label: 'Shipped' },
      delivered: { icon: <CheckCircle size={14}/>, className: 'status-delivered', label: 'Delivered' },
      cancelled: { icon: <XCircle size={14}/>, className: 'status-cancelled', label: 'Cancelled' },
    };
    const b = badges[status] || badges.placed;
    return <span className={`order-status-badge ${b.className}`}>{b.icon} {b.label}</span>;
  };

  return (
    <div className="admin-page-wrap">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders Management</h1>
          <p className="admin-page-subtitle">Track payments, shipping, and real-time customer orders</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="admin-btn-primary" onClick={downloadCSV} style={{ background: '#10b981' }}>
            <Download size={18} /> Export CSV
          </button>
          <div className="admin-stats-mini">
            <div className="mini-stat">
              <span className="label">Total Orders</span>
              <span className="value">{orders.length}</span>
            </div>
            <div className="mini-stat">
              <span className="label">Revenue</span>
              <span className="value">₹{orders.filter(o => o.payment_status === 'paid').reduce((acc, curr) => acc + (curr.total_amount || 0), 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-controls">
          <div className="admin-search-box">
            <Search size={18} color="#9ca3af" />
            <input 
              type="text" 
              placeholder="Search Name, ID, or Phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="admin-filters">
            <select className="admin-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="placed">Newly Placed</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>Fetching real-time orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No orders found.</td></tr>
              ) : filteredOrders.map(order => (
                <tr key={order.id}>
                  <td><span className="order-id-link">#{order.id.slice(0, 8).toUpperCase()}</span></td>
                  <td>
                    <div className="customer-cell">
                      <strong>{order.customer_name}</strong>
                      <span>{order.customer_phone}</span>
                    </div>
                  </td>
                  <td>{new Date(order.placed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                  <td><strong>₹{order.total_amount.toLocaleString('en-IN')}</strong></td>
                  <td>
                    <span className={`pay-badge ${order.payment_status}`}>
                      <CreditCard size={12} /> {order.payment_status.toUpperCase()}
                    </span>
                  </td>
                  <td>{getStatusBadge(order.order_status)}</td>
                  <td>
                    <button className="t-action-btn view" onClick={() => setSelectedOrder(order)}>
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS DRAWER / MODAL */}
      {selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={e => e.stopPropagation()}>
            <div className="order-modal-header">
              <h3>Order Details: #{selectedOrder.id.slice(0, 8).toUpperCase()}</h3>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            
            <div className="order-modal-body">
              <div className="modal-section">
                <h4>Customer & Shipping</h4>
                <div className="detail-grid">
                  <div><label>Name</label><p>{selectedOrder.customer_name}</p></div>
                  <div><label>Phone</label><p>{selectedOrder.customer_phone}</p></div>
                  <div><label>Alt. Phone</label><p>{selectedOrder.shipping_address.alternate_phone || 'N/A'}</p></div>
                  <div><label>Email</label><p>{selectedOrder.customer_email}</p></div>
                  <div className="full-width">
                    <label>Shipping Address ({selectedOrder.shipping_address.address_type?.toUpperCase()})</label>
                    <p style={{ lineHeight: '1.6' }}>
                      <strong>{selectedOrder.shipping_address.flat_no}</strong>, {selectedOrder.shipping_address.address_line1}<br/>
                      {selectedOrder.shipping_address.landmark && <span style={{ color: '#6d0e2c', fontSize: '0.85rem' }}>📍 Landmark: {selectedOrder.shipping_address.landmark}<br/></span>}
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4>Payment & Tracking</h4>
                <div className="detail-grid">
                  <div><label>Razorpay ID</label><p>{selectedOrder.razorpay_payment_id || 'N/A'}</p></div>
                  <div><label>Payment Method</label><p>{selectedOrder.payment_method}</p></div>
                  <div><label>Shiprocket AWB</label><p>{selectedOrder.shiprocket_awb || 'Not Shipped'}</p></div>
                  <div>
                    <label>Live Tracking</label>
                    {selectedOrder.tracking_url ? 
                      <a href={selectedOrder.tracking_url} target="_blank" className="track-link">Track Order <ExternalLink size={12}/></a> 
                      : <p>N/A</p>
                    }
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4>Order Status Actions</h4>
                <div className="status-actions">
                  {!selectedOrder.shiprocket_order_id && (
                    <button onClick={() => syncShiprocket(selectedOrder)} className="btn-sync">Sync to Shiprocket</button>
                  )}
                  <button onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')} disabled={selectedOrder.order_status === 'confirmed'} className="btn-confirm">Mark Confirmed</button>
                  <button onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')} disabled={selectedOrder.order_status === 'shipped'} className="btn-ship">Mark Shipped</button>
                  <button onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')} disabled={selectedOrder.order_status === 'delivered'} className="btn-deliver">Mark Delivered</button>
                  <button onClick={() => setCancelConfirm(selectedOrder.id)} disabled={selectedOrder.order_status === 'cancelled'} className="btn-cancel">Cancel Order</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!cancelConfirm}
        title="Cancel This Order?"
        message="This will mark the order as cancelled and notify the customer. This action is permanent."
        confirmText="Yes, Cancel"
        onConfirm={async () => {
          await updateOrderStatus(cancelConfirm, 'cancelled');
          setCancelConfirm(null);
        }}
        onCancel={() => setCancelConfirm(null)}
      />
    </div>
  );
};

export default AdminOrders;
