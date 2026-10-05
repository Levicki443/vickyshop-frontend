import { io } from 'socket.io-client';

/**
 * Service de gestion de la connexion WebSocket Socket.IO sécurisée pour le frontend Vicky-Shop.
 */

const rawBaseUrl = (import.meta.env.VITE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000').trim().replace(/\/+$/, '');
const SOCKET_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl.replace(/\/api$/, '') : rawBaseUrl;

let socket = null;

const getActiveToken = () => {
  return localStorage.getItem('vicky_auth_token') || localStorage.getItem('vicky_admin_token') || null;
};

/**
 * Initialise ou retourne la connexion Socket.IO singleton avec transmission du jeton JWT.
 */
export const getSocket = () => {
  if (!socket) {
    const token = getActiveToken();

    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      withCredentials: true,
      auth: {
        token,
      },
    });

    socket.on('connect', () => {
      console.log(`[Socket.IO] Connecté au serveur temps réel (${socket.id})`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Déconnecté : ${reason}`);
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket.IO] Erreur de connexion temps réel :', error.message);
    });
  }

  return socket;
};

/**
 * Réinitialise la connexion Socket.IO lors du changement de session (Connexion / Déconnexion).
 */
export const reauthenticateSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  return getSocket();
};

/**
 * Rejoint la salle privée d'administration du Dashboard.
 */
export const joinAdminRoom = () => {
  const s = getSocket();
  if (s.connected) {
    s.emit('admin:join');
  } else {
    s.once('connect', () => s.emit('admin:join'));
  }
};

/**
 * Rejoint la salle privée d'un vendeur spécifique pour recevoir ses alertes de commande.
 */
export const joinSellerRoom = (sellerId) => {
  if (!sellerId) return;
  const s = getSocket();
  if (s.connected) {
    s.emit('seller:join', sellerId);
  } else {
    s.once('connect', () => s.emit('seller:join', sellerId));
  }
};

/**
 * Rejoint la salle privée d'un client spécifique pour recevoir ses notifications de suivi.
 */
export const joinUserRoom = (userId) => {
  if (!userId) return;
  const s = getSocket();
  if (s.connected) {
    s.emit('user:join', userId);
  } else {
    s.once('connect', () => s.emit('user:join', userId));
  }
};

/**
 * Rejoint la salle de suivi d'une référence de commande spécifique.
 */
export const trackOrderRoom = (orderNumber) => {
  if (!orderNumber) return;
  const s = getSocket();
  if (s.connected) {
    s.emit('order:track', orderNumber);
  } else {
    s.once('connect', () => s.emit('order:track', orderNumber));
  }
};

/**
 * Écoute les notifications et mises à jour en direct pour le client.
 */
export const onClientOrderUpdate = (callback) => {
  const s = getSocket();
  s.on('order:client:update', callback);
  s.on('order:client:created', callback);
  return () => {
    s.off('order:client:update', callback);
    s.off('order:client:created', callback);
  };
};

/**
 * Écoute l'arrivée d'une nouvelle commande concernant spécifiquement le vendeur connecté.
 */
export const onSellerNewOrder = (callback) => {
  const s = getSocket();
  s.on('order:seller:new', callback);
  return () => {
    s.off('order:seller:new', callback);
  };
};

/**
 * Écoute les nouvelles commandes entrantes en temps réel (Administrateurs).
 */
export const onNewOrder = (callback) => {
  const s = getSocket();
  s.on('order:new', callback);
  return () => {
    s.off('order:new', callback);
  };
};

/**
 * Écoute les mises à jour de statut des commandes.
 */
export const onOrderUpdated = (callback) => {
  const s = getSocket();
  s.on('order:updated', callback);
  return () => {
    s.off('order:updated', callback);
  };
};

/**
 * Écoute l'ajout d'un nouveau produit en temps réel.
 */
export const onProductCreated = (callback) => {
  const s = getSocket();
  s.on('product:created', callback);
  return () => {
    s.off('product:created', callback);
  };
};

/**
 * Écoute la modification d'un produit en temps réel.
 */
export const onProductUpdated = (callback) => {
  const s = getSocket();
  s.on('product:updated', callback);
  return () => {
    s.off('product:updated', callback);
  };
};

/**
 * Écoute la suppression d'un produit en temps réel.
 */
export const onProductDeleted = (callback) => {
  const s = getSocket();
  s.on('product:deleted', callback);
  return () => {
    s.off('product:deleted', callback);
  };
};

/**
 * Écoute la mise à jour de stock d'un produit en temps réel.
 */
export const onProductStockUpdated = (callback) => {
  const s = getSocket();
  s.on('product:stock_updated', callback);
  return () => {
    s.off('product:stock_updated', callback);
  };
};

/**
 * Déconnecte proprement le client Socket.IO.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
