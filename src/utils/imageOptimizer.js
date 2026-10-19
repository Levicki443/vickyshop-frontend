/**
 * Utilitaire d'optimisation dynamique des images pour Vicky-Shop.
 * Transforme automatiquement les URLs Cloudinary et Unsplash pour servir
 * le format nouvelle génération le plus léger (WebP/AVIF via f_auto),
 * avec compression adaptative (q_auto) et dimensionnement précis.
 */

/**
 * Optimise une URL d'image selon la largeur et la qualité souhaitées.
 * @param {string} url - URL source de l'image
 * @param {object} options - Options de dimensionnement { width, quality, crop }
 * @returns {string} URL optimisée prête pour l'affichage haute performance
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url;

  const width = options.width || 500;
  const quality = options.quality || 'auto';
  const crop = options.crop || 'limit';

  // 1. Optimisation Cloudinary
  if (url.includes('cloudinary.com') && url.includes('/image/upload/')) {
    // Évite d'ajouter les transformations si elles existent déjà
    if (url.includes('/f_auto,q_auto') || url.includes('/q_auto,f_auto')) {
      return url;
    }

    const transformParams = `f_auto,q_${quality},c_${crop},w_${width}`;
    return url.replace('/image/upload/', `/image/upload/${transformParams}/`);
  }

  // 2. Optimisation Unsplash
  if (url.includes('images.unsplash.com')) {
    try {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set('auto', 'format');
      parsedUrl.searchParams.set('fit', 'crop');
      parsedUrl.searchParams.set('w', String(width));
      parsedUrl.searchParams.set('q', quality === 'auto' ? '80' : String(quality));
      return parsedUrl.toString();
    } catch (_) {
      return url;
    }
  }

  // Fallback direct pour les images locales, SVG et data:
  return url;
};

/**
 * Génère un srcSet responsive pour l'affichage multi-écrans (Retina & Mobile).
 * @param {string} url - URL source
 * @param {number[]} widths - Liste des largeurs souhaitées [320, 640, 960]
 * @returns {string} Attribut srcSet formaté
 */
export const getResponsiveSrcSet = (url, widths = [320, 540, 720]) => {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return '';
  return widths
    .map((w) => `${getOptimizedImageUrl(url, { width: w })} ${w}w`)
    .join(', ');
};

export default getOptimizedImageUrl;
