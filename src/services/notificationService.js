/**
 * Service de notifications intelligentes multi-canaux pour Vicky-Shop :
 * 1. Synthétiseur Audio Web Audio API (Chime de notification instantané sans fichier externe)
 * 2. API HTML5 Notification du navigateur (Notifications système Desktop / Android)
 * 3. Clignotement dynamique de l'onglet de navigation
 */

let audioCtx = null;

/**
 * Joue un carillon sonore agréable et cristallin généré par synthèse audio native.
 */
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Note 1 (E5 - 659.25 Hz)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Note 2 (A5 - 880 Hz) - Plus haute et éclatante
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.4, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.7);
  } catch (err) {
    console.warn('[Audio] Impossible de jouer le son de notification :', err.message);
  }
};

/**
 * Demande la permission d'afficher des notifications système dans le navigateur.
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('[Notification API] Non supportée sur ce navigateur.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Affiche une notification native du système d'exploitation / navigateur.
 * @param {Object} order 
 * @param {Function} onClick 
 */
export const showOrderNotification = (order, onClick = null) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const title = `🔔 Nouvelle commande #${order.orderNumber || 'VK'}`;
    const amountStr = typeof order.total === 'number' ? `${order.total.toLocaleString('fr-FR')} FCFA` : '';
    const body = `${order.customerName || 'Client'} vient de commander pour ${amountStr} (${order.city || 'Abidjan'}).`;

    const notification = new Notification(title, {
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: `order-${order.orderNumber}`,
      renotify: true,
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (onClick) onClick(order);
    };
  } catch (err) {
    console.warn('[Notification] Échec affichage notification système :', err.message);
  }
};

/**
 * Anime le titre de l'onglet du navigateur pour attirer l'attention de l'administrateur.
 */
let flashInterval = null;
export const flashTabTitle = (alertMessage = '🔔 NOUVELLE COMMANDE !', durationMs = 12000) => {
  if (flashInterval) {
    clearInterval(flashInterval);
  }

  const originalTitle = document.title;
  let isAlert = false;

  flashInterval = setInterval(() => {
    document.title = isAlert ? originalTitle : alertMessage;
    isAlert = !isAlert;
  }, 900);

  setTimeout(() => {
    if (flashInterval) {
      clearInterval(flashInterval);
      flashInterval = null;
      document.title = originalTitle;
    }
  }, durationMs);
};
