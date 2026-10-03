import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  fetchSellerNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/sellerApi';

export const SellerNotifications = ({ onRefreshCounts }) => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchSellerNotifications(token);
      setNotifications(data.notifications || []);
    } catch (err) {
      console.warn('Erreur chargement notifications :', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id, token);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      if (onRefreshCounts) onRefreshCounts();
    } catch (err) {
      addToast('Erreur', 'Impossible de marquer la notification comme lue.', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      addToast('Notifications', 'Toutes les notifications sont marquées comme lues.', 'success');
      if (onRefreshCounts) onRefreshCounts();
    } catch (err) {
      addToast('Erreur', 'Impossible de marquer toutes les notifications.', 'error');
    }
  };

  return (
    <div className="seller-notifications-section">
      <div className="seller-section-header-bar">
        <div>
          <h3 className="seller-section-title">Centre de Notifications</h3>
          <p className="seller-section-desc">Historique de vos alertes de commandes et d&apos;activité boutique.</p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
            <i className="fa-solid fa-check-double"></i>
            <span>Tout marquer comme lu</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="seller-table-loading">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <span>Chargement de vos notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="seller-empty-state">
          <i className="fa-solid fa-bell-slash empty-icon"></i>
          <h4>Aucune notification</h4>
          <p>Vous n&apos;avez aucune notification pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="seller-notifications-list">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`seller-notification-card ${notif.isRead ? 'read' : 'unread'}`}
            >
              <div className="notification-icon-wrap">
                <i className="fa-solid fa-bag-shopping"></i>
              </div>
              <div className="notification-body">
                <div className="notification-header-row">
                  <strong>{notif.title}</strong>
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
              </div>

              {!notif.isRead && (
                <button
                  type="button"
                  className="btn-mark-read"
                  title="Marquer comme lu"
                  onClick={() => handleMarkAsRead(notif._id)}
                >
                  <i className="fa-solid fa-check"></i>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
