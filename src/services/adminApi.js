/**
 * Service API pour le Backoffice Administrateur de Vicky-Shop.
 * Gère les requêtes authentifiées JWT pour les KPIs, Commandes, Produits, Clients et Paramètres.
 * Intègre un intercepteur automatique des expirations de session (HTTP 401).
 */

const rawBaseUrl = (import.meta.env.VITE_URL || import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

const ADMIN_TOKEN_KEY = 'vicky_admin_token';
const ADMIN_USER_KEY = 'vicky_admin_user';

export const getAdminToken = () =>
  localStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem('vicky_auth_token');

export const setAdminToken = (token, user) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  }
};

export const getAdminUser = () => {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY) || localStorage.getItem('vicky_auth_user');
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
 * Wrapper de requête HTTP sécurisé avec interception centralisée des expirations de session (401).
 */
export const adminRequest = async (path, options = {}) => {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  const json = await response.json().catch(() => ({}));

  if (response.status === 401) {
    removeAdminToken();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('vicky:admin-session-expired', {
          detail: { message: json.message || 'Session administrateur expirée.' },
        })
      );
    }
  }

  if (!response.ok) {
    throw new Error(json.message || `Erreur serveur (${response.status})`);
  }

  return json;
};

export const adminLogin = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Identifiants incorrects.');
  if (json.data?.user?.role !== 'admin') {
    throw new Error('Accès refusé. Privilèges administrateur requis.');
  }
  setAdminToken(json.token, json.data.user);
  return json;
};

export const adminRegister = async ({ name, email, phone, password, adminSecretKey }) => {
  const response = await fetch(`${API_BASE_URL}/auth/register-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, password, adminSecretKey }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Échec de la création du compte.');
  setAdminToken(json.token, json.data.user);
  return json;
};

export const fetchDashboardKPIs = async () => {
  const json = await adminRequest('/admin/kpis');
  return json.data;
};

export const fetchAdminOrders = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.search) query.append('search', params.search);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const json = await adminRequest(`/admin/orders?${query.toString()}`);
  return json.data;
};

export const updateOrderStatusApi = async (orderId, orderStatus, paymentStatus, comment = '') => {
  const body = { orderStatus };
  if (paymentStatus) body.paymentStatus = paymentStatus;
  if (comment) body.comment = comment;

  const json = await adminRequest(`/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return json.data.order;
};

export const fetchAdminProducts = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'all') query.append('category', params.category);
  
  let stockParam = params.stockStatus;
  if (stockParam === 'inStock') stockParam = 'in';
  else if (stockParam === 'outOfStock') stockParam = 'out';
  if (stockParam && stockParam !== 'all') query.append('stockStatus', stockParam);
  if (params.search) query.append('search', params.search);

  const json = await adminRequest(`/admin/products?${query.toString()}`);
  return json.data.products;
};

export const uploadProductImageApi = async (file) => {
  const token = getAdminToken();
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/admin/upload`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  });
  const json = await response.json();
  if (response.status === 401) {
    removeAdminToken();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vicky:admin-session-expired', { detail: { message: json.message } }));
    }
  }
  if (!response.ok) throw new Error(json.message || 'Erreur téléversement image.');
  return json.data;
};

export const createProductApi = async (productData) => {
  const json = await adminRequest('/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
  return json.data.product;
};

export const seedAdminProductsApi = async () => {
  const json = await adminRequest('/admin/products/seed', { method: 'POST' });
  return json.data?.products || [];
};

export const updateProductApi = async (productId, productData) => {
  const json = await adminRequest(`/admin/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
  return json.data.product;
};

export const deleteProductApi = async (productId) => {
  return await adminRequest(`/admin/products/${productId}`, { method: 'DELETE' });
};

export const toggleProductStockApi = async (productId) => {
  const json = await adminRequest(`/admin/products/${productId}/toggle-stock`, { method: 'PATCH' });
  return json.data.product;
};

export const fetchAdminUserStats = async () => {
  const json = await adminRequest('/admin/users/stats');
  return json.data.stats;
};

export const fetchAdminUsers = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.role && params.role !== 'all') query.append('role', params.role);
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.verified && params.verified !== 'all') query.append('verified', params.verified);
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);

  const json = await adminRequest(`/admin/users?${query.toString()}`);
  return json.data;
};

export const fetchAdminUserDetails = async (userId) => {
  const json = await adminRequest(`/admin/users/${userId}`);
  return json.data;
};

export const updateAdminUserApi = async (userId, userData) => {
  const json = await adminRequest(`/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
  return json.data.user;
};

export const updateAdminUserStatusApi = async (userId, status, reason = '') => {
  const json = await adminRequest(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });
  return json.data.user;
};

export const deleteAdminUserApi = async (userId) => {
  return await adminRequest(`/admin/users/${userId}`, { method: 'DELETE' });
};

export const fetchAdminSettings = async () => {
  const json = await adminRequest('/admin/settings');
  return json.data.settings;
};

export const updateAdminSettingsApi = async (settingsData) => {
  const json = await adminRequest('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settingsData),
  });
  return json.data.settings;
};

export {
  fetchAdminReviews,
  updateReviewStatusApi,
  toggleReviewActiveApi,
  updateReviewAdminApi,
  deleteReviewAdminApi,
} from './reviewApi';
