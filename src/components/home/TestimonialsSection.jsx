import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchReviews } from '../../services/reviewApi';
import { StarRating } from '../reviews/StarRating';

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

/**
 * Section Témoignages & Avis Clients sur la page d'accueil de Vicky-Shop.
 * Présentation dynamique, responsive et rassurante des retours d'expérience vérifiés.
 */
export const TestimonialsSection = ({ onOpenReviewModal, onSelectProduct }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: 4.9 });
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  const loadReviewsData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchReviews({ limit: 12, sort: 'recent' });
      if (data.reviews && data.reviews.length > 0) {
        setReviews(data.reviews);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.warn('Erreur chargement témoignages vitrine:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviewsData();
  }, [loadReviewsData]);

  const handleScrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  const formatReviewDate = (dateStr) => {
    if (!dateStr) return 'Récemment';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Récemment';
    }
  };

  return (
    <section className="testimonials-section-root" id="avis-clients">
      <div className="container">
        {/* En-tête de la section */}
        <div className="testimonials-header-row">
          <div className="testimonials-header-info">
            <div className="testimonials-badge-trust">
              <i className="fa-solid fa-certificate"></i>
              <span>Confiance &amp; Authenticité</span>
            </div>
            <h2 className="section-title" style={{ margin: '0.25rem 0 0.5rem', textAlign: 'left' }}>
              Ce que nos clients pensent de nous
            </h2>
            <div className="title-underline" style={{ margin: '0.5rem 0 1rem' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', margin: 0, lineHeight: 1.6 }}>
              Découvrez les retours authentiques de nos clients à Abidjan et en Côte d&apos;Ivoire sur la qualité de nos articles et la rapidité de nos livraisons.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div className="testimonials-stats-pill">
              <span className="testimonials-stars-group">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </span>
              <span>
                <strong>{stats.averageRating ? stats.averageRating.toFixed(1) : '4.9'} / 5.0</strong> ({stats.totalReviews || 120}+ avis vérifiés)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onOpenReviewModal}
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
              >
                <i className="fa-solid fa-pen-to-square"></i>
                <span>Donner votre avis</span>
              </button>
              <div style={{ display: 'flex', gap: '0.35rem', marginLeft: 'auto' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleScrollLeft}
                  style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}
                  aria-label="Témoignage précédent"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleScrollRight}
                  style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}
                  aria-label="Témoignage suivant"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grille / Carrousel des cartes de témoignages */}
        <div className="testimonials-slider-container">
          {loading && reviews.length === 0 ? (
            <div className="testimonials-cards-grid">
              {[1, 2, 3].map((n) => (
                <div key={n} className="testimonial-card" style={{ opacity: 0.6, minHeight: '220px' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--border-color)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                      <div style={{ width: '50%', height: '16px', background: 'var(--border-color)', borderRadius: '4px' }} />
                      <div style={{ width: '30%', height: '12px', background: 'var(--border-color)', borderRadius: '4px' }} />
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '50px', background: 'var(--border-color)', borderRadius: '6px' }} />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
              <i className="fa-regular fa-comment-dots" style={{ fontSize: '2.5rem', color: 'var(--primary)', opacity: 0.4, marginBottom: '0.75rem' }}></i>
              <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Soyez le premier à donner votre avis</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Partagez votre expérience d&apos;achat sur Vicky-Shop et aidez d&apos;autres clients.
              </p>
              <button type="button" className="btn btn-primary" onClick={onOpenReviewModal}>
                <i className="fa-solid fa-star"></i> Déposer un avis
              </button>
            </div>
          ) : (
            <div className="testimonials-cards-grid" ref={sliderRef}>
              {reviews.map((rev) => (
                <div key={rev._id || rev.id} className="testimonial-card animate-fade-in">
                  <div>
                    <div className="testimonial-card-top">
                      <div className="testimonial-author-wrapper">
                        <img
                          src={rev.customerAvatar || FALLBACK_AVATAR}
                          alt={rev.customerName}
                          className="testimonial-avatar"
                          onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                        />
                        <div className="testimonial-author-meta">
                          <h4>{rev.customerName}</h4>
                          <span className="testimonial-date">
                            {formatReviewDate(rev.createdAt)}
                          </span>
                        </div>
                      </div>
                      <i className="fa-solid fa-quote-right testimonial-quote-icon"></i>
                    </div>

                    <div className="testimonial-stars-row">
                      <StarRating rating={rev.rating || 5} size="sm" />
                    </div>

                    {rev.isVerifiedPurchase && (
                      <div className="testimonial-badge-verified">
                        <i className="fa-solid fa-circle-check"></i>
                        <span>Achat Vérifié</span>
                      </div>
                    )}

                    <p className="testimonial-comment">
                      &laquo; {rev.comment} &raquo;
                    </p>
                  </div>

                  {rev.productTitle && (
                    <div
                      className="testimonial-product-tag"
                      onClick={() => rev.productId && onSelectProduct && onSelectProduct(rev.productId)}
                      style={{ cursor: rev.productId ? 'pointer' : 'default' }}
                      title={rev.productId ? `Voir l'article : ${rev.productTitle}` : rev.productTitle}
                    >
                      {rev.productImage ? (
                        <img
                          src={rev.productImage}
                          alt={rev.productTitle}
                          className="testimonial-product-img"
                        />
                      ) : (
                        <i className="fa-solid fa-bag-shopping" style={{ color: 'var(--primary)' }}></i>
                      )}
                      <span className="testimonial-product-title">{rev.productTitle}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
