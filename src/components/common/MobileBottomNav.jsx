import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useSecretAdminTrigger } from '../../hooks/useSecretAdminTrigger';

/**
 * Composant MobileBottomNav
 * Barre de navigation inférieure mobile (Bottom Navigation Bar)
 * avec icônes Font Awesome Free officielles, badges temps réel et gestion de l'état actif.
 */
export const MobileBottomNav = ({ currentPath, onNavigate, onOpenAdmin }) => {
  const { totalItems, openCart, closeCart, isCartOpen } = useCart();
  const { wishlistCount, openWishlist, closeWishlist, isWishlistOpen } = useWishlist();
  const { unreadCount, openNotificationCenter, closeNotificationCenter, isNotificationCenterOpen } = useNotifications();
  const { closeAuthModal } = useAuth();

  const { isTriggeredRef, triggerProps } = useSecretAdminTrigger(onOpenAdmin);

  const [activeTab, setActiveTab] = useState('home');

  // Fermeture centralisée de tous les tiroirs et modales de premier plan
  const closeAllOverlays = () => {
    closeCart();
    closeWishlist();
    closeNotificationCenter();
    closeAuthModal();
  };

  // Synchronisation de l'onglet actif avec la navigation et les tiroirs ouverts
  useEffect(() => {
    if (isCartOpen) {
      setActiveTab('cart');
    } else if (isWishlistOpen) {
      setActiveTab('wishlist');
    } else if (isNotificationCenterOpen) {
      setActiveTab('alerts');
    } else if (currentPath === '/' || currentPath === '') {
      if (window.location.hash === '#produits') {
        setActiveTab('products');
      } else {
        setActiveTab('home');
      }
    } else {
      setActiveTab('');
    }
  }, [currentPath, isCartOpen, isWishlistOpen, isNotificationCenterOpen]);

  // Détection du défilement pour basculer naturellement entre Accueil et Produits
  useEffect(() => {
    const handleScroll = () => {
      if (isCartOpen || isWishlistOpen || isNotificationCenterOpen) return;
      if (window.location.pathname !== '/') return;

      const productsEl = document.getElementById('produits');
      if (productsEl) {
        const rect = productsEl.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 150) {
          setActiveTab('products');
          return;
        }
      }

      if (window.scrollY < 200) {
        setActiveTab('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCartOpen, isWishlistOpen, isNotificationCenterOpen]);

  const handleHomeClick = (e) => {
    if (isTriggeredRef.current) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10); } catch (_) {}
    }
    closeAllOverlays();
    setActiveTab('home');
    if (onNavigate && window.location.pathname !== '/') {
      onNavigate('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductsClick = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10); } catch (_) {}
    }
    closeAllOverlays();
    setActiveTab('products');

    const scrollToCatalog = () => {
      const scroll = () => {
        const el = document.getElementById('produits');
        if (el) {
          const headerOffset = 68;
          const targetTop = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({ top: targetTop, behavior: 'smooth' });
          return true;
        }
        return false;
      };

      if (!scroll()) {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (scroll() || attempts >= 12) {
            clearInterval(interval);
          }
        }, 50);
      }
    };

    if (window.location.pathname !== '/') {
      if (onNavigate) onNavigate('/');
      setTimeout(scrollToCatalog, 60);
    } else {
      scrollToCatalog();
    }
  };

  const handleNotifClick = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10); } catch (_) {}
    }
    if (isNotificationCenterOpen) {
      closeNotificationCenter();
    } else {
      closeCart();
      closeWishlist();
      closeAuthModal();
      setActiveTab('alerts');
      openNotificationCenter();
    }
  };

  const handleWishlistClick = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10); } catch (_) {}
    }
    if (isWishlistOpen) {
      closeWishlist();
    } else {
      closeCart();
      closeNotificationCenter();
      closeAuthModal();
      setActiveTab('wishlist');
      openWishlist();
    }
  };

  const handleCartClick = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10); } catch (_) {}
    }
    if (isCartOpen) {
      closeCart();
    } else {
      closeWishlist();
      closeNotificationCenter();
      closeAuthModal();
      setActiveTab('cart');
      openCart();
    }
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Navigation mobile principale">
      {/* 1. Onglet Accueil */}
      <button
        type="button"
        className={`mobile-nav-tab ${activeTab === 'home' ? 'active' : ''}`}
        {...triggerProps}
        onClick={(e) => {
          if (triggerProps?.onClick) triggerProps.onClick(e);
          handleHomeClick(e);
        }}
        aria-label="Accueil"
      >
        <div className="mobile-nav-icon-wrap">
          <i className="fa-solid fa-house"></i>
        </div>
        <span>Accueil</span>
      </button>

      {/* 2. Onglet Produits (icône Font Awesome Free fa-table-cells-large) */}
      <button
        type="button"
        className={`mobile-nav-tab ${activeTab === 'products' ? 'active' : ''}`}
        onClick={handleProductsClick}
        aria-label="Produits"
      >
        <div className="mobile-nav-icon-wrap">
          <i className="fa-solid fa-table-cells-large"></i>
        </div>
        <span>Produits</span>
      </button>

      {/* 3. Onglet Alertes / Notifications */}
      <button
        type="button"
        className={`mobile-nav-tab notif-tab ${activeTab === 'alerts' ? 'active' : ''}`}
        onClick={handleNotifClick}
        aria-label="Alertes"
      >
        <div className="mobile-nav-icon-wrap">
          <i className="fa-solid fa-bell"></i>
          {unreadCount > 0 && (
            <span className="mobile-nav-badge" key={unreadCount}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <span>Alertes</span>
      </button>

      {/* 4. Onglet Favoris */}
      <button
        type="button"
        className={`mobile-nav-tab ${activeTab === 'wishlist' ? 'active' : ''}`}
        onClick={handleWishlistClick}
        aria-label="Favoris"
      >
        <div className="mobile-nav-icon-wrap">
          <i className="fa-solid fa-heart"></i>
          {wishlistCount > 0 && (
            <span className="mobile-nav-badge" key={wishlistCount}>
              {wishlistCount > 99 ? '99+' : wishlistCount}
            </span>
          )}
        </div>
        <span>Favoris</span>
      </button>

      {/* 5. Onglet Panier */}
      <button
        type="button"
        className={`mobile-nav-tab cart-tab ${activeTab === 'cart' ? 'active' : ''}`}
        onClick={handleCartClick}
        aria-label="Panier"
      >
        <div className="mobile-nav-icon-wrap">
          <i className="fa-solid fa-cart-shopping"></i>
          {totalItems > 0 && (
            <span className="mobile-nav-badge count-highlight" key={totalItems}>
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </div>
        <span>Panier</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
