import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from '../services/notificationApi';
import { getSocket } from '../services/socket';
import { playNotificationSound } from '../utils/notificationAudio';
import { isPushSupported, subscribeToWebPush, unsubscribeFromWebPush, getPushPermissionState } from '../services/pushNotificationService';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    orders: true,
    delivery: true,
    newProducts: true,
    priceDrops: true,
    promotions: true,
    pushNotifications: true,
    soundEnabled: true,
    sellerNewOrders: true,
    sellerOrderStatus: true,
    sellerStockAlerts: true,
  });

  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isPushActive, setIsPushActive] = useState(false);

  const preferencesRef = useRef(preferences);
  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  // Chargement des notifications
  const loadNotifications = useCallback(
    async (category = 'all', unreadOnly = false) => {
      if (!token) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchNotifications({ token, category, unreadOnly, limit: 40 });
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (err) {
        console.warn('[NotificationContext] Erreur chargement notifications :', err.message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Chargement des préférences utilisateur
  const loadPreferences = useCallback(async () => {
    if (!token) return;
    try {
      const prefs = await fetchNotificationPreferences(token);
      if (prefs && Object.keys(prefs).length > 0) {
        setPreferences((prev) => ({ ...prev, ...prefs }));
      }
    } catch (err) {
      console.warn('[NotificationContext] Erreur chargement préférences :', err.message);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadNotifications(activeCategory);
      loadPreferences();
      if (isPushSupported()) {
        setIsPushActive(getPushPermissionState() === 'granted');
      }
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, token, loadNotifications, loadPreferences, activeCategory]);

  // Écoute des notifications en temps réel via Socket.IO
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    const handleNewNotification = (newNotif) => {
      if (!newNotif) return;

      setNotifications((prev) => [newNotif, ...prev.filter((n) => n._id !== newNotif._id)]);
      setUnreadCount((prev) => prev + 1);

      // Déclenchement du son si autorisé
      if (preferencesRef.current.soundEnabled !== false) {
        playNotificationSound();
      }

      // Notification Toast visuelle immédiate
      if (addToast) {
        const toastType = newNotif.type === 'order_new' ? 'success' : newNotif.type === 'price_drop' ? 'info' : 'default';
        addToast(newNotif.title, newNotif.message, toastType);
      }
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [isAuthenticated, addToast]);

  const markAsRead = async (id) => {
    if (!token || !id) return;
    try {
      await markNotificationRead(id, token);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, readAt: new Date() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('[NotificationContext] Erreur markAsRead :', err.message);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await markAllNotificationsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date() })));
      setUnreadCount(0);
      if (addToast) {
        addToast('Notifications', 'Toutes les notifications sont marquées comme lues.', 'success');
      }
    } catch (err) {
      if (addToast) {
        addToast('Erreur', 'Impossible de marquer toutes les notifications.', 'error');
      }
    }
  };

  const removeNotification = async (id) => {
    if (!token || !id) return;
    try {
      await deleteNotification(id, token);
      const target = notifications.find((n) => n._id === id);
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (addToast) {
        addToast('Supprimée', 'Notification retirée de votre historique.', 'info');
      }
    } catch (err) {
      if (addToast) {
        addToast('Erreur', 'Impossible de supprimer la notification.', 'error');
      }
    }
  };

  const updatePrefs = async (newPrefs) => {
    if (!token) return;
    try {
      const updated = await updateNotificationPreferences(newPrefs, token);
      setPreferences((prev) => ({ ...prev, ...updated }));
      if (addToast) {
        addToast('Préférences enregistrées', 'Vos paramètres de notifications ont été mis à jour.', 'success');
      }
      return updated;
    } catch (err) {
      if (addToast) {
        addToast('Erreur', err.message || 'Échec de l\'enregistrement des préférences.', 'error');
      }
    }
  };

  const toggleWebPush = async () => {
    if (!token) return;
    try {
      if (isPushActive) {
        await unsubscribeFromWebPush(token);
        setIsPushActive(false);
        await updatePrefs({ ...preferences, pushNotifications: false });
        if (addToast) addToast('Notifications Push', 'Les notifications push ont été désactivées.', 'info');
      } else {
        const result = await subscribeToWebPush(token);
        if (result.success) {
          setIsPushActive(true);
          await updatePrefs({ ...preferences, pushNotifications: true });
          if (addToast) addToast('Notifications Push Activées !', 'Vous recevrez désormais les alertes même hors ligne.', 'success');
        } else if (result.permission === 'denied') {
          if (addToast) addToast('Permission refusée', 'Veuillez autoriser les notifications dans les réglages de votre navigateur.', 'error');
        }
      }
    } catch (err) {
      if (addToast) addToast('Erreur Push', err.message || 'Impossible d\'activer les notifications push.', 'error');
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        preferences,
        activeCategory,
        setActiveCategory,
        isNotificationCenterOpen,
        openNotificationCenter: () => setIsNotificationCenterOpen(true),
        closeNotificationCenter: () => setIsNotificationCenterOpen(false),
        loadNotifications,
        markAsRead,
        markAllAsRead,
        removeNotification,
        updatePrefs,
        isPushActive,
        toggleWebPush,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé au sein d\'un NotificationProvider');
  }
  return context;
};
