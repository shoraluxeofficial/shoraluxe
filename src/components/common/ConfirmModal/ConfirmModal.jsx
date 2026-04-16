import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
  if (!isOpen) return null;

  return (
    <div className="pf-overlay confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-modal-header">
           <div className={`confirm-icon-wrap ${type}`}>
             <AlertTriangle size={24} />
           </div>
           <button className="confirm-close" onClick={onCancel}><X size={20} /></button>
        </div>
        <div className="confirm-modal-body">
          <h3>{title}</h3>
          <p>{message}</p>
        </div>
        <div className="confirm-modal-actions">
          <button className="confirm-btn-ghost" onClick={onCancel}>{cancelText}</button>
          <button className={`confirm-btn-main ${type}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
