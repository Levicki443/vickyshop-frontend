import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { formatPrice } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';

/**
 * Composant FlashSale :
 * Vitrine carrousel multi-cartes responsive avec articles en vedette,
 * compte à rebours interactif, jauges d'urgence et animations soignées.
 */
export const FlashSale = ({ products = [], onShopNow, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(3);

  // Compte à rebours dynamique de la Vente Flash
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  // Ajustement dynamique du nombre de cartes affichées selon la largeur de l'écran
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerView(1);
      } else if (width < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sélection des articles phares / promotions
  const featuredList = useMemo(() => {
    if (!products || products.length === 0) return [];
    const promos = products.filter(
      (p) =>
        p.featured === true ||
        p.badge === 'Vente Flash' ||
        p.badge === 'Promo' ||
        (p.originalPrice && p.originalPrice > p.price)
    );
    if (promos.length > 0) {
      return promos.slice(0, 9);
    }
    return products.slice(0, 6);
  }, [products]);

  const maxIndex = Math.max(0, featuredList.length - itemsPerView);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Réinitialise l'index si la taille de l'écran change
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [itemsPerView, maxIndex, currentIndex]);

  // Défilement automatique avec mise en pause au survol
  useEffect(() => {
    if (featuredList.length <= itemsPerView || isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(interval);
  }, [featuredList.length, itemsPerView, isPaused, nextSlide]);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const isOutOfStock =
      product.inStock === false ||
      (product.stockQuantity !== undefined && product.stockQuantity <= 0);

    if (isOutOfStock) {
      addToast(
        'Produit indisponible',
        `${product.title} est actuellement en rupture de stock.`,
        'warning'
      );
      return;
    }

    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : null;
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
    addToCart(product, 1, defaultColor, defaultSize);
    addToast('Article ajouté !', `${product.title} a été ajouté à votre panier.`, 'success');
  };

  const handleWishlist = (e, product) => {
    e.stopPropagation();
    const isFavorited = isInWishlist(product);
    toggleWishlist(product);
    addToast(
      isFavorited ? 'Retiré des favoris' : 'Ajouté aux favoris',
      `${product.title} ${isFavorited ? 'a été retiré de' : 'a été ajouté à'} vos favoris.`,
      'info'
    );
  };

  const slideWidthPercent = 100 / itemsPerView;

  return (
    <section className="flash-sale-section" id="flash-sale">
      <div className="container">
        <div
          className="flash-sale-card"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flash-glow"></div>

          {/* En-tête avec Compte à Rebours */}
          <div className="flash-header-row">
            <div className="flash-header-text">
              <div className="flash-tag">
                <i className="fa-solid fa-bolt-lightning flash-bolt-icon"></i>
                <span>OFFRE DU JOUR • VENTE FLASH</span>
              </div>
              <h2 className="flash-title">Offres Vedettes &amp; Promotions Exclusives</h2>
              <p className="flash-subtitle">
                Profitez de réductions exceptionnelles jusqu&apos;à -50% avant expiration du compte à rebours !
              </p>
            </div>

            <div className="countdown-container">
              <div className="timer-box">
                <span className="timer-num">{pad(timeLeft.hours)}</span>
                <span className="timer-label">Heures</span>
              </div>
              <span className="timer-colon">:</span>
              <div className="timer-box">
                <span className="timer-num">{pad(timeLeft.minutes)}</span>
                <span className="timer-label">Minutes</span>
              </div>
              <span className="timer-colon">:</span>
              <div className="timer-box">
                <span className="timer-num">{pad(timeLeft.seconds)}</span>
                <span className="timer-label">Secondes</span>
              </div>
            </div>
          </div>

          {/* Vitrine des Articles en Vedette */}
          {featuredList.length > 0 && (
            <div className="flash-showcase-wrapper">
              <div className="flash-carousel-controls">
                <span className="flash-controls-title">
                  <i className="fa-solid fa-fire" style={{ color: 'var(--accent-gold, #f59e0b)' }}></i>
                  <span>Articles en Vedette ({featuredList.length})</span>
                </span>
                <div className="flash-arrows-group">
                  <button
                    type="button"
                    className="flash-arrow-btn"
                    onClick={prevSlide}
                    aria-label="Articles précédents"
                    title="Précédent"
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button
                    type="button"
                    className="flash-arrow-btn"
                    onClick={nextSlide}
                    aria-label="Articles suivants"
                    title="Suivant"
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>

              {/* Rails de Défilement Multi-Cartes */}
              <div className="flash-products-track-container">
                <div
                  className="flash-products-track"
                  style={{
                    transform: `translateX(-${currentIndex * slideWidthPercent}%)`,
                  }}
                >
                  {featuredList.map((product, idx) => {
                    const discountPercent =
                      product.originalPrice && product.originalPrice > product.price
                        ? Math.round((1 - product.price / product.originalPrice) * 100)
                        : null;
                    const savingsAmount =
                      product.originalPrice && product.originalPrice > product.price
                        ? product.originalPrice - product.price
                        : null;
                    const isFavorited = isInWishlist(product);
                    const isLowStock =
                      product.stockQuantity !== undefined &&
                      product.stockQuantity > 0 &&
                      product.stockQuantity <= 6;

                    return (
                      <div
                        className="flash-product-slide"
                        key={product._id || idx}
                        style={{ flex: `0 0 ${slideWidthPercent}%`, maxWidth: `${slideWidthPercent}%` }}
                      >
                        <div className="flash-item-card">
                          {/* En-tête de la carte avec Image et Badges */}
                          <div
                            className="flash-item-image-wrap"
                            onClick={() => onQuickView && onQuickView(product)}
                          >
                            <img
                              src={product.image}
                              alt={product.title}
                              className="flash-item-image"
                              loading="lazy"
                            />
                            <div className="flash-item-shine"></div>

                            {/* Badges de Réduction & Vedette */}
                            <div className="flash-item-badges">
                              {discountPercent ? (
                                <span className="flash-badge-discount">-{discountPercent}%</span>
                              ) : (
                                <span className="flash-badge-hot">VEDETTE</span>
                              )}
                            </div>

                            {/* Bouton Favoris */}
                            <button
                              type="button"
                              className={`flash-item-wishlist ${isFavorited ? 'active' : ''}`}
                              onClick={(e) => handleWishlist(e, product)}
                              aria-label="Ajouter aux favoris"
                            >
                              <i className={isFavorited ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
                            </button>

                            {/* Bouton Aperçu Rapide */}
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

                            {/* Prix et Économie */}
                            <div className="flash-item-pricing">
                              <span className="flash-item-price">{formatPrice(product.price)}</span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="flash-item-old-price">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>

                            {savingsAmount ? (
                              <div className="flash-savings-pill">
                                Économisez {formatPrice(savingsAmount)}
                              </div>
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

                            {/* Bouton d'Action Panier Direct */}
                            <button
                              type="button"
                              className="btn btn-primary flash-item-add-btn"
                              onClick={(e) => handleAddToCart(e, product)}
                            >
                              <i className="fa-solid fa-cart-shopping"></i>
                              <span>Ajouter au panier</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Indicateurs de pagination */}
              {maxIndex > 0 && (
                <div className="flash-dots-container">
                  {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      className={`flash-dot ${dotIdx === currentIndex ? 'active' : ''}`}
                      onClick={() => setCurrentIndex(dotIdx)}
                      aria-label={`Aller au groupe ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bouton d'accès global au catalogue */}
          <div className="flash-footer-action">
            <button
              type="button"
              className="btn btn-secondary flash-explore-btn"
              onClick={onShopNow}
            >
              <span>Voir Tous les Produits en Promotion</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
