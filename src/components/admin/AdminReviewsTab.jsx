import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchAdminReviews,
  updateReviewStatusApi,
  toggleReviewActiveApi,
  deleteReviewAdminApi,
} from '../../services/reviewApi';
import { getAdminToken } from '../../services/adminApi';
import { StarRating } from '../reviews/StarRating';

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

/**
 * Onglet de Gestion & Modération des Témoignages et Avis Clients (Backoffice).
 * Permet aux administrateurs de filtrer, valider, refuser, masquer et supprimer des avis.
 */
export const AdminReviewsTab = ({ onFeedback = () => {} }) => {
  const [reviews, setReviews] = useState([]);
  const [kpis, setKpis] = useState({
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
    averageRating: 5.0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      const data = await fetchAdminReviews(
        {
          status: statusFilter,
          rating: ratingFilter,
          search: searchQuery,
          limit: 50,
        },
        token
      );
      setReviews(data.reviews || []);
      if (data.kpis) setKpis(data.kpis);
    } catch (err) {
      console.error('Erreur chargement avis admin:', err);
      onFeedback(err.message || 'Impossible de charger les avis clients.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, ratingFilter, searchQuery, onFeedback]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleUpdateStatus = async (reviewId, newStatus) => {
    setActionLoadingId(reviewId);
    try {
      const token = getAdminToken();
      await updateReviewStatusApi(reviewId, newStatus, token);
      const labels = {
        approved: 'validé et publié sur la boutique',
        rejected: 'refusé',
        pending: 'remis en attente',
      };
      onFeedback(`Le témoignage a été ${labels[newStatus]}.`, 'success');
      loadReviews();
    } catch (err) {
      onFeedback(err.message || 'Erreur lors de la mise à jour du statut.', 'danger');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleActive = async (reviewId) => {
    setActionLoadingId(reviewId);
    try {
      const token = getAdminToken();
      const res = await toggleReviewActiveApi(reviewId, token);
      onFeedback(res.message || 'Visibilité mise à jour.', 'success');
      loadReviews();
    } catch (err) {
      onFeedback(err.message || 'Erreur lors du changement de visibilité.', 'danger');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (reviewId, authorName) => {
    if (window.confirm(`Confirmez-vous la suppression définitive du témoignage de "${authorName}" ?`)) {
      setActionLoadingId(reviewId);
      try {
        const token = getAdminToken();
        await deleteReviewAdminApi(reviewId, token);
        onFeedback(`Le témoignage de ${authorName} a été supprimé définitivement.`, 'success');
        loadReviews();
      } catch (err) {
        onFeedback(err.message || 'Erreur lors de la suppression.', 'danger');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  return (
    <div className="admin-reviews-tab-root animate-fade-in">
      {/* 1. Bloc des KPIs des Témoignages */}
      <div className="admin-kpis-grid" style={{ marginBottom: '1.75rem' }}>
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Total Témoignages</span>
            <div className="admin-kpi-icon icon-purple">
              <i className="fa-solid fa-comments"></i>
            </div>
          </div>
          <div className="admin-kpi-value">{kpis.totalReviews}</div>
          <div className="admin-kpi-subtext">Avis déposés en base</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">En Attente de Validation</span>
            <div className="admin-kpi-icon icon-orange">
              <i className="fa-solid fa-clock"></i>
            </div>
          </div>
          <div className="admin-kpi-value" style={{ color: 'var(--primary)' }}>
            {kpis.pendingReviews}
          </div>
          <div className="admin-kpi-subtext">Nécessitent une modération</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Témoignages Validés</span>
            <div className="admin-kpi-icon icon-green">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div className="admin-kpi-value" style={{ color: 'var(--accent-green)' }}>
            {kpis.approvedReviews}
          </div>
          <div className="admin-kpi-subtext">Visibles sur la boutique</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Note Moyenne Globale</span>
            <div className="admin-kpi-icon icon-blue">
              <i className="fa-solid fa-star"></i>
            </div>
          </div>
          <div className="admin-kpi-value" style={{ color: 'var(--accent-gold)' }}>
            {kpis.averageRating ? kpis.averageRating.toFixed(1) : '5.0'} / 5.0
          </div>
          <div className="admin-kpi-subtext">Satisfaction globale</div>
        </div>
      </div>

      {/* 2. Barre de Filtres & Recherche */}
      <div className="admin-filter-bar" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <i
            className="fa-solid fa-magnifying-glass"
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.5rem', margin: 0 }}
            placeholder="Rechercher par client, avis, produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filtres par Statut */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'Tous' },
            { key: 'pending', label: `En attente (${kpis.pendingReviews})` },
            { key: 'approved', label: 'Validés' },
            { key: 'rejected', label: 'Refusés' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`admin-btn admin-btn-sm ${statusFilter === tab.key ? 'admin-btn-primary' : 'admin-btn-outline'}`}
              onClick={() => setStatusFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-outline"
          onClick={loadReviews}
          title="Rafraîchir la liste"
        >
          <i className="fa-solid fa-rotate-right"></i>
        </button>
      </div>

      {/* 3. Liste des Avis pour Modération */}
      {loading && reviews.length === 0 ? (
        <div className="admin-loading-state">
          <i className="fa-solid fa-spinner fa-spin admin-loading-spinner"></i>
          <p>Chargement des témoignages clients...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="admin-empty-state" style={{ padding: '3rem 1.5rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
          <i className="fa-regular fa-comment-dots" style={{ fontSize: '3rem', opacity: 0.35, color: 'var(--primary)', marginBottom: '1rem' }}></i>
          <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Aucun témoignage trouvé</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Aucun avis client ne correspond aux critères de filtre sélectionnés.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map((rev) => {
            const isActing = actionLoadingId === rev._id;
            return (
              <div
                key={rev._id}
                className="admin-card animate-fade-in"
                style={{
                  borderLeft: `4px solid ${
                    rev.status === 'approved'
                      ? 'var(--accent-green)'
                      : rev.status === 'pending'
                      ? 'var(--primary)'
                      : 'var(--accent-red)'
                  }`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src={rev.customerAvatar || FALLBACK_AVATAR}
                      alt={rev.customerName}
                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border-color)' }}
                      onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{rev.customerName}</strong>
                        {rev.isVerifiedPurchase && (
                          <span className="testimonial-badge-verified" style={{ margin: 0 }}>
                            <i className="fa-solid fa-circle-check"></i> Achat Vérifié
                          </span>
                        )}
                        {!rev.isActive && (
                          <span style={{ fontSize: '0.72rem', background: 'var(--bg-input)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)', color: 'var(--text-muted)' }}>
                            Masqué
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Déposé le {new Date(rev.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {rev.orderNumber ? ` • Réf : #${rev.orderNumber}` : ''}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      className={`card-badge badge-${
                        rev.status === 'approved' ? 'completed' : rev.status === 'pending' ? 'new' : 'cancelled'
                      }`}
                      style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
                    >
                      {rev.status === 'approved' ? 'Validé & Publié' : rev.status === 'pending' ? 'En Attente' : 'Refusé'}
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '0.85rem' }}>
                  <StarRating rating={rev.rating} size="sm" showValue={true} />
                </div>

                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 1rem', background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  &laquo; {rev.comment} &raquo;
                </p>

                {rev.productTitle && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-input)', padding: '0.35rem 0.7rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                    <i className="fa-solid fa-box-archive" style={{ color: 'var(--primary)' }}></i>
                    <span>Article concerné : <strong>{rev.productTitle}</strong></span>
                  </div>
                )}

                {/* Boutons d'Action de Modération */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                  {rev.status !== 'approved' && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm admin-btn-success"
                      disabled={isActing}
                      onClick={() => handleUpdateStatus(rev._id, 'approved')}
                    >
                      <i className="fa-solid fa-check"></i> Valider &amp; Publier
                    </button>
                  )}

                  {rev.status !== 'rejected' && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm admin-btn-warning"
                      disabled={isActing}
                      onClick={() => handleUpdateStatus(rev._id, 'rejected')}
                    >
                      <i className="fa-solid fa-ban"></i> Refuser
                    </button>
                  )}

                  {rev.status !== 'pending' && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm admin-btn-outline"
                      disabled={isActing}
                      onClick={() => handleUpdateStatus(rev._id, 'pending')}
                    >
                      <i className="fa-solid fa-clock-rotate-left"></i> Mettre en attente
                    </button>
                  )}

                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-outline"
                    disabled={isActing}
                    onClick={() => handleToggleActive(rev._id)}
                    title={rev.isActive ? 'Masquer de la boutique' : 'Rendre visible'}
                  >
                    <i className={`fa-solid ${rev.isActive ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    <span>{rev.isActive ? 'Masquer' : 'Afficher'}</span>
                  </button>

                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-danger-outline"
                    disabled={isActing}
                    onClick={() => handleDelete(rev._id, rev.customerName)}
                    style={{ marginLeft: 'auto' }}
                  >
                    <i className="fa-solid fa-trash-can"></i> Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminReviewsTab;
