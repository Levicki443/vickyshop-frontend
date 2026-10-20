import React, { useEffect } from 'react';

/**
 * Composant MobileMenuModal
 * Modale de navigation latérale (Drawer Modal) pour mobile
 * avec positionnement prioritaire du bouton de connexion/profil en haut du tiroir.
 */
export const MobileMenuModal = ({
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
  onOpenNotifs,
  onOpenAIAssistant
}) => {
  // Verrouillage du défilement de l'arrière-plan lorsque la modale est ouverte
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

  const handleAction = (callback) => {
    onClose();
    if (typeof callback === 'function') {
      setTimeout(callback, 60);
    }
  };

  return (
    <>
      {/* Arrière-plan assombri (Backdrop) */}
      <div
        className="mobile-menu-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Tiroir latéral modal */}
      <aside
        className="mobile-menu-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
      >
        {/* En-tête de la modale */}
        <div className="mobile-drawer-header">
          <a
            href="#accueil"
            className="logo mobile-drawer-logo"
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
            className="mobile-drawer-close-btn"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Corps défilable de la modale */}
        <div className="mobile-drawer-body">
          {/* CARTE D'AUTHENTIFICATION EN HAUT DE LA MODALE : Immédiatement visible */}
          <section className="mobile-auth-hero-card">
            {isAuthenticated ? (
              <div className="mobile-user-authenticated-box">
                <div
                  className="mobile-user-profile-row"
                  onClick={() => handleAction(() => onOpenProfile('profile'))}
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
                    onClick={() => handleAction(() => onOpenProfile('profile'))}
                  >
                    <i className="fa-solid fa-user-gear"></i>
                    <span>Mon Profil</span>
                  </button>

                  {isSeller && (
                    <button
                      type="button"
                      className="btn btn-primary mobile-quick-btn"
                      onClick={() => handleAction(onOpenSeller)}
                    >
                      <i className="fa-solid fa-store"></i>
                      <span>Vendeur</span>
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

                {/* Bouton de connexion proéminent et immédiatement visible en haut */}
                <button
                  type="button"
                  className="btn btn-primary mobile-login-hero-btn"
                  onClick={() => handleAction(onOpenAuth)}
                >
                  <i className="fa-solid fa-arrow-right-to-bracket"></i>
                  <span>Se connecter / S&apos;inscrire</span>
                </button>
              </div>
            )}
          </section>

          {/* LIENS DE NAVIGATION */}
          <nav className="mobile-drawer-nav">
            <span className="mobile-section-label">Navigation</span>
            <ul className="mobile-nav-list">
              <li>
                <a href="#accueil" className="mobile-nav-card" onClick={(e) => handleLinkClick(e, 'accueil')}>
                  <div className="mobile-nav-card-left">
                    <i className="fa-solid fa-house mobile-nav-card-icon"></i>
                    <span>Accueil</span>
                  </div>
                  <i className="fa-solid fa-chevron-right mobile-nav-arrow"></i>
                </a>
              </li>

              <li>
                <a href="#produits" className="mobile-nav-card" onClick={(e) => handleLinkClick(e, 'produits')}>
                  <div className="mobile-nav-card-left">
                    <i className="fa-solid fa-table-cells-large mobile-nav-card-icon"></i>
                    <span>Produits</span>
                  </div>
                  <i className="fa-solid fa-chevron-right mobile-nav-arrow"></i>
                </a>
              </li>

              <li>
                <a href="#flash-sale" className="mobile-nav-card" onClick={(e) => handleLinkClick(e, 'flash-sale')}>
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
                    handleAction(() => {
                      if (onOpenAIAssistant) onOpenAIAssistant();
                      else {
                        window.history.pushState(null, '', '/assistant-ia');
                        window.dispatchEvent(new Event('app-navigate'));
                      }
                    });
                  }}
                >
                  <div className="mobile-nav-card-left">
                    <i className="fa-solid fa-wand-magic-sparkles mobile-nav-card-icon" style={{ color: 'var(--primary)' }}></i>
                    <span>Assistant IA</span>
                  </div>
                  <div className="mobile-nav-card-right">
                    <span className="hot-badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>Nouveau</span>
                    <i className="fa-solid fa-chevron-right mobile-nav-arrow"></i>
                  </div>
                </button>
              </li>

              <li>
                <button type="button" className="mobile-nav-card mobile-nav-btn" onClick={() => handleAction(onOpenWishlist)}>
                  <div className="mobile-nav-card-left">
                    <i className="fa-solid fa-heart mobile-nav-card-icon text-danger"></i>
                    <span>Favoris</span>
                  </div>
                  <div className="mobile-nav-card-right">
                    {wishlistCount > 0 && <span className="badge-count-pill">{wishlistCount}</span>}
                    <i className="fa-solid fa-chevron-right mobile-nav-arrow"></i>
                  </div>
                </button>
              </li>

              <li>
                <button type="button" className="mobile-nav-card mobile-nav-btn" onClick={() => handleAction(onOpenOrders)}>
                  <div className="mobile-nav-card-left">
                    <i className="fa-solid fa-box-open mobile-nav-card-icon text-primary"></i>
                    <span>Vos commandes</span>
                  </div>
                  <i className="fa-solid fa-chevron-right mobile-nav-arrow"></i>
                </button>
              </li>

              {isAuthenticated && (
                <li>
                  <button type="button" className="mobile-nav-card mobile-nav-btn" onClick={() => handleAction(onOpenNotifs)}>
                    <div className="mobile-nav-card-left">
                      <i className="fa-solid fa-bell mobile-nav-card-icon text-primary"></i>
                      <span>Notifications</span>
                    </div>
                    <div className="mobile-nav-card-right">
                      {unreadCount > 0 && <span className="badge-count-pill">{unreadCount}</span>}
                      <i className="fa-solid fa-chevron-right mobile-nav-arrow"></i>
                    </div>
                  </button>
                </li>
              )}

              {isSeller && isAuthenticated && (
                <li>
                  <button type="button" className="mobile-nav-card mobile-nav-btn mobile-nav-seller" onClick={() => handleAction(onOpenSeller)}>
                    <div className="mobile-nav-card-left">
                      <i className="fa-solid fa-store mobile-nav-card-icon text-primary"></i>
                      <span>Gestion Vendeur</span>
                    </div>
                    <i className="fa-solid fa-chevron-right mobile-nav-arrow"></i>
                  </button>
                </li>
              )}
            </ul>
          </nav>

          {/* Pied de la modale */}
          {isAuthenticated && (
            <div className="mobile-drawer-footer">
              <button
                type="button"
                className="btn btn-block mobile-logout-btn"
                onClick={() => handleAction(onLogout)}
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
