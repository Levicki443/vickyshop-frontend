import React from 'react';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationDropdown = ({ isOpen, onClose, onSelectOrder, onSelectProduct, onOpenCenter }) => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  if (!isOpen) return null;

  const handleItemClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif._id);
    }
    onClose();

    if (notif.orderNumber && onSelectOrder) {
      onSelectOrder(notif.orderNumber);
    } else if (notif.productId && onSelectProduct) {
      onSelectProduct(notif.productId);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'order_new':
        return 'fa-bag-shopping';
      case 'order_status':
      case 'order_confirmed':
      case 'order_in_preparation':
      case 'order_shipped':
        return 'fa-truck-fast';
      case 'order_delivered':
        return 'fa-circle-check text-success';
      case 'price_drop':
        return 'fa-tag text-warning';
      case 'new_product':
        return 'fa-sparkles text-primary';
      case 'promo_ending':
        return 'fa-fire text-danger';
      default:
        return 'fa-bell text-primary';
    }
  };

  const recentNotifications = notifications.slice(0, 6);

  return (
    <>
      <div className="notif-dropdown-backdrop" onClick={onClose} />
      <div className="notification-dropdown-panel animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="notif-dropdown-header">
        <div className="d-flex align-items-center gap-2">
          <i className="fa-solid fa-bell text-primary"></i>
          <strong>Notifications</strong>
          {unreadCount > 0 && <span className="notif-count-badge">{unreadCount}</span>}
        </div>
        {unreadCount > 0 && (
          <button type="button" className="btn-mark-all-read-sm" onClick={markAllAsRead} title="Tout marquer comme lu">
            <i className="fa-solid fa-check-double"></i> <span>Tout marquer</span>
          </button>
        )}
      </div>

      <div className="notif-dropdown-body">
        {loading && notifications.length === 0 ? (
          <div className="notif-loading-state">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <span>Chargement des alertes...</span>
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="notif-empty-state">
            <i className="fa-regular fa-bell-slash empty-icon"></i>
            <p>Aucune notification pour le moment.</p>
          </div>
        ) : (
          <div className="notif-items-list">
            {recentNotifications.map((n) => (
              <div
                key={n._id}
                className={`notif-item-row ${n.isRead ? 'read' : 'unread'}`}
                onClick={() => handleItemClick(n)}
              >
                <div className="notif-icon-circle">
                  <i className={`fa-solid ${getNotifIcon(n.type)}`}></i>
                </div>
                <div className="notif-text-col">
                  <div className="notif-title-row">
                    <strong>{n.title}</strong>
                    {!n.isRead && <span className="notif-unread-dot" />}
                  </div>
                  <p className="notif-desc-text">{n.message}</p>
                  <span className="notif-date-sub">
                    {new Date(n.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="notif-dropdown-footer">
        <button
          type="button"
          className="btn-view-all-notifs"
          onClick={() => {
            onClose();
            if (onOpenCenter) onOpenCenter();
          }}
        >
          <span>Voir toutes les notifications</span>
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
    </>
  );
};

export default NotificationDropdown;
