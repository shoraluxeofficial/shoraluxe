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
        <div className="notification-overlay">
          <div className={`notification-card ${notification.type}`}>
            <div className="notification-icon">
              {notification.type === 'success' && <CheckCircle size={24} />}
              {notification.type === 'error' && <AlertCircle size={24} />}
              {notification.type === 'info' && <Info size={24} />}
              {notification.type === 'confirm' && <AlertCircle size={24} color="#f59e0b" />}
            </div>
            <div className="notification-content">
              <p>{notification.message}</p>
            </div>
            {notification.type === 'confirm' ? (
              <div className="notification-actions">
                <button className="notif-btn cancel" onClick={() => { notification.onCancel?.(); close(); }}>Cancel</button>
                <button className="notif-btn confirm" onClick={() => { notification.onConfirm?.(); close(); }}>Confirm</button>
              </div>
            ) : (
              <button className="notification-close" onClick={close}>
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotify = () => useContext(NotificationContext);
