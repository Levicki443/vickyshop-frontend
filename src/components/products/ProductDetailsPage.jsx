import React, { useState, useEffect } from 'react';
import { formatPrice } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { ProductCard } from './ProductCard';

export const ProductDetailsPage = ({ product, allProducts = [], onBack, onOpenCheckout, onSelectProduct }) => {
  const { addToCart, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const images = product?.images?.length > 0 ? product.images : [product?.image].filter(Boolean);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedImageIndex(0);
    setQuantity(1);
    setSelectedColor(product?.colors?.[0] || null);
    setSelectedSize(product?.sizes?.[0] || null);
  }, [product]);

  if (!product) return null;

  const isFavorited = isInWishlist(product);
  const isOutOfStock = product.inStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0);
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleNextImage = () => setSelectedImageIndex((prev) => (prev + 1) % images.length);
  const handlePrevImage = () => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleAddToCart = () => {
    if (isOutOfStock) {
      addToast('Produit indisponible', `${product.title} est en rupture de stock.`, 'warning');
      return;
    }
    addToCart(product, quantity, selectedColor, selectedSize);
    addToast('Article ajouté !', `${quantity}x ${product.title} ajouté à votre panier.`, 'success');
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      addToast('Produit indisponible', `${product.title} est en rupture de stock.`, 'warning');
      return;
    }
    addToCart(product, quantity, selectedColor, selectedSize);
    if (onOpenCheckout) onOpenCheckout();
    else openCart();
  };

  const relatedProducts = allProducts.filter((p) => p._id !== product._id).slice(0, 4);

  return (
    <div className="product-details-container container animate-fade-in">
      {/* Fil d'Ariane & Bouton Retour */}
      <div className="details-top-bar">
        <button type="button" className="btn-back-shop" onClick={onBack}>
          <i className="fa-solid fa-arrow-left"></i>
          <span>Retour au catalogue</span>
        </button>
        <div className="details-breadcrumb">
          <span onClick={onBack} style={{ cursor: 'pointer' }}>Accueil</span>
          <i className="fa-solid fa-chevron-right"></i>
          <span>{product.category}</span>
          <i className="fa-solid fa-chevron-right"></i>
          <span className="breadcrumb-current">{product.title}</span>
        </div>
      </div>

      <div className="product-details-grid">
        {/* COLONNE GAUCHE : GALERIE D'IMAGES */}
        <div className="details-gallery-section">
          <div className="main-image-display">
            <img src={images[selectedImageIndex] || product.image} alt={product.title} className="main-gallery-img" />
            {discountPercent && <span className="details-badge-discount">-{discountPercent}%</span>}
            {isOutOfStock && <div className="details-stock-overlay"><span>Rupture de stock</span></div>}
            {images.length > 1 && (
              <>
                <button type="button" className="gallery-nav-btn btn-prev" onClick={handlePrevImage} aria-label="Précédent">
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button type="button" className="gallery-nav-btn btn-next" onClick={handleNextImage} aria-label="Suivant">
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="gallery-thumbnails-row">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`thumb-btn ${selectedImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(idx)}
                >
                  <img src={img} alt={`${product.title} miniature ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* COLONNE DROITE : INFORMATIONS & ACHAT */}
        <div className="details-info-section">
          <div className="details-category-tag">{product.category}</div>
          <h1 className="details-title">{product.title}</h1>

          <div className="details-rating-row">
            <div className="rating-stars">
              <i className="fa-solid fa-star text-warning"></i>
              <i className="fa-solid fa-star text-warning"></i>
              <i className="fa-solid fa-star text-warning"></i>
              <i className="fa-solid fa-star text-warning"></i>
              <i className="fa-solid fa-star text-warning"></i>
              <strong>{product.rating?.toFixed(1) || '5.0'}</strong>
            </div>
            <span className="bullet">•</span>
            <span className="details-reviews-count">
              <i className="fa-regular fa-comment-dots"></i> {product.reviewsCount || 14} avis vérifiés
            </span>
          </div>

          <div className="details-price-card">
            <div className="price-main-row">
              <span className="details-current-price">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="details-old-price">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="details-saving-note">
                <i className="fa-solid fa-tags"></i> Économisez {formatPrice(product.originalPrice - product.price)}
              </div>
            )}
          </div>

          {product.description && (
            <div className="details-description-box">
              <h4>Description de l&apos;article</h4>
              <p>{product.description}</p>
            </div>
          )}

          {/* SÉLECTEUR DE COULEURS */}
          {product.colors?.length > 0 && (
            <div className="variant-group">
              <label>Couleur : <strong>{selectedColor}</strong></label>
              <div className="colors-selector-row">
                {product.colors.map((color, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`color-choice-pill ${selectedColor === color ? 'active' : ''}`}
                    onClick={() => setSelectedColor(color)}
                  >
                    <span className="color-preview-dot" style={{ backgroundColor: color.toLowerCase() }} />
                    <span>{color}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SÉLECTEUR DE TAILLES */}
          {product.sizes?.length > 0 && (
            <div className="variant-group">
              <label>Taille : <strong>{selectedSize}</strong></label>
              <div className="sizes-selector-row">
                {product.sizes.map((size, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`size-choice-pill ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACTIONS D'ACHAT */}
          <div className="details-actions-wrapper">
            <div className="quantity-controls">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isOutOfStock}
              >
                <i className="fa-solid fa-minus"></i>
              </button>
              <span className="qty-number">{quantity}</span>
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((q) => q + 1)}
                disabled={isOutOfStock}
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>

            <button type="button" className="btn btn-secondary btn-details-add" onClick={handleAddToCart} disabled={isOutOfStock}>
              <i className="fa-solid fa-cart-plus"></i>
              <span>Ajouter au panier</span>
            </button>

            <button type="button" className="btn btn-primary btn-details-buy" onClick={handleBuyNow} disabled={isOutOfStock}>
              <i className="fa-solid fa-bolt"></i>
              <span>Acheter (Paiement Cash)</span>
            </button>

            <button
              type="button"
              className={`btn-details-fav ${isFavorited ? 'active' : ''}`}
              onClick={() => {
                toggleWishlist(product);
                addToast(isFavorited ? 'Retiré des favoris' : 'Ajouté aux favoris', `${product.title}`, 'info');
              }}
              title={isFavorited ? 'Retirer' : 'Favori'}
            >
              <i className={isFavorited ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
            </button>
          </div>

          {/* RÉASSURANCES CLIENTS */}
          <div className="details-trust-grid">
            <div className="trust-card">
              <i className="fa-solid fa-truck-fast text-primary"></i>
              <div>
                <strong>Livraison Express 24/48h</strong>
                <small>Partout à Abidjan et en Côte d&apos;Ivoire</small>
              </div>
            </div>
            <div className="trust-card">
              <i className="fa-solid fa-hand-holding-dollar text-warning"></i>
              <div>
                <strong>Paiement Cash à la livraison</strong>
                <small>Réglez en espèces à réception du colis</small>
              </div>
            </div>
            <div className="trust-card">
              <i className="fa-solid fa-shield-halved text-success"></i>
              <div>
                <strong>Garantie Authenticité</strong>
                <small>Produits 100% neufs et vérifiés</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ARTICLES SIMILAIRES */}
      {relatedProducts.length > 0 && (
        <div className="details-related-section">
          <div className="section-header">
            <span className="section-subtitle">Découvrez aussi</span>
            <h3 className="section-title">Produits Similaires</h3>
            <div className="title-underline"></div>
          </div>
          <div className="products-grid">
            {relatedProducts.map((prod) => (
              <ProductCard
                key={prod._id || prod.id}
                product={prod}
                onSelectProduct={onSelectProduct}
                onQuickView={() => onSelectProduct(prod)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
