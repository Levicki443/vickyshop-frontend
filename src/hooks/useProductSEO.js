import { useEffect } from 'react';
import { getProductCanonicalUrl } from '../components/common/ProductShareModal';

const DEFAULT_TITLE = 'Vicky-Shop | Mode, High-Tech & Accessoires Premium';
const DEFAULT_DESC = "Vicky-Shop : La boutique e-commerce MERN d'exception pour la mode, le high-tech et les accessoires tendance en Afrique de l'Ouest.";

/**
 * Met à jour ou insère une balise meta dans le <head> du document.
 * @param {string} selector - Le sélecteur de la balise (ex: 'meta[property="og:title"]').
 * @param {string} attribute - L'attribut d'identification (ex: 'property' ou 'name').
 * @param {string} attrValue - La valeur de l'attribut (ex: 'og:title').
 * @param {string} content - Le contenu à assigner.
 */
const setMetaTag = (selector, attribute, attrValue, content) => {
  if (typeof document === 'undefined') return;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

/**
 * Hook pour gérer dynamiquement le référencement naturel et les métadonnées Open Graph / Twitter Cards.
 * @param {object|null} product - L'article sélectionné.
 */
export const useProductSEO = (product) => {
  useEffect(() => {
    if (!product) {
      document.title = DEFAULT_TITLE;
      return;
    }

    const title = `${product.title} | Vicky-Shop`;
    const canonicalUrl = getProductCanonicalUrl(product);
    const sellerName = product.seller?.shopName || product.seller?.name || product.sellerName || 'Vicky-Shop';
    const description = product.description
      ? product.description.slice(0, 180)
      : `Achetez ${product.title} au meilleur prix sur Vicky-Shop. Vendu par ${sellerName}. Livraison rapide et paiement cash à la livraison.`;
    const image = product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';

    // Mise à jour du titre
    document.title = title;

    // Métadonnées standards & Open Graph
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', image);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'product');
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Vicky-Shop');

    // Twitter Cards
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);

    // Balise canonique
    let linkCanonical = document.head.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    return () => {
      document.title = DEFAULT_TITLE;
      setMetaTag('meta[name="description"]', 'name', 'description', DEFAULT_DESC);
    };
  }, [product]);
};

export default useProductSEO;
