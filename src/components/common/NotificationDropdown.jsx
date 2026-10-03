import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  fetchClientNotifications,
  markClientNotificationRead,
  markAllClientNotificationsRead,
} from '../../services/notificationApi';

export const NotificationDropdown = ({ isOpen, onClose, onSelectOrder }) => {
  const { token, setClientUnreadCount } = useAuth();
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchClientNotifications(token);
      setNotifications(data.notifications || []);
      setClientUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.warn('Erreur chargement notifications client :', err);
    } finally {
      setLoading(false);
    }
  }, [token, setClientUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  if (!isOpen) return null;

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await markClientNotificationRead(id, token);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setClientUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllClientNotificationsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setClientUnreadCount(0);
      addToast('Notifications', 'Toutes les notifications sont marquées comme lues.', 'success');
    } catch (err) {
      addToast('Erreur', 'Impossible de marquer toutes les notifications.', 'error');
    }
  };

  const handleClickNotification = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif._id);
    }
    onClose();
    if (notif.orderNumber && onSelectOrder) {
      onSelectOrder(notif.orderNumber);
    }
  };

  return (
    <div className="notification-dropdown-panel animate-fade-in" onClick={(e) => e.stopPropagation()}>
      <div className="notif-dropdown-header">
        <div className="d-flex align-items-center gap-2">
          <i className="fa-solid fa-bell text-primary"></i>
          <strong>Vos Notifications</strong>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button type="button" className="btn-mark-all-read-sm" onClick={handleMarkAllRead}>
            <i className="fa-solid fa-check-double"></i> Tout marquer
          </button>
        )}
      </div>

      <div className="notif-dropdown-body">
        {loading && notifications.length === 0 ? (
          <div className="notif-loading-state">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <span>Chargement des alertes...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty-state">
            <i className="fa-regular fa-bell-slash empty-icon"></i>
            <p>Aucune notification pour le moment.</p>
          </div>
        ) : (
          <div className="notif-items-list">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`notif-item-row ${n.isRead ? 'read' : 'unread'}`}
                onClick={() => handleClickNotification(n)}
              >
                <div className="notif-icon-circle">
                  <i
                    className={`fa-solid ${
                      n.type === 'order_new'
                        ? 'fa-bag-shopping'
                        : n.type === 'order_status'
                        ? 'fa-truck-fast'
                        : 'fa-info'
                    }`}
                  ></i>
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
    </div>
  );
};

export default NotificationDropdown;
