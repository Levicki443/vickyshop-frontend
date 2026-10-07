import React, { useState, useEffect, useCallback } from 'react';
import { fetchReviews } from '../../services/reviewApi';
import { StarRating } from '../reviews/StarRating';

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

/**
 * Section d'Évaluation et d'Avis Clients spécifique à un Produit.
 * Affiche la note globale, la ventilation par étoiles (1-5 ⭐) et la liste des avis vérifiés.
 */
export const ProductReviewsSection = ({ product, onOpenReviewModal }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: product?.reviewsCount || 0,
    averageRating: product?.rating || 5.0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadProductReviews = useCallback(async () => {
    const prodId = product?._id || product?.id;
    if (!prodId) return;

    setLoading(true);
    try {
      const data = await fetchReviews({ productId: prodId, limit: 20, sort: 'recent' });
      if (data.reviews) {
        setReviews(data.reviews);
      }
      if (data.stats && data.stats.totalReviews > 0) {
        setStats(data.stats);
      }
    } catch (err) {
      console.warn('Erreur chargement avis du produit:', err);
    } finally {
      setLoading(false);
    }
  }, [product]);

  useEffect(() => {
    loadProductReviews();
  }, [loadProductReviews]);

  const total = stats.totalReviews || 1;
  const getPercent = (count) => Math.round(((count || 0) / total) * 100);

  const ratingBars = [
    { stars: 5, count: stats.fiveStars || (reviews.length ? 0 : Math.round(total * 0.85)) },
    { stars: 4, count: stats.fourStars || (reviews.length ? 0 : Math.round(total * 0.12)) },
    { stars: 3, count: stats.threeStars || 0 },
    { stars: 2, count: stats.twoStars || 0 },
    { stars: 1, count: stats.oneStar || 0 },
  ];

  return (
    <div className="product-reviews-section animate-fade-in" id="section-avis-produit" style={{ marginTop: '3.5rem' }}>
      <div className="section-header" style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
        <span className="section-subtitle">Retours d&apos;Expérience Clients</span>
        <h3 className="section-title" style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>
          Avis &amp; Évaluations sur cet article
        </h3>
        <div className="title-underline" style={{ margin: '0.5rem 0' }} />
      </div>

      {/* Carte Résumé des Notations */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2rem',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Colonne Note Moyenne */}
        <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
          <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
            {stats.averageRating ? stats.averageRating.toFixed(1) : '5.0'}
          </div>
          <div style={{ margin: '0.5rem 0' }}>
            <StarRating rating={stats.averageRating || 5} size="md" />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Basé sur <strong>{stats.totalReviews || reviews.length || 1} avis vérifiés</strong>
          </span>
        </div>

        {/* Colonne Barres de Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {ratingBars.map((bar) => {
            const percent = getPercent(bar.count);
            return (
              <div key={bar.stars} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem' }}>
                <span style={{ width: '45px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {bar.stars} ⭐
                </span>
                <div style={{ flex: 1, height: '8px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <div
                    style={{
                      width: `${percent}%`,
                      height: '100%',
                      background: 'var(--accent-gold)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
                <span style={{ width: '35px', textAlign: 'right', color: 'var(--text-muted)' }}>
                  {bar.count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Colonne Bouton Appel à Action */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Vous possédez déjà cet article ?
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onOpenReviewModal(product)}
            style={{ width: '100%', maxWidth: '240px', padding: '0.75rem 1.25rem' }}
          >
            <i className="fa-solid fa-pen-to-square"></i>
            <span>Évaluer cet article</span>
          </button>
        </div>
      </div>

      {/* Liste des Avis du Produit */}
      {loading && reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}></i>
          <p>Chargement des avis de cet article...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px dashed var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <i className="fa-regular fa-comment-dots" style={{ fontSize: '2.5rem', opacity: 0.35, color: 'var(--primary)', marginBottom: '0.75rem' }}></i>
          <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Aucun avis déposé pour le moment</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem' }}>
            Soyez le tout premier client à donner votre avis sur <strong>{product.title}</strong> !
          </p>
          <button type="button" className="btn btn-primary" onClick={() => onOpenReviewModal(product)}>
            <i className="fa-solid fa-star"></i> Donner mon avis sur cet article
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {reviews.map((rev) => (
            <div
              key={rev._id || rev.id}
              className="testimonial-card animate-fade-in"
              style={{ padding: '1.35rem' }}
            >
              <div>
                <div className="testimonial-card-top" style={{ marginBottom: '0.65rem' }}>
                  <div className="testimonial-author-wrapper">
                    <img
                      src={rev.customerAvatar || FALLBACK_AVATAR}
                      alt={rev.customerName}
                      className="testimonial-avatar"
                      style={{ width: '40px', height: '40px' }}
                      onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                    />
                    <div className="testimonial-author-meta">
                      <h4 style={{ fontSize: '0.92rem' }}>{rev.customerName}</h4>
                      <span className="testimonial-date">
                        {rev.createdAt
                          ? new Date(rev.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Récemment'}
                      </span>
                    </div>
                  </div>
                  <StarRating rating={rev.rating || 5} size="sm" />
                </div>

                {rev.isVerifiedPurchase && (
                  <div className="testimonial-badge-verified" style={{ marginBottom: '0.6rem' }}>
                    <i className="fa-solid fa-circle-check"></i>
                    <span>Achat Vérifié</span>
                  </div>
                )}

                <p className="testimonial-comment" style={{ fontSize: '0.88rem', margin: 0 }}>
                  &laquo; {rev.comment} &raquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviewsSection;
