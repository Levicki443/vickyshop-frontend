import React from 'react';
import { formatPrice } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';

/**
 * Sous-composant modulaire pour une carte individuelle de la Vente Flash.
 * Réduit la taille du fichier parent et respecte le principe de modularité (SOLID).
 */
const FlashItemCardComponent = ({ product, slideWidthPercent, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const isFavorited = isInWishlist(product);
  const isOutOfStock =
    product.inStock === false ||
    (product.stockQuantity !== undefined && product.stockQuantity <= 0);

  const isLowStock =
    !isOutOfStock &&
    product.stockQuantity !== undefined &&
    product.stockQuantity > 0 &&
    product.stockQuantity <= 6;

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null;

  const savingsAmount =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) {
      addToast('Produit indisponible', `${product.title} est actuellement en rupture de stock.`, 'warning');
      return;
    }

    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : null;
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
    addToCart(product, 1, defaultColor, defaultSize);
    addToast('Article ajouté !', `${product.title} a été ajouté à votre panier.`, 'success');
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
    addToast(
      isFavorited ? 'Retiré des favoris' : 'Ajouté aux favoris',
      `${product.title} ${isFavorited ? 'a été retiré de' : 'a été ajouté à'} vos favoris.`,
      'info'
    );
  };

  return (
    <div
      className="flash-product-slide"
      style={{ flex: `0 0 ${slideWidthPercent}%`, maxWidth: `${slideWidthPercent}%` }}
    >
      <div className="flash-item-card">
        {/* En-tête de la carte avec Image et Badges */}
        <div className="flash-item-image-wrap" onClick={() => onQuickView && onQuickView(product)}>
          <img
            src={getOptimizedImageUrl(product.image, { width: 440 })}
            alt={product.title}
            className="flash-item-image"
            loading="lazy"
            decoding="async"
          />
          <div className="flash-item-shine"></div>

          <div className="flash-item-badges">
            {discountPercent ? (
              <span className="flash-badge-discount">-{discountPercent}%</span>
            ) : (
              <span className="flash-badge-hot">VEDETTE</span>
            )}
          </div>

          <button
            type="button"
            className={`flash-item-wishlist ${isFavorited ? 'active' : ''}`}
            onClick={handleWishlist}
            aria-label="Ajouter aux favoris"
          >
            <i className={isFavorited ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
          </button>

          <button
            type="button"
            className="flash-item-quickview-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickView) onQuickView(product);
            }}
          >
            <i className="fa-solid fa-eye"></i> Aperçu rapide
          </button>
        </div>

        {/* Corps de la carte */}
        <div className="flash-item-body">
          <div className="flash-item-meta">
            <span className="flash-item-category">{product.category}</span>
            <div className="flash-item-rating">
              <i className="fa-solid fa-star"></i>
              <span>{product.rating?.toFixed(1) || '5.0'}</span>
            </div>
          </div>

          <h3
            className="flash-item-title"
            onClick={() => onQuickView && onQuickView(product)}
            title={product.title}
          >
            {product.title}
          </h3>

          <div className="flash-item-pricing">
            <span className="flash-item-price">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="flash-item-old-price">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {savingsAmount ? (
            <div className="flash-savings-pill">Économisez {formatPrice(savingsAmount)}</div>
          ) : (
            <div className="flash-savings-placeholder"></div>
          )}

          {/* Jauge d'Urgence du Stock */}
          <div className="flash-stock-gauge-wrapper">
            <div className="flash-stock-gauge-header">
              <span className="flash-stock-label">
                <i className="fa-solid fa-bolt"></i> {isLowStock ? 'Vite, stock limité !' : 'Offre éclair'}
              </span>
              <span className="flash-stock-value">
                {product.stockQuantity > 0 ? `${product.stockQuantity} dispos` : 'Dispo'}
              </span>
            </div>
            <div className="flash-stock-gauge-bar">
              <div
                className="flash-stock-gauge-fill"
                style={{
                  width: `${Math.min(100, Math.max(25, ((product.stockQuantity || 5) / 10) * 100))}%`,
                }}
              />
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary flash-item-add-btn"
            onClick={handleAddToCart}
          >
            <i className="fa-solid fa-cart-shopping"></i>
            <span>Ajouter au panier</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const FlashItemCard = React.memo(FlashItemCardComponent);
export default FlashItemCard;
