import React, { useState, useEffect } from 'react';
import { formatPrice } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export const QuickViewModal = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  const { addToCart, openCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedImage(product.image || '');
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : '');
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : '');
    }
  }, [product]);

  if (!product) return null;

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

  const galleryImages = [
    product.image,
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean);
  const uniqueImages = Array.from(new Set(galleryImages));

  const maxAvailable = product.stockQuantity !== undefined ? Math.max(1, product.stockQuantity) : 99;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      addToast('Indisponible', 'Ce produit est actuellement en rupture de stock.', 'warning');
      return;
    }
    addToCart(product, quantity, selectedColor, selectedSize);
    addToast(
      'Article ajouté !',
      `${quantity}x ${product.title} ${selectedColor ? `(${selectedColor})` : ''} ajouté(s) au panier.`,
      'success'
    );
    onClose();
  };

  const incrementQty = () => setQuantity((prev) => Math.min(maxAvailable, prev + 1));
  const decrementQty = () => setQuantity((prev) => Math.max(1, prev - 1));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-quickview" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Fermer"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="quickview-grid">
          {/* Galerie d'images */}
          <div className="quickview-gallery-col">
            <div className="quickview-main-img-wrap">
              <img src={selectedImage || product.image} alt={product.title} className="quickview-main-img" />
              {isOutOfStock && (
                <div className="out-of-stock-overlay">
                  <span>Rupture de Stock</span>
                </div>
              )}
            </div>

            {uniqueImages.length > 1 && (
              <div className="quickview-thumbnails">
                {uniqueImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`thumb-btn ${selectedImage === imgUrl ? 'active' : ''}`}
                    onClick={() => setSelectedImage(imgUrl)}
                  >
                    <img src={imgUrl} alt={`Aperçu ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Détails du produit */}
          <div className="quickview-details">
            <div className="qv-header-row">
              <span className="product-category-tag">{product.category}</span>
              {/* Badge de stock en direct */}
              {isOutOfStock ? (
                <span className="stock-indicator-badge stock-badge-out">
                  <i className="fa-solid fa-circle-xmark"></i> Rupture de stock
                </span>
              ) : isLowStock ? (
                <span className="stock-indicator-badge stock-badge-low">
                  <i className="fa-solid fa-fire"></i> Plus que {product.stockQuantity} en stock !
                </span>
              ) : (
                <span className="stock-indicator-badge stock-badge-in">
                  <i className="fa-solid fa-circle-check"></i> En stock ({product.stockQuantity || 'Disponible'})
                </span>
              )}
            </div>

            <h2 id="qv-title">{product.title}</h2>

            <div className="product-rating">
              <i className="fa-solid fa-star"></i>
              <span>({product.rating?.toFixed(1) || '5.0'})</span>
              {product.reviewsCount > 0 && (
                <span className="reviews-count">({product.reviewsCount} avis vérifiés)</span>
              )}
            </div>

            <div className="qv-price-tag">
              <span className="current-price">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="old-price">{formatPrice(product.originalPrice)}</span>
                  {discountPercent && <span className="discount-pill">-{discountPercent}%</span>}
                </>
              )}
            </div>

            <p className="qv-description">{product.description || 'Aucune description disponible pour cet article.'}</p>

            {/* Variantes de Couleurs */}
            {product.colors && product.colors.length > 0 && (
              <div className="qv-variants-group">
                <label className="variant-label">
                  Couleur : <strong>{selectedColor || 'Choisir'}</strong>
                </label>
                <div className="color-options-row">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`color-pill-btn ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                    >
                      <span
                        className="color-sample-dot"
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                      <span>{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variantes de Tailles / Pointures */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="qv-variants-group">
                <label className="variant-label">
                  Taille / Pointure : <strong>{selectedSize || 'Choisir'}</strong>
                </label>
                <div className="size-options-row">
                  {product.sizes.map((size, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`size-pill-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Contrôle de Quantité & Achat */}
            <div className="qv-purchase-row">
              <div className="qv-quantity-control">
                <label>Quantité :</label>
                <div className="qty-stepper">
                  <button
                    type="button"
                    onClick={decrementQty}
                    disabled={isOutOfStock || quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={isOutOfStock ? 0 : quantity}
                    min="1"
                    max={maxAvailable}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={incrementQty}
                    disabled={isOutOfStock || quantity >= maxAvailable}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                className={`btn btn-primary qv-add-btn ${isOutOfStock ? 'btn-disabled' : ''}`}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? (
                  <>
                    <i className="fa-solid fa-ban"></i> Article Épuisé
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-cart-plus"></i> Ajouter au panier
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
