/**
 * Moteur de recommandation sémantique et multicritères côté client pour Vicky-Shop.
 * Utilisé en complément ou en relais de secours de l'API REST.
 */

const extractTypeKeywords = (text = '') => {
  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const patterns = [
    /\b(iphone|smartphone|telephone|phone|samsung|galaxy|xiaomi|redmi)\b/g,
    /\b(ordinateur|laptop|macbook|pc|portable|thinkpad)\b/g,
    /\b(casque|ecouteur|audio|earbuds|airpods|headphone)\b/g,
    /\b(montre|smartwatch|watch|bracelet)\b/g,
    /\b(chaussure|basket|sneaker|running|air max|soulier)\b/g,
    /\b(chemise|ensemble|short|bermuda|complet|pantalon|costume)\b/g,
    /\b(pull|sweat|hoodie|sweatshirt|veste|blouson|manteau)\b/g,
    /\b(casquette|chapeau|bonnet|bob)\b/g,
    /\b(sac|sacoche|maroquinerie|pochette|valise)\b/g,
    /\b(enceinte|speaker|baffle|soundbar)\b/g,
    /\b(television|tv|ecran|moniteur)\b/g,
  ];

  const matches = [];
  patterns.forEach((pattern) => {
    const found = normalized.match(pattern);
    if (found) matches.push(...found);
  });
  return Array.from(new Set(matches));
};

/**
 * Filtre et ordonne les produits similaires par score d'affinité contextuelle.
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
  const currentCategory = (currentProduct.category || '').toLowerCase().trim();

  // Filtrage préliminaire : exclusion de l'article lui-même, rupture de stock et catégorie différente
  const candidates = allProducts.filter((p) => {
    const pId = String(p._id || p.id);
    if (pId === currentId) return false;
    if (p.isArchived) return false;
    if (p.inStock === false) return false;
    if (p.stockQuantity !== undefined && p.stockQuantity <= 0) return false;

    const pCategory = (p.category || '').toLowerCase().trim();
    return pCategory === currentCategory;
  });

  if (!candidates.length) return [];

  const targetTypes = extractTypeKeywords(
    `${currentProduct.title || ''} ${currentProduct.subCategory || ''} ${currentProduct.description || ''}`
  );
  const targetBrand = (currentProduct.brand || '').trim().toLowerCase();
  const targetSubCategory = (currentProduct.subCategory || '').trim().toLowerCase();
  const targetPrice = Number(currentProduct.price) || 0;

  const scored = candidates.map((cand) => {
    let score = 0;
    const candTypes = extractTypeKeywords(
      `${cand.title || ''} ${cand.subCategory || ''} ${cand.description || ''}`
    );
    const candBrand = (cand.brand || '').trim().toLowerCase();
    const candSubCategory = (cand.subCategory || '').trim().toLowerCase();
    const candPrice = Number(cand.price) || 0;

    // 1. Type exact de produit (critère prépondérant)
    const sharedTypes = targetTypes.filter((t) => candTypes.includes(t));
    if (sharedTypes.length > 0) {
      score += 80 + sharedTypes.length * 20;
    } else if (targetTypes.length > 0) {
      score -= 50; // Pénalité si le type sémantique diffère au sein d'une même catégorie
    }

    // 2. Même sous-catégorie
    if (targetSubCategory && candSubCategory && targetSubCategory === candSubCategory) {
      score += 40;
    }

    // 3. Même marque (si non générique)
    if (
      targetBrand &&
      !['generique', 'générique'].includes(targetBrand) &&
      targetBrand === candBrand
    ) {
      score += 25;
    }

    // 4. Proximité de prix (±35%)
    if (targetPrice > 0 && candPrice > 0) {
      const ratio = Math.abs(targetPrice - candPrice) / targetPrice;
      if (ratio <= 0.35) score += 15;
    }

    // 5. Note client
    if (cand.rating >= 4.5) score += 5;

    return { product: cand, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.product);
};
