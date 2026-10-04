import React, { useState, useEffect, useCallback } from 'react';
import { fetchProductById, formatPrice } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { ProductCard } from './ProductCard';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';

export const ProductDetailsPage = ({
  productId,
  initialProduct = null,
  allProducts = [],
  onBack,
  onOpenCheckout,
  onSelectProduct,
}) => {
  const { addToCart, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(
    () => (initialProduct && String(initialProduct._id || initialProduct.id) === String(productId) ? initialProduct : null)
  );
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const loadProductData = useCallback(async () => {
    if (!productId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await fetchProductById(productId);
      if (!data) {
        setNotFound(true);
      } else {
        setProduct(data);
        setSelectedImageIndex(0);
        setQuantity(1);
        setSelectedColor(data.colors?.[0] || null);
        setSelectedSize(data.sizes?.[0] || null);
      }
    } catch (err) {
      if (err.message && (err.message.includes('404') || err.message.includes('introuvable'))) {
        setNotFound(true);
      } else {
        setError('Impossible de charger les détails du produit. Veuillez vérifier votre connexion.');
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (initialProduct && String(initialProduct._id || initialProduct.id) === String(productId)) {
      setProduct(initialProduct);
      setLoading(false);
      setNotFound(false);
      setSelectedImageIndex(0);
      setQuantity(1);
      setSelectedColor(initialProduct.colors?.[0] || null);
      setSelectedSize(initialProduct.sizes?.[0] || null);
    } else {
      loadProductData();
    }
  }, [productId, initialProduct, loadProductData]);

  if (loading) {
    return (
      <div className="product-details-container container animate-fade-in">
        <div className="details-top-bar">
          <button type="button" className="btn-back-shop" onClick={onBack}>
            <i className="fa-solid fa-arrow-left"></i>
            <span>Retour au catalogue</span>
          </button>
        </div>
        <div className="product-details-grid details-skeleton-layout">
          <div className="skeleton-img-box" style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)', background: 'var(--border-color)', animation: 'pulse 1.5s infinite' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ width: '30%', height: '20px', background: 'var(--border-color)', borderRadius: '4px' }} />
            <div style={{ width: '85%', height: '36px', background: 'var(--border-color)', borderRadius: '6px' }} />
            <div style={{ width: '50%', height: '48px', background: 'var(--border-color)', borderRadius: '8px' }} />
            <div style={{ width: '100%', height: '80px', background: 'var(--border-color)', borderRadius: '8px' }} />
            <div style={{ width: '70%', height: '48px', background: 'var(--border-color)', borderRadius: '8px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || (!product && !loading)) {
    return (
      <div className="product-details-container container animate-fade-in text-center" style={{ padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ fontSize: '3.5rem', color: 'var(--accent-red, #e11d48)', marginBottom: '1rem' }}>
            <i className="fa-solid fa-box-open"></i>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--text-primary)' }}>
            Produit Introuvable
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
            L&apos;article demandé n&apos;existe pas, a été retiré de la vente ou l&apos;adresse saisie est incorrecte.
          </p>
          <button type="button" className="btn btn-primary" onClick={onBack} style={{ margin: '0 auto' }}>
            <i className="fa-solid fa-arrow-left"></i>
            <span>Retourner au catalogue principal</span>
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-details-container container animate-fade-in text-center" style={{ padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: 'var(--accent-gold, #f59e0b)', marginBottom: '1rem' }}></i>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.8rem' }}>Erreur de chargement</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button type="button" className="btn btn-secondary" onClick={loadProductData}>
              <i className="fa-solid fa-rotate-right"></i> Réessayer
            </button>
            <button type="button" className="btn btn-primary" onClick={onBack}>
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isFavorited = isInWishlist(product);
  const isOutOfStock = product.inStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0);
  const isLowStock = !isOutOfStock && product.stockQuantity !== undefined && product.stockQuantity > 0 && product.stockQuantity <= 5;
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const rawImages = [product.image, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean);
  const images = rawImages.length > 0 ? Array.from(new Set(rawImages)) : [FALLBACK_IMAGE];

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

  const sellerName = product.seller?.shopName || product.seller?.name || product.sellerName || 'Vicky-Shop Officiel';
  const relatedProducts = allProducts.filter((p) => String(p._id || p.id) !== String(product._id || product.id)).slice(0, 4);

  return (
    <div className="product-details-container container animate-fade-in">
      <div className="details-top-bar">
        <button type="button" className="btn-back-shop" onClick={onBack}>
          <i className="fa-solid fa-arrow-left"></i>
          <span>Retour au catalogue</span>
        </button>
        <div className="details-breadcrumb">
          <span onClick={onBack} style={{ cursor: 'pointer' }}>Accueil</span>
          <i className="fa-solid fa-chevron-right"></i>
          <span>{product.category || 'Boutique'}</span>
          <i className="fa-solid fa-chevron-right"></i>
          <span className="breadcrumb-current">{product.title}</span>
        </div>
      </div>

      <div className="product-details-grid">
        {/* COLONNE GAUCHE : GALERIE */}
        <div className="details-gallery-section">
          <div className="main-image-display">
            <img
              src={images[selectedImageIndex] || FALLBACK_IMAGE}
              alt={product.title}
              className="main-gallery-img"
              onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
            />
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
                  <img src={img} alt={`${product.title} miniature ${idx + 1}`} onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* COLONNE DROITE : INFORMATIONS & ACTIONS */}
        <div className="details-info-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <span className="details-category-tag">{product.category}</span>
            <div className="details-seller-tag" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-store" style={{ color: 'var(--primary)', marginRight: '5px' }}></i>
              <span>Vendu par : <strong>{sellerName}</strong></span>
            </div>
          </div>

          <h1 className="details-title">{product.title}</h1>

          <div className="details-rating-row">
            <div className="rating-stars">
              <i className="fa-solid fa-star text-warning"></i>
              <strong>{product.rating?.toFixed(1) || '5.0'}</strong>
            </div>
            <span className="bullet">•</span>
            <span className="details-reviews-count">
              <i className="fa-regular fa-comment-dots"></i> {product.reviewsCount || 12} avis vérifiés
            </span>
            <span className="bullet">•</span>
            {isOutOfStock ? (
              <span style={{ color: 'var(--accent-red, #e11d48)', fontWeight: 700 }}>Épuisé</span>
            ) : isLowStock ? (
              <span style={{ color: 'var(--accent-gold, #f59e0b)', fontWeight: 700 }}>Stock limité ({product.stockQuantity})</span>
            ) : (
              <span style={{ color: 'var(--accent-green, #10b981)', fontWeight: 700 }}>En stock ({product.stockQuantity || 'Disponible'})</span>
            )}
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

          {product.sizes?.length > 0 && (
            <div className="variant-group">
              <label>Taille / Pointure : <strong>{selectedSize}</strong></label>
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

          <div className="details-actions-wrapper">
            <div className="quantity-controls">
              <button type="button" className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1 || isOutOfStock}>
                <i className="fa-solid fa-minus"></i>
              </button>
              <span className="qty-number">{quantity}</span>
              <button type="button" className="qty-btn" onClick={() => setQuantity((q) => q + 1)} disabled={isOutOfStock}>
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
              title={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <i className={isFavorited ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
            </button>
          </div>

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
                <small>Réglez en espèces à réception</small>
              </div>
            </div>
            <div className="trust-card">
              <i className="fa-solid fa-shield-halved text-success"></i>
              <div>
                <strong>Garantie Authenticité</strong>
                <small>Produits 100% vérifiés</small>
              </div>
            </div>
          </div>
        </div>
      </div>

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
