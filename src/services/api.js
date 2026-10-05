/**
 * Service API Client centralisé pour communiquer avec le backend Express / MongoDB.
 * Inclut la gestion de l'authentification JWT, des erreurs et du formatage monétaire.
 */

const rawBaseUrl = (import.meta.env.VITE_URL || import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

export const fetchProducts = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);

    const response = await fetch(`${API_BASE_URL}/products?${query.toString()}`);
    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des produits (${response.status})`);
    }

    const json = await response.json();
    return json.data.products || [];
  } catch (error) {
    console.error('[API] Erreur fetchProducts :', error);
    throw error;
  }
};

export const fetchProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error(`Produit introuvable (${response.status})`);
    }
    const json = await response.json();
    return json.data.product;
  } catch (error) {
    console.error('[API] Erreur fetchProductById :', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Identifiants invalides');
    }

    return json;
  } catch (error) {
    console.error('[API] Erreur loginUser :', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Impossible de contacter le serveur. Veuillez vérifier la connexion.');
    }
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Échec de l\'inscription');
    }

    return json;
  } catch (error) {
    console.error('[API] Erreur registerUser :', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Impossible de contacter le serveur. Veuillez vérifier la connexion.');
    }
    throw error;
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Erreur lors de la demande de réinitialisation.');
    return json;
  } catch (error) {
    console.error('[API] Erreur requestPasswordReset :', error);
    throw error;
  }
};

export const submitPasswordReset = async (token, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || 'Erreur lors de la réinitialisation du mot de passe.');
    return json;
  } catch (error) {
    console.error('[API] Erreur submitPasswordReset :', error);
    throw error;
  }
};

export const fetchUserProfile = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Session expirée');
    }

    return json.data.user;
  } catch (error) {
    console.error('[API] Erreur fetchUserProfile :', error);
    throw error;
  }
};

export const updateUserProfile = async (userData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Échec lors de la mise à jour du profil');
    }

    return json.data.user;
  } catch (error) {
    console.error('[API] Erreur updateUserProfile :', error);
    throw error;
  }
};

export const updateUserPassword = async (passwordData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/update-password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Échec lors de la modification du mot de passe');
    }

    return json;
  } catch (error) {
    console.error('[API] Erreur updateUserPassword :', error);
    throw error;
  }
};

export const submitOrder = async (orderData, token = null) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detailedMessage = Array.isArray(json.errors) && json.errors.length > 0
        ? json.errors.join(' • ')
        : (json.message || 'Échec lors de la création de la commande');
      throw new Error(detailedMessage);
    }

    return json.data.order;
  } catch (error) {
    console.error('[API] Erreur submitOrder :', error);
    throw error;
  }
};

export const fetchMyOrders = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors du chargement de vos commandes');
    }

    return json.data.orders || [];
  } catch (error) {
    console.error('[API] Erreur fetchMyOrders :', error);
    throw error;
  }
};

export const formatPrice = (amount) => {
  if (typeof amount !== 'number') return '0 FCFA';
  return `${amount.toLocaleString('fr-FR')} FCFA`;
};
