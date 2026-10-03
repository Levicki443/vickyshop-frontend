/**
 * Service API pour la gestion des notifications client (Vicky-Shop).
 */

const rawBaseUrl = (import.meta.env.VITE_URL || import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const fetchClientNotifications = async (token) => {
  if (!token) return { notifications: [], unreadCount: 0 };
  const res = await fetch(`${API_BASE_URL}/notifications`, {
    headers: getAuthHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur lors du chargement des notifications.');
  return json.data || { notifications: [], unreadCount: 0 };
};

export const markClientNotificationRead = async (id, token) => {
  if (!token || !id) return;
  const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur');
  return json.data?.notification;
};

export const markAllClientNotificationsRead = async (token) => {
  if (!token) return;
  const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur');
  return json;
};
