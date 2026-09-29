/**
 * Service API pour le Backoffice Administrateur de Vicky-Shop.
 * Gere les appels securises avec jeton JWT Admin pour les KPIs, Commandes, Produits, Clients et Parametres.
 */

const rawBaseUrl = (import.meta.env.VITE_URL || import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

const ADMIN_TOKEN_KEY = 'vicky_admin_token';
const ADMIN_USER_KEY = 'vicky_admin_user';

export const getAdminToken = () => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token, user) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  }
};

export const getAdminUser = () => {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const removeAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
};

const authHeaders = () => {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Connexion Administrateur.
 */
export const adminLogin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Identifiants administrateur incorrects.');
    }

    if (json.data?.user?.role !== 'admin') {
      throw new Error('Acces refuse. Ce compte ne possede pas les privileges administrateur.');
    }

    setAdminToken(json.token, json.data.user);
    return json;
  } catch (error) {
    console.error('[AdminAPI] Erreur adminLogin :', error.message);
    throw error;
  }
};

/**
 * Inscription Administrateur avec Cle Secrete.
 */
export const adminRegister = async ({ name, email, phone, password, adminSecretKey }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, adminSecretKey }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Echec de la creation du compte administrateur.');
    }

    setAdminToken(json.token, json.data.user);
    return json;
  } catch (error) {
    console.error('[AdminAPI] Erreur adminRegister :', error.message);
    throw error;
  }
};

/**
 * Recupere les indicateurs cles de performance (KPIs).
 */
export const fetchDashboardKPIs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/kpis`, {
      headers: authHeaders(),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors de la recuperation des KPIs.');
    }
    return json.data;
  } catch (error) {
    console.error('[AdminAPI] Erreur fetchDashboardKPIs :', error.message);
    throw error;
  }
};

/**
 * Recupere la liste des commandes avec pagination et filtres.
 */
export const fetchAdminOrders = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.paymentMethod && params.paymentMethod !== 'all') query.append('paymentMethod', params.paymentMethod);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const response = await fetch(`${API_BASE_URL}/admin/orders?${query.toString()}`, {
      headers: authHeaders(),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors de la recuperation des commandes.');
    }
    return json.data;
  } catch (error) {
    console.error('[AdminAPI] Erreur fetchAdminOrders :', error.message);
    throw error;
  }
};

/**
 * Met a jour le statut d'une commande.
 */
export const updateOrderStatusApi = async (orderId, orderStatus, paymentStatus, comment = '') => {
  try {
    const body = { orderStatus };
    if (paymentStatus) body.paymentStatus = paymentStatus;
    if (comment) body.comment = comment;

    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors de la mise a jour du statut.');
    }
    return json.data.order;
  } catch (error) {
    console.error('[AdminAPI] Erreur updateOrderStatusApi :', error.message);
    throw error;
  }
};

/**
 * Recupere la liste des produits avec filtres pour l'administration.
 */
export const fetchAdminProducts = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.stockStatus && params.stockStatus !== 'all') query.append('stockStatus', params.stockStatus);
    if (params.search) query.append('search', params.search);

    const response = await fetch(`${API_BASE_URL}/admin/products?${query.toString()}`, {
      headers: authHeaders(),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors de la recuperation des produits.');
    }
    return json.data.products;
  } catch (error) {
    console.error('[AdminAPI] Erreur fetchAdminProducts :', error.message);
    throw error;
  }
};

/**
 * Téléverse une image de produit vers Cloudinary.
 * @param {File} file 
 * @returns {Promise<{ url: string, secure_url: string, public_id: string }>}
 */
export const uploadProductImageApi = async (file) => {
  try {
    const token = getAdminToken();
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/admin/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors du téléversement de l\'image sur Cloudinary.');
    }

    return json.data;
  } catch (error) {
    console.error('[AdminAPI] Erreur uploadProductImageApi :', error.message);
    throw error;
  }
};

/**
 * Cree un nouveau produit.
 */
export const createProductApi = async (productData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(productData),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors de la creation du produit.');
    }
    return json.data.product;
  } catch (error) {
    console.error('[AdminAPI] Erreur createProductApi :', error.message);
    throw error;
  }
};

/**
 * Met a jour un produit existant.
 */
export const updateProductApi = async (productId, productData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(productData),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors de la mise a jour du produit.');
    }
    return json.data.product;
  } catch (error) {
    console.error('[AdminAPI] Erreur updateProductApi :', error.message);
    throw error;
  }
};

/**
 * Supprime un produit.
 */
export const deleteProductApi = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors de la suppression du produit.');
    }
    return json;
  } catch (error) {
    console.error('[AdminAPI] Erreur deleteProductApi :', error.message);
    throw error;
  }
};

/**
 * Bascule l'etat de stock d'un produit (En stock / Rupture).
 */
export const toggleProductStockApi = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/toggle-stock`, {
      method: 'PATCH',
      headers: authHeaders(),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors de la bascule du stock.');
    }
    return json.data.product;
  } catch (error) {
    console.error('[AdminAPI] Erreur toggleProductStockApi :', error.message);
    throw error;
  }
};

/**
 * Recupere la liste des utilisateurs / clients.
 */
export const fetchAdminUsers = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.role && params.role !== 'all') query.append('role', params.role);

    const response = await fetch(`${API_BASE_URL}/admin/users?${query.toString()}`, {
      headers: authHeaders(),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors de la recuperation des utilisateurs.');
    }
    return json.data.users;
  } catch (error) {
    console.error('[AdminAPI] Erreur fetchAdminUsers :', error.message);
    throw error;
  }
};

/**
 * Recupere les parametres generaux de la boutique.
 */
export const fetchAdminSettings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      headers: authHeaders(),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors de la recuperation des parametres.');
    }
    return json.data.settings;
  } catch (error) {
    console.error('[AdminAPI] Erreur fetchAdminSettings :', error.message);
    throw error;
  }
};

/**
 * Met a jour les parametres generaux de la boutique.
 */
export const updateAdminSettingsApi = async (settingsData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(settingsData),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Erreur lors de la mise a jour des parametres.');
    }
    return json.data.settings;
  } catch (error) {
    console.error('[AdminAPI] Erreur updateAdminSettingsApi :', error.message);
    throw error;
  }
};
