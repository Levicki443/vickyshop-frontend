import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';

export const SellerNotifications = ({ onSelectOrder }) => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const [filterType, setFilterType] = useState('all');

  const sellerNotifications = notifications.filter((n) => {
    if (n.role !== 'vendeur' && !['order_new', 'stock_alert'].includes(n.type)) {
      return false;
    }
    if (filterType === 'unread') return !n.isRead;
    if (filterType === 'orders') return n.type === 'order_new';
    if (filterType === 'stock') return n.type === 'stock_alert';
    return true;
  });

  const handleCardClick = (notif) => {
    if (!notif.isRead) markAsRead(notif._id);
    if (notif.orderNumber && onSelectOrder) {
      onSelectOrder(notif.orderNumber);
    }
  };

  return (
    <div className="seller-notifications-section animate-fade-in">
      <div className="seller-section-header-bar">
        <div>
          <h3 className="seller-section-title">
            <i className="fa-solid fa-bell text-primary"></i> Centre de Notifications Vendeur
          </h3>
          <p className="seller-section-desc">
            Alertes instantanées sur vos nouvelles commandes, validations et alertes de stock.
          </p>
        </div>

        <div className="seller-notif-header-actions">
          {unreadCount > 0 && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={markAllAsRead}>
              <i className="fa-solid fa-check-double"></i>
              <span>Tout marquer comme lu</span>
            </button>
          )}
        </div>
      </div>

      {/* Barre de filtres rapides */}
      <div className="seller-notif-filters">
        <button
          type="button"
          className={`seller-chip-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          Toutes ({notifications.length})
        </button>
        <button
          type="button"
          className={`seller-chip-btn ${filterType === 'unread' ? 'active' : ''}`}
          onClick={() => setFilterType('unread')}
        >
          Non lues ({unreadCount})
        </button>
        <button
          type="button"
          className={`seller-chip-btn ${filterType === 'orders' ? 'active' : ''}`}
          onClick={() => setFilterType('orders')}
        >
          Commandes
        </button>
        <button
          type="button"
          className={`seller-chip-btn ${filterType === 'stock' ? 'active' : ''}`}
          onClick={() => setFilterType('stock')}
        >
          Stock &amp; Alertes
        </button>
      </div>

      {loading && notifications.length === 0 ? (
        <div className="seller-table-loading">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <span>Chargement des alertes boutique...</span>
        </div>
      ) : sellerNotifications.length === 0 ? (
        <div className="seller-empty-state">
          <i className="fa-solid fa-bell-slash empty-icon"></i>
          <h4>Aucune notification trouvée</h4>
          <p>Vous n&apos;avez aucune alerte correspondant à vos critères actuels.</p>
        </div>
      ) : (
        <div className="seller-notifications-list">
          {sellerNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`seller-notification-card ${notif.isRead ? 'read' : 'unread'}`}
              onClick={() => handleCardClick(notif)}
            >
              <div className="notification-icon-wrap">
                <i
                  className={`fa-solid ${
                    notif.type === 'order_new'
                      ? 'fa-bag-shopping text-primary'
                      : notif.type === 'stock_alert'
                      ? 'fa-triangle-exclamation text-warning'
                      : 'fa-info'
                  }`}
                ></i>
              </div>

              <div className="notification-body">
                <div className="notification-header-row">
                  <div className="d-flex align-items-center gap-2">
                    <strong>{notif.title}</strong>
                    {!notif.isRead && <span className="seller-unread-dot" />}
                  </div>
                  <span className="notification-time">
                    {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="notification-text">{notif.message}</p>

                {notif.orderNumber && (
                  <div className="seller-notif-meta">
                    <span>
                      <i className="fa-solid fa-receipt text-primary"></i> Commande :{' '}
                      <strong>#{notif.orderNumber}</strong>
                    </span>
                    <span className="seller-view-link">
                      Consulter la commande <i className="fa-solid fa-arrow-right"></i>
                    </span>
                  </div>
                )}
              </div>

              <div className="notification-card-actions" onClick={(e) => e.stopPropagation()}>
                {!notif.isRead && (
                  <button
                    type="button"
                    className="btn-mark-read"
                    title="Marquer comme lu"
                    onClick={() => markAsRead(notif._id)}
                  >
                    <i className="fa-solid fa-check"></i>
                  </button>
                )}
                <button
                  type="button"
                  className="btn-delete-notif"
                  title="Supprimer"
                  onClick={() => removeNotification(notif._id)}
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerNotifications;
