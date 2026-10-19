/**
 * Service API pour communiquer avec l'assistant IA Vicky-Shop (Vicky IA).
 * Gère l'envoi de messages, l'historique et la réinitialisation de session.
 */

const rawBaseUrl = (import.meta.env.VITE_URL || import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('vicky_auth_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Envoie une question ou un message à Vicky IA.
 * @param {Object} params
 * @param {string} params.sessionId - Identifiant unique de session
 * @param {string} params.message - Question ou message de l'utilisateur
 * @param {string} [params.userName] - Prénom ou nom affiché de l'utilisateur
 * @param {Array<string>} [params.recentlyViewedIds] - Identifiants des derniers articles consultés
 * @returns {Promise<{ reply: string, products: Array, actions: Array, sessionId: string, isSafe: boolean, isFallback: boolean, createdAt: string }>}
 */
export const sendChatMessage = async ({ sessionId, message, userName, recentlyViewedIds = [] }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        sessionId,
        message: message.trim(),
        userName: userName ? userName.trim() : undefined,
        recentlyViewedIds,
      }),
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(json.message || 'Impossible d\'obtenir une réponse de l\'assistant pour le moment.');
    }

    return json.data;
  } catch (error) {
    console.error('[aiApi] Erreur sendChatMessage :', error);
    throw error;
  }
};

/**
 * Récupère l'historique de discussion d'une session.
 * @param {string} sessionId
 * @returns {Promise<{ sessionId: string, messages: Array, userName: string }>}
 */
export const fetchChatHistory = async (sessionId) => {
  try {
    if (!sessionId) return { sessionId: '', messages: [] };

    const response = await fetch(`${API_BASE_URL}/ai/history/${encodeURIComponent(sessionId)}`, {
      headers: getAuthHeaders(),
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(json.message || 'Impossible de charger l\'historique.');
    }

    return json.data;
  } catch (error) {
    console.error('[aiApi] Erreur fetchChatHistory :', error);
    throw error;
  }
};

/**
 * Réinitialise une session de discussion sur le serveur.
 * @param {string} sessionId
 */
export const resetChatSession = async (sessionId) => {
  try {
    if (!sessionId) return;

    await fetch(`${API_BASE_URL}/ai/session/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.warn('[aiApi] Erreur lors de la réinitialisation de session :', error);
  }
};

/**
 * Récupère les questions et thèmes suggérés adaptés au profil.
 * @param {string} [role] - Rôle ('client', 'vendeur', etc.)
 * @returns {Promise<Array>}
 */
export const fetchChatSuggestions = async (role = '') => {
  try {
    const url = role ? `${API_BASE_URL}/ai/suggestions?role=${encodeURIComponent(role)}` : `${API_BASE_URL}/ai/suggestions`;
    const response = await fetch(url);
    const json = await response.json().catch(() => ({}));
    if (response.ok && json.data?.suggestions) {
      return json.data.suggestions;
    }
    return [];
  } catch (error) {
    console.warn('[aiApi] Erreur fetchChatSuggestions, utilisation du fallback local :', error);
    return [];
  }
};
