/**
 * Service API pour la gestion unifiée des notifications (Client & Vendeur Vicky-Shop).
 */

const rawBaseUrl = (import.meta.env.VITE_URL || import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

/**
 * Récupère la liste paginée et filtrée des notifications de l'utilisateur connecté.
 */
export const fetchNotifications = async ({ token, category = 'all', unreadOnly = false, page = 1, limit = 30 }) => {
  if (!token) return { notifications: [], unreadCount: 0, total: 0, page: 1, totalPages: 1 };
  
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (unreadOnly) params.append('unreadOnly', 'true');
  params.append('page', String(page));
  params.append('limit', String(limit));

  const res = await fetch(`${API_BASE_URL}/notifications?${params.toString()}`, {
    headers: getAuthHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur lors du chargement des notifications.');
  return json.data || { notifications: [], unreadCount: 0, total: 0, page: 1, totalPages: 1 };
};

/**
 * Alias de compatibilité pour le chargement des notifications client.
 */
export const fetchClientNotifications = async (token) => {
  return await fetchNotifications({ token });
};

/**
 * Marque une notification spécifique comme lue.
 */
export const markNotificationRead = async (id, token) => {
  if (!token || !id) return;
  const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur lors de la mise à jour de la notification.');
  return json.data?.notification;
};

export const markClientNotificationRead = markNotificationRead;

/**
 * Marque toutes les notifications de l'utilisateur comme lues.
 */
export const markAllNotificationsRead = async (token) => {
  if (!token) return;
  const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur lors du marquage des notifications.');
  return json;
};

export const markAllClientNotificationsRead = markAllNotificationsRead;

/**
 * Supprime définitivement une notification de l'historique.
 */
export const deleteNotification = async (id, token) => {
  if (!token || !id) return;
  const res = await fetch(`${API_BASE_URL}/notifications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur lors de la suppression de la notification.');
  return json;
};

/**
 * Récupère les préférences de notifications de l'utilisateur.
 */
export const fetchNotificationPreferences = async (token) => {
  if (!token) return {};
  const res = await fetch(`${API_BASE_URL}/notifications/preferences`, {
    headers: getAuthHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur préférences notifications.');
  return json.data?.preferences || {};
};

/**
 * Met à jour les préférences de notifications de l'utilisateur.
 */
export const updateNotificationPreferences = async (preferences, token) => {
  if (!token) return {};
  const res = await fetch(`${API_BASE_URL}/notifications/preferences`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(preferences),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur enregistrement préférences.');
  return json.data?.preferences || {};
};

/**
 * Récupère la clé publique VAPID du serveur pour le Push Web.
 */
export const fetchVapidPublicKey = async () => {
  const res = await fetch(`${API_BASE_URL}/notifications/vapid-key`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur récupération clé VAPID.');
  return json.data?.publicKey || '';
};

/**
 * Enregistre un abonnement Web Push auprès du serveur.
 */
export const registerPushSubscription = async (subscription, token) => {
  if (!token || !subscription) return;
  const res = await fetch(`${API_BASE_URL}/notifications/push-subscribe`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.toJSON()?.keys?.p256dh,
        auth: subscription.toJSON()?.keys?.auth,
      },
      deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur abonnement push.');
  return json;
};

/**
 * Supprime un abonnement Web Push auprès du serveur.
 */
export const unregisterPushSubscription = async (endpoint, token) => {
  if (!token || !endpoint) return;
  const res = await fetch(`${API_BASE_URL}/notifications/push-unsubscribe`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ endpoint }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur désabonnement push.');
  return json;
};
