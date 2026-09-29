import React from 'react';
import { ProductCard } from './ProductCard';

export const ProductGrid = ({
  products,
  loading,
  error,
  onSelectProduct,
  onQuickView,
  onResetFilters,
}) => {
  if (loading) {
    return (
      <div className="product-container">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="product-card skeleton-card">
            <div className="skeleton-img"></div>
            <div className="skeleton-line" style={{ width: '40%' }}></div>
            <div className="skeleton-line" style={{ width: '80%' }}></div>
            <div className="skeleton-line" style={{ width: '60%' }}></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="fa-solid fa-triangle-exclamation error-icon"></i>
        <h3>Oups, une erreur est survenue</h3>
        <p>{error}</p>
        <button type="button" className="btn btn-secondary" onClick={onResetFilters}>
          Réessayer
        </button>
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
