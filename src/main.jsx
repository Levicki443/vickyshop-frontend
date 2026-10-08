import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './styles/global.css';
import './styles/products.css';
import './styles/product-details.css';
import './styles/layout.css';
import './styles/auth.css';
import './styles/profile-modal.css';
import './styles/seller-dashboard.css';
import './styles/seller-orders.css';
import './styles/seller.css';
import './styles/testimonials.css';
import './styles/admin.css';
import './styles/pwa.css';
import './styles/notifications.css';
import './styles/orders.css';
import './styles/responsive.css';

// Enregistrement standard du Service Worker PWA et Web Push
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[ServiceWorker] Enregistrement sw.js :', err.message);
    });
  });
}

import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <WishlistProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </WishlistProvider>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
