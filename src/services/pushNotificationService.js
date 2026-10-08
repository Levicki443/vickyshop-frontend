import { fetchVapidPublicKey, registerPushSubscription, unregisterPushSubscription } from './notificationApi';

/**
 * Utilitaire pour convertir une clé publique VAPID Base64 en Uint8Array pour le PushManager.
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Vérifie si le navigateur supporte les notifications Web Push et les Service Workers.
 */
export const isPushSupported = () => {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};

/**
 * Récupère l'état actuel de la permission des notifications du navigateur.
 */
export const getPushPermissionState = () => {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission; // 'default', 'granted', 'denied'
};

/**
 * Demande poliment l'autorisation Web Push et enregistre l'appareil auprès du backend.
 */
export const subscribeToWebPush = async (token) => {
  if (!isPushSupported()) {
    throw new Error('Les notifications push ne sont pas supportées par votre navigateur.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { success: false, permission };
  }

  const registration = await navigator.serviceWorker.ready;
  if (!registration) {
    throw new Error('Le Service Worker n\'est pas encore prêt.');
  }

  // Récupération de la clé VAPID publique
  const vapidPublicKey = await fetchVapidPublicKey();
  if (!vapidPublicKey) {
    throw new Error('Clé publique de notification introuvable.');
  }

  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

  // Inscription auprès du service push natif du navigateur
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });
  }

  // Enregistrement sur le backend Vicky-Shop
  await registerPushSubscription(subscription, token);

  return { success: true, subscription, permission };
};

/**
 * Désabonne le navigateur des notifications Web Push.
 */
export const unsubscribeFromWebPush = async (token) => {
  if (!isPushSupported()) return { success: false };

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      if (token) {
        await unregisterPushSubscription(endpoint, token);
      }
    }
    return { success: true };
  } catch (err) {
    console.warn('[WebPush] Erreur désinscription push :', err);
    return { success: false, error: err.message };
  }
};
