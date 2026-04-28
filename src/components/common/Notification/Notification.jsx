import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import './Notification.css';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const notify = (message, type = 'success', options = {}) => {
    setNotification({ message, type, ...options });
    if (type !== 'confirm') {
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const close = () => setNotification(null);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {notification && (
        <div className="notification-container">
          <div className={`notification-card ${notification.type}`} style={notification.type === 'confirm' ? { flexDirection: 'column', alignItems: 'stretch' } : {}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
              <div className="notification-icon">
                {notification.type === 'success' && <CheckCircle size={20} />}
                {notification.type === 'error' && <AlertCircle size={20} />}
                {notification.type === 'info' && <Info size={20} />}
                {notification.type === 'confirm' && <AlertCircle size={20} color="#f59e0b" />}
              </div>
              <div className="notification-content" style={{ flex: 1 }}>
                <p>{notification.message}</p>
              </div>
              {notification.type !== 'confirm' && (
                <button className="notification-close" onClick={close} style={{ position: 'static' }}>
                  <X size={16} />
                </button>
              )}
            </div>
            {notification.type === 'confirm' && (
              <div className="notification-actions" style={{ marginTop: '1rem' }}>
                <button className="notif-btn cancel" onClick={() => { notification.onCancel?.(); close(); }}>Cancel</button>
                <button className="notif-btn confirm" onClick={() => { notification.onConfirm?.(); close(); }}>Confirm</button>
              </div>
            )}
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotify = () => useContext(NotificationContext);
