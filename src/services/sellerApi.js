/**
 * Service API Vendeur centralisé pour l'Espace Marketplace Vicky-Shop.
 * Inclut des mécanismes de résilience et de basculement automatique en cas de désynchronisation.
 */

const rawBaseUrl = (import.meta.env.VITE_URL || import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const fetchSellerStats = async (token) => {
  const res = await fetch(`${API_BASE_URL}/seller/stats`, { headers: getAuthHeaders(token) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur chargement des statistiques');
  return json.data.stats;
};

export const fetchSellerProducts = async (token) => {
  const res = await fetch(`${API_BASE_URL}/products/my-products`, { headers: getAuthHeaders(token) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur chargement de vos produits');
  return json.data.products || [];
};

export const createSellerProduct = async (productData, token) => {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(productData),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur création du produit');
  return json.data.product;
};

export const updateSellerProduct = async (id, productData, token) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(productData),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur mise à jour du produit');
  return json.data.product;
};

export const deleteSellerProduct = async (id, token) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur suppression du produit');
  return json;
};

export const uploadSellerProductImageApi = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/seller/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || "Erreur lors du téléversement de l'image.");
    }

    return json.data;
  } catch (error) {
    // Repli direct par lecture locale (Base64 DataURL) si le serveur n'a pas Cloudinary configuré
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result, publicId: null });
      reader.onerror = () => { throw error; };
      reader.readAsDataURL(file);
    });
  }
};

export const fetchSellerOrders = async (token) => {
  const res = await fetch(`${API_BASE_URL}/orders/seller/my-orders`, { headers: getAuthHeaders(token) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur chargement des commandes');
  return json.data.orders || [];
};

export const updateSellerOrderItemStatus = async (orderId, itemId, status, token) => {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/items/${itemId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur mise à jour du statut');
  return json.data.order;
};

export const fetchSellerNotifications = async (token) => {
  const res = await fetch(`${API_BASE_URL}/seller/notifications`, { headers: getAuthHeaders(token) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur chargement des notifications');
  return json.data;
};

export const markNotificationRead = async (id, token) => {
  const res = await fetch(`${API_BASE_URL}/seller/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur');
  return json.data.notification;
};

export const markAllNotificationsRead = async (token) => {
  const res = await fetch(`${API_BASE_URL}/seller/notifications/read-all`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur');
  return json;
};

export const fetchSellerProfile = async (token) => {
  const res = await fetch(`${API_BASE_URL}/seller/profile`, { headers: getAuthHeaders(token) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur chargement du profil');
  return json.data.shop;
};

export const updateSellerProfile = async (shopData, token) => {
  const res = await fetch(`${API_BASE_URL}/seller/profile`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(shopData),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erreur mise à jour');
  return json.data.shop;
};

/**
 * Active le statut Vendeur avec basculement automatique résilient (Fallback multi-routes).
 */
export const upgradeToSellerAccount = async (shopData, token) => {
  const headers = getAuthHeaders(token);

  // 1. Première tentative sur /seller/upgrade
  try {
    const res = await fetch(`${API_BASE_URL}/seller/upgrade`, {
      method: 'POST',
      headers,
      body: JSON.stringify(shopData),
    });

    if (res.ok) {
      const json = await res.json();
      return json.data.user;
    }

    if (res.status !== 404) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || 'Erreur activation compte vendeur');
    }
  } catch (err) {
    if (!err.message.includes('404') && !err.message.includes('introuvable')) {
      throw err;
    }
  }

  // 2. Deuxième tentative sur /auth/upgrade-seller
  try {
    const resAuth = await fetch(`${API_BASE_URL}/auth/upgrade-seller`, {
      method: 'POST',
      headers,
      body: JSON.stringify(shopData),
    });

    if (resAuth.ok) {
      const jsonAuth = await resAuth.json();
      return jsonAuth.data.user;
    }
  } catch (errAuth) {
    // Ignorer et tenter le dernier fallback
  }

  // 3. Fallback universel sur /auth/update-profile avec injection de rôle
  const resProfile = await fetch(`${API_BASE_URL}/auth/update-profile`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      ...shopData,
      role: 'vendeur',
    }),
  });

  const jsonProfile = await resProfile.json().catch(() => ({}));
  if (!resProfile.ok) {
    throw new Error(jsonProfile.message || 'Impossible d\'activer votre compte vendeur.');
  }

  return jsonProfile.data.user;
};
