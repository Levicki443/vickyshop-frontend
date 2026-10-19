import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FlashItemCard } from './FlashItemCard';
import { useScrollReveal } from '../../hooks/useScrollReveal';

/**
 * Composant FlashSale :
 * Vitrine carrousel multi-cartes responsive avec articles en vedette,
 * compte à rebours interactif, support des squelettes de chargement et animations soignées.
 */
export const FlashSale = ({ products = [], loading = false, onShopNow, onQuickView }) => {
  const sectionRef = useScrollReveal();
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
    if (loading || featuredList.length <= itemsPerView || isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(interval);
  }, [featuredList.length, itemsPerView, isPaused, nextSlide, loading]);

  const slideWidthPercent = 100 / itemsPerView;

  return (
    <section className="flash-sale-section" id="flash-sale" ref={sectionRef}>
      <div className="container">
        <div
          className="flash-sale-card reveal-on-scroll reveal-scale"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flash-glow"></div>

          {/* En-tête avec Compte à Rebours */}
          <div className="flash-header-row">
            <div className="flash-header-text">
              <div className="flash-tag motion-pulse">
                <i className="fa-solid fa-bolt-lightning flash-bolt-icon"></i>
                <span>OFFRE DU JOUR • VENTE FLASH</span>
              </div>
              <h2 className="flash-title">Offres Vedettes &amp; Promotions Exclusives</h2>
              <p className="flash-subtitle">
                Profitez de réductions exceptionnelles jusqu&apos;à -50% avant expiration du compte à rebours !
              </p>
            </div>

            <div className="countdown-container">
              <div className="timer-box motion-lift">
                <span className="timer-num">{pad(timeLeft.hours)}</span>
                <span className="timer-label">Heures</span>
              </div>
              <span className="timer-colon">:</span>
              <div className="timer-box motion-lift">
                <span className="timer-num">{pad(timeLeft.minutes)}</span>
                <span className="timer-label">Minutes</span>
              </div>
              <span className="timer-colon">:</span>
              <div className="timer-box motion-lift">
                <span className="timer-num" key={timeLeft.seconds}>{pad(timeLeft.seconds)}</span>
                <span className="timer-label">Secondes</span>
              </div>
            </div>
          </div>

          {/* Vitrine des Articles en Vedette ou Squelette de chargement */}
          {loading ? (
            <div className="flash-showcase-wrapper" style={{ marginTop: '1.5rem' }}>
              <div className="flash-skeleton-container">
                {Array.from({ length: itemsPerView }).map((_, idx) => (
                  <div key={idx} className="product-card skeleton-card">
                    <div className="skeleton-img skeleton-block" />
                    <div className="skeleton-meta-row">
                      <div className="skeleton-pill skeleton-block" />
                      <div className="skeleton-rating skeleton-block" />
                    </div>
                    <div className="skeleton-line-title skeleton-block" style={{ width: '80%' }} />
                    <div className="skeleton-line skeleton-block" style={{ width: '50%' }} />
                    <div className="skeleton-price-row">
                      <div className="skeleton-price skeleton-block" />
                    </div>
                    <div className="skeleton-btn skeleton-block" />
                  </div>
                ))}
              </div>
            </div>
          ) : featuredList.length > 0 ? (
            <div className="flash-showcase-wrapper">
              <div className="flash-carousel-controls">
                <span className="flash-controls-title">
                  <i className="fa-solid fa-fire" style={{ color: 'var(--accent-gold)' }}></i>
                  <span>Articles en Vedette ({featuredList.length})</span>
                </span>
                <div className="flash-arrows-group">
                  <button
                    type="button"
                    className="flash-arrow-btn motion-press"
                    onClick={prevSlide}
                    aria-label="Articles précédents"
                    title="Précédent"
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button
                    type="button"
                    className="flash-arrow-btn motion-press"
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
                  {featuredList.map((product, idx) => (
                    <FlashItemCard
                      key={product._id || idx}
                      product={product}
                      slideWidthPercent={slideWidthPercent}
                      onQuickView={onQuickView}
                    />
                  ))}
                </div>
              </div>

              {/* Indicateurs de pagination */}
              {maxIndex > 0 && (
                <div className="flash-dots-container">
                  {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      className={`flash-dot motion-press ${dotIdx === currentIndex ? 'active' : ''}`}
                      onClick={() => setCurrentIndex(dotIdx)}
                      aria-label={`Aller au groupe ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* Bouton d'accès global au catalogue */}
          <div className="flash-footer-action">
            <button
              type="button"
              className="btn btn-secondary flash-explore-btn motion-press"
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
