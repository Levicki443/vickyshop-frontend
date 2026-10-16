/**
 * Moteur de recommandation contextuelle et sémantique côté client pour Vicky-Shop.
 * Utilisé pour un affichage optimiste instantané et en relais de secours de l'API.
 * Aligné rigoureusement sur le référentiel taxonomique du backend.
 */

export const TAXONOMY_FAMILIES = {
  montres: {
    label: 'Montres & Smartwatches',
    keywords: ['montre', 'smartwatch', 'watch', 'bracelet'],
    subCategories: ['montres', 'smartwatches', 'bracelets-connectes'],
  },
  audio: {
    label: 'Casques & Audio',
    keywords: ['casque', 'ecouteur', 'audio', 'earbuds', 'airpods', 'headphone', 'headset', 'soundbar', 'enceinte', 'speaker'],
    subCategories: ['audio', 'casques', 'ecouteurs', 'enceintes'],
  },
  ordinateurs: {
    label: 'Ordinateurs & PC',
    keywords: ['macbook', 'ordinateur', 'laptop', 'pc', 'portable', 'thinkpad', 'chromebook', 'ultrabook', 'xps', 'spectre'],
    subCategories: ['ordinateurs', 'laptops', 'pc', 'pc-portables'],
  },
  smartphones: {
    label: 'Smartphones & Téléphones',
    keywords: ['iphone', 'smartphone', 'telephone', 'phone', 'redmi', 'xiaomi', 'pixel', 'tecno', 'infinix'],
    subCategories: ['smartphones', 'telephones', 'mobiles'],
  },
  chaussures: {
    label: 'Chaussures & Baskets',
    keywords: ['chaussure', 'basket', 'sneaker', 'running', 'air max', 'soulier', 'mocassin', 'sandale', 'claquette', 'bottine', 'jordan'],
    subCategories: ['chaussures', 'baskets', 'sneakers', 'souliers'],
  },
  chapeaux: {
    label: 'Chapeaux & Casquettes',
    keywords: ['casquette', 'chapeau', 'bonnet', 'bob', 'balaclava', 'cagoule', 'beret'],
    subCategories: ['chapeaux', 'casquettes', 'bonnets'],
  },
  maroquinerie: {
    label: 'Sacs & Maroquinerie',
    keywords: ['sac', 'sacoche', 'maroquinerie', 'pochette', 'valise', 'portefeuille', 'bandouliere', 'sac a dos'],
    subCategories: ['sacs', 'sacoches', 'maroquinerie', 'valises'],
  },
  sweats_pulls: {
    label: 'Pulls & Sweats',
    keywords: ['pull', 'sweat', 'hoodie', 'sweatshirt', 'veste', 'blouson', 'manteau', 'gilet', 'cardigan'],
    subCategories: ['sweats', 'pulls', 'hoodies', 'vestes', 'manteaux'],
  },
  ensembles_chemises: {
    label: 'Ensembles & Vêtements',
    keywords: ['chemise', 'ensemble', 'complet', 'costume', 'bermuda', 'short', 'pantalon', 'jean', 'tenue', 'robe', 'jupe'],
    subCategories: ['ensembles', 'chemises', 'pantalons', 'costumes', 'robes'],
  },
};

/**
 * Détecte avec précision la famille taxonomique d'un produit en 2 passes strictes :
 * 1. Correspondance formelle de sous-catégorie.
 * 2. Correspondance contextuelle par mots-clés ordonnés.
 */
export const detectProductFamily = (product = {}) => {
  if (!product) return 'general';

  const subCat = (product.subCategory || '').toLowerCase().trim();
  const rawText = `${product.title || ''} ${product.subCategory || ''} ${product.description || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Passe 1 : Priorité absolue à la sous-catégorie déclarée
  if (subCat) {
    for (const [familyKey, data] of Object.entries(TAXONOMY_FAMILIES)) {
      if (data.subCategories.some((sc) => subCat.includes(sc))) {
        return familyKey;
      }
    }
  }

  // Passe 2 : Détection textuelle ordonnée par spécificité
  for (const [familyKey, data] of Object.entries(TAXONOMY_FAMILIES)) {
    if (data.keywords.some((kw) => new RegExp(`\\b${kw}\\b`, 'i').test(rawText))) {
      return familyKey;
    }
  }

  // Cas spécifique Samsung Galaxy (smartphone si non-watch/audio/tablette)
  if (/\bgalaxy\b/i.test(rawText) && !/\b(watch|montre|buds|tab|ecouteur)\b/i.test(rawText)) {
    return 'smartphones';
  }

  return 'general';
};

/**
 * Extrait les termes descriptifs pertinents pour le matching secondaire.
 */
const extractDescriptiveTokens = (text = '') => {
  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const stopWords = new Set(['pour', 'avec', 'sans', 'dans', 'plus', 'très', 'ultra', 'style', 'mode', 'tout', 'tous']);
  const tokens = normalized.match(/[a-z0-9]{4,}/g) || [];
  return Array.from(new Set(tokens.filter((t) => !stopWords.has(t))));
};

/**
 * Filtre et ordonne les produits similaires par score d'affinité contextuelle stricte.
 *
 * @param {Object} currentProduct - Le produit de référence affiché dans la fiche
 * @param {Array} allProducts - L'ensemble des produits disponibles
 * @param {number} limit - Nombre maximum de recommandations (défaut: 4)
 * @returns {Array} Produits réellement similaires
 */
export const computeSimilarProducts = (currentProduct, allProducts = [], limit = 4) => {
  if (!currentProduct || !Array.isArray(allProducts) || allProducts.length === 0) {
    return [];
  }

  const currentId = String(currentProduct._id || currentProduct.id);
  const targetFamily = detectProductFamily(currentProduct);
  const targetSubCategory = (currentProduct.subCategory || '').trim().toLowerCase();
  const targetBrand = (currentProduct.brand || '').trim().toLowerCase();
  const targetPrice = Number(currentProduct.price) || 0;
  const targetTokens = extractDescriptiveTokens(`${currentProduct.title || ''} ${currentProduct.description || ''}`);

  // Filtrage initial : exclusion stricte du produit lui-même, des articles indisponibles et des maquettes unsplash
  const candidates = allProducts.filter((p) => {
    const pId = String(p._id || p.id);
    if (pId === currentId) return false;
    if (p.isArchived) return false;
    if (p.inStock === false) return false;
    if (p.stockQuantity !== undefined && p.stockQuantity <= 0) return false;
    if (p.image && p.image.includes('unsplash.com')) return false;
    return true;
  });

  if (!candidates.length) return [];

  const scoredCandidates = [];

  for (const cand of candidates) {
    const candFamily = detectProductFamily(cand);

    let score = 0;

    // 1. Priorité 1 : Même famille exacte
    if (targetFamily !== 'general' && targetFamily === candFamily) {
      score += 100;
    }

    // 2. Priorité 2 : Même sous-catégorie
    const candSubCategory = (cand.subCategory || '').trim().toLowerCase();
    if (targetSubCategory && candSubCategory && targetSubCategory === candSubCategory) {
      score += 30;
    }

    // 3. Priorité 3 : Même catégorie principale
    if (currentProduct.category && cand.category && currentProduct.category.toLowerCase() === cand.category.toLowerCase()) {
      score += 25;
    }

    // 4. Priorité 4 : Même marque (hors générique)
    const candBrand = (cand.brand || '').trim().toLowerCase();
    if (
      targetBrand &&
      !['generique', 'générique', 'autre', ''].includes(targetBrand) &&
      targetBrand === candBrand
    ) {
      score += 20;
    }

    // 5. Priorité 5 : Termes descriptifs et caractéristiques communes
    const candTokens = extractDescriptiveTokens(`${cand.title || ''} ${cand.description || ''}`);
    const sharedTokens = targetTokens.filter((token) => candTokens.includes(token));
    if (sharedTokens.length > 0) {
      score += Math.min(30, sharedTokens.length * 10);
    }

    // 6. Proximité tarifaire
    const candPrice = Number(cand.price) || 0;
    if (targetPrice > 0 && candPrice > 0) {
      const ratio = Math.abs(targetPrice - candPrice) / targetPrice;
      if (ratio <= 0.35) score += 15;
      else if (ratio <= 0.60) score += 8;
    }

    // 7. Bonus qualité client
    if (cand.rating >= 4.5) score += 5;

    scoredCandidates.push({ product: cand, score });
  }

  return scoredCandidates
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.product);
};
