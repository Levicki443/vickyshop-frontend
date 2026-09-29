import React from 'react';
import { useToast } from '../../context/ToastContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-box toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <div className="toast-icon">
            {toast.type === 'success' && <i className="fa-solid fa-circle-check"></i>}
            {toast.type === 'error' && <i className="fa-solid fa-circle-exclamation"></i>}
            {toast.type === 'info' && <i className="fa-solid fa-circle-info"></i>}
          </div>
          <div className="toast-body">
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      ))}
    </div>
  );
};
