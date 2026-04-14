import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './OrderTracking.css';

const statusSteps = [
  { key: 'placed',    label: 'Order Placed',    icon: Package,     desc: 'Your order has been received.' },
  { key: 'confirmed', label: 'Confirmed',        icon: CheckCircle, desc: 'Payment verified, preparing your items.' },
  { key: 'shipped',   label: 'Shipped',          icon: Truck,       desc: 'Your package is on the way.' },
  { key: 'delivered', label: 'Delivered',        icon: MapPin,      desc: 'Package delivered successfully.' },
];

const statusIndex = { placed: 0, confirmed: 1, shipped: 2, delivered: 3 };

const OrderTracking = () => {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const { data, error: err } = await supabase
        .from('orders')
        .select('*')
        .or(`id.ilike.%${query.trim()}%,customer_phone.eq.${query.trim()}`)
        .order('placed_at', { ascending: false })
        .limit(1)
        .single();

      if (err || !data) {
        setError('No order found. Please check your Order ID or phone number.');
      } else {
        setOrder(data);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? (statusIndex[order.order_status] ?? 0) : -1;

  return (
    <div className="tracking-page">
      {/* HERO */}
      <div className="tracking-hero">
        <span className="tracking-tag">SHORALUXE</span>
        <h1>Track Your Order</h1>
        <p>Enter your Order ID or registered phone number to get live updates.</p>

        <form className="tracking-search-bar" onSubmit={handleSearch}>
          <Search size={20} className="ts-icon" />
          <input
            type="text"
            placeholder="Order ID or Phone Number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      <div className="tracking-body">
        {/* ERROR */}
        {error && (
          <div className="tracking-error">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* RESULT */}
        {order && (
          <div className="tracking-result">
            {/* ORDER META */}
            <div className="tracking-meta">
              <div className="meta-item">
                <span className="meta-label">Order ID</span>
                <span className="meta-val">#{order.id.slice(0, 10).toUpperCase()}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Placed On</span>
                <span className="meta-val">{new Date(order.placed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Customer</span>
                <span className="meta-val">{order.customer_name}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Total</span>
                <span className="meta-val">₹{order.total_amount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* STATUS STEPPER */}
            <div className="status-stepper">
              {statusSteps.map((step, i) => {
                const Icon = step.icon;
                const isDone = i <= currentStep;
                const isActive = i === currentStep;
                return (
                  <div key={step.key} className={`stepper-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                    <div className="step-connector" />
                    <div className="step-icon-wrap">
                      <Icon size={22} />
                    </div>
                    <div className="step-info">
                      <span className="step-label">{step.label}</span>
                      {isActive && <span className="step-desc">{step.desc}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AWB Number */}
            {order.tracking_awb && (
              <div className="awb-banner">
                <Truck size={18} />
                <span>Shiprocket AWB: <strong>{order.tracking_awb}</strong></span>
                <a href={`https://shiprocket.co/tracking/${order.tracking_awb}`} target="_blank" rel="noreferrer">
                  Track on Shiprocket →
                </a>
              </div>
            )}

            {/* ITEMS */}
            <div className="tracking-items">
              <h3>Items in this Order</h3>
              <div className="item-list">
                {(order.items || []).map((item, i) => (
                  <div className="tracking-item-row" key={i}>
                    <img src={item.img || item.gallery?.[0]} alt={item.title} />
                    <div>
                      <p className="item-title">{item.title}</p>
                      <p className="item-meta">Qty: {item.quantity} · ₹{item.price?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!order && !error && (
          <div className="tracking-empty">
            <Package size={64} strokeWidth={1} />
            <h3>No Order Searched Yet</h3>
            <p>Use your Order ID from the confirmation email or your phone number.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
