import React, { useState, useMemo, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { NotificationFeedCard } from './NotificationFeedCard';

/**
 * Page dédiée au Centre de Notifications utilisateur
 * Permet le filtrage par statut, catégorie, recherche en direct et actions rapides.
 */
export const NotificationsPage = ({ onBackToShop, onSelectOrder, onSelectProduct, onOpenSettings }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    activeCategory,
    setActiveCategory,
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(false);

  useEffect(() => {
    document.title = 'Notifications | Vicky-Shop';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Filtrage combiné : catégorie, recherche textuelle et non lues
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (onlyUnread && n.isRead) return false;

      if (activeCategory === 'orders') {
        const orderTypes = [
          'order_new',
          'order_status',
          'order_confirmed',
          'order_in_preparation',
          'order_shipped',
          'order_delivered',
        ];
        if (!orderTypes.includes(n.type)) return false;
      } else if (activeCategory === 'products') {
        const prodTypes = ['new_product', 'price_drop', 'promo_ending', 'stock_alert'];
        if (!prodTypes.includes(n.type)) return false;
      } else if (activeCategory === 'system') {
        if (n.type !== 'system') return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = n.title && n.title.toLowerCase().includes(query);
        const matchesMsg = n.message && n.message.toLowerCase().includes(query);
        const matchesOrder = n.orderNumber && n.orderNumber.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMsg && !matchesOrder) return false;
      }
      return true;
    });
  }, [notifications, activeCategory, onlyUnread, searchTerm]);

  const handleCardClick = (n) => {
    if (!n.isRead) markAsRead(n._id);
    if (n.orderNumber && onSelectOrder) {
      onSelectOrder(n.orderNumber);
    } else if (n.productId && onSelectProduct) {
      onSelectProduct(n.productId);
    }
  };

  return (
    <div className="notif-page-root animate-fade-in">
      <div className="container notif-page-container">
        {/* Barre de navigation supérieure de la page */}
        <div className="notif-page-topbar">
          <button type="button" className="btn-notif-back" onClick={onBackToShop}>
            <i className="fa-solid fa-arrow-left"></i>
            <span>Retour à la boutique</span>
          </button>

          <div className="notif-topbar-actions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn-mark-all-read-page"
                onClick={markAllAsRead}
                title="Tout marquer comme lu"
              >
                <i className="fa-solid fa-check-double"></i>
                <span>Tout marquer comme lu ({unreadCount})</span>
              </button>
            )}
            {onOpenSettings && (
              <button
                type="button"
                className="btn-notif-settings-page"
                onClick={onOpenSettings}
                title="Gérer les préférences de notification"
              >
                <i className="fa-solid fa-sliders"></i>
                <span className="hide-mobile">Préférences</span>
              </button>
            )}
          </div>
        </div>

        {/* En-tête titre avec statistiques */}
        <header className="notif-page-hero">
          <div className="notif-hero-title-group">
            <div className="notif-hero-icon-bubble">
              <i className="fa-solid fa-bell"></i>
              {unreadCount > 0 && <span className="notif-hero-badge-pill">{unreadCount}</span>}
            </div>
            <div>
              <h1 className="notif-page-main-title">Centre de Notifications</h1>
              <p className="notif-page-subtitle">
                Vos alertes d&apos;activité, suivis d&apos;acheminement et offres exclusives en direct
              </p>
            </div>
          </div>
        </header>

        {/* Barre de contrôles et filtres */}
        <div className="notif-controls-panel">
          <div className="notif-category-chips-list">
            <button
              type="button"
              className={`notif-chip-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              <i className="fa-solid fa-layer-group"></i>
              <span>Toutes</span>
            </button>
            <button
              type="button"
              className={`notif-chip-btn ${activeCategory === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveCategory('orders')}
            >
              <i className="fa-solid fa-truck-fast"></i>
              <span>Commandes &amp; Suivi</span>
            </button>
            <button
              type="button"
              className={`notif-chip-btn ${activeCategory === 'products' ? 'active' : ''}`}
              onClick={() => setActiveCategory('products')}
            >
              <i className="fa-solid fa-sparkles"></i>
              <span>Produits &amp; Nouveautés</span>
            </button>
            <button
              type="button"
              className={`notif-chip-btn ${activeCategory === 'system' ? 'active' : ''}`}
              onClick={() => setActiveCategory('system')}
            >
              <i className="fa-solid fa-gear"></i>
              <span>Système</span>
            </button>
          </div>

          <div className="notif-search-filter-row">
            <div className="notif-input-search-box">
              <i className="fa-solid fa-magnifying-glass search-ico"></i>
              <input
                type="text"
                placeholder="Rechercher par mot-clé ou réf. commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button type="button" className="btn-search-clear" onClick={() => setSearchTerm('')}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>

            <label className="notif-filter-unread-switch">
              <input
                type="checkbox"
                checked={onlyUnread}
                onChange={(e) => setOnlyUnread(e.target.checked)}
              />
              <span>Non lues uniquement</span>
            </label>
          </div>
        </div>

        {/* Corps principal : affichage conditionnel */}
        {!isAuthenticated ? (
          <div className="notif-auth-gate-box">
            <div className="notif-auth-icon-wrap">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h2>Accès à vos alertes personnelles</h2>
            <p>
              Connectez-vous à votre compte Vicky-Shop pour suivre l&apos;évolution de vos commandes,
              recevoir les alertes de baisses de prix et accéder à vos notifications privées.
            </p>
            <div className="notif-auth-actions-group">
              <button type="button" className="btn btn-primary" onClick={openAuthModal}>
                <i className="fa-solid fa-arrow-right-to-bracket"></i>
                <span>Se connecter / S&apos;inscrire</span>
              </button>
            </div>
          </div>
        ) : loading && notifications.length === 0 ? (
          <div className="notif-state-card notif-loading-box">
            <i className="fa-solid fa-circle-notch fa-spin"></i>
            <p>Synchronisation de vos notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notif-state-card notif-empty-box">
            <div className="notif-empty-icon-circle">
              <i className="fa-regular fa-bell-slash"></i>
            </div>
            <h3>Aucune notification disponible</h3>
            <p>
              {searchTerm || onlyUnread
                ? 'Aucune alerte ne correspond à vos critères de recherche actuels.'
                : 'Votre boîte de notifications est à jour. Vous n&apos;avez aucune nouvelle alerte.'}
            </p>
          </div>
        ) : (
          <div className="notif-page-feed">
            {filteredNotifications.map((n) => (
              <NotificationFeedCard
                key={n._id}
                notification={n}
                onCardClick={handleCardClick}
                onMarkAsRead={markAsRead}
                onRemove={removeNotification}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
