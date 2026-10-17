import { useEffect } from 'react';
import { getProductCanonicalUrl } from '../components/common/ProductShareModal';

const DEFAULT_TITLE = 'Vicky-Shop | Mode, High-Tech & Accessoires Premium';
const DEFAULT_DESC = "Vicky-Shop : La boutique e-commerce MERN d'exception pour la mode, le high-tech et les accessoires tendance en Afrique de l'Ouest.";
const DEFAULT_IMAGE = 'https://res.cloudinary.com/l2wj9yzu/image/upload/v1790614748/vickyshop/products/products/aimfwyu6fenuxbipcpek.jpg';

/**
 * Met à jour ou insère une balise meta dans le <head> du document.
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
    const priceText = product.price ? `${Number(product.price).toLocaleString('fr-FR')} FCFA` : '';
    const description = product.description
      ? `Prix : ${priceText} - ${product.description.slice(0, 150)}... Vendu par ${sellerName}. Paiement cash à la livraison.`
      : `Achetez ${product.title} (${priceText}) sur Vicky-Shop. Vendu par ${sellerName}. Livraison rapide et paiement sécurisé.`;
    const image = product.image || DEFAULT_IMAGE;

    // Mise à jour du titre
    document.title = title;

    // Métadonnées standards & Open Graph
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', image);
    setMetaTag('meta[property="og:image:secure_url"]', 'property', 'og:image:secure_url', image);
    setMetaTag('meta[property="og:image:type"]', 'property', 'og:image:type', 'image/jpeg');
    setMetaTag('meta[property="og:image:width"]', 'property', 'og:image:width', '1200');
    setMetaTag('meta[property="og:image:height"]', 'property', 'og:image:height', '630');
    setMetaTag('meta[property="og:image:alt"]', 'property', 'og:image:alt', product.title);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'product');
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Vicky-Shop');

    if (product.price) {
      setMetaTag('meta[property="product:price:amount"]', 'property', 'product:price:amount', String(product.price));
      setMetaTag('meta[property="product:price:currency"]', 'property', 'product:price:currency', 'XOF');
    }

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

    // Insertion schema.org JSON-LD
    let scriptJsonLd = document.head.querySelector('script#product-json-ld');
    if (!scriptJsonLd) {
      scriptJsonLd = document.createElement('script');
      scriptJsonLd.id = 'product-json-ld';
      scriptJsonLd.type = 'application/ld+json';
      document.head.appendChild(scriptJsonLd);
    }
    scriptJsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      image: [image],
      description: description,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'XOF',
        price: product.price || 0,
        availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: sellerName,
        },
      },
    });

    return () => {
      document.title = DEFAULT_TITLE;
      setMetaTag('meta[name="description"]', 'name', 'description', DEFAULT_DESC);
      setMetaTag('meta[property="og:title"]', 'property', 'og:title', DEFAULT_TITLE);
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', DEFAULT_IMAGE);
    };
  }, [product]);
};

export default useProductSEO;
