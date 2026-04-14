import React, { useState, useEffect, createContext, useContext } from 'react';
import { Package, Truck, CheckCircle, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import './TrackingNotification.css';

const TrackingContext = createContext();

export const TrackingProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shoraluxe_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [notifications, setNotifications] = useState([]);

  // Subscribe to real-time order updates for the logged-in user
  useEffect(() => {
    if (!user?.phone) return;

    const channel = supabase
      .channel('order-tracking')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `customer_phone=eq.${user.phone}`,
        },
        (payload) => {
          const updated = payload.new;
          const statusMessages = {
            confirmed: `✅ Order #${updated.id.slice(0, 8).toUpperCase()} Confirmed! We're preparing your items.`,
            shipped: `🚚 Your order #${updated.id.slice(0, 8).toUpperCase()} has shipped! Tracking: ${updated.tracking_awb || 'Pending'}`,
            delivered: `🎉 Delivered! Your Shoraluxe order #${updated.id.slice(0, 8).toUpperCase()} has arrived.`,
          };

          const msg = statusMessages[updated.order_status];
          if (msg) {
            const id = Date.now();
            setNotifications(prev => [...prev, { id, message: msg, status: updated.order_status }]);
            setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== id));
            }, 8000);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <TrackingContext.Provider value={{ user, setUser, notifications, dismissNotification }}>
      {children}
      {/* LIVE NOTIFICATION TOASTS */}
      <div className="tracking-toast-stack">
        {notifications.map(notif => (
          <div key={notif.id} className={`tracking-toast ${notif.status}`}>
            <div className="toast-icon">
              {notif.status === 'shipped' ? <Truck size={20} /> :
               notif.status === 'delivered' ? <CheckCircle size={20} /> :
               <Package size={20} />}
            </div>
            <div className="toast-body">
              <span className="toast-brand">SHORALUXE ORDER UPDATE</span>
              <p>{notif.message}</p>
            </div>
            <button className="toast-close" onClick={() => dismissNotification(notif.id)}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </TrackingContext.Provider>
  );
};

export const useTracking = () => useContext(TrackingContext);
