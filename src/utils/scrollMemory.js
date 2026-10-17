/**
 * Utilitaire de gestion avancée de la mémoire de défilement (Scroll Memory).
 * Permet une restauration instantanée et propre de la position de lecture
 * lors des retours de navigation sur le catalogue de produits, éliminant
 * les défilements saccadés et les comportements instables sur mobile et desktop.
 */

const CATALOG_SCROLL_KEY = 'vicky_catalog_scroll_position_y';

/**
 * Configure la politique de restauration du navigateur sur 'manual'
 * pour donner le plein contrôle programmatique à l'application.
 */
export const initScrollRestoration = () => {
  if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
};

/**
 * Mémorise la position verticale courante de l'écran avant navigation.
 */
export const saveCatalogScroll = () => {
  if (typeof window === 'undefined') return;
  const currentY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  try {
    sessionStorage.setItem(CATALOG_SCROLL_KEY, String(Math.round(currentY)));
  } catch {
    // Tolérance en cas de navigation privée avec stockage restreint
  }
};

/**
 * Récupère la position enregistrée du catalogue.
 * @returns {number} Position Y en pixels
 */
export const getSavedCatalogScroll = () => {
  if (typeof window === 'undefined') return 0;
  try {
    const saved = sessionStorage.getItem(CATALOG_SCROLL_KEY);
    return saved ? Math.max(0, parseInt(saved, 10)) : 0;
  } catch {
    return 0;
  }
};

/**
 * Restaure de façon immédiate et précise la position de défilement mémorisée.
 */
export const restoreCatalogScroll = () => {
  if (typeof window === 'undefined') return;
  const targetY = getSavedCatalogScroll();
  if (targetY <= 0) return;

  // Double requestAnimationFrame garantissant que le layout du catalogue est calculé
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: targetY,
        left: 0,
        behavior: 'instant',
      });
    });
  });
};

/**
 * Réinitialise la position mémorisée.
 */
export const resetCatalogScroll = () => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(CATALOG_SCROLL_KEY);
  } catch {
    // Ignorer
  }
};
