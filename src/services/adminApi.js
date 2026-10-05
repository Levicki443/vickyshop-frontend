/**
 * Service API pour le Backoffice Administrateur de Vicky-Shop.
 * Gère les requêtes authentifiées JWT pour les KPIs, Commandes, Produits, Clients et Paramètres.
 */

const rawBaseUrl = (import.meta.env.VITE_URL || import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

const ADMIN_TOKEN_KEY = 'vicky_admin_token';
const ADMIN_USER_KEY = 'vicky_admin_user';

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

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
  const response = await fetch(`${API_BASE_URL}/admin/kpis`, { headers: authHeaders() });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Erreur chargement KPIs.');
  return json.data;
};

export const fetchAdminOrders = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.search) query.append('search', params.search);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const response = await fetch(`${API_BASE_URL}/admin/orders?${query.toString()}`, { headers: authHeaders() });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Erreur chargement commandes.');
  return json.data;
};

export const updateOrderStatusApi = async (orderId, orderStatus, paymentStatus, comment = '') => {
  const body = { orderStatus };
  if (paymentStatus) body.paymentStatus = paymentStatus;
  if (comment) body.comment = comment;

  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Erreur mise à jour statut.');
  return json.data.order;
};

export const fetchAdminProducts = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'all') query.append('category', params.category);
  if (params.stockStatus && params.stockStatus !== 'all') query.append('stockStatus', params.stockStatus);
  if (params.search) query.append('search', params.search);

  const response = await fetch(`${API_BASE_URL}/admin/products?${query.toString()}`, { headers: authHeaders() });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Erreur chargement produits.');
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
  if (!response.ok) throw new Error(json.message || 'Erreur téléversement image.');
  return json.data;
};

export const createProductApi = async (productData) => {
  const response = await fetch(`${API_BASE_URL}/admin/products`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(productData),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Erreur création produit.');
  return json.data.product;
};

export const updateProductApi = async (productId, productData) => {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(productData),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Erreur mise à jour produit.');
  return json.data.product;
};

export const deleteProductApi = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Erreur suppression produit.');
  return json;
};

export const toggleProductStockApi = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/toggle-stock`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Erreur bascule stock.');
  return json.data.product;
};

export const fetchAdminUsers = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);

  const response = await fetch(`${API_BASE_URL}/admin/users?${query.toString()}`, { headers: authHeaders() });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Erreur chargement utilisateurs.');
  return json.data.users;
};

export const fetchAdminSettings = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/settings`, { headers: authHeaders() });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Erreur chargement paramètres.');
  return json.data.settings;
};

export const updateAdminSettingsApi = async (settingsData) => {
  const response = await fetch(`${API_BASE_URL}/admin/settings`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(settingsData),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Erreur mise à jour paramètres.');
  return json.data.settings;
};
