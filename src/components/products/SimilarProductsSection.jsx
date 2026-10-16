import React, { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { fetchSimilarProducts } from '../../services/api';
import { computeSimilarProducts } from '../../utils/recommendationEngine';

/**
 * Composant dédié affichant les produits réellement similaires au produit consulté.
 * Intègre la double stratégie : récupération API avec fallback intelligent immédiat.
 */
export const SimilarProductsSection = ({ currentProduct, allProducts = [], onSelectProduct }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const productId = currentProduct?._id || currentProduct?.id;

    if (!productId) {
      setSimilarProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const loadRecommendations = async () => {
      // 1. Calcul optimiste local immédiat pour éviter tout flash blanc
      const localMatches = computeSimilarProducts(currentProduct, allProducts, 4);

      try {
        const apiMatches = await fetchSimilarProducts(productId, 4);
        if (isMounted) {
          if (Array.isArray(apiMatches)) {
            setSimilarProducts(apiMatches);
          } else {
            setSimilarProducts(localMatches);
          }
        }
      } catch {
        if (isMounted) setSimilarProducts(localMatches);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, [currentProduct, allProducts]);

  const handleSelect = (prod) => {
    if (onSelectProduct) {
      onSelectProduct(prod);
    }
  };

  if (!currentProduct) return null;

  return (
    <section className="details-related-section" aria-label="Produits similaires recommandés">
      <div className="section-header">
        <span className="section-subtitle">Découvrez aussi</span>
        <h3 className="section-title">Produits Similaires</h3>
        <div className="title-underline"></div>
      </div>

      {loading && similarProducts.length === 0 ? (
        <div className="products-grid details-skeleton-layout" style={{ minHeight: '200px' }}>
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="skeleton-box"
              style={{ height: '280px', borderRadius: 'var(--radius-md)', background: 'var(--border-color)' }}
            />
          ))}
        </div>
      ) : similarProducts.length > 0 ? (
        <div className="products-grid">
          {similarProducts.map((prod) => (
            <ProductCard
              key={prod._id || prod.id}
              product={prod}
              onSelectProduct={handleSelect}
              onQuickView={() => handleSelect(prod)}
            />
          ))}
        </div>
      ) : (
        <div className="no-similar-products" style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>Aucun produit similaire disponible pour le moment.</p>
        </div>
      )}
    </section>
  );
};
