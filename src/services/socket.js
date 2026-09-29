import { io } from 'socket.io-client';

/**
 * Service de gestion de la connexion WebSocket Socket.IO pour le frontend Vicky-Shop.
 */

const rawBaseUrl = (import.meta.env.VITE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000').trim().replace(/\/+$/, '');
const SOCKET_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl.replace(/\/api$/, '') : rawBaseUrl;

let socket = null;

/**
 * Initialise ou retourne la connexion Socket.IO singleton.
 */
export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      withCredentials: true,
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
 * Rejoint la salle privée d'administration du Dashboard.
 */
export const joinAdminRoom = () => {
  const s = getSocket();
  if (s.connected) {
    s.emit('admin:join');
  } else {
    s.once('connect', () => {
      s.emit('admin:join');
    });
  }
};

/**
 * Écoute les nouvelles commandes entrantes en temps réel.
 * @param {Function} callback 
 * @returns {Function} Fonction de désabonnement
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
 * @param {Function} callback 
 * @returns {Function} Fonction de désabonnement
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
 * @param {Function} callback 
 * @returns {Function} Fonction de désabonnement
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
 * @param {Function} callback 
 * @returns {Function} Fonction de désabonnement
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
 * @param {Function} callback 
 * @returns {Function} Fonction de désabonnement
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
 * @param {Function} callback 
 * @returns {Function} Fonction de désabonnement
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
