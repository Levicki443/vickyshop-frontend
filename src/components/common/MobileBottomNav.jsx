import React from 'react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav = ({ currentPath, onNavigate }) => {
  const { totalItems, openCart } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const { unreadCount, openNotificationCenter } = useNotifications();
  const { isAuthenticated, openAuthModal } = useAuth();

  const handleHomeClick = () => {
    if (onNavigate) onNavigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductsClick = () => {
    if (window.location.pathname !== '/') {
      if (onNavigate) onNavigate('/');
      setTimeout(() => {
        document.getElementById('produits')?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } else {
      document.getElementById('produits')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNotifClick = () => {
    if (!isAuthenticated) {
      openAuthModal();
    } else {
      openNotificationCenter();
    }
  };

  const isHomeActive = currentPath === '/' || currentPath === '';
  const isOrdersActive = currentPath.startsWith('/commandes');

  return (
    <nav className="mobile-bottom-nav" aria-label="Navigation mobile principale">
      <button
        type="button"
        className={`mobile-nav-tab ${isHomeActive ? 'active' : ''}`}
        onClick={handleHomeClick}
      >
        <i className="fa-solid fa-house"></i>
        <span>Accueil</span>
      </button>

      <button
        type="button"
        className="mobile-nav-tab"
        onClick={handleProductsClick}
      >
        <i className="fa-solid fa-grid-2"></i>
        <span>Produits</span>
      </button>

      <button
        type="button"
        className="mobile-nav-tab notif-tab"
        onClick={handleNotifClick}
      >
        <div className="mobile-nav-icon-wrap">
          <i className="fa-solid fa-bell"></i>
          {unreadCount > 0 && <span className="mobile-nav-badge">{unreadCount}</span>}
        </div>
        <span>Alertes</span>
      </button>

      <button
        type="button"
        className="mobile-nav-tab"
        onClick={openWishlist}
      >
        <div className="mobile-nav-icon-wrap">
          <i className="fa-solid fa-heart"></i>
          {wishlistCount > 0 && <span className="mobile-nav-badge">{wishlistCount}</span>}
        </div>
        <span>Favoris</span>
      </button>

      <button
        type="button"
        className="mobile-nav-tab cart-tab"
        onClick={openCart}
      >
        <div className="mobile-nav-icon-wrap">
          <i className="fa-solid fa-cart-shopping"></i>
          {totalItems > 0 && <span className="mobile-nav-badge count-highlight">{totalItems}</span>}
        </div>
        <span>Panier</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
