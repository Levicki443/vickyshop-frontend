import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useSecretAdminTrigger } from '../../hooks/useSecretAdminTrigger';
import logoImg from '../../assets/logo.png';

export const Header = ({ onOpenAdmin, isAdminActive, onOpenOrdersTracking }) => {
  const { theme, toggleTheme } = useTheme();
  const { totalItems, openCart } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const { user, isAuthenticated, openAuthModal, openProfileModal, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((p) => p[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <a href="#accueil" className="logo" {...triggerProps}>
            <img src={logoImg} alt="Vicky-Shop" className="logo-img rounded-logo" />
            <span className="logo-text">Vicky<span className="logo-accent">-Shop</span></span>
          </a>

          <nav className={`navbar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="mobile-menu-header">
              <div className="logo">
                <img src={logoImg} alt="Vicky-Shop" className="logo-img rounded-logo" />
                <span className="logo-text">Vicky<span className="logo-accent">-Shop</span></span>
              </div>
              <button type="button" className="close-menu-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Fermer le menu">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <ul className="nav-links">
              <li>
                <a
                  href="#accueil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="nav-link-item"
                  {...triggerProps}
                >
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
              <li className="mobile-only-nav-item">
                <button
                  type="button"
                  className="nav-link-item nav-link-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openWishlist();
                  }}
                >
                  <i className="fa-solid fa-heart nav-icon-mobile" style={{ color: 'var(--accent-red, #e11d48)' }}></i> Favoris
                  {wishlistCount > 0 && <span className="badge-count-pill">{wishlistCount}</span>}
                </button>
              </li>
              <li className="mobile-only-nav-item">
                <button
                  type="button"
                  className="nav-link-item nav-link-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenOrdersTracking) onOpenOrdersTracking();
                  }}
                >
                  <i className="fa-solid fa-box-open nav-icon-mobile" style={{ color: 'var(--primary-color)' }}></i> Vos commandes
                </button>
              </li>
              <li>
                <a href="#apropos" onClick={() => setMobileMenuOpen(false)}>
                  <i className="fa-solid fa-circle-info nav-icon-mobile"></i> À propos
                </a>
              </li>
              <li>
                <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
                  <i className="fa-solid fa-envelope nav-icon-mobile"></i> Contact
                </a>
              </li>
            </ul>

            <div className="mobile-menu-footer">
              <div className="mobile-auth-section">
                {isAuthenticated ? (
                  <div
                    className="mobile-user-card"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openProfileModal();
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="user-avatar-badge">{getInitials(user?.name)}</div>
                    <div>
                      <strong>{user?.name}</strong>
                      <small><i className="fa-solid fa-gear"></i> Paramètres &amp; Profil</small>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal();
                    }}
                  >
                    <i className="fa-solid fa-user"></i>
                    <span>Se connecter / S'inscrire</span>
                  </button>
                )}
              </div>
            </div>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              aria-label="Mode Clair/Sombre"
            >
              <i className={theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
            </button>

            <button
              type="button"
              className="icon-btn desktop-only-action"
              onClick={openWishlist}
              title="Favoris"
              aria-label="Favoris"
            >
              <i className="fa-solid fa-heart"></i>
              {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
            </button>

            <button
              type="button"
              className="icon-btn orders-tracking-btn desktop-only-action"
              onClick={onOpenOrdersTracking}
              title="Vos commandes"
              aria-label="Vos commandes"
            >
              <i className="fa-solid fa-box-open"></i>
            </button>

            <button
              type="button"
              className="icon-btn cart-btn-active"
              onClick={openCart}
              title="Mon Panier"
              aria-label="Panier"
            >
              <i className="fa-solid fa-cart-shopping"></i>
              {totalItems > 0 && <span className="badge-count">{totalItems}</span>}
            </button>

            {isAuthenticated ? (
              <div className="user-menu-wrap desktop-only-action" ref={dropdownRef}>
                <button
                  type="button"
                  className="btn-auth-header"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  title="Mon Compte"
                >
                  <div className="user-avatar-badge">{getInitials(user?.name)}</div>
                  <span className="auth-btn-label">{user?.name?.split(' ')[0]}</span>
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.7rem' }}></i>
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <strong>{user?.name}</strong>
                      <small>{user?.email}</small>
                    </div>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        openProfileModal();
                      }}
                    >
                      <i className="fa-solid fa-user-gear"></i> Paramètres du compte
                    </button>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (onOpenOrdersTracking) onOpenOrdersTracking();
                      }}
                    >
                      <i className="fa-solid fa-box-open"></i> Vos commandes
                    </button>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        openWishlist();
                      }}
                    >
                      <i className="fa-solid fa-heart"></i> Mes Favoris
                    </button>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        openCart();
                      }}
                    >
                      <i className="fa-solid fa-bag-shopping"></i> Mon Panier
                    </button>
                    <button
                      type="button"
                      className="dropdown-item text-danger"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket"></i> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="btn-auth-header desktop-only-action"
                onClick={openAuthModal}
                title="Se connecter"
              >
                <i className="fa-solid fa-user"></i>
                <span className="auth-btn-label">Connexion</span>
              </button>
            )}

            <button
              type="button"
              className="icon-btn menu-btn"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Menu"
            >
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
