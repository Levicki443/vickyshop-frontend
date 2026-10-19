import React, { useState } from 'react';
import { Eye, ShoppingBag, Check } from 'lucide-react';
import { formatPrice } from '../../services/api';

/**
 * Carte produit interactive compacte intégrée aux réponses de Vicky IA.
 * Permet la consultation immédiate et l'ajout direct au panier sans friction.
 *
 * @param {Object} props
 * @param {Object} props.product - Données réelles du produit
 * @param {Function} [props.onViewProduct] - Callback pour ouvrir la fiche détaillée
 * @param {Function} [props.onAddToCart] - Callback pour ajouter au panier
 */
export const AIProductCard = ({
  product,
  onViewProduct,
  onAddToCart,
}) => {
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.inStock === false || (typeof product.stockQuantity === 'number' && product.stockQuantity <= 0);

  const handleCardClick = (e) => {
    e.stopPropagation();
    if (onViewProduct) {
      onViewProduct(product.slug || product._id);
    }
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (isOutOfStock || !onAddToCart) return;

    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <article
      className={`vicky-ai-product-card ${isOutOfStock ? 'is-out-of-stock' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(e); }}
      aria-label={`Produit : ${product.title}`}
    >
      <div className="vicky-ai-card-media">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="vicky-ai-card-img"
            loading="lazy"
          />
        ) : (
          <div className="vicky-ai-card-img-placeholder">
            <span>Vicky-Shop</span>
          </div>
        )}

        {product.badge && (
          <span className="vicky-ai-card-badge">{product.badge}</span>
        )}

        {isOutOfStock && (
          <span className="vicky-ai-card-badge-stock">Épuisé</span>
        )}
      </div>

      <div className="vicky-ai-card-content">
        <span className="vicky-ai-card-category">{product.category || 'Mode'}</span>
        <h4 className="vicky-ai-card-title" title={product.title}>
          {product.title}
        </h4>

        <div className="vicky-ai-card-price-row">
          <span className="vicky-ai-card-price">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="vicky-ai-card-old-price">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        <div className="vicky-ai-card-actions">
          <button
            type="button"
            className="vicky-ai-card-view-btn"
            onClick={handleCardClick}
            title="Consulter la fiche produit"
            aria-label="Voir la fiche détaillée"
          >
            <Eye size={14} />
            <span>Voir</span>
          </button>

          {!isOutOfStock && (
            <button
              type="button"
              className={`vicky-ai-card-cart-btn ${isAdded ? 'is-added' : ''}`}
              onClick={handleAddToCartClick}
              disabled={isAdded}
              title="Ajouter au panier"
              aria-label="Ajouter au panier"
            >
              {isAdded ? <Check size={14} /> : <ShoppingBag size={14} />}
              <span>{isAdded ? 'Ajouté !' : 'Panier'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default React.memo(AIProductCard);
