import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './styles/global.css';
import './styles/products.css';
import './styles/product-details.css';
import './styles/layout.css';
import './styles/auth.css';
import './styles/admin.css';
import './styles/pwa.css';

// Enregistrement du Service Worker PWA
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Erreur enregistrement Service Worker:', err);
    });
  });
}

import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
