import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationCenterModal = ({ isOpen, onClose, onSelectOrder, onSelectProduct, onOpenSettings }) => {
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

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (onlyUnread && n.isRead) return false;
    if (activeCategory === 'orders' && !['order_new', 'order_status', 'order_confirmed', 'order_in_preparation', 'order_shipped', 'order_delivered'].includes(n.type)) return false;
    if (activeCategory === 'products' && !['new_product', 'price_drop', 'promo_ending', 'stock_alert'].includes(n.type)) return false;
    if (activeCategory === 'system' && n.type !== 'system') return false;

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      return (
        n.title.toLowerCase().includes(s) ||
        n.message.toLowerCase().includes(s) ||
        (n.orderNumber && n.orderNumber.toLowerCase().includes(s))
      );
    }
    return true;
  });

  const handleActionClick = (n) => {
    if (!n.isRead) markAsRead(n._id);
    onClose();

    if (n.orderNumber && onSelectOrder) {
      onSelectOrder(n.orderNumber);
    } else if (n.productId && onSelectProduct) {
      onSelectProduct(n.productId);
    }
  };

  const getBadgeType = (type) => {
    switch (type) {
      case 'order_new':
        return { label: 'Commande', color: 'badge-blue', icon: 'fa-bag-shopping' };
      case 'order_status':
      case 'order_confirmed':
      case 'order_in_preparation':
      case 'order_shipped':
        return { label: 'Livraison', color: 'badge-purple', icon: 'fa-truck-fast' };
      case 'order_delivered':
        return { label: 'Livrée', color: 'badge-green', icon: 'fa-circle-check' };
      case 'price_drop':
        return { label: 'Baisse de prix', color: 'badge-amber', icon: 'fa-tag' };
      case 'new_product':
        return { label: 'Nouveauté', color: 'badge-cyan', icon: 'fa-sparkles' };
      case 'promo_ending':
        return { label: 'Promotion', color: 'badge-red', icon: 'fa-fire' };
      default:
        return { label: 'Info', color: 'badge-gray', icon: 'fa-bell' };
    }
  };

  return (
    <div className="notif-modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="notif-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="notif-modal-header">
          <div className="notif-modal-title-group">
            <div className="notif-modal-icon-wrap">
              <i className="fa-solid fa-bell"></i>
              {unreadCount > 0 && <span className="notif-modal-badge">{unreadCount}</span>}
            </div>
            <div>
              <h3 className="notif-modal-title">Centre de Notifications</h3>
              <p className="notif-modal-subtitle">Gérez et consultez vos alertes en temps réel</p>
            </div>
          </div>

          <div className="notif-modal-header-actions">
            {unreadCount > 0 && (
              <button type="button" className="btn-notif-action-sm" onClick={markAllAsRead} title="Tout marquer comme lu">
                <i className="fa-solid fa-check-double"></i>
                <span className="hide-mobile">Tout marquer</span>
              </button>
            )}
            {onOpenSettings && (
              <button
                type="button"
                className="btn-notif-action-icon"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                title="Préférences de notifications"
              >
                <i className="fa-solid fa-sliders"></i>
              </button>
            )}
            <button type="button" className="btn-notif-close" onClick={onClose} aria-label="Fermer">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Filtres et barre de recherche */}
        <div className="notif-modal-controls">
          <div className="notif-category-tabs">
            <button
              type="button"
              className={`notif-tab-chip ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              Toutes
            </button>
            <button
              type="button"
              className={`notif-tab-chip ${activeCategory === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveCategory('orders')}
            >
              Commandes &amp; Suivi
            </button>
            <button
              type="button"
              className={`notif-tab-chip ${activeCategory === 'products' ? 'active' : ''}`}
              onClick={() => setActiveCategory('products')}
            >
              Produits &amp; Prix
            </button>
            <button
              type="button"
              className={`notif-tab-chip ${activeCategory === 'system' ? 'active' : ''}`}
              onClick={() => setActiveCategory('system')}
            >
              Système
            </button>
          </div>

          <div className="notif-search-row">
            <div className="notif-search-input-wrap">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Rechercher une notification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button type="button" className="btn-clear-search" onClick={() => setSearchTerm('')}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>

            <label className="notif-unread-toggle">
              <input
                type="checkbox"
                checked={onlyUnread}
                onChange={(e) => setOnlyUnread(e.target.checked)}
              />
              <span>Non lues uniquement</span>
            </label>
          </div>
        </div>

        {/* Corps de la liste */}
        <div className="notif-modal-body">
          {loading && notifications.length === 0 ? (
            <div className="notif-center-loading">
              <i className="fa-solid fa-spinner fa-spin"></i>
              <span>Chargement de votre historique...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notif-center-empty">
              <div className="empty-icon-bubble">
                <i className="fa-regular fa-bell-slash"></i>
              </div>
              <h4>Aucune notification trouvée</h4>
              <p>
                {searchTerm || onlyUnread
                  ? 'Aucun résultat ne correspond à vos critères de recherche.'
                  : 'Vous êtes à jour ! Aucune alerte récente.'}
              </p>
            </div>
          ) : (
            <div className="notif-full-list">
              {filteredNotifications.map((n) => {
                const badge = getBadgeType(n.type);
                return (
                  <div
                    key={n._id}
                    className={`notif-card-item ${n.isRead ? 'is-read' : 'is-unread'}`}
                    onClick={() => handleActionClick(n)}
                  >
                    <div className="notif-card-icon-area">
                      <div className={`notif-badge-pill ${badge.color}`}>
                        <i className={`fa-solid ${badge.icon}`}></i>
                      </div>
                    </div>

                    <div className="notif-card-content">
                      <div className="notif-card-top-row">
                        <span className={`notif-type-tag ${badge.color}`}>{badge.label}</span>
                        <span className="notif-card-date">
                          {new Date(n.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <h4 className="notif-card-heading">
                        {n.title}
                        {!n.isRead && <span className="notif-unread-glow" title="Non lue" />}
                      </h4>

                      <p className="notif-card-msg">{n.message}</p>

                      {n.orderNumber && (
                        <div className="notif-card-meta-bar">
                          <span>
                            <i className="fa-solid fa-box-open text-primary"></i> Réf :{' '}
                            <strong>#{n.orderNumber}</strong>
                          </span>
                          <span className="notif-action-link">
                            Voir le détail <i className="fa-solid fa-arrow-right"></i>
                          </span>
                        </div>
                      )}

                      {n.productId && (
                        <div className="notif-card-meta-bar">
                          <span className="notif-action-link">
                            Consulter le produit <i className="fa-solid fa-arrow-right"></i>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="notif-card-actions" onClick={(e) => e.stopPropagation()}>
                      {!n.isRead && (
                        <button
                          type="button"
                          className="btn-card-action"
                          onClick={() => markAsRead(n._id)}
                          title="Marquer comme lu"
                        >
                          <i className="fa-solid fa-check"></i>
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-card-action text-danger"
                        onClick={() => removeNotification(n._id)}
                        title="Supprimer la notification"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenterModal;
