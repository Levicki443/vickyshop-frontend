import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useSecretAdminTrigger } from '../../hooks/useSecretAdminTrigger';
import { NotificationDropdown } from './NotificationDropdown';
import logoImg from '../../assets/logo.png';

export const Header = ({ onOpenAdmin, onOpenOrdersTracking, onOpenProfile, onOpenSeller }) => {
  const { theme, toggleTheme } = useTheme();
  const { totalItems, openCart } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const {
    user,
    isSeller,
    isAuthenticated,
    sellerUnreadCount,
    clientUnreadCount,
    openAuthModal,
    logout,
  } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const { triggerProps } = useSecretAdminTrigger(onOpenAdmin);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((p) => p[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleSellerClick = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
    if (onOpenSeller) {
      onOpenSeller('dashboard');
    } else {
      window.history.pushState(null, '', '/vendeur/dashboard');
      window.dispatchEvent(new Event('app-navigate'));
    }
  };

  const handleOrdersClick = (orderNumber) => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
    if (onOpenOrdersTracking) {
      onOpenOrdersTracking(orderNumber);
    } else {
      window.history.pushState(null, '', '/commandes');
      window.dispatchEvent(new Event('app-navigate'));
    }
  };

  const handleProfileClick = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      window.history.pushState(null, '', '/profil');
      window.dispatchEvent(new Event('app-navigate'));
    }
  };

  const handleMobileLogout = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
    logout();
  };

  return (
    <>
      <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <a
            href="#accueil"
            className="logo"
            {...triggerProps}
            onClick={(e) => {
              if (window.location.pathname !== '/') {
                e.preventDefault();
                window.history.pushState(null, '', '/');
                window.dispatchEvent(new Event('app-navigate'));
              }
            }}
          >
            <img src={logoImg} alt="Vicky-Shop" className="logo-img rounded-logo" />
            <span className="logo-text">Vicky<span className="logo-accent">-Shop</span></span>
          </a>

          <nav className={`navbar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="mobile-menu-header">
              <div className="logo">
                <img src={logoImg} alt="Vicky-Shop" className="logo-img rounded-logo" />
                <span className="logo-text">Vicky<span className="logo-accent">-Shop</span></span>
              </div>
              <button type="button" className="close-menu-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Fermer">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <ul className="nav-links">
              <li>
                <a href="#accueil" onClick={() => setMobileMenuOpen(false)} className="nav-link-item" {...triggerProps}>
                  <i className="fa-solid fa-house nav-icon-mobile"></i> Accueil
                </a>
              </li>
              <li>
                <a href="#produits" onClick={() => setMobileMenuOpen(false)}>
                  <i className="fa-solid fa-grid-2 nav-icon-mobile"></i> Produits
                </a>
              </li>
              <li>
                <a href="#flash-sale" onClick={() => setMobileMenuOpen(false)}>
                  <i className="fa-solid fa-fire nav-icon-mobile"></i> Vente Flash <span className="hot-badge">Hot</span>
                </a>
              </li>

              {isSeller && isAuthenticated && (
                <li>
                  <button type="button" className="nav-link-item nav-link-btn seller-nav-highlight-btn" onClick={handleSellerClick}>
                    <i className="fa-solid fa-store"></i>
                    <span>Gestion Vendeur</span>
                    {sellerUnreadCount > 0 && <span className="badge-count-pill seller-badge-count">{sellerUnreadCount}</span>}
                  </button>
                </li>
              )}

              <li className="mobile-only-nav-item">
                <button type="button" className="nav-link-item nav-link-btn" onClick={() => { setMobileMenuOpen(false); openWishlist(); }}>
                  <i className="fa-solid fa-heart nav-icon-mobile text-danger"></i> Favoris
                  {wishlistCount > 0 && <span className="badge-count-pill">{wishlistCount}</span>}
                </button>
              </li>
              <li className="mobile-only-nav-item">
                <button type="button" className="nav-link-item nav-link-btn" onClick={() => handleOrdersClick()}>
                  <i className="fa-solid fa-box-open nav-icon-mobile text-primary"></i> Vos commandes
                </button>
              </li>
            </ul>

            <div className="mobile-menu-footer">
              <div className="mobile-auth-section">
                {isAuthenticated ? (
                  <div className="mobile-user-box">
                    <div className="mobile-user-card" onClick={handleProfileClick}>
                      <div className="user-avatar-badge">{getInitials(user?.name)}</div>
                      <div className="mobile-user-info-col">
                        <strong>{user?.name}</strong>
                        <small>{isSeller ? '🏪 Compte Vendeur' : '⚙️ Paramètres & Profil'}</small>
                      </div>
                    </div>
                    {isSeller ? (
                      <button type="button" className="btn btn-primary btn-block mt-2" onClick={handleSellerClick}>
                        <i className="fa-solid fa-store"></i> <span>Ouvrir Gestion Vendeur</span>
                      </button>
                    ) : (
                      <button type="button" className="btn btn-outline btn-block mt-2" onClick={handleProfileClick}>
                        <i className="fa-solid fa-store"></i> <span>Devenir Vendeur Marketplace</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-block mobile-logout-btn mt-2"
                      onClick={handleMobileLogout}
                    >
                      <i className="fa-solid fa-right-from-bracket"></i> <span>Déconnexion</span>
                    </button>
                  </div>
                ) : (
                  <button type="button" className="btn btn-primary btn-block" onClick={() => { setMobileMenuOpen(false); openAuthModal(); }}>
                    <i className="fa-solid fa-user"></i> <span>Se connecter / S&apos;inscrire</span>
                  </button>
                )}
              </div>
            </div>
          </nav>

          <div className="header-actions">
            {isSeller && isAuthenticated && (
              <button type="button" className="btn btn-primary btn-sm desktop-only-action header-seller-btn-pulse" onClick={handleSellerClick} title="Espace Vendeur">
                <i className="fa-solid fa-store"></i>
                <span>Gestion Vendeur</span>
                {sellerUnreadCount > 0 && <span className="seller-header-badge">{sellerUnreadCount}</span>}
              </button>
            )}

            <button type="button" className="icon-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'} aria-label="Mode">
              <i className={theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
            </button>

            {/* Cloche de notifications Client en temps réel */}
            {isAuthenticated && (
              <div className="header-notif-wrapper" ref={notifRef}>
                <button
                  type="button"
                  className={`icon-btn header-notif-btn ${clientUnreadCount > 0 ? 'has-unread' : ''}`}
                  onClick={() => setNotifDropdownOpen((prev) => !prev)}
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <i className="fa-solid fa-bell"></i>
                  {clientUnreadCount > 0 && <span className="badge-count notif-badge-count">{clientUnreadCount}</span>}
                </button>

                <NotificationDropdown
                  isOpen={notifDropdownOpen}
                  onClose={() => setNotifDropdownOpen(false)}
                  onSelectOrder={(ordNum) => handleOrdersClick(ordNum)}
                />
              </div>
            )}

            <button type="button" className="icon-btn desktop-only-action" onClick={openWishlist} title="Favoris" aria-label="Favoris">
              <i className="fa-solid fa-heart"></i>
              {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
            </button>

            <button type="button" className="icon-btn orders-tracking-btn desktop-only-action" onClick={() => handleOrdersClick()} title="Vos commandes" aria-label="Commandes">
              <i className="fa-solid fa-box-open"></i>
            </button>

            <button type="button" className="icon-btn cart-btn-active" onClick={openCart} title="Panier" aria-label="Panier">
              <i className="fa-solid fa-cart-shopping"></i>
              {totalItems > 0 && <span className="badge-count">{totalItems}</span>}
            </button>

            {isAuthenticated ? (
              <div className="user-menu-wrap desktop-only-action" ref={dropdownRef}>
                <button type="button" className={`btn-auth-header ${isSeller ? 'seller-user-active' : ''}`} onClick={() => setUserDropdownOpen((prev) => !prev)}>
                  <div className="user-avatar-badge">{getInitials(user?.name)}</div>
                  <span className="auth-btn-label">{user?.name?.split(' ')[0]}</span>
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.7rem' }}></i>
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <strong>{user?.name}</strong>
                      <small>{isSeller ? `🏪 ${user?.shopName || 'Boutique'}` : user?.email}</small>
                    </div>

                    {isSeller ? (
                      <button type="button" className="dropdown-item text-primary font-weight-bold" onClick={handleSellerClick}>
                        <i className="fa-solid fa-store"></i> Panneau Gestion Vendeur
                      </button>
                    ) : (
                      <button type="button" className="dropdown-item text-primary font-weight-bold" onClick={handleProfileClick}>
                        <i className="fa-solid fa-store"></i> Activer mon Compte Vendeur
                      </button>
                    )}

                    <button type="button" className="dropdown-item" onClick={handleProfileClick}>
                      <i className="fa-solid fa-user-gear"></i> Paramètres &amp; Profil
                    </button>
                    <button type="button" className="dropdown-item" onClick={() => handleOrdersClick()}>
                      <i className="fa-solid fa-box-open"></i> Vos commandes
                    </button>
                    <button type="button" className="dropdown-item text-danger" onClick={() => { logout(); setUserDropdownOpen(false); }}>
                      <i className="fa-solid fa-arrow-right-from-bracket"></i> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" className="btn-auth-header desktop-only-action" onClick={openAuthModal}>
                <i className="fa-solid fa-user"></i>
                <span className="auth-btn-label">Connexion</span>
              </button>
            )}

            <button type="button" className="icon-btn menu-btn" onClick={() => setMobileMenuOpen((prev) => !prev)} aria-label="Menu">
              <i className={mobileMenuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'}></i>
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="nav-backdrop" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
      )}
    </>
  );
};
