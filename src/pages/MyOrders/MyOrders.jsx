import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, MapPin, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useShop } from '../../context/ShopContext';
import SEO from '../../components/SEO/SEO';
import './MyOrders.css';

const statusSteps = [
  { key: 'placed',    label: 'Order Placed',    icon: Package },
  { key: 'confirmed', label: 'Confirmed',        icon: CheckCircle },
  { key: 'shipped',   label: 'Shipped',          icon: Truck },
  { key: 'delivered', label: 'Delivered',        icon: MapPin },
];

const statusIndex = { placed: 0, confirmed: 1, shipped: 2, delivered: 3 };

const MyOrders = () => {
  const { user } = useShop();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        let query = supabase.from('orders').select('*');
        
        // If user has email, use it. If not, fallback to mobile.
        if (user.email) {
          query = query.eq('customer_email', user.email);
        } else if (user.mobile) {
          query = query.eq('customer_phone', user.mobile.replace('+91', ''));
        }

        const { data, error } = await query.order('placed_at', { ascending: false });

        if (!error && data) {
          setOrders(data);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return <Navigate to="/account" replace />;
  }

  return (
    <div className="my-orders-page">
      <SEO title="My Orders - Shoraluxe" />
      <h1 className="mo-title">My Orders</h1>

      {loading ? (
        <div>Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="mo-empty">
          <Package size={48} />
          <h2>No orders yet</h2>
          <p>You haven't placed any orders with this account yet.</p>
          <Link to="/shop" className="mo-empty-btn">Start Shopping</Link>
        </div>
      ) : (
        <div className="mo-list">
          {orders.map(order => {
            const currentStep = statusIndex[order.order_status] ?? 0;
            const isCancelled = order.order_status === 'cancelled';

            return (
              <div key={order.id} className="mo-card">
                <div className="mo-header">
                  <div className="mo-header-left">
                    <span className="mo-id">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className="mo-date">Placed on {new Date(order.placed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="mo-header-right">
                    <span className="mo-total">₹{order.total_amount?.toLocaleString('en-IN')}</span>
                    <span className="mo-items">{order.cart_items?.length || 0} Items</span>
                  </div>
                </div>

                <div className="mo-body">
                  <div className={`mo-status-pill ${order.order_status}`}>
                    {order.order_status}
                  </div>

                  {!isCancelled && (
                    <div className="mo-stepper">
                      {statusSteps.map((step, i) => {
                        const Icon = step.icon;
                        const isDone = i <= currentStep;
                        const isActive = i === currentStep;
                        return (
                          <div key={step.key} className={`mo-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                            <div className="mo-step-icon"><Icon size={16} /></div>
                            <span className="mo-step-label">{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {order.shiprocket_awb && (
                    <div className="mo-awb">
                      <span><strong>Tracking AWB:</strong> {order.shiprocket_awb}</span>
                      <a href={order.tracking_url || `https://shiprocket.co/tracking/${order.shiprocket_awb}`} target="_blank" rel="noreferrer" style={{color: '#6d0e2c', fontWeight: 600, textDecoration: 'none'}}>Track Package &rarr;</a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
