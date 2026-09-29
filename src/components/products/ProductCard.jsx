import React, { useRef } from 'react';
import { formatPrice } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';

export const ProductCard = ({ product, onSelectProduct, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();
  const cardRef = useRef(null);

  const isFavorited = isInWishlist(product);

  const isOutOfStock =
    product.inStock === false ||
    (product.stockQuantity !== undefined && product.stockQuantity <= 0);

  const isLowStock =
    !isOutOfStock &&
    product.stockQuantity !== undefined &&
    product.stockQuantity > 0 &&
    product.stockQuantity <= (product.lowStockThreshold || 5);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null;

  const handleCardClick = () => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
  };

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

  const handleWishlistClick = (e) => {
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
      ref={cardRef}
      className={`product-card ${isOutOfStock ? 'product-card-out-of-stock' : ''}`}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      {/* Badges en haut à gauche */}
      <div className="card-badges-container">
        {isOutOfStock ? (
          <span className="card-badge badge-out-stock">Rupture</span>
        ) : isLowStock ? (
          <span className="card-badge badge-low-stock">
            <i className="fa-solid fa-fire"></i> Plus que {product.stockQuantity}
          </span>
        ) : product.badge ? (
          <span className={`card-badge badge-${product.badge.toLowerCase().replace(/\s+/g, '-')}`}>
            {product.badge}
          </span>
        ) : null}

        {discountPercent && !isOutOfStock && (
          <span className="card-badge badge-discount">-{discountPercent}%</span>
        )}
      </div>

      <button
        type="button"
        className={`btn-wishlist ${isFavorited ? 'active' : ''}`}
        onClick={handleWishlistClick}
        aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <i className={isFavorited ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
      </button>

      <div className="img-wrapper">
        <img src={product.image} alt={product.title} loading="lazy" />
        {isOutOfStock && (
          <div className="out-of-stock-overlay">
            <span>Épuisé</span>
          </div>
        )}
        <button
          type="button"
          className="btn-quickview"
          onClick={(e) => {
            e.stopPropagation();
            if (onQuickView) onQuickView(product);
          }}
        >
          <i className="fa-solid fa-eye"></i> Détails
        </button>
      </div>

      <div className="card-content">
        <div className="card-meta-row">
          <span className="product-category-tag">{product.category}</span>
          {product.colors && product.colors.length > 0 && (
            <div className="product-card-colors" title={`${product.colors.length} coloris disponibles`}>
              {product.colors.slice(0, 3).map((col, idx) => (
                <span
                  key={idx}
                  className="color-mini-dot"
                  style={{ backgroundColor: col.toLowerCase() }}
                  title={col}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="color-mini-more">+{product.colors.length - 3}</span>
              )}
            </div>
          )}
        </div>
        
        <div className="product-rating">
          <i className="fa-solid fa-star"></i>
          <span>({product.rating?.toFixed(1) || '5.0'})</span>
          {product.reviewsCount > 0 && (
            <small className="reviews-count">({product.reviewsCount} avis)</small>
          )}
        </div>

        <h3 className="product-title">{product.title}</h3>

        <div className="product-price-wrapper">
          <span className="product-price">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="old-price">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        <button
          type="button"
          className={`btn-add-cart ${isOutOfStock ? 'btn-add-cart-disabled' : ''}`}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? (
            <>
              <i className="fa-solid fa-ban"></i> Rupture de stock
            </>
          ) : (
            <>
              <i className="fa-solid fa-cart-plus"></i> Ajouter au panier
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
