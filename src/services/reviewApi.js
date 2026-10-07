/**
 * Service API pour la gestion dynamique des Témoignages et Avis clients.
 * Intègre les requêtes publiques (vitrine), client (dépôt d'avis) et administrateur (modération).
 */

const rawBaseUrl = (import.meta.env.VITE_URL || import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

const getAuthHeaders = (token) => {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * 1. Récupérer les avis approuvés pour la vitrine ou pour un produit spécifique
 */
export const fetchReviews = async ({ page = 1, limit = 10, sort = 'recent', productId = null } = {}) => {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (sort) params.append('sort', sort);
    if (productId) params.append('productId', productId);

    const response = await fetch(`${API_BASE_URL}/reviews?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des avis (${response.status})`);
    }

    const json = await response.json();
    return json.data || { reviews: [], stats: {}, pagination: {} };
  } catch (error) {
    console.error('[API Reviews] Erreur fetchReviews :', error);
    throw error;
  }
};

/**
 * 2. Déposer un nouvel avis (Client connecté ou invité avec référence de commande)
 */
export const submitReview = async (reviewData, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(reviewData),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Impossible d\'enregistrer votre avis.');
    }

    return json;
  } catch (error) {
    console.error('[API Reviews] Erreur submitReview :', error);
    throw error;
  }
};

/**
 * 3. Récupérer les avis postés par l'utilisateur connecté
 */
export const fetchMyReviews = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/my`, {
      headers: getAuthHeaders(token),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur chargement de vos avis.');
    }

    return json.data?.reviews || [];
  } catch (error) {
    console.error('[API Reviews] Erreur fetchMyReviews :', error);
    throw error;
  }
};

/**
 * 4. [Admin] Récupérer tous les avis pour la modération dans le Backoffice
 */
export const fetchAdminReviews = async ({ page = 1, limit = 20, status = 'all', search = '', rating = 'all' } = {}, token = null) => {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    if (rating && rating !== 'all') params.append('rating', rating);

    const response = await fetch(`${API_BASE_URL}/reviews/admin?${params.toString()}`, {
      headers: getAuthHeaders(token),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors du chargement des avis pour l\'administration.');
    }

    return json.data || { reviews: [], kpis: {}, pagination: {} };
  } catch (error) {
    console.error('[API Admin Reviews] Erreur fetchAdminReviews :', error);
    throw error;
  }
};

/**
 * 5. [Admin] Valider, refuser ou remettre en attente un avis
 */
export const updateReviewStatusApi = async (reviewId, status, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/admin/${reviewId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors de la mise à jour du statut.');
    }

    return json;
  } catch (error) {
    console.error('[API Admin Reviews] Erreur updateReviewStatusApi :', error);
    throw error;
  }
};

/**
 * 6. [Admin] Masquer ou afficher un avis sur la boutique
 */
export const toggleReviewActiveApi = async (reviewId, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/admin/${reviewId}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors du changement de visibilité.');
    }

    return json;
  } catch (error) {
    console.error('[API Admin Reviews] Erreur toggleReviewActiveApi :', error);
    throw error;
  }
};

/**
 * 7. [Admin] Mettre à jour un avis ou ajouter une réponse officielle
 */
export const updateReviewAdminApi = async (reviewId, updateData, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/admin/${reviewId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updateData),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors de la modification de l\'avis.');
    }

    return json;
  } catch (error) {
    console.error('[API Admin Reviews] Erreur updateReviewAdminApi :', error);
    throw error;
  }
};

/**
 * 8. [Admin] Supprimer définitivement un avis
 */
export const deleteReviewAdminApi = async (reviewId, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/admin/${reviewId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors de la suppression de l\'avis.');
    }

    return json;
  } catch (error) {
    console.error('[API Admin Reviews] Erreur deleteReviewAdminApi :', error);
    throw error;
  }
};
