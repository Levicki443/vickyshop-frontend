import React, { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';

export const ProductGrid = ({
  products,
  loading,
  error,
  onSelectProduct,
  onQuickView,
  onResetFilters,
  onRetry,
}) => {
  const [showWakeupNotice, setShowWakeupNotice] = useState(false);

  useEffect(() => {
    let timer = null;
    if (loading) {
      // Déclenche l'avis de réveil serveur si la requête dépasse 2,5 secondes (mise en veille fréquente sur hébergeur gratuit)
      timer = setTimeout(() => {
        setShowWakeupNotice(true);
      }, 2500);
    } else {
      setShowWakeupNotice(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="product-grid-loading-wrapper">
        {showWakeupNotice && (
          <div className="server-wakeup-banner" role="status" aria-live="polite">
            <div className="server-wakeup-icon-wrapper">
              <i className="fa-solid fa-cloud-bolt"></i>
            </div>
            <div className="server-wakeup-content">
              <div className="server-wakeup-title">
                <span>Démarrage du serveur cloud en cours...</span>
              </div>
              <p className="server-wakeup-desc">
                Notre serveur gratuit sort de son mode veille. Vos produits s&apos;afficheront automatiquement dans quelques secondes. Merci pour votre patience !
              </p>
            </div>
          </div>
        )}

        <div className="product-container" id="product-grid-skeleton">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="product-card skeleton-card">
              <div className="skeleton-img skeleton-block" />
              <div className="skeleton-meta-row">
                <div className="skeleton-pill skeleton-block" />
                <div className="skeleton-rating skeleton-block" />
              </div>
              <div className="skeleton-line-title skeleton-block" style={{ width: '85%' }} />
              <div className="skeleton-line skeleton-block" style={{ width: '55%' }} />
              <div className="skeleton-price-row">
                <div className="skeleton-price skeleton-block" />
              </div>
              <div className="skeleton-btn skeleton-block" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="fa-solid fa-triangle-exclamation error-icon"></i>
        <h3>Oups, une erreur est survenue</h3>
        <p>{error}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onRetry || onResetFilters}
          >
            <i className="fa-solid fa-rotate-right" style={{ marginRight: '0.5rem' }}></i>
            Réveiller le serveur / Réessayer
          </button>
          {onResetFilters && (
            <button type="button" className="btn btn-secondary" onClick={onResetFilters}>
              Réinitialiser
            </button>
          )}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="no-products-found">
        <i className="fa-solid fa-magnifying-glass-chart"></i>
        <h3>Aucun article ne correspond à votre recherche</h3>
        <p>Essayez avec d&apos;autres mots-clés ou réinitialisez les filtres.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onResetFilters}
        >
          Réinitialiser les filtres
        </button>
      </div>
    );
  }

  return (
    <div className="product-container" id="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product._id || product.id}
          product={product}
          onSelectProduct={onSelectProduct}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
};

