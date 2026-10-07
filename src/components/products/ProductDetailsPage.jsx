import React, { useState, useEffect, useCallback } from 'react';
import { fetchProductById, formatPrice } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { ProductCard } from './ProductCard';
import { ProductReviewsSection } from './ProductReviewsSection';
import { ReviewModal } from '../reviews/ReviewModal';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';

/**
 * Page de Détail Complète d'un Produit avec Galerie, Achat Express et Avis Clients Dédiés.
 */
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
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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
      if (!data) setNotFound(true);
      else {
        setProduct(data);
        setSelectedImageIndex(0);
        setQuantity(1);
        setSelectedColor(data.colors?.[0] || null);
        setSelectedSize(data.sizes?.[0] || null);
      }
    } catch {
      setError('Impossible de charger les détails du produit.');
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
            <i className="fa-solid fa-arrow-left"></i> <span>Retour au catalogue</span>
          </button>
        </div>
        <div className="product-details-grid details-skeleton-layout">
          <div className="skeleton-img-box" style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)', background: 'var(--border-color)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ width: '30%', height: '20px', background: 'var(--border-color)', borderRadius: '4px' }} />
            <div style={{ width: '85%', height: '36px', background: 'var(--border-color)', borderRadius: '6px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || (!product && !loading)) {
    return (
      <div className="product-details-container container animate-fade-in text-center" style={{ padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <i className="fa-solid fa-box-open" style={{ fontSize: '3.5rem', color: 'var(--accent-red)', marginBottom: '1rem' }}></i>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.8rem' }}>Produit Introuvable</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>L&apos;article demandé n&apos;existe pas ou a été retiré.</p>
          <button type="button" className="btn btn-primary" onClick={onBack}>
            <i className="fa-solid fa-arrow-left"></i> <span>Retourner au catalogue</span>
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-details-container container animate-fade-in text-center" style={{ padding: '4rem 1rem' }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}></i>
        <h2>Erreur de chargement</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
        <button type="button" className="btn btn-primary" onClick={loadProductData}>Réessayer</button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product);
  const isOutOfStock = product.inStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0);
  const isLowStock = !isOutOfStock && product.stockQuantity !== undefined && product.stockQuantity > 0 && product.stockQuantity <= 5;
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  const rawImages = [product.image, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean);
  const images = rawImages.length > 0 ? Array.from(new Set(rawImages)) : [FALLBACK_IMAGE];

  const handleAddToCart = () => {
    if (isOutOfStock) return addToast('Produit indisponible', `${product.title} est épuisé.`, 'warning');
    addToCart(product, quantity, selectedColor, selectedSize);
    addToast('Article ajouté !', `${quantity}x ${product.title} ajouté à votre panier.`, 'success');
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return addToast('Produit indisponible', `${product.title} est épuisé.`, 'warning');
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
          <i className="fa-solid fa-arrow-left"></i> <span>Retour au catalogue</span>
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
            <img src={images[selectedImageIndex] || FALLBACK_IMAGE} alt={product.title} className="main-gallery-img" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
            {discountPercent && <span className="details-badge-discount">-{discountPercent}%</span>}
            {isOutOfStock && <div className="details-stock-overlay"><span>Rupture de stock</span></div>}
            {images.length > 1 && (
              <>
                <button type="button" className="gallery-nav-btn btn-prev" onClick={() => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)} aria-label="Précédent"><i className="fa-solid fa-chevron-left"></i></button>
                <button type="button" className="gallery-nav-btn btn-next" onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)} aria-label="Suivant"><i className="fa-solid fa-chevron-right"></i></button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbnails-row">
              {images.map((img, idx) => (
                <button key={idx} type="button" className={`thumb-btn ${selectedImageIndex === idx ? 'active' : ''}`} onClick={() => setSelectedImageIndex(idx)}>
                  <img src={img} alt={`${product.title} ${idx + 1}`} onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
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

          {/* Évaluation avec défilement fluide */}
          <div
            className="details-rating-row"
            onClick={() => document.getElementById('section-avis-produit')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ cursor: 'pointer' }}
            title="Voir tous les avis de cet article"
          >
            <div className="rating-stars">
              <i className="fa-solid fa-star text-warning"></i>
              <strong>{product.rating?.toFixed(1) || '5.0'}</strong>
            </div>
            <span className="bullet">•</span>
            <span className="details-reviews-count" style={{ textDecoration: 'underline' }}>
              <i className="fa-regular fa-comment-dots"></i> {product.reviewsCount || 12} avis vérifiés
            </span>
            <span className="bullet">•</span>
            {isOutOfStock ? (
              <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>Épuisé</span>
            ) : isLowStock ? (
              <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>Stock limité ({product.stockQuantity})</span>
            ) : (
              <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>En stock ({product.stockQuantity || 'Dispo'})</span>
            )}
          </div>

          <div className="details-price-card">
            <div className="price-main-row">
              <span className="details-current-price">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="details-old-price">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
          </div>

          {product.description && (
            <div className="details-description-box">
              <h4>Description de l&apos;article</h4>
              <p>{product.description}</p>
            </div>
          )}

          {/* Variantes Couleurs & Tailles */}
          {product.colors?.length > 0 && (
            <div className="variant-group">
              <label>Couleur : <strong>{selectedColor}</strong></label>
              <div className="colors-selector-row">
                {product.colors.map((color, idx) => (
                  <button key={idx} type="button" className={`color-choice-pill ${selectedColor === color ? 'active' : ''}`} onClick={() => setSelectedColor(color)}>
                    <span className="color-preview-dot" style={{ backgroundColor: color.toLowerCase() }} />
                    <span>{color}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="variant-group">
              <label>Taille : <strong>{selectedSize}</strong></label>
              <div className="sizes-selector-row">
                {product.sizes.map((size, idx) => (
                  <button key={idx} type="button" className={`size-choice-pill ${selectedSize === size ? 'active' : ''}`} onClick={() => setSelectedSize(size)}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions Panier & Achat */}
          <div className="details-actions-wrapper">
            <div className="quantity-controls">
              <button type="button" className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1 || isOutOfStock}><i className="fa-solid fa-minus"></i></button>
              <span className="qty-number">{quantity}</span>
              <button type="button" className="qty-btn" onClick={() => setQuantity((q) => q + 1)} disabled={isOutOfStock}><i className="fa-solid fa-plus"></i></button>
            </div>
            <button type="button" className="btn btn-secondary btn-details-add" onClick={handleAddToCart} disabled={isOutOfStock}>
              <i className="fa-solid fa-cart-plus"></i> <span>Ajouter au panier</span>
            </button>
            <button type="button" className="btn btn-primary btn-details-buy" onClick={handleBuyNow} disabled={isOutOfStock}>
              <i className="fa-solid fa-bolt"></i> <span>Acheter (Cash)</span>
            </button>
            <button type="button" className={`btn-details-fav ${isFavorited ? 'active' : ''}`} onClick={() => toggleWishlist(product)}>
              <i className={isFavorited ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION DÉDIÉE : AVIS CLIENTS SUR CET ARTICLE */}
      <ProductReviewsSection product={product} onOpenReviewModal={() => setIsReviewModalOpen(true)} />

      {/* MODALE DE DÉPÔT D'AVIS PRODUIT */}
      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} initialProduct={product} />

      {/* PRODUITS SIMILAIRES */}
      {relatedProducts.length > 0 && (
        <div className="details-related-section">
          <div className="section-header">
            <span className="section-subtitle">Découvrez aussi</span>
            <h3 className="section-title">Produits Similaires</h3>
            <div className="title-underline"></div>
          </div>
          <div className="products-grid">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod._id || prod.id} product={prod} onSelectProduct={onSelectProduct} onQuickView={() => onSelectProduct(prod)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
