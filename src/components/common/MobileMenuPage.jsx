import React, { useEffect } from 'react';

/**
 * Composant MobileMenuPage
 * Affiche la navigation mobile sous forme d'une véritable page plein écran
 * avec mise en avant prioritaire du bouton de connexion/profil en haut de page.
 */
export const MobileMenuPage = ({
  isOpen,
  onClose,
  onNavAnchor,
  logoImg,
  triggerProps,
  isAuthenticated,
  user,
  isSeller,
  unreadCount,
  wishlistCount,
  onOpenAuth,
  onLogout,
  onOpenSeller,
  onOpenProfile,
  onOpenOrders,
  onOpenWishlist,
  onOpenNotifs
}) => {
  // Empêche le défilement de la page arrière-plan quand le menu plein écran est ouvert
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((p) => p[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleLinkClick = (e, anchorId) => {
    onClose();
    if (onNavAnchor) {
      onNavAnchor(e, anchorId);
    }
  };

  return (
    <div
      className="mobile-menu-page"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation principale mobile"
    >
      {/* En-tête de la page mobile */}
      <div className="mobile-page-header">
        <a
          href="#accueil"
          className="logo mobile-page-logo"
          {...triggerProps}
          onClick={(e) => handleLinkClick(e, 'accueil')}
        >
          <img src={logoImg} alt="Vicky-Shop" className="logo-img rounded-logo" />
          <span className="logo-text">
            Vicky<span className="logo-accent">-Shop</span>
          </span>
        </a>

        <button
          type="button"
          className="mobile-page-close-btn"
          onClick={onClose}
          aria-label="Fermer le menu"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* Contenu principal de la page mobile */}
      <div className="mobile-page-content">
        {/* CARTE D'AUTHENTIFICATION PRIORITAIRE : Positionnée tout en haut pour une visibilité immédiate */}
        <section className="mobile-auth-hero-card">
          {isAuthenticated ? (
            <div className="mobile-user-authenticated-box">
              <div
                className="mobile-user-profile-row"
                onClick={() => {
                  onClose();
                  onOpenProfile('profile');
                }}
              >
                <div className="user-avatar-badge mobile-user-avatar">
                  {getInitials(user?.name)}
                </div>
                <div className="mobile-user-info-col">
                  <strong className="mobile-user-name">{user?.name}</strong>
                  <span className="mobile-user-role">
                    {isSeller ? '🏪 Compte Vendeur' : '👤 Client Vicky-Shop'}
                  </span>
                </div>
                <i className="fa-solid fa-chevron-right mobile-profile-arrow"></i>
              </div>

              <div className="mobile-user-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary mobile-quick-btn"
                  onClick={() => {
                    onClose();
                    onOpenProfile('profile');
                  }}
                >
                  <i className="fa-solid fa-user-gear"></i>
                  <span>Mon Profil</span>
                </button>

                {isSeller && (
                  <button
                    type="button"
                    className="btn btn-primary mobile-quick-btn"
                    onClick={() => {
                      onClose();
                      onOpenSeller();
                    }}
                  >
                    <i className="fa-solid fa-store"></i>
                    <span>Espace Vendeur</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mobile-guest-box">
              <div className="mobile-guest-header">
                <div className="mobile-guest-icon-wrap">
                  <i className="fa-solid fa-circle-user"></i>
                </div>
                <div className="mobile-guest-texts">
                  <h3 className="mobile-guest-title">Bienvenue sur Vicky-Shop !</h3>
                  <p className="mobile-guest-subtitle">
                    Connectez-vous pour suivre vos commandes et gérer vos favoris.
                  </p>
                </div>
              </div>

              {/* Bouton de connexion proéminent et parfaitement visible */}
              <button
                type="button"
                className="btn btn-primary mobile-login-hero-btn"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
              >
                <i className="fa-solid fa-arrow-right-to-bracket"></i>
                <span>Se connecter / S&apos;inscrire</span>
              </button>
            </div>
          )}
        </section>

        {/* LISTE DES LIENS DE NAVIGATION */}
        <section className="mobile-nav-section">
          <span className="mobile-section-label">Navigation</span>
          <ul className="mobile-nav-list">
            <li>
              <a
                href="#accueil"
                className="mobile-nav-card"
                onClick={(e) => handleLinkClick(e, 'accueil')}
              >
                <div className="mobile-nav-card-left">
                  <i className="fa-solid fa-house mobile-nav-card-icon"></i>
                  <span>Accueil</span>
                </div>
                <i className="fa-solid fa-chevron-right mobile-nav-arrow"></i>
              </a>
            </li>

            <li>
              <a
                href="#produits"
                className="mobile-nav-card"
                onClick={(e) => handleLinkClick(e, 'produits')}
              >
                <div className="mobile-nav-card-left">
                  <i className="fa-solid fa-grid-2 mobile-nav-card-icon"></i>
                  <span>Produits</span>
                </div>
                <i className="fa-solid fa-chevron-right mobile-nav-arrow"></i>
              </a>
            </li>

            <li>
              <a
                href="#flash-sale"
                className="mobile-nav-card"
                onClick={(e) => handleLinkClick(e, 'flash-sale')}
              >
                <div className="mobile-nav-card-left">
                  <i className="fa-solid fa-fire mobile-nav-card-icon text-warning"></i>
                  <span>Vente Flash</span>
                </div>
                <div className="mobile-nav-card-right">
                  <span className="hot-badge">Hot</span>
                  <i className="fa-solid fa-chevron-right mobile-nav-arrow"></i>
                </div>
              </a>
            </li>

            <li>
              <button
                type="button"
                className="mobile-nav-card mobile-nav-btn"
                onClick={() => {
                  onClose();
                  onOpenWishlist();
                }}
              >
                <div className="mobile-nav-card-left">
                  <i className="fa-solid fa-heart mobile-nav-card-icon text-danger"></i>
                  <span>Mes Favoris</span>
                </div>
                <div className="mobile-nav-card-right">
                  {wishlistCount > 0 && (
                    <span className="badge-count-pill">{wishlistCount}</span>
                  )}
                  <i className="fa-solid fa-chevron-right mobile-nav-arrow"></i>
                </div>
              </button>
            </li>

            <li>
              <button
                type="button"
                className="mobile-nav-card mobile-nav-btn"
                onClick={() => {
                  onClose();
                  onOpenOrders();
                }}
              >
                <div className="mobile-nav-card-left">
                  <i className="fa-solid fa-box-open mobile-nav-card-icon text-primary"></i>
                  <span>Vos commandes</span>
                </div>
                <i className="fa-solid fa-chevron-right mobile-nav-arrow"></i>
              </button>
            </li>

            {isAuthenticated && (
              <li>
                <button
                  type="button"
                  className="mobile-nav-card mobile-nav-btn"
                  onClick={() => {
                    onClose();
                    onOpenNotifs();
                  }}
                >
                  <div className="mobile-nav-card-left">
                    <i className="fa-solid fa-bell mobile-nav-card-icon text-primary"></i>
                    <span>Notifications</span>
                  </div>
                  <div className="mobile-nav-card-right">
                    {unreadCount > 0 && (
                      <span className="badge-count-pill">{unreadCount}</span>
                    )}
                    <i className="fa-solid fa-chevron-right mobile-nav-arrow"></i>
                  </div>
                </button>
              </li>
            )}

            {isSeller && isAuthenticated && (
              <li>
                <button
                  type="button"
                  className="mobile-nav-card mobile-nav-btn mobile-nav-seller"
                  onClick={() => {
                    onClose();
                    onOpenSeller();
                  }}
                >
                  <div className="mobile-nav-card-left">
                    <i className="fa-solid fa-store mobile-nav-card-icon text-primary"></i>
                    <span>Gestion Vendeur</span>
                  </div>
                  <i className="fa-solid fa-chevron-right mobile-nav-arrow"></i>
                </button>
              </li>
            )}
          </ul>
        </section>

        {/* PIED DE PAGE : Déconnexion si connecté */}
        {isAuthenticated && (
          <div className="mobile-page-footer">
            <button
              type="button"
              className="btn btn-block mobile-logout-btn"
              onClick={() => {
                onClose();
                onLogout();
              }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
